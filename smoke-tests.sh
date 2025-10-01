#!/bin/bash

# Automated Smoke Tests for Blue-Green Deployments
# Validates critical functionality after deployment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Configuration
TARGET_ENV=${1:-"blue"}
BASE_URL="http://localhost:3000"
API_BASE_URL="http://localhost:3001"
TEST_TIMEOUT=30

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
TEST_RESULTS=()

# Logging
LOG_FILE="$PROJECT_ROOT/logs/smoke-tests.log"
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

# Record test result
record_test() {
    local test_name=$1
    local result=$2
    local details=$3

    if [ "$result" = "PASS" ]; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        TEST_RESULTS+=("✅ $test_name")
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        TEST_RESULTS+=("❌ $test_name: $details")
    fi
}

# Test HTTP endpoint
test_http_endpoint() {
    local url=$1
    local expected_status=${2:-200}
    local test_name=$3
    local timeout=${4:-10}

    if curl -f -s --max-time "$timeout" -o /dev/null -w "%{http_code}" "$url" | grep -q "^$expected_status$"; then
        record_test "$test_name" "PASS"
        return 0
    else
        record_test "$test_name" "FAIL" "Expected status $expected_status"
        return 1
    fi
}

# Test response content
test_response_content() {
    local url=$1
    local expected_content=$2
    local test_name=$3

    if curl -f -s --max-time 10 "$url" | grep -q "$expected_content"; then
        record_test "$test_name" "PASS"
        return 0
    else
        record_test "$test_name" "FAIL" "Content not found: $expected_content"
        return 1
    fi
}

# Test API response format
test_api_response() {
    local url=$1
    local test_name=$2

    local response
    response=$(curl -f -s --max-time 10 "$url")

    if echo "$response" | jq . >/dev/null 2>&1; then
        record_test "$test_name" "PASS"
        return 0
    else
        record_test "$test_name" "FAIL" "Invalid JSON response"
        return 1
    fi
}

# Test database connectivity
test_database_connectivity() {
    local test_name="Database Connectivity"

    # Test database connection through API
    if curl -f -s --max-time 10 "$API_BASE_URL/api/health" | grep -q "database.*ok"; then
        record_test "$test_name" "PASS"
        return 0
    else
        record_test "$test_name" "FAIL" "Database connection failed"
        return 1
    fi
}

# Test authentication flow
test_authentication() {
    local test_name="Authentication Flow"

    # Test auth endpoints are accessible
    if test_http_endpoint "$API_BASE_URL/auth/status" 200 "Auth Status Check"; then
        record_test "$test_name" "PASS"
        return 0
    else
        record_test "$test_name" "FAIL" "Auth endpoints not accessible"
        return 1
    fi
}

# Test payment integration
test_payment_integration() {
    local test_name="Payment Integration"

    # Test Razorpay integration endpoint
    if test_http_endpoint "$API_BASE_URL/api/payments/config" 200 "Payment Config Check"; then
        record_test "$test_name" "PASS"
        return 0
    else
        record_test "$test_name" "FAIL" "Payment integration failed"
        return 1
    fi
}

# Test QR code functionality
test_qr_functionality() {
    local test_name="QR Code Functionality"

    # Test QR code generation endpoint
    if test_http_endpoint "$API_BASE_URL/api/qr/generate" 200 "QR Generation Check"; then
        record_test "$test_name" "PASS"
        return 0
    else
        record_test "$test_name" "FAIL" "QR functionality failed"
        return 1
    fi
}

# Test static assets
test_static_assets() {
    local test_name="Static Assets"

    # Test main CSS file
    if test_http_endpoint "$BASE_URL/assets/index.css" 200 "CSS Asset Check"; then
        # Test main JS file
        if test_http_endpoint "$BASE_URL/assets/index.js" 200 "JS Asset Check"; then
            record_test "$test_name" "PASS"
            return 0
        fi
    fi

    record_test "$test_name" "FAIL" "Static assets not loading"
    return 1
}

# Test page load performance
test_performance() {
    local test_name="Page Load Performance"
    local url=$1

    local load_time
    load_time=$(curl -s -o /dev/null -w "%{time_total}" "$url")

    # Check if page loads within 3 seconds
    if (( $(echo "$load_time < 3.0" | bc -l) )); then
        record_test "$test_name" "PASS" "Load time: ${load_time}s"
        return 0
    else
        record_test "$test_name" "FAIL" "Slow load time: ${load_time}s"
        return 1
    fi
}

