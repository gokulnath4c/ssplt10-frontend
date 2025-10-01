#!/bin/bash

# SSPL Incident Response Script
# Automated incident detection and response procedures
# Usage: ./incident-response.sh [action] [severity]

set -e

ACTION=${1:-"check"}
SEVERITY=${2:-"WARNING"}
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INCIDENT_LOG="$PROJECT_ROOT/logs/incidents.log"
RESPONSE_LOG="$PROJECT_ROOT/logs/incident_responses.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') ${GREEN}✅ $1${NC}" | tee -a "$RESPONSE_LOG"
}

print_warning() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') ${YELLOW}⚠️  $1${NC}" | tee -a "$RESPONSE_LOG"
}

print_error() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') ${RED}❌ $1${NC}" | tee -a "$RESPONSE_LOG"
}

print_info() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') ${BLUE}ℹ️  $1${NC}" | tee -a "$RESPONSE_LOG"
}

print_header() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') ${PURPLE}🚨 $1${NC}" | tee -a "$RESPONSE_LOG"
}

# Log incident response
log_response() {
    local action=$1
    local result=$2
    local details=$3

    echo "$(date '+%Y-%m-%d %H:%M:%S') ACTION:$action RESULT:$result DETAILS:$details" >> "$RESPONSE_LOG"
}

