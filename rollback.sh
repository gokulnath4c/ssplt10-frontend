#!/bin/bash

# Blue-Green Deployment Rollback Script
# Automated rollback procedures for failed deployments

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Configuration
DEPLOY_HOST="62.72.43.74"
DEPLOY_USER="root"
DEPLOY_PATH="/var/www/vhosts/ssplt10.cloud"
ROLLBACK_LOG="$PROJECT_ROOT/logs/rollback.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Logging
mkdir -p "$PROJECT_ROOT/logs"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') $*" | tee -a "$ROLLBACK_LOG"
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

print_header() {
    log "${PURPLE}🚨 $1${NC}"
}

# Get current active environment
get_current_active() {
    if ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "[ -L $DEPLOY_PATH/current ]"; then
        local target
        target=$(ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "readlink $DEPLOY_PATH/current")
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

# Get previous environment (for rollback)
get_previous_environment() {
    local current_active
    current_active=$(get_current_active)

    case "$current_active" in
        "blue")
            echo "green"
            ;;
        "green")
            echo "blue"
            ;;
        *)
            echo "none"
            ;;
    esac
}

# Check if rollback environment is healthy
check_rollback_environment_health() {
    local rollback_env=$1
    local base_port

    if [ "$rollback_env" = "blue" ]; then
        base_port=3000
    else
        base_port=4000
    fi

    print_info "Checking health of rollback environment: $rollback_env"

    local max_attempts=10
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
            curl -f -s http://localhost:$base_port/health >/dev/null 2>&1 &&
            curl -f -s http://localhost:$((base_port+1))/health >/dev/null 2>&1
        "; then
            print_status "Rollback environment $rollback_env is healthy"
            return 0
        fi

        print_info "Waiting for rollback environment to be ready... ($attempt/$max_attempts)"
        sleep 5
        ((attempt++))
    done

    print_error "Rollback environment $rollback_env is not healthy"
    return 1
}

# Switch traffic back to previous environment
switch_to_previous_environment() {
    local rollback_env=$1

    print_info "Switching traffic to rollback environment: $rollback_env"

    ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        # Update nginx configuration
        sed -i 's/set \$active_env .*/set \$active_env $rollback_env;/' /etc/nginx/sites-available/ssplt10.cloud

        # Test nginx configuration
        nginx -t

        # Reload nginx
        nginx -s reload
    "

    print_status "Traffic switched to $rollback_env environment"
}

# Stop services in failed environment
stop_failed_environment() {
    local failed_env=$1

    print_info "Stopping services in failed environment: $failed_env"

    ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        # Stop PM2 processes for failed environment
        pm2 stop sspl-${failed_env}-frontend sspl-${failed_env}-backend || true
        pm2 delete sspl-${failed_env}-frontend sspl-${failed_env}-backend || true
        pm2 save
    "

    print_status "Services stopped in $failed_env environment"
}

# Rollback database changes
rollback_database() {
    local target_env=$1

    print_info "Rolling back database changes"

    # Run database rollback script
    if [ -f "$SCRIPT_DIR/database-migration-handler.sh" ]; then
        if "$SCRIPT_DIR/database-migration-handler.sh" rollback "$target_env"; then
            print_status "Database rollback completed"
            return 0
        else
            print_error "Database rollback failed"
            return 1
        fi
    else
        print_warning "Database migration handler not found, skipping database rollback"
        return 0
    fi
}

# Clean up failed deployment
cleanup_failed_deployment() {
    local failed_env=$1

    print_info "Cleaning up failed deployment in $failed_env environment"

    ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        # Remove failed deployment directory (keep last 2 for debugging)
        if [ -d $DEPLOY_PATH/${failed_env}/deployments ]; then
            cd $DEPLOY_PATH/${failed_env}/deployments
            ls -t | tail -n +3 | xargs -r rm -rf
        fi
    "

    print_status "Cleanup completed for $failed_env environment"
}

# Send rollback notifications
send_rollback_notification() {
    local rollback_env=$1
    local reason=$2

    print_info "Sending rollback notification"

    # Log rollback event
    echo "$(date '+%Y-%m-%d %H:%M:%S') ROLLBACK_COMPLETED Environment:$rollback_env Reason:$reason" >> "$ROLLBACK_LOG"

    # Here you could integrate with external notification systems
    # - Slack notifications
    # - Email alerts
    # - Monitoring dashboards

    print_status "Rollback notification sent"
}

# Validate rollback success
validate_rollback() {
    local rollback_env=$1
    local base_port

    if [ "$rollback_env" = "blue" ]; then
        base_port=3000
    else
        base_port=4000
    fi

    print_info "Validating rollback success"

    # Test health endpoints
    if ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        curl -f -s http://localhost:$base_port/health >/dev/null 2>&1 &&
        curl -f -s http://localhost:$((base_port+1))/health >/dev/null 2>&1
    "; then
        print_status "Rollback validation successful"
        return 0
    else
        print_error "Rollback validation failed"
        return 1
    fi
}

# Emergency rollback procedure
emergency_rollback() {
    print_header "EMERGENCY ROLLBACK INITIATED"

    local current_active
    current_active=$(get_current_active)

    if [ "$current_active" = "none" ]; then
        print_error "No active environment found for rollback"
        return 1
    fi

    local rollback_env
    rollback_env=$(get_previous_environment)

    if [ "$rollback_env" = "none" ]; then
        print_error "No previous environment available for rollback"
        return 1
    fi

    print_warning "Emergency rollback from $current_active to $rollback_env"

    # Check if rollback environment is available
    if ! ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "[ -d $DEPLOY_PATH/${rollback_env}/current ]"; then
        print_error "Rollback environment $rollback_env does not exist"
        return 1
    fi

    # Check rollback environment health
    if ! check_rollback_environment_health "$rollback_env"; then
        print_error "Rollback environment is not healthy, cannot proceed"
        return 1
    fi

    # Switch traffic immediately
    switch_to_previous_environment "$rollback_env"

    # Stop failed environment services
    stop_failed_environment "$current_active"

    # Rollback database changes
    rollback_database "$current_active"

    # Validate rollback
    if validate_rollback "$rollback_env"; then
        print_status "Emergency rollback completed successfully"
        send_rollback_notification "$rollback_env" "Emergency rollback from failed deployment"
        return 0
    else
        print_error "Emergency rollback validation failed"
        return 1
    fi
}

# Graceful rollback procedure
graceful_rollback() {
    local reason=${1:-"Manual rollback request"}

    print_header "GRACEFUL ROLLBACK INITIATED"

    local current_active
    current_active=$(get_current_active)

    if [ "$current_active" = "none" ]; then
        print_error "No active environment found for rollback"
        return 1
    fi

    local rollback_env
    rollback_env=$(get_previous_environment)

    if [ "$rollback_env" = "none" ]; then
        print_error "No previous environment available for rollback"
        return 1
    fi

    print_info "Graceful rollback from $current_active to $rollback_env"
    print_info "Reason: $reason"

    # Check rollback environment health
    if ! check_rollback_environment_health "$rollback_env"; then
        print_error "Rollback environment is not healthy"
        return 1
    fi

    # Switch traffic to rollback environment
    switch_to_previous_environment "$rollback_env"

    # Wait for traffic to stabilize
    sleep 10

    # Validate rollback
    if validate_rollback "$rollback_env"; then
        # Stop services in old environment
        stop_failed_environment "$current_active"

        # Clean up
        cleanup_failed_deployment "$current_active"

        print_status "Graceful rollback completed successfully"
        send_rollback_notification "$rollback_env" "$reason"
        return 0
    else
        print_error "Graceful rollback validation failed"
        return 1
    fi
}

# Show rollback status
show_status() {
    print_header "ROLLBACK STATUS"

    local current_active
    current_active=$(get_current_active)

    echo "Current Active Environment: $current_active"

    local rollback_env
    rollback_env=$(get_previous_environment)

    echo "Available Rollback Environment: $rollback_env"

    # Check environments status
    for env in blue green; do
        if ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "[ -d $DEPLOY_PATH/${env}/current ]"; then
            echo "$env Environment: Available"

            local base_port=3000
            [ "$env" = "green" ] && base_port=4000

            if ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
                curl -f -s http://localhost:$base_port/health >/dev/null 2>&1
            "; then
                echo "  Health: ✅ Healthy"
            else
                echo "  Health: ❌ Unhealthy"
            fi
        else
            echo "$env Environment: Not Available"
        fi
    done
}

# Main function
main() {
    local action=${1:-"emergency"}
    local reason=${2:-"Automated rollback"}

    print_header "BLUE-GREEN DEPLOYMENT ROLLBACK SYSTEM"
    echo "Action: $action"
    echo "Reason: $reason"
    echo ""

    case "$action" in
        "emergency")
            if emergency_rollback; then
                print_status "Emergency rollback completed successfully"
                exit 0
            else
                print_error "Emergency rollback failed"
                exit 1
            fi
            ;;

        "graceful")
            if graceful_rollback "$reason"; then
                print_status "Graceful rollback completed successfully"
                exit 0
            else
                print_error "Graceful rollback failed"
                exit 1
            fi
            ;;

        "status")
            show_status
            exit 0
            ;;

        *)
            echo "Usage: $0 [emergency|graceful|status] [reason]"
            echo ""
            echo "Actions:"
            echo "  emergency - Immediate rollback to previous environment"
            echo "  graceful  - Controlled rollback with validation"
            echo "  status    - Show current rollback status"
            echo ""
            echo "Examples:"
            echo "  $0 emergency"
            echo "  $0 graceful 'Manual rollback due to issues'"
            echo "  $0 status"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"