#!/bin/bash

# SSPL Deployment Verification Script
# Comprehensive health and performance verification after deployment
# Usage: ./verify-deployment.sh [environment] [remote_host]

set -e

ENVIRONMENT=${1:-"production"}
REMOTE_HOST=${2:-"62.72.43.74"}
REMOTE_USER="root"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header() {
    echo -e "${PURPLE}🔍 $1${NC}"
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
        ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST "$cmd"
    else
        eval "$cmd"
    fi
}

# Check PM2 process status
check_pm2_status() {
    print_header "Checking PM2 Process Status"

    local pm2_status
    pm2_status=$(execute_command "pm2 jlist")

    # Check if processes are running
    local frontend_running=$(echo "$pm2_status" | jq -r '.[] | select(.name=="sspl-frontend") | .pm2_env.status')
    local backend_running=$(echo "$pm2_status" | jq -r '.[] | select(.name=="sspl-backend") | .pm2_env.status')

    if [ "$frontend_running" = "online" ]; then
        print_status "Frontend PM2 process is running"
    else
        print_error "Frontend PM2 process is not running (status: $frontend_running)"
        return 1
    fi

    if [ "$backend_running" = "online" ]; then
        print_status "Backend PM2 process is running"
    else
        print_error "Backend PM2 process is not running (status: $backend_running)"
        return 1
    fi

    # Check memory usage
    local frontend_memory=$(echo "$pm2_status" | jq -r '.[] | select(.name=="sspl-frontend") | .monit.memory / 1024 / 1024 | floor')
    local backend_memory=$(echo "$pm2_status" | jq -r '.[] | select(.name=="sspl-backend") | .monit.memory / 1024 / 1024 | floor')

    print_info "Frontend memory usage: ${frontend_memory}MB"
    print_info "Backend memory usage: ${backend_memory}MB"

    if [ "$frontend_memory" -gt 500 ]; then
        print_warning "Frontend memory usage is high: ${frontend_memory}MB"
    fi

    if [ "$backend_memory" -gt 300 ]; then
        print_warning "Backend memory usage is high: ${backend_memory}MB"
    fi
}

# Check health endpoints
check_health_endpoints() {
    print_header "Checking Health Endpoints"

    local base_url="http://localhost"
    if ! is_remote_server; then
        base_url="http://localhost"
    fi

    # Check basic health endpoints
    if execute_command "curl -f -s ${base_url}:3000/health >/dev/null 2>&1"; then
        print_status "Frontend basic health check passed"
    else
        print_error "Frontend basic health check failed"
        return 1
    fi

    if execute_command "curl -f -s ${base_url}:3001/health >/dev/null 2>&1"; then
        print_status "Backend basic health check passed"
    else
        print_error "Backend basic health check failed"
        return 1
    fi

    # Check detailed health endpoints
    local frontend_health
    local backend_health

    frontend_health=$(execute_command "curl -s ${base_url}:3000/health/detailed 2>/dev/null")
    backend_health=$(execute_command "curl -s ${base_url}:3001/health/detailed 2>/dev/null")

    # Parse JSON responses
    if command -v jq >/dev/null 2>&1; then
        local frontend_status=$(echo "$frontend_health" | jq -r '.status' 2>/dev/null || echo "unknown")
        local backend_status=$(echo "$backend_health" | jq -r '.status' 2>/dev/null || echo "unknown")

        local frontend_response_time=$(echo "$frontend_health" | jq -r '.responseTime' 2>/dev/null || echo "0")
        local backend_response_time=$(echo "$backend_health" | jq -r '.responseTime' 2>/dev/null || echo "0")

        if [ "$frontend_status" = "ok" ]; then
            print_status "Frontend detailed health check passed (${frontend_response_time}ms)"
        else
            print_warning "Frontend detailed health check: $frontend_status"
        fi

        if [ "$backend_status" = "ok" ]; then
            print_status "Backend detailed health check passed (${backend_response_time}ms)"
        else
            print_warning "Backend detailed health check: $backend_status"
        fi

        # Check service statuses
        if [ "$backend_health" != "" ]; then
            echo "$backend_health" | jq -r '.services | to_entries[] | "  \(.key): \(.value.status)"' 2>/dev/null | while read -r service; do
                if echo "$service" | grep -q ": ok$"; then
                    print_status "Service check: $service"
                else
                    print_warning "Service check: $service"
                fi
            done
        fi
    else
        print_warning "jq not available, skipping detailed JSON parsing"
    fi
}

# Check API endpoints
check_api_endpoints() {
    print_header "Checking API Endpoints"

    local base_url="http://localhost"
    if ! is_remote_server; then
        base_url="http://localhost"
    fi

    # Test backend API endpoints
    local endpoints=(
        "/create-order"
        "/verify-payment"
        "/health"
        "/health/detailed"
    )

    for endpoint in "${endpoints[@]}"; do
        local start_time=$(date +%s%3N)
        if execute_command "curl -f -s ${base_url}:3001${endpoint} >/dev/null 2>&1"; then
            local end_time=$(date +%s%3N)
            local response_time=$((end_time - start_time))
            print_status "API endpoint ${endpoint} accessible (${response_time}ms)"
        else
            print_error "API endpoint ${endpoint} not accessible"
        fi
    done
}

