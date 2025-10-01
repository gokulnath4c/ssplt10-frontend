#!/bin/bash

# Blue-Green Deployment Orchestration Script
# Manages zero-downtime deployments with automatic rollback capabilities

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Configuration
DEPLOY_HOST="62.72.43.74"
DEPLOY_USER="root"
DEPLOY_PATH="/var/www/vhosts/ssplt10.cloud"
BLUE_DIR="$DEPLOY_PATH/blue"
GREEN_DIR="$DEPLOY_PATH/green"
CURRENT_LINK="$DEPLOY_PATH/current"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
LOG_FILE="$PROJECT_ROOT/logs/blue-green-deployment.log"
mkdir -p "$PROJECT_ROOT/logs"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') $*" | tee -a "$LOG_FILE"
}

print_status() {
    log "${GREEN}✅ $1${NC}"
}

print_warning() {
    log "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    log "${RED}❌ $1${NC}"
}

print_info() {
    log "${BLUE}ℹ️  $1${NC}"
}

# Determine which environment is active
get_active_environment() {
    if ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "[ -L $CURRENT_LINK ]"; then
        local target
        target=$(ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "readlink $CURRENT_LINK")
        if [[ "$target" == *"/blue"* ]]; then
            echo "blue"
        elif [[ "$target" == *"/green"* ]]; then
            echo "green"
        else
            echo "unknown"
        fi
    else
        echo "none"
    fi
}

# Determine which environment to deploy to (inactive one)
get_target_environment() {
    local active_env
    active_env=$(get_active_environment)

    if [ "$active_env" = "blue" ]; then
        echo "green"
    elif [ "$active_env" = "green" ]; then
        echo "blue"
    else
        # First deployment, default to blue
        echo "blue"
    fi
}

# Check if target environment is healthy
check_environment_health() {
    local env=$1
    local port=$2

    print_info "Checking health of $env environment on port $port"

    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
            curl -f -s http://localhost:$port/health >/dev/null 2>&1 &&
            curl -f -s http://localhost:$((port+1))/health >/dev/null 2>&1
        "; then
            print_status "$env environment is healthy"
            return 0
        fi

        print_info "Waiting for $env environment to be ready... ($attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done

    print_error "$env environment failed health check"
    return 1
}

# Deploy to target environment
deploy_to_environment() {
    local target_env=$1
    local target_dir

    if [ "$target_env" = "blue" ]; then
        target_dir="$BLUE_DIR"
    else
        target_dir="$GREEN_DIR"
    fi

    print_info "Deploying to $target_env environment"

    # Create timestamped deployment directory
    local timestamp
    timestamp=$(date +%Y%m%d_%H%M%S)
    local deploy_dir="$target_dir/deployments/$timestamp"

    # Create deployment directory
    ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        mkdir -p $deploy_dir
    "

    # Copy files
    print_info "Transferring files to $target_env environment"
    rsync -avz --delete --exclude='node_modules' --exclude='.git' \
        -e "ssh -o StrictHostKeyChecking=no" \
        $PROJECT_ROOT/httpdocs/ \
        $DEPLOY_USER@$DEPLOY_HOST:$deploy_dir/

    # Install dependencies
    print_info "Installing dependencies for $target_env environment"
    ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        cd $deploy_dir
        npm ci --production --ignore-scripts
    "

    # Install backend dependencies if exists
    if ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "[ -d $PROJECT_ROOT/backend/backend ]"; then
        print_info "Installing backend dependencies"
        ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
            mkdir -p $deploy_dir/backend
            rsync -avz $PROJECT_ROOT/backend/ $deploy_dir/backend/
            cd $deploy_dir/backend/backend
            npm ci --production --ignore-scripts
        "
    fi

    # Update environment variables
    print_info "Updating environment variables for $target_env"
    ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        cd $deploy_dir
        cat > .env << EOF
NODE_ENV=production
PORT=3000
BACKEND_URL=http://localhost:3001
VITE_SUPABASE_PROJECT_ID=\$VITE_SUPABASE_PROJECT_ID
VITE_SUPABASE_ANON_KEY=\$VITE_SUPABASE_ANON_KEY
VITE_SUPABASE_URL=\$VITE_SUPABASE_URL
VITE_RAZORPAY_KEY_ID=\$VITE_RAZORPAY_KEY_ID
VITE_APP_NAME='Southern Street Premier League'
VITE_APP_VERSION=1.0.0
EOF
    "

    # Update symlink to point to new deployment
    ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        ln -sfn $deploy_dir $target_dir/current
    "

    print_status "Files deployed to $target_env environment"
}

