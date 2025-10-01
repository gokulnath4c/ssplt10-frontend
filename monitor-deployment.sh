#!/bin/bash

# SSPL Deployment Monitoring and Auto-Recovery Script
# Continuously monitors deployment health and triggers recovery procedures
# Usage: ./monitor-deployment.sh [environment] [remote_host]

set -e

ENVIRONMENT=${1:-"production"}
REMOTE_HOST=${2:-"62.72.43.74"}
REMOTE_USER="root"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$PROJECT_ROOT/logs/monitoring.log"
INCIDENT_LOG="$PROJECT_ROOT/logs/incidents.log"

# Monitoring configuration
MONITOR_INTERVAL=60  # Check every 60 seconds
HEALTH_TIMEOUT=10    # Health check timeout in seconds
MAX_FAILURES=3       # Max consecutive failures before recovery
RECOVERY_COOLDOWN=300 # Cooldown period after recovery (5 minutes)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Global variables for tracking state
consecutive_failures=0
last_recovery_time=0
monitoring_active=true

# Function to print colored output
print_status() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') ${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

print_warning() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') ${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

print_error() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') ${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

print_info() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') ${BLUE}ℹ️  $1${NC}" | tee -a "$LOG_FILE"
}

print_header() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') ${PURPLE}🔍 $1${NC}" | tee -a "$LOG_FILE"
}

# Log incident
log_incident() {
    local incident_type=$1
    local description=$2
    local severity=${3:-"WARNING"}

    echo "$(date '+%Y-%m-%d %H:%M:%S') [$severity] $incident_type: $description" >> "$INCIDENT_LOG"
}

# Check if we're running on the deployment server
is_remote_server() {
    if [ "$(hostname -I | grep -c '62.72.43')" -gt 0 ] || [ "$REMOTE_HOST" = "localhost" ]; then
        return 0
    else
        return 1
    fi
}

# Execute command locally or remotely
execute_command() {
    local cmd=$1

    if is_remote_server; then
        ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 $REMOTE_USER@$REMOTE_HOST "$cmd" 2>/dev/null
    else
        eval "$cmd" 2>/dev/null
    fi
}

# Check health of a service
check_service_health() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}

    local http_code
    http_code=$(execute_command "curl -s -o /dev/null -w '%{http_code}' --max-time $HEALTH_TIMEOUT '$url' 2>/dev/null")

    if [ "$http_code" = "$expected_status" ]; then
        return 0
    else
        return 1
    fi
}

# Get detailed health information
get_detailed_health() {
    local service_name=$1
    local url=$2

    execute_command "curl -s --max-time $HEALTH_TIMEOUT '$url' 2>/dev/null"
}

# Check PM2 process status
check_pm2_status() {
    local process_name=$1

    local status
    status=$(execute_command "pm2 jlist | jq -r '.[] | select(.name==\"$process_name\") | .pm2_env.status' 2>/dev/null")

    if [ "$status" = "online" ]; then
        return 0
    else
        return 1
    fi
}

# Restart PM2 process
restart_pm2_process() {
    local process_name=$1

    print_warning "Restarting PM2 process: $process_name"
    execute_command "pm2 restart $process_name"

    # Wait a moment for restart
    sleep 5

    # Verify restart
    if check_pm2_status "$process_name"; then
        print_status "Successfully restarted $process_name"
        return 0
    else
        print_error "Failed to restart $process_name"
        return 1
    fi
}

# Perform rollback
perform_rollback() {
    local reason=$1

    print_error "Performing automatic rollback due to: $reason"
    log_incident "AUTO_ROLLBACK" "Automatic rollback triggered: $reason" "CRITICAL"

    # Execute rollback script
    if is_remote_server; then
        ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST "
            cd /var/www/vhosts/ssplt10.cloud
            ./rollback.sh $ENVIRONMENT
        "
    else
        ./rollback.sh "$ENVIRONMENT"
    fi

    last_recovery_time=$(date +%s)
    consecutive_failures=0
}

# Check if we're in cooldown period
is_in_cooldown() {
    local current_time=$(date +%s)
    local time_since_recovery=$((current_time - last_recovery_time))

    if [ $time_since_recovery -lt $RECOVERY_COOLDOWN ]; then
        return 0
    else
        return 1
    fi
}

# Send alert (placeholder for actual alerting system)
send_alert() {
    local subject=$1
    local message=$2
    local severity=${3:-"WARNING"}

    print_warning "ALERT [$severity]: $subject"
    print_info "Message: $message"

    # Placeholder for email/Slack alerting
    # echo "Would send alert: $subject - $message" >> alerts.log

    log_incident "ALERT" "$subject: $message" "$severity"
}