# Test error handling
test_error_handling() {
    local test_name="Error Handling"

    # Test 404 page
    if test_http_endpoint "$BASE_URL/nonexistent-page" 404 "404 Error Handling"; then
        record_test "$test_name" "PASS"
        return 0
    else
        record_test "$test_name" "FAIL" "Error handling not working"
        return 1
    fi
}

# Test security headers
test_security_headers() {
    local test_name="Security Headers"

    local headers
    headers=$(curl -I -s --max-time 10 "$BASE_URL")

    local required_headers=("X-Frame-Options" "X-Content-Type-Options" "X-XSS-Protection")
    local missing_headers=()

    for header in "${required_headers[@]}"; do
        if ! echo "$headers" | grep -q "$header"; then
            missing_headers+=("$header")
        fi
    done

    if [ ${#missing_headers[@]} -eq 0 ]; then
        record_test "$test_name" "PASS"
        return 0
    else
        record_test "$test_name" "FAIL" "Missing headers: ${missing_headers[*]}"
        return 1
    fi
}

# Test API rate limiting (if implemented)
test_rate_limiting() {
    local test_name="Rate Limiting"

    # Make multiple rapid requests
    local success_count=0
    for i in {1..10}; do
        if curl -f -s --max-time 5 "$API_BASE_URL/api/health" >/dev/null; then
            success_count=$((success_count + 1))
        fi
    done

    # If rate limiting is working, some requests should fail
    if [ $success_count -lt 10 ]; then
        record_test "$test_name" "PASS" "Rate limiting active ($success_count/10 requests succeeded)"
        return 0
    else
        record_test "$test_name" "WARN" "Rate limiting may not be configured"
        return 0  # Don't fail test if rate limiting isn't implemented
    fi
}

# Run all smoke tests
run_smoke_tests() {
    print_info "Starting smoke tests for $TARGET_ENV environment"
    print_info "Base URL: $BASE_URL"
    print_info "API Base URL: $API_BASE_URL"

    # Basic connectivity tests
    test_http_endpoint "$BASE_URL/health" 200 "Basic Health Check"
    test_http_endpoint "$API_BASE_URL/health" 200 "API Health Check"

    # Content tests
    test_response_content "$BASE_URL" "Southern Street Premier League" "Homepage Content"
    test_response_content "$BASE_URL" "DOCTYPE html" "HTML Structure"

    # API tests
    test_api_response "$API_BASE_URL/api/health" "API Response Format"

    # Feature tests
    test_database_connectivity
    test_authentication
    test_payment_integration
    test_qr_functionality

    # Asset tests
    test_static_assets

    # Performance tests
    test_performance "$BASE_URL"

    # Security tests
    test_security_headers
    test_error_handling

    # Advanced tests
    test_rate_limiting
}

# Generate test report
generate_report() {
    print_info "Generating smoke test report"

    local total_tests=$((TESTS_PASSED + TESTS_FAILED))
    local success_rate=0

    if [ $total_tests -gt 0 ]; then
        success_rate=$((TESTS_PASSED * 100 / total_tests))
    fi

    echo "========================================" | tee -a "$LOG_FILE"
    echo "SMOKE TEST REPORT - $TARGET_ENV Environment" | tee -a "$LOG_FILE"
    echo "========================================" | tee -a "$LOG_FILE"
    echo "Total Tests: $total_tests" | tee -a "$LOG_FILE"
    echo "Passed: $TESTS_PASSED" | tee -a "$LOG_FILE"
    echo "Failed: $TESTS_FAILED" | tee -a "$LOG_FILE"
    echo "Success Rate: ${success_rate}%" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
    echo "Test Results:" | tee -a "$LOG_FILE"

    for result in "${TEST_RESULTS[@]}"; do
        echo "  $result" | tee -a "$LOG_FILE"
    done

    echo "" | tee -a "$LOG_FILE"
    echo "========================================" | tee -a "$LOG_FILE"

    # Return success if all critical tests pass
    if [ $TESTS_FAILED -eq 0 ]; then
        print_status "All smoke tests passed!"
        return 0
    elif [ $success_rate -ge 80 ]; then
        print_warning "Smoke tests completed with $success_rate% success rate"
        return 0
    else
        print_error "Smoke tests failed with only $success_rate% success rate"
        return 1
    fi
}

# Main function
main() {
    print_info "Running smoke tests for environment: $TARGET_ENV"

    # Adjust URLs based on target environment
    if [ "$TARGET_ENV" = "green" ]; then
        BASE_URL="http://localhost:4000"
        API_BASE_URL="http://localhost:4001"
    fi

    # Run tests
    run_smoke_tests

    # Generate report
    generate_report
}

# Run main function
main "$@"