# Check system status
check_system_status() {
    print_header "Checking System Status"

    local issues=()

    # Check PM2 processes
    if ! pm2 jlist | jq -r '.[] | select(.name=="sspl-frontend") | .pm2_env.status' | grep -q "online"; then
        issues+=("Frontend PM2 process not running")
    fi

    if ! pm2 jlist | jq -r '.[] | select(.name=="sspl-backend") | .pm2_env.status' | grep -q "online"; then
        issues+=("Backend PM2 process not running")
    fi

    # Check health endpoints
    if ! curl -f -s http://localhost:3000/health >/dev/null 2>&1; then
        issues+=("Frontend health check failed")
    fi

    if ! curl -f -s http://localhost:3001/health >/dev/null 2>&1; then
        issues+=("Backend health check failed")
    fi

    # Check disk space
    local disk_usage
    disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')

    if [ "$disk_usage" -gt 90 ]; then
        issues+=("Disk usage high: ${disk_usage}%")
    fi

    # Check memory usage
    local memory_usage
    memory_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')

    if [ "$memory_usage" -gt 90 ]; then
        issues+=("Memory usage high: ${memory_usage}%")
    fi

    if [ ${#issues[@]} -gt 0 ]; then
        print_error "Found ${#issues[@]} system issues:"
        for issue in "${issues[@]}"; do
            print_error "  - $issue"
        done
        return 1
    else
        print_status "All system checks passed"
        return 0
    fi
}

# Quick restart procedure
quick_restart() {
    print_header "Performing Quick Restart"

    print_info "Stopping PM2 processes..."
    pm2 stop sspl-frontend sspl-backend || true
    pm2 delete sspl-frontend sspl-backend || true

    sleep 2

    print_info "Starting PM2 processes..."
    pm2 start ecosystem.config.cjs
    pm2 save

    sleep 5

    if check_system_status; then
        print_status "Quick restart successful"
        log_response "QUICK_RESTART" "SUCCESS" "System restarted and health checks passed"
        return 0
    else
        print_error "Quick restart failed"
        log_response "QUICK_RESTART" "FAILED" "System restart did not resolve issues"
        return 1
    fi
}

# Emergency rollback
emergency_rollback() {
    print_header "Performing Emergency Rollback"

    local reason="Emergency incident response"

    print_warning "Initiating emergency rollback..."

    if ./rollback.sh; then
        print_status "Emergency rollback completed"
        log_response "EMERGENCY_ROLLBACK" "SUCCESS" "System rolled back to previous deployment"
        return 0
    else
        print_error "Emergency rollback failed"
        log_response "EMERGENCY_ROLLBACK" "FAILED" "Rollback script failed"
        return 1
    fi
}

# Scale up resources (if applicable)
scale_up() {
    print_header "Attempting to Scale Up Resources"

    print_info "Checking if scaling is possible..."

    # Check current PM2 configuration
    local current_instances
    current_instances=$(pm2 jlist | jq -r '.[] | select(.name=="sspl-frontend") | .instances' 2>/dev/null || echo "1")

    if [ "$current_instances" = "1" ]; then
        print_info "Scaling frontend from 1 to 2 instances"
        pm2 scale sspl-frontend 2

        sleep 10

        if pm2 jlist | jq -r '.[] | select(.name=="sspl-frontend") | .instances' | grep -q "2"; then
            print_status "Successfully scaled frontend to 2 instances"
            log_response "SCALE_UP" "SUCCESS" "Frontend scaled from 1 to 2 instances"
            return 0
        else
            print_error "Failed to scale frontend"
            log_response "SCALE_UP" "FAILED" "Could not scale frontend instances"
            return 1
        fi
    else
        print_info "Already scaled or not applicable"
        log_response "SCALE_UP" "SKIPPED" "Already at target scale"
        return 0
    fi
}

# Gather diagnostic information
gather_diagnostics() {
    print_header "Gathering Diagnostic Information"

    local diag_dir="$PROJECT_ROOT/diagnostics/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$diag_dir"

    print_info "Collecting system information..."

    # System info
    uname -a > "$diag_dir/system_info.txt"
    df -h > "$diag_dir/disk_usage.txt"
    free -h > "$diag_dir/memory_info.txt"
    ps aux > "$diag_dir/process_list.txt"

    # PM2 info
    pm2 list > "$diag_dir/pm2_list.txt"
    pm2 logs --lines 50 > "$diag_dir/pm2_logs.txt"

    # Application logs
    cp -r logs/* "$diag_dir/" 2>/dev/null || true

    # Health check outputs
    curl -s http://localhost:3000/health/detailed > "$diag_dir/frontend_health.json" 2>/dev/null || echo "Failed to get frontend health" > "$diag_dir/frontend_health.json"
    curl -s http://localhost:3001/health/detailed > "$diag_dir/backend_health.json" 2>/dev/null || echo "Failed to get backend health" > "$diag_dir/backend_health.json"

    # Network info
    netstat -tlnp > "$diag_dir/network_connections.txt" 2>/dev/null || ss -tlnp > "$diag_dir/network_connections.txt" 2>/dev/null || true

    print_status "Diagnostic information collected in: $diag_dir"
    log_response "DIAGNOSTICS" "SUCCESS" "Diagnostic data collected in $diag_dir"

    echo "$diag_dir"
}

# Send alert
send_alert() {
    local subject=$1
    local message=$2

    print_warning "SENDING ALERT: $subject"
    print_info "Message: $message"

    # Placeholder for actual alerting (email, Slack, etc.)
    # This could be extended to send actual notifications

    log_response "ALERT" "SENT" "$subject: $message"
}

# Main incident response logic
main() {
    print_header "SSPL Incident Response System"
    echo "Action: $ACTION"
    echo "Severity: $SEVERITY"
    echo ""

    mkdir -p "$PROJECT_ROOT/logs"

    case "$ACTION" in
        "check")
            if check_system_status; then
                print_status "System status check completed - no issues found"
                exit 0
            else
                print_error "System issues detected"
                exit 1
            fi
            ;;

        "restart")
            if quick_restart; then
                send_alert "System Restarted" "System has been restarted successfully"
                exit 0
            else
                send_alert "Restart Failed" "System restart failed, manual intervention required"
                exit 1
            fi
            ;;

        "rollback")
            if emergency_rollback; then
                send_alert "Emergency Rollback Completed" "System has been rolled back to previous deployment"
                exit 0
            else
                send_alert "Rollback Failed" "Emergency rollback failed"
                exit 1
            fi
            ;;

        "scale")
            if scale_up; then
                send_alert "System Scaled Up" "System resources have been scaled up"
                exit 0
            else
                send_alert "Scale Up Failed" "Failed to scale up system resources"
                exit 1
            fi
            ;;

        "diagnose")
            diag_dir=$(gather_diagnostics)
            send_alert "Diagnostics Collected" "Diagnostic information collected in $diag_dir"
            exit 0
            ;;

        "auto")
            # Automatic response based on severity
            print_info "Running automatic incident response for severity: $SEVERITY"

            # Gather diagnostics first
            gather_diagnostics > /dev/null

            case "$SEVERITY" in
                "CRITICAL")
                    print_info "Critical severity - attempting emergency rollback"
                    if emergency_rollback; then
                        send_alert "Critical Incident Resolved" "Automatic emergency rollback completed"
                        exit 0
                    else
                        send_alert "Critical Incident Unresolved" "Automatic emergency rollback failed"
                        exit 1
                    fi
                    ;;

                "HIGH")
                    print_info "High severity - attempting quick restart"
                    if quick_restart; then
                        send_alert "High Incident Resolved" "Automatic quick restart completed"
                        exit 0
                    else
                        print_info "Quick restart failed, attempting rollback"
                        if emergency_rollback; then
                            send_alert "High Incident Resolved" "Automatic rollback completed after restart failure"
                            exit 0
                        else
                            send_alert "High Incident Unresolved" "Both restart and rollback failed"
                            exit 1
                        fi
                    fi
                    ;;

                "MEDIUM")
                    print_info "Medium severity - attempting quick restart"
                    if quick_restart; then
                        send_alert "Medium Incident Resolved" "Automatic quick restart completed"
                        exit 0
                    else
                        send_alert "Medium Incident Unresolved" "Automatic quick restart failed"
                        exit 1
                    fi
                    ;;

                "LOW"|"WARNING")
                    print_info "Low severity - gathering diagnostics only"
                    send_alert "Low Priority Incident" "Diagnostics collected, monitoring for escalation"
                    exit 0
                    ;;

                *)
                    print_error "Unknown severity level: $SEVERITY"
                    exit 1
                    ;;
            esac
            ;;

        *)
            echo "Usage: $0 [action] [severity]"
            echo ""
            echo "Actions:"
            echo "  check     - Check system status"
            echo "  restart   - Perform quick restart"
            echo "  rollback  - Perform emergency rollback"
            echo "  scale     - Scale up resources"
            echo "  diagnose  - Gather diagnostic information"
            echo "  auto      - Automatic response based on severity"
            echo ""
            echo "Severities:"
            echo "  CRITICAL  - System down, immediate action required"
            echo "  HIGH      - Major functionality impaired"
            echo "  MEDIUM    - Some functionality impaired"
            echo "  LOW       - Minor issues, monitoring"
            echo "  WARNING   - Potential issues detected"
            echo ""
            echo "Examples:"
            echo "  $0 check"
            echo "  $0 restart"
            echo "  $0 auto CRITICAL"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"