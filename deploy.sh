#!/bin/bash

# SSPL Automated Deployment Script
# This script can be run locally or on the server
# Usage: ./deploy.sh [environment] [skip-build]
# Environments: production, preview, development
# skip-build: true/false (default: false)

set -e

ENVIRONMENT=${1:-"production"}
SKIP_BUILD=${2:-"false"}
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/httpdocs"
DEPLOY_HOST="62.72.43.74"
DEPLOY_USER="root"
DEPLOY_PATH="/var/www/vhosts/ssplt10.cloud"

echo "🚀 Starting deployment to $ENVIRONMENT environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Validate environment
validate_environment() {
    if [[ "$ENVIRONMENT" != "development" && "$ENVIRONMENT" != "preview" && "$ENVIRONMENT" != "production" ]]; then
        print_error "Invalid environment: $ENVIRONMENT"
        echo "Valid environments: development, preview, production"
        exit 1
    fi
}

# Check if we're running on the deployment server
is_remote_server() {
    if [ "$(hostname -I | grep -c '62.72.43')" -gt 0 ] || [ "$DEPLOY_HOST" = "localhost" ]; then
        return 0
    else
        return 1
    fi
}

# Build frontend locally
build_frontend() {
    if [ "$SKIP_BUILD" = "true" ]; then
        print_warning "Skipping build as requested"
        return
    fi

    print_status "Building frontend for $ENVIRONMENT..."

    cd "$FRONTEND_DIR"

    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm ci
    fi

    # Build based on environment
    if [ "$ENVIRONMENT" = "production" ]; then
        npm run build:production
    elif [ "$ENVIRONMENT" = "preview" ]; then
        npm run build:preview
    else
        npm run build:dev
    fi

    print_status "Frontend build completed"
}

# Deploy to remote server
deploy_remote() {
    print_status "Deploying to remote server..."

    # Create timestamped deployment directory
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    REMOTE_DEPLOY_DIR="$DEPLOY_PATH/deployments/$TIMESTAMP"

    # Create deployment directory
    ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        mkdir -p $REMOTE_DEPLOY_DIR
        ln -sfn $REMOTE_DEPLOY_DIR $DEPLOY_PATH/current
    "

    # Copy files using rsync (much faster than scp)
    print_status "Transferring files..."
    rsync -avz --delete --exclude='node_modules' --exclude='.git' \
        -e "ssh -o StrictHostKeyChecking=no" \
        $FRONTEND_DIR/ \
        $DEPLOY_USER@$DEPLOY_HOST:$REMOTE_DEPLOY_DIR/

    # Install dependencies on remote server
    print_status "Installing frontend dependencies on server..."
    ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        cd $REMOTE_DEPLOY_DIR/httpdocs
        npm ci --production --ignore-scripts
    "

    # Install backend dependencies if backend directory exists
    if ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "[ -d $REMOTE_DEPLOY_DIR/backend/backend ]"; then
        print_status "Installing backend dependencies on server..."
        ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
            cd $REMOTE_DEPLOY_DIR/backend/backend
            npm ci --production --ignore-scripts
        "
    fi

    # Update environment variables
    print_status "Updating environment variables..."
    ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        cd $REMOTE_DEPLOY_DIR
        cat > .env << EOF
NODE_ENV=$ENVIRONMENT
PORT=3001
RAZORPAY_KEY_ID=\$RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET=\$RAZORPAY_KEY_SECRET
DOMAIN=https://www.ssplt10.cloud
VITE_SUPABASE_PROJECT_ID=\$VITE_SUPABASE_PROJECT_ID
VITE_SUPABASE_PUBLISHABLE_KEY=\$VITE_SUPABASE_ANON_KEY
VITE_SUPABASE_URL=\$VITE_SUPABASE_URL
VITE_RAZORPAY_KEY_ID=\$VITE_RAZORPAY_KEY_ID
VITE_APP_NAME='Southern Street Premier League'
VITE_APP_VERSION=1.0.0
EOF
    "

    # Restart application
    print_status "Restarting application..."
    ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        cd $REMOTE_DEPLOY_DIR
        pm2 stop sspl-frontend sspl-backend || true
        pm2 delete sspl-frontend sspl-backend || true
        pm2 start ecosystem.config.cjs
        pm2 save
    "

    # Health check
    print_status "Performing health check..."
    for i in {1..30}; do
        if ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
            curl -f http://localhost:3000/health >/dev/null 2>&1 &&
            curl -f http://localhost:3001/health >/dev/null 2>&1
        "; then
            print_status "Deployment successful!"

            # Purge Cloudflare cache after successful deployment
            print_status "Purging Cloudflare cache..."
            if [ -f "./cloudflare-purge.sh" ]; then
                ./cloudflare-purge.sh deploy || print_warning "Cache purge failed, but deployment was successful"
            else
                print_warning "Cache purge script not found, skipping cache invalidation"
            fi

            return 0
        fi
        echo "Waiting for application to be ready... ($i/30)"
        sleep 10
    done

    print_error "Health check failed"
    return 1
}

# Deploy locally (on server)
deploy_local() {
    print_status "Deploying locally..."

    cd "$FRONTEND_DIR"

    # Install/update dependencies
    if [ ! -d "node_modules" ] || [ "$SKIP_BUILD" = "false" ]; then
        npm ci --production --ignore-scripts
    fi

    # Update environment file
    cat > .env << EOF
NODE_ENV=$ENVIRONMENT
PORT=3001
RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID:-your_razorpay_key}
RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET:-your_razorpay_secret}
DOMAIN=https://www.ssplt10.cloud
VITE_SUPABASE_PROJECT_ID=${VITE_SUPABASE_PROJECT_ID:-your_project_id}
VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_ANON_KEY:-your_supabase_key}
VITE_SUPABASE_URL=${VITE_SUPABASE_URL:-your_supabase_url}
VITE_RAZORPAY_KEY_ID=${VITE_RAZORPAY_KEY_ID:-your_razorpay_key}
VITE_APP_NAME='Southern Street Premier League'
VITE_APP_VERSION=1.0.0
EOF

    # Restart PM2 applications
    pm2 stop sspl-frontend sspl-backend || true
    pm2 delete sspl-frontend sspl-backend || true
    pm2 start ecosystem.config.cjs
    pm2 save

    print_status "Local deployment completed"
}

# Cleanup old deployments
cleanup_old_deployments() {
    if is_remote_server; then
        print_status "Cleaning up old deployments..."
        # Keep only last 5 deployments
        ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
            cd $DEPLOY_PATH/deployments
            ls -t | tail -n +6 | xargs -r rm -rf
        "
    fi
}

# Main deployment flow
main() {
    validate_environment

    echo "📋 Deployment checklist:"
    echo "  ✅ Environment: $ENVIRONMENT"
    echo "  ✅ Skip build: $SKIP_BUILD"
    echo "  ✅ Remote server: $(is_remote_server && echo 'Yes' || echo 'No')"

    if ! is_remote_server; then
        build_frontend
        deploy_remote
    else
        deploy_local
    fi

    cleanup_old_deployments

    echo ""
    echo "🎉 Deployment to $ENVIRONMENT completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "  1. Test the application at https://www.ssplt10.cloud"
    echo "  2. Check PM2 status: pm2 status"
    echo "  3. Monitor logs: pm2 logs"
    echo "  4. Verify API endpoints are working"
    echo "  5. Run verification: ./verify-deployment.sh $ENVIRONMENT"
    echo "  6. Start monitoring: ./monitor-deployment.sh $ENVIRONMENT &"
    echo ""
    echo "🚨 Emergency commands:"
    echo "  • Quick restart: ./incident-response.sh restart"
    echo "  • Emergency rollback: ./incident-response.sh rollback"
    echo "  • System diagnostics: ./incident-response.sh diagnose"
}

# Run main function
main "$@"