# Check external connectivity
check_external_services() {
    print_header "Checking External Service Connectivity"

    # Check internet connectivity
    if execute_command "curl -f -s --max-time 10 https://www.google.com >/dev/null 2>&1"; then
        print_status "Internet connectivity is working"
    else
        print_warning "Internet connectivity check failed"
    fi

    # Check DNS resolution
    if execute_command "nslookup www.ssplt10.cloud >/dev/null 2>&1"; then
        print_status "DNS resolution for domain is working"
    else
        print_warning "DNS resolution for domain failed"
    fi
}

# Check logs for errors
check_logs() {
    print_header "Checking Application Logs for Errors"

    local log_errors
    log_errors=$(execute_command "pm2 logs --lines 50 --nostream | grep -i error | wc -l")

    if [ "$log_errors" -gt 0 ]; then
        print_warning "Found $log_errors error entries in recent logs"
        execute_command "pm2 logs --lines 20 --nostream | grep -i error | tail -5"
    else
        print_status "No recent errors found in application logs"
    fi
}

# Performance metrics
check_performance() {
    print_header "Performance Metrics"

    # Check response times for key endpoints
    local endpoints=(
        "http://localhost:3000/health"
        "http://localhost:3001/health"
        "http://localhost:3000/"
    )

    for endpoint in "${endpoints[@]}"; do
        local response_time
        response_time=$(execute_command "curl -o /dev/null -s -w '%{time_total}' ${endpoint} 2>/dev/null | awk '{print \$1 * 1000}'")

        if [ "$(echo "$response_time > 0" | bc -l 2>/dev/null)" = "1" ]; then
            if [ "$(echo "$response_time < 1000" | bc -l 2>/dev/null)" = "1" ]; then
                print_status "Response time for ${endpoint}: ${response_time}ms"
            else
                print_warning "Slow response time for ${endpoint}: ${response_time}ms"
            fi
        else
            print_error "Failed to measure response time for ${endpoint}"
        fi
    done
}

# Generate verification report
generate_report() {
    print_header "Deployment Verification Report"

    echo "========================================"
    echo "Environment: $ENVIRONMENT"
    echo "Server: $(is_remote_server && echo 'Remote' || echo 'Local')"
    echo "Timestamp: $(date)"
    echo "========================================"
    echo ""

    # Summary of checks
    local checks_passed=0
    local total_checks=0

    # Count successful checks (this is a simple approximation)
    ((total_checks++))
    if check_pm2_status >/dev/null 2>&1; then ((checks_passed++)); fi

    ((total_checks++))
    if check_health_endpoints >/dev/null 2>&1; then ((checks_passed++)); fi

    ((total_checks++))
    if check_api_endpoints >/dev/null 2>&1; then ((checks_passed++)); fi

    ((total_checks++))
    if check_external_services >/dev/null 2>&1; then ((checks_passed++)); fi

    echo "Verification Results:"
    echo "✅ Checks Passed: $checks_passed/$total_checks"

    if [ $checks_passed -eq $total_checks ]; then
        print_status "All verification checks passed!"
        return 0
    else
        print_warning "Some verification checks failed"
        return 1
    fi
}

# Main verification flow
main() {
    print_header "SSPL Deployment Verification"
    echo "Environment: $ENVIRONMENT"
    echo "Server: $(is_remote_server && echo 'Remote' || echo 'Local')"
    echo ""

    local verification_passed=true

    # Run all checks
    if ! check_pm2_status; then verification_passed=false; fi
    echo ""

    if ! check_health_endpoints; then verification_passed=false; fi
    echo ""

    if ! check_api_endpoints; then verification_passed=false; fi
    echo ""

    if ! check_external_services; then verification_passed=false; fi
    echo ""

    check_logs
    echo ""

    check_performance
    echo ""

    generate_report

    echo ""
    if [ "$verification_passed" = true ]; then
        print_status "Deployment verification completed successfully!"
        exit 0
    else
        print_error "Deployment verification failed!"
        echo ""
        print_info "Consider running rollback if issues persist:"
        echo "  ./rollback.sh"
        exit 1
    fi
}

# Show help
show_help() {
    echo "SSPL Deployment Verification Script"
    echo ""
    echo "Usage: $0 [environment] [remote_host]"
    echo ""
    echo "Arguments:"
    echo "  environment    Target environment (production, preview, development) (default: production)"
    echo "  remote_host    Remote server hostname/IP (default: 62.72.43.74)"
    echo ""
    echo "Examples:"
    echo "  $0                          # Verify local deployment"
    echo "  $0 production               # Verify production deployment"
    echo "  $0 production 192.168.1.100 # Verify deployment on specific server"
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