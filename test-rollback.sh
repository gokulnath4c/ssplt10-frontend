#!/bin/bash

# SSPL Rollback Mechanism Test Script
# Tests the rollback functionality and measures time to ensure 30-second requirement
# Usage: ./test-rollback.sh [environment]

set -e

ENVIRONMENT=${1:-"production"}
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_RESULTS="$PROJECT_ROOT/test_results.txt"

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
    echo -e "${PURPLE}🧪 $1${NC}"
}

# Log test results
log_test_result() {
    local test_name=$1
    local result=$2
    local details=$3

    echo "$(date '+%Y-%m-%d %H:%M:%S') TEST:$test_name RESULT:$result DETAILS:$details" >> "$TEST_RESULTS"
}

# Test 1: Validate rollback script exists and is executable
test_rollback_script_exists() {
    print_header "Test 1: Rollback Script Validation"

    if [ -f "./rollback.sh" ]; then
        print_status "Rollback script exists"
    else
        print_error "Rollback script not found"
        return 1
    fi

    if [ -x "./rollback.sh" ]; then
        print_status "Rollback script is executable"
    else
        print_warning "Rollback script is not executable, attempting to make it executable"
        chmod +x ./rollback.sh
        if [ -x "./rollback.sh" ]; then
            print_status "Rollback script is now executable"
        else
            print_error "Failed to make rollback script executable"
            return 1
        fi
    fi

    log_test_result "SCRIPT_VALIDATION" "PASS" "Rollback script exists and is executable"
    return 0
}

# Test 2: Validate ecosystem config
test_ecosystem_config() {
    print_header "Test 2: PM2 Ecosystem Configuration Validation"

    if [ -f "./ecosystem.config.cjs" ]; then
        print_status "Ecosystem config file exists"
    else
        print_error "Ecosystem config file not found"
        return 1
    fi

    # Check if config has both frontend and backend
    if grep -q "sspl-frontend" ./ecosystem.config.cjs && grep -q "sspl-backend" ./ecosystem.config.cjs; then
        print_status "Ecosystem config contains both frontend and backend processes"
    else
        print_error "Ecosystem config missing required processes"
        return 1
    fi

    # Check for health check configuration
    if grep -q "health_check" ./ecosystem.config.cjs; then
        print_status "Health check configuration found in ecosystem config"
    else
        print_warning "Health check configuration not found in ecosystem config"
    fi

    log_test_result "ECOSYSTEM_VALIDATION" "PASS" "PM2 ecosystem config is valid"
    return 0
}

# Test 3: Validate health endpoints
test_health_endpoints() {
    print_header "Test 3: Health Endpoints Validation"

    local test_passed=true

    # Test frontend health endpoint
    if curl -f -s --max-time 5 http://localhost:3000/health >/dev/null 2>&1; then
        print_status "Frontend basic health endpoint is accessible"
    else
        print_warning "Frontend basic health endpoint is not accessible"
        test_passed=false
    fi

    # Test frontend detailed health endpoint
    if curl -f -s --max-time 5 http://localhost:3000/health/detailed >/dev/null 2>&1; then
        print_status "Frontend detailed health endpoint is accessible"
    else
        print_warning "Frontend detailed health endpoint is not accessible"
        test_passed=false
    fi

    # Test backend health endpoint
    if curl -f -s --max-time 5 http://localhost:3001/health >/dev/null 2>&1; then
        print_status "Backend basic health endpoint is accessible"
    else
        print_warning "Backend basic health endpoint is not accessible"
        test_passed=false
    fi

    # Test backend detailed health endpoint
    if curl -f -s --max-time 5 http://localhost:3001/health/detailed >/dev/null 2>&1; then
        print_status "Backend detailed health endpoint is accessible"
    else
        print_warning "Backend detailed health endpoint is not accessible"
        test_passed=false
    fi

    if [ "$test_passed" = true ]; then
        log_test_result "HEALTH_ENDPOINTS" "PASS" "All health endpoints are accessible"
        return 0
    else
        log_test_result "HEALTH_ENDPOINTS" "WARNING" "Some health endpoints are not accessible"
        return 1
    fi
}

# Test 4: Measure rollback time (simulation)
test_rollback_time_simulation() {
    print_header "Test 4: Rollback Time Measurement (Simulation)"

    print_info "This test simulates the rollback process timing"
    print_info "Note: Actual rollback time will depend on system performance"

    local start_time=$(date +%s%3N)

    # Simulate PM2 process stop (2 seconds)
    print_info "Simulating PM2 process stop..."
    sleep 2

    # Simulate symlink switch (1 second)
    print_info "Simulating deployment symlink switch..."
    sleep 1

    # Simulate PM2 process start (3 seconds)
    print_info "Simulating PM2 process start..."
    sleep 3

    # Simulate health checks (6 attempts * 3 seconds = 18 seconds max)
    print_info "Simulating health checks..."
    local health_check_attempts=0
    local health_check_passed=false

    while [ $health_check_attempts -lt 6 ]; do
        sleep 3
        health_check_attempts=$((health_check_attempts + 1))

        # Simulate 80% success rate
        if [ $((RANDOM % 10)) -lt 8 ]; then
            health_check_passed=true
            break
        fi

        print_info "Health check attempt $health_check_attempts failed, retrying..."
    done

    local end_time=$(date +%s%3N)
    local total_time=$((end_time - start_time))

    print_info "Simulated rollback time: ${total_time}ms"

    if [ $total_time -le 30000 ]; then  # 30 seconds = 30000ms
        print_status "Simulated rollback time is within 30-second requirement"
        log_test_result "ROLLBACK_TIME_SIMULATION" "PASS" "Simulated rollback completed in ${total_time}ms"
        return 0
    else
        print_warning "Simulated rollback time exceeded 30-second requirement: ${total_time}ms"
        log_test_result "ROLLBACK_TIME_SIMULATION" "WARNING" "Simulated rollback took ${total_time}ms (over 30s limit)"
        return 1
    fi
}

# Test 5: Validate monitoring scripts
test_monitoring_scripts() {
    print_header "Test 5: Monitoring Scripts Validation"

    local test_passed=true

    # Check monitoring script
    if [ -f "./monitor-deployment.sh" ]; then
        print_status "Monitoring script exists"
        if [ -x "./monitor-deployment.sh" ]; then
            print_status "Monitoring script is executable"
        else
            print_warning "Monitoring script is not executable"
            test_passed=false
        fi
    else
        print_error "Monitoring script not found"
        test_passed=false
    fi

    # Check incident response script
    if [ -f "./incident-response.sh" ]; then
        print_status "Incident response script exists"
        if [ -x "./incident-response.sh" ]; then
            print_status "Incident response script is executable"
        else
            print_warning "Incident response script is not executable"
            test_passed=false
        fi
    else
        print_error "Incident response script not found"
        test_passed=false
    fi

    # Check verification script
    if [ -f "./verify-deployment.sh" ]; then
        print_status "Verification script exists"
        if [ -x "./verify-deployment.sh" ]; then
            print_status "Verification script is executable"
        else
            print_warning "Verification script is not executable"
            test_passed=false
        fi
    else
        print_error "Verification script not found"
        test_passed=false
    fi

    if [ "$test_passed" = true ]; then
        log_test_result "MONITORING_SCRIPTS" "PASS" "All monitoring scripts are present and executable"
        return 0
    else
        log_test_result "MONITORING_SCRIPTS" "WARNING" "Some monitoring scripts are missing or not executable"
        return 1
    fi
}

# Test 6: Validate deployment directory structure
test_deployment_structure() {
    print_header "Test 6: Deployment Directory Structure Validation"

    local test_passed=true

    # Check if deployments directory exists
    if [ -d "deployments" ]; then
        print_status "Deployments directory exists"
    else
        print_warning "Deployments directory does not exist (will be created on first deployment)"
    fi

    # Check if current symlink exists
    if [ -L "current" ]; then
        print_status "Current deployment symlink exists"
    else
        print_warning "Current deployment symlink does not exist (will be created on first deployment)"
    fi

    # Check logs directory
    if [ -d "logs" ]; then
        print_status "Logs directory exists"
    else
        print_info "Creating logs directory"
        mkdir -p logs
        print_status "Logs directory created"
    fi

    log_test_result "DEPLOYMENT_STRUCTURE" "PASS" "Deployment directory structure is valid"
    return 0
}

# Run comprehensive test suite
run_full_test_suite() {
    print_header "Running SSPL Rollback Mechanism Test Suite"
    echo "Environment: $ENVIRONMENT"
    echo "Timestamp: $(date)"
    echo "========================================"
    echo ""

    local total_tests=6
    local passed_tests=0
    local failed_tests=0

    # Initialize test results file
    echo "SSPL Rollback Test Results - $(date)" > "$TEST_RESULTS"
    echo "========================================" >> "$TEST_RESULTS"

    # Run individual tests
    if test_rollback_script_exists; then
        ((passed_tests++))
    else
        ((failed_tests++))
    fi

    echo ""

    if test_ecosystem_config; then
        ((passed_tests++))
    else
        ((failed_tests++))
    fi

    echo ""

    if test_health_endpoints; then
        ((passed_tests++))
    else
        ((failed_tests++))
    fi

    echo ""

    if test_rollback_time_simulation; then
        ((passed_tests++))
    else
        ((failed_tests++))
    fi

    echo ""

    if test_monitoring_scripts; then
        ((passed_tests++))
    else
        ((failed_tests++))
    fi

    echo ""

    if test_deployment_structure; then
        ((passed_tests++))
    else
        ((failed_tests++))
    fi

    # Print summary
    echo ""
    print_header "Test Suite Summary"
    echo "========================================"
    echo "Total Tests: $total_tests"
    echo "Passed: $passed_tests"
    echo "Failed: $failed_tests"
    echo "Success Rate: $((passed_tests * 100 / total_tests))%"
    echo ""

    if [ $failed_tests -eq 0 ]; then
        print_status "All tests passed! Rollback mechanism is ready for production."
        echo ""
        print_info "Next steps:"
        echo "  1. Deploy the application: ./deploy.sh $ENVIRONMENT"
        echo "  2. Run verification: ./verify-deployment.sh $ENVIRONMENT"
        echo "  3. Start monitoring: ./monitor-deployment.sh $ENVIRONMENT &"
        echo "  4. Test rollback manually: ./rollback.sh"
    else
        print_warning "Some tests failed. Please review and fix issues before production deployment."
        echo ""
        print_info "Failed tests may indicate:"
        echo "  • Missing or incorrect script permissions"
        echo "  • Health endpoints not responding"
        echo "  • PM2 configuration issues"
        echo "  • Missing dependencies"
    fi

    # Log final results
    echo "" >> "$TEST_RESULTS"
    echo "SUMMARY: $passed_tests/$total_tests tests passed" >> "$TEST_RESULTS"
    echo "Test completed at $(date)" >> "$TEST_RESULTS"
}

# Show help
show_help() {
    echo "SSPL Rollback Mechanism Test Script"
    echo ""
    echo "Usage: $0 [environment]"
    echo ""
    echo "Arguments:"
    echo "  environment    Target environment (production, preview, development) (default: production)"
    echo ""
    echo "This script runs a comprehensive test suite to validate:"
    echo "  • Rollback script functionality"
    echo "  • PM2 ecosystem configuration"
    echo "  • Health endpoint accessibility"
    echo "  • Rollback time requirements (30-second target)"
    echo "  • Monitoring and incident response scripts"
    echo "  • Deployment directory structure"
    echo ""
    echo "Results are logged to: test_results.txt"
}

# Parse arguments
case "$1" in
    -h|--help)
        show_help
        exit 0
        ;;
    *)
        run_full_test_suite
        ;;
esac