# Main monitoring function
perform_health_check() {
    local health_issues=()

    print_info "Performing health check cycle..."

    # Check frontend health
    if ! check_service_health "frontend" "http://localhost:3000/health"; then
        health_issues+=("Frontend basic health check failed")
    fi

    if ! check_service_health "frontend-detailed" "http://localhost:3000/health/detailed"; then
        health_issues+=("Frontend detailed health check failed")
    fi

    # Check backend health
    if ! check_service_health "backend" "http://localhost:3001/health"; then
        health_issues+=("Backend basic health check failed")
    fi

    if ! check_service_health "backend-detailed" "http://localhost:3001/health/detailed"; then
        health_issues+=("Backend detailed health check failed")
    fi

    # Check PM2 processes
    if ! check_pm2_status "sspl-frontend"; then
        health_issues+=("Frontend PM2 process not running")
    fi

    if ! check_pm2_status "sspl-backend"; then
        health_issues+=("Backend PM2 process not running")
    fi

    # Check for high memory usage
    local frontend_memory
    frontend_memory=$(execute_command "pm2 jlist | jq -r '.[] | select(.name==\"sspl-frontend\") | .monit.memory / 1024 / 1024' 2>/dev/null | awk '{print int(\$1)}'")

    if [ "${frontend_memory:-0}" -gt 800 ]; then
        health_issues+=("Frontend memory usage high: ${frontend_memory}MB")
    fi

    local backend_memory
    backend_memory=$(execute_command "pm2 jlist | jq -r '.[] | select(.name==\"sspl-backend\") | .monit.memory / 1024 / 1024' 2>/dev/null | awk '{print int(\$1)}'")

    if [ "${backend_memory:-0}" -gt 500 ]; then
        health_issues+=("Backend memory usage high: ${backend_memory}MB")
    fi

    # Report issues
    if [ ${#health_issues[@]} -gt 0 ]; then
        consecutive_failures=$((consecutive_failures + 1))
        print_warning "Health check found ${#health_issues[@]} issues (failures: $consecutive_failures/$MAX_FAILURES)"

        for issue in "${health_issues[@]}"; do
            print_warning "  - $issue"
        done

        # Check if we should trigger recovery
        if [ $consecutive_failures -ge $MAX_FAILURES ]; then
            if is_in_cooldown; then
                print_warning "In cooldown period, skipping automatic recovery"
            else
                send_alert "Multiple Health Check Failures" "System has failed $consecutive_failures consecutive health checks. Triggering automatic recovery." "CRITICAL"
                perform_rollback "Multiple health check failures ($consecutive_failures consecutive)"
            fi
        fi

        return 1
    else
        if [ $consecutive_failures -gt 0 ]; then
            print_status "Health check recovered after $consecutive_failures failures"
            send_alert "Health Check Recovered" "System health has been restored after $consecutive_failures consecutive failures" "INFO"
        fi
        consecutive_failures=0
        return 0
    fi
}

# Check for error patterns in logs
check_error_logs() {
    local error_count
    error_count=$(execute_command "pm2 logs --lines 100 --nostream 2>/dev/null | grep -i error | wc -l")

    if [ "$error_count" -gt 10 ]; then
        print_warning "High error count in logs: $error_count errors in last 100 lines"
        log_incident "HIGH_ERROR_RATE" "Detected $error_count errors in recent logs" "WARNING"

        # Get recent errors for analysis
        local recent_errors
        recent_errors=$(execute_command "pm2 logs --lines 20 --nostream 2>/dev/null | grep -i error | tail -5")

        if echo "$recent_errors" | grep -q -i "connection\|timeout\|database"; then
            print_warning "Critical errors detected, considering recovery"
            return 1
        fi
    fi

    return 0
}

# Cleanup old log files
cleanup_logs() {
    # Keep only last 30 days of logs
    find "$PROJECT_ROOT/logs" -name "*.log" -mtime +30 -delete 2>/dev/null || true
}

# Signal handler for graceful shutdown
shutdown_monitoring() {
    print_info "Received shutdown signal, stopping monitoring..."
    monitoring_active=false
}

# Main monitoring loop
main() {
    # Setup signal handlers
    trap shutdown_monitoring SIGINT SIGTERM

    # Create log directories
    mkdir -p "$PROJECT_ROOT/logs"

    print_header "Starting SSPL Deployment Monitoring"
    print_info "Environment: $ENVIRONMENT"
    print_info "Server: $(is_remote_server && echo 'Remote' || echo 'Local')"
    print_info "Monitor interval: ${MONITOR_INTERVAL}s"
    print_info "Max failures before recovery: $MAX_FAILURES"
    echo ""

    # Initial health check
    perform_health_check

    # Main monitoring loop
    while [ "$monitoring_active" = true ]; do
        sleep $MONITOR_INTERVAL

        # Perform health checks
        if ! perform_health_check; then
            # Check for critical errors in logs
            if ! check_error_logs; then
                if [ $consecutive_failures -ge $((MAX_FAILURES - 1)) ]; then
                    print_warning "Critical errors detected, escalating recovery"
                fi
            fi
        fi

        # Periodic cleanup
        if [ $(( $(date +%s) % 3600 )) -eq 0 ]; then  # Every hour
            cleanup_logs
        fi
    done

    print_info "Monitoring stopped"
}

# Show help
show_help() {
    echo "SSPL Deployment Monitoring Script"
    echo ""
    echo "Usage: $0 [environment] [remote_host]"
    echo ""
    echo "Arguments:"
    echo "  environment    Target environment (production, preview, development) (default: production)"
    echo "  remote_host    Remote server hostname/IP (default: 62.72.43.74)"
    echo ""
    echo "Configuration:"
    echo "  MONITOR_INTERVAL  Check interval in seconds (default: 60)"
    echo "  MAX_FAILURES      Max consecutive failures before recovery (default: 3)"
    echo "  RECOVERY_COOLDOWN Cooldown after recovery in seconds (default: 300)"
    echo ""
    echo "Examples:"
    echo "  $0                          # Monitor local deployment"
    echo "  $0 production               # Monitor production deployment"
    echo "  MONITOR_INTERVAL=30 $0      # Monitor every 30 seconds"
}

# Parse arguments
case "$1" in
    -h|--help)
        show_help
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac