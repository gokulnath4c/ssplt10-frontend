#!/bin/bash

# Blue-Green Deployment Monitoring Integration
# Integrates with existing health checks and monitoring systems

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Configuration
DEPLOY_HOST="62.72.43.74"
DEPLOY_USER="root"
MONITORING_INTERVAL=60  # seconds
HEALTH_CHECK_TIMEOUT=10
LOG_FILE="$PROJECT_ROOT/logs/blue-green-monitoring.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Monitoring state
ACTIVE_ENV=""
LAST_HEALTH_CHECK=""
CONSECUTIVE_FAILURES=0
MAX_FAILURES=3

# Logging
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

print_header() {
    log "${PURPLE}🔍 $1${NC}"
}

# Get current active environment
get_active_environment() {
    if ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "[ -L /var/www/vhosts/ssplt10.cloud/current ]"; then
        local target
        target=$(ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "readlink /var/www/vhosts/ssplt10.cloud/current")
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

# Check environment health
check_environment_health() {
    local env=$1
    local base_port

    if [ "$env" = "blue" ]; then
        base_port=3000
    else
        base_port=4000
    fi

    local health_status="healthy"

    # Check frontend health
    if ! ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        curl -f -s --max-time $HEALTH_CHECK_TIMEOUT http://localhost:$base_port/health >/dev/null 2>&1
    "; then
        health_status="unhealthy"
    fi

    # Check backend health
    if ! ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        curl -f -s --max-time $HEALTH_CHECK_TIMEOUT http://localhost:$((base_port+1))/health >/dev/null 2>&1
    "; then
        health_status="unhealthy"
    fi

    echo "$health_status"
}

# Check nginx status
check_nginx_status() {
    if ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        systemctl is-active --quiet nginx
    "; then
        echo "healthy"
    else
        echo "unhealthy"
    fi
}

# Check PM2 processes
check_pm2_processes() {
    local healthy_count
    healthy_count=$(ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        pm2 jlist | jq -r '.[] | select(.pm2_env.status==\"online\") | .name' | wc -l
    ")

    if [ "$healthy_count" -ge 2 ]; then
        echo "healthy"
    else
        echo "unhealthy"
    fi
}

# Monitor system resources
check_system_resources() {
    local cpu_usage
    local memory_usage
    local disk_usage

    cpu_usage=$(ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\([0-9.]*\)%* id.*/\1/' | awk '{print 100 - \$1}'
    ")

    memory_usage=$(ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        free | grep Mem | awk '{printf \"%.0f\", \$3/\$2 * 100.0}'
    ")

    disk_usage=$(ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        df / | tail -1 | awk '{print \$5}' | sed 's/%//'
    ")

    # Alert thresholds
    if (( $(echo "$cpu_usage > 90" | bc -l) )) || \
       (( $(echo "$memory_usage > 90" | bc -l) )) || \
       [ "$disk_usage" -gt 90 ]; then
        echo "critical"
    elif (( $(echo "$cpu_usage > 70" | bc -l) )) || \
         (( $(echo "$memory_usage > 70" | bc -l) )) || \
         [ "$disk_usage" -gt 80 ]; then
        echo "warning"
    else
        echo "healthy"
    fi
}

# Send alert
send_alert() {
    local severity=$1
    local message=$2
    local details=$3

    print_warning "SENDING $severity ALERT: $message"

    # Log alert
    echo "$(date '+%Y-%m-%d %H:%M:%S') ALERT severity:$severity message:'$message' details:'$details'" >> "$LOG_FILE"

    # Integrate with existing incident response system
    if [ -f "$SCRIPT_DIR/incident-response.sh" ]; then
        case "$severity" in
            "CRITICAL")
                "$SCRIPT_DIR/incident-response.sh" auto CRITICAL &
                ;;
            "HIGH")
                "$SCRIPT_DIR/incident-response.sh" auto HIGH &
                ;;
            "MEDIUM")
                "$SCRIPT_DIR/incident-response.sh" auto MEDIUM &
                ;;
        esac
    fi

    # Here you could integrate with external monitoring systems:
    # - Send Slack notifications
    # - Send email alerts
    # - Update monitoring dashboards
    # - Trigger PagerDuty alerts
}

# Handle health check failure
handle_health_failure() {
    local env=$1
    local component=$2

    CONSECUTIVE_FAILURES=$((CONSECUTIVE_FAILURES + 1))

    if [ $CONSECUTIVE_FAILURES -ge $MAX_FAILURES ]; then
        print_error "Multiple health check failures detected ($CONSECUTIVE_FAILURES/$MAX_FAILURES)"

        case $CONSECUTIVE_FAILURES in
            $MAX_FAILURES)
                send_alert "MEDIUM" "Health check failures detected" "$component in $env environment failing"
                ;;
            $((MAX_FAILURES + 2)))
                send_alert "HIGH" "Persistent health check failures" "$component in $env environment consistently failing"
                ;;
            $((MAX_FAILURES + 4)))
                send_alert "CRITICAL" "Critical health check failures" "Automatic rollback may be triggered"
                ;;
        esac
    fi
}

# Reset failure counter on successful health check
reset_failure_counter() {
    if [ $CONSECUTIVE_FAILURES -gt 0 ]; then
        print_status "Health check recovered after $CONSECUTIVE_FAILURES failures"
        CONSECUTIVE_FAILURES=0
    fi
}

# Collect detailed metrics
collect_metrics() {
    local env=$1
    local base_port

    if [ "$env" = "blue" ]; then
        base_port=3000
    else
        base_port=4000
    fi

    print_info "Collecting detailed metrics for $env environment"

    # Get detailed health information
    local frontend_health
    local backend_health

    frontend_health=$(ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        curl -s --max-time 5 http://localhost:$base_port/health/detailed 2>/dev/null || echo '{\"status\":\"unhealthy\"}'
    ")

    backend_health=$(ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        curl -s --max-time 5 http://localhost:$((base_port+1))/health/detailed 2>/dev/null || echo '{\"status\":\"unhealthy\"}'
    ")

    # Log metrics
    echo "$(date '+%Y-%m-%d %H:%M:%S') METRICS env:$env frontend:'$frontend_health' backend:'$backend_health'" >> "$LOG_FILE"
}

# Main monitoring loop
monitoring_loop() {
    print_header "Starting Blue-Green Deployment Monitoring"

    while true; do
        local current_time
        current_time=$(date '+%Y-%m-%d %H:%M:%S')

        print_info "Monitoring cycle started at $current_time"

        # Get current active environment
        local active_env
        active_env=$(get_active_environment)

        if [ "$active_env" != "$ACTIVE_ENV" ]; then
            print_info "Environment change detected: $ACTIVE_ENV -> $active_env"
            ACTIVE_ENV="$active_env"
            CONSECUTIVE_FAILURES=0
        fi

        # Skip monitoring if no active environment
        if [ "$active_env" = "none" ] || [ "$active_env" = "unknown" ]; then
            print_warning "No active environment detected, skipping health checks"
            sleep "$MONITORING_INTERVAL"
            continue
        fi

        # Check environment health
        local env_health
        env_health=$(check_environment_health "$active_env")

        if [ "$env_health" = "healthy" ]; then
            reset_failure_counter
            print_status "$active_env environment is healthy"
        else
            print_error "$active_env environment health check failed"
            handle_health_failure "$active_env" "environment"
        fi

        # Check nginx status
        local nginx_status
        nginx_status=$(check_nginx_status)

        if [ "$nginx_status" = "healthy" ]; then
            print_status "Nginx is healthy"
        else
            print_error "Nginx health check failed"
            handle_health_failure "$active_env" "nginx"
        fi

        # Check PM2 processes
        local pm2_status
        pm2_status=$(check_pm2_processes)

        if [ "$pm2_status" = "healthy" ]; then
            print_status "PM2 processes are healthy"
        else
            print_error "PM2 processes health check failed"
            handle_health_failure "$active_env" "pm2"
        fi

        # Check system resources
        local resource_status
        resource_status=$(check_system_resources)

        case "$resource_status" in
            "healthy")
                print_status "System resources are healthy"
                ;;
            "warning")
                print_warning "System resource usage is high"
                ;;
            "critical")
                print_error "System resource usage is critical"
                send_alert "HIGH" "Critical system resource usage" "CPU/Memory/Disk usage above thresholds"
                ;;
        esac

        # Collect detailed metrics every 5 minutes
        if [ $(( $(date +%s) % 300 )) -eq 0 ]; then
            collect_metrics "$active_env"
        fi

        # Update last health check time
        LAST_HEALTH_CHECK="$current_time"

        print_info "Monitoring cycle completed, sleeping for $MONITORING_INTERVAL seconds"
        sleep "$MONITORING_INTERVAL"
    done
}

# Show monitoring status
show_status() {
    print_header "BLUE-GREEN MONITORING STATUS"

    echo "Active Environment: $ACTIVE_ENV"
    echo "Last Health Check: $LAST_HEALTH_CHECK"
    echo "Consecutive Failures: $CONSECUTIVE_FAILURES"
    echo "Monitoring Interval: $MONITORING_INTERVAL seconds"
    echo ""

    # Current health status
    local current_env
    current_env=$(get_active_environment)

    if [ "$current_env" != "none" ]; then
        echo "Current Environment Health:"
        echo "  Environment: $(check_environment_health "$current_env")"
        echo "  Nginx: $(check_nginx_status)"
        echo "  PM2: $(check_pm2_processes)"
        echo "  Resources: $(check_system_resources)"
    fi
}

# Manual health check
manual_health_check() {
    print_header "MANUAL HEALTH CHECK"

    local env=${1:-$(get_active_environment)}

    if [ "$env" = "none" ]; then
        print_error "No active environment found"
        return 1
    fi

    echo "Environment: $env"
    echo "Health Status: $(check_environment_health "$env")"
    echo "Nginx Status: $(check_nginx_status)"
    echo "PM2 Status: $(check_pm2_processes)"
    echo "Resource Status: $(check_system_resources)"
}

# Main function
main() {
    local action=${1:-"start"}

    case "$action" in
        "start")
            monitoring_loop
            ;;
        "status")
            show_status
            ;;
        "check")
            manual_health_check "$2"
            ;;
        "stop")
            print_info "Stopping monitoring (send SIGTERM to process)"
            exit 0
            ;;
        *)
            echo "Usage: $0 [start|status|check|stop] [environment]"
            echo ""
            echo "Actions:"
            echo "  start  - Start monitoring loop"
            echo "  status - Show monitoring status"
            echo "  check  - Manual health check"
            echo "  stop   - Stop monitoring"
            echo ""
            echo "Examples:"
            echo "  $0 start"
            echo "  $0 status"
            echo "  $0 check blue"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"