# Start services for target environment
start_environment_services() {
    local target_env=$1
    local base_port

    if [ "$target_env" = "blue" ]; then
        base_port=3000
    else
        base_port=4000  # Green environment uses different ports
    fi

    print_info "Starting services for $target_env environment on ports $base_port and $((base_port+1))"

    ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        # Stop any existing processes for this environment
        pm2 stop sspl-${target_env}-frontend sspl-${target_env}-backend || true
        pm2 delete sspl-${target_env}-frontend sspl-${target_env}-backend || true

        # Start frontend
        cd $DEPLOY_PATH/${target_env}/current
        pm2 start ecosystem.config.cjs --name sspl-${target_env}-frontend --env production -- --port $base_port

        # Start backend if exists
        if [ -d backend/backend ]; then
            cd backend/backend
            pm2 start src/app.js --name sspl-${target_env}-backend -- --port $((base_port+1))
        fi

        pm2 save
    "

    print_status "Services started for $target_env environment"
}

# Run smoke tests
run_smoke_tests() {
    local target_env=$1
    local base_port

    if [ "$target_env" = "blue" ]; then
        base_port=3000
    else
        base_port=4000
    fi

    print_info "Running smoke tests for $target_env environment"

    # Run smoke tests via SSH
    if ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        # Test basic endpoints
        curl -f -s http://localhost:$base_port/health >/dev/null 2>&1 || exit 1
        curl -f -s http://localhost:$((base_port+1))/health >/dev/null 2>&1 || exit 1

        # Test main application page
        curl -f -s http://localhost:$base_port/ | grep -q 'Southern Street Premier League' || exit 1

        # Test API endpoints if they exist
        curl -f -s http://localhost:$((base_port+1))/api/health >/dev/null 2>&1 || true
    "; then
        print_status "Smoke tests passed for $target_env environment"
        return 0
    else
        print_error "Smoke tests failed for $target_env environment"
        return 1
    fi
}

# Switch traffic to target environment
switch_traffic() {
    local target_env=$1

    print_info "Switching traffic to $target_env environment"

    ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        # Update nginx configuration
        sed -i 's/set \$active_env .*/set \$active_env $target_env;/' /etc/nginx/sites-available/ssplt10.cloud

        # Reload nginx
        nginx -t && nginx -s reload
    "

    print_status "Traffic switched to $target_env environment"
}

# Rollback to previous environment
rollback() {
    local current_env
    current_env=$(get_active_environment)

    if [ "$current_env" = "blue" ]; then
        local rollback_env="green"
    elif [ "$current_env" = "green" ]; then
        local rollback_env="blue"
    else
        print_error "Cannot determine current environment for rollback"
        return 1
    fi

    print_warning "Rolling back to $rollback_env environment"

    # Switch traffic back
    switch_traffic "$rollback_env"

    # Stop services in failed environment
    ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        pm2 stop sspl-${current_env}-frontend sspl-${current_env}-backend || true
        pm2 delete sspl-${current_env}-frontend sspl-${current_env}-backend || true
        pm2 save
    "

    print_status "Rollback completed to $rollback_env environment"
}

# Main deployment function
main() {
    print_info "Starting Blue-Green Deployment"

    local target_env
    target_env=$(get_target_environment)

    print_info "Active environment: $(get_active_environment)"
    print_info "Target environment: $target_env"

    # Deploy to target environment
    deploy_to_environment "$target_env"

    # Start services
    start_environment_services "$target_env"

    # Check health
    if ! check_environment_health "$target_env" 3000; then
        print_error "Target environment failed health check, aborting deployment"
        exit 1
    fi

    # Run smoke tests
    if ! run_smoke_tests "$target_env"; then
        print_error "Smoke tests failed, aborting deployment"
        exit 1
    fi

    # Switch traffic
    switch_traffic "$target_env"

    # Wait a moment for traffic to stabilize
    sleep 5

    # Final health check
    if ! check_environment_health "$target_env" 3000; then
        print_error "Post-deployment health check failed, initiating rollback"
        rollback
        exit 1
    fi

    print_status "Blue-Green deployment completed successfully"
    print_info "Active environment is now: $target_env"
}

# Handle command line arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "rollback")
        rollback
        ;;
    "status")
        echo "Active environment: $(get_active_environment)"
        echo "Target environment: $(get_target_environment)"
        ;;
    *)
        echo "Usage: $0 [deploy|rollback|status]"
        exit 1
        ;;
esac