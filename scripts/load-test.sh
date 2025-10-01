#!/bin/bash

# Load testing script to validate 10x traffic handling capability
# Tests the infrastructure under various load conditions

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="$PROJECT_DIR/logs/load-test.log"
RESULTS_FILE="$PROJECT_DIR/logs/load-test-results.json"

# Test configuration
BASE_URL="http://localhost"
CONCURRENT_USERS=(10 50 100 200 500 1000)
TEST_DURATION=60  # seconds
WARMUP_TIME=10

# Create directories
mkdir -p "$PROJECT_DIR/logs"

# Function to check if services are running
check_services() {
    echo "$(date): Checking service status..." >> "$LOG_FILE"

    # Check if docker-compose services are running
    if ! docker-compose -f "$PROJECT_DIR/docker-compose.yml" ps | grep -q "Up"; then
        echo "ERROR: Services are not running. Please start with: docker-compose up -d" >> "$LOG_FILE"
        exit 1
    fi

    # Wait for services to be ready
    echo "Waiting for services to be ready..." >> "$LOG_FILE"
    sleep 30

    # Test basic connectivity
    if ! curl -s --max-time 10 "$BASE_URL/health" > /dev/null; then
        echo "ERROR: Cannot connect to $BASE_URL/health" >> "$LOG_FILE"
        exit 1
    fi

    echo "$(date): Services are ready for testing" >> "$LOG_FILE"
}

# Function to run load test with Apache Bench
run_ab_test() {
    local concurrent=$1
    local total_requests=$((concurrent * TEST_DURATION * 2))  # 2 requests per second per user

    echo "$(date): Running AB test with $concurrent concurrent users, $total_requests total requests" >> "$LOG_FILE"

    # Run Apache Bench test
    local result=$(ab -n "$total_requests" -c "$concurrent" -g /dev/null -q "$BASE_URL/" 2>/dev/null)

    # Extract metrics
    local requests_per_sec=$(echo "$result" | grep "Requests per second" | awk '{print $4}')
    local time_per_request=$(echo "$result" | grep "Time per request.*mean" | head -1 | awk '{print $4}')
    local transfer_rate=$(echo "$result" | grep "Transfer rate" | awk '{print $3}')
    local failed_requests=$(echo "$result" | grep "Failed requests" | awk '{print $3}')
    local p50=$(echo "$result" | grep "50%" | awk '{print $2}')
    local p95=$(echo "$result" | grep "95%" | awk '{print $2}')
    local p99=$(echo "$result" | grep "99%" | awk '{print $2}')

    # Create JSON result
    cat << EOF
{
  "concurrent_users": $concurrent,
  "total_requests": $total_requests,
  "requests_per_second": ${requests_per_sec:-0},
  "time_per_request_ms": ${time_per_request:-0},
  "transfer_rate_kbps": ${transfer_rate:-0},
  "failed_requests": ${failed_requests:-0},
  "response_time_p50_ms": ${p50:-0},
  "response_time_p95_ms": ${p95:-0},
  "response_time_p99_ms": ${p99:-0}
}
EOF
}

# Function to run API load test
run_api_test() {
    local concurrent=$1
    local total_requests=$((concurrent * TEST_DURATION))

    echo "$(date): Running API load test with $concurrent concurrent users" >> "$LOG_FILE"

    # Test API endpoints
    local api_result=$(ab -n "$total_requests" -c "$concurrent" -g /dev/null -q "$BASE_URL/api/health" 2>/dev/null)

    local api_rps=$(echo "$api_result" | grep "Requests per second" | awk '{print $4}')
    local api_failed=$(echo "$api_result" | grep "Failed requests" | awk '{print $3}')

    cat << EOF
{
  "api_requests_per_second": ${api_rps:-0},
  "api_failed_requests": ${api_failed:-0}
}
EOF
}

# Function to monitor system resources during test
monitor_resources() {
    local test_id=$1
    local duration=$2

    echo "$(date): Starting resource monitoring for $duration seconds" >> "$LOG_FILE"

    local start_time=$(date +%s)
    local end_time=$((start_time + duration))

    while [ $(date +%s) -lt $end_time ]; do
        local cpu=$(docker stats --no-stream --format "table {{.CPUPerc}}" | tail -n +2 | sed 's/%//' | awk '{sum+=$1} END {print sum/NR}')
        local mem=$(docker stats --no-stream --format "table {{.MemPerc}}" | tail -n +2 | sed 's/%//' | awk '{sum+=$1} END {print sum/NR}')

        echo "$(date +%s),$cpu,$mem" >> "$PROJECT_DIR/logs/resource-monitor-$test_id.csv"
        sleep 5
    done
}

# Function to analyze results
analyze_results() {
    echo "$(date): Analyzing test results..." >> "$LOG_FILE"

    # Check if all tests passed performance criteria
    local max_response_time=1000  # 1 second max response time
    local max_error_rate=5        # 5% max error rate
    local min_rps=100            # Minimum 100 requests per second

    local all_passed=true

    # Read results and check thresholds
    if [ -f "$RESULTS_FILE" ]; then
        local high_load_result=$(jq '.tests[-1]' "$RESULTS_FILE")

        local rps=$(echo "$high_load_result" | jq '.requests_per_second')
        local error_rate=$(echo "$high_load_result" | jq '.failed_requests')
        local p95=$(echo "$high_load_result" | jq '.response_time_p95_ms')

        if (( $(echo "$rps < $min_rps" | bc -l) )) || (( $(echo "$p95 > $max_response_time" | bc -l) )) || (( $(echo "$error_rate > $max_error_rate" | bc -l) )); then
            all_passed=false
        fi
    fi

    if [ "$all_passed" = true ]; then
        echo "✓ All performance tests PASSED" >> "$LOG_FILE"
        echo "✓ System can handle 10x traffic spikes" >> "$LOG_FILE"
    else
        echo "✗ Some performance tests FAILED" >> "$LOG_FILE"
        echo "✗ System may need optimization for 10x traffic" >> "$LOG_FILE"
    fi
}

# Main test execution
echo "$(date): Starting load testing suite" >> "$LOG_FILE"
echo "Testing infrastructure for 10x traffic handling capability..." >> "$LOG_FILE"

# Initialize results
echo '{"tests": []}' > "$RESULTS_FILE"

# Check services
check_services

# Warm up
echo "$(date): Warming up system..." >> "$LOG_FILE"
ab -n 100 -c 10 -q "$BASE_URL/" > /dev/null 2>&1
sleep "$WARMUP_TIME"

# Run tests with increasing load
for concurrent in "${CONCURRENT_USERS[@]}"; do
    echo "$(date): Testing with $concurrent concurrent users" >> "$LOG_FILE"

    # Start resource monitoring in background
    monitor_resources "test_$concurrent" "$TEST_DURATION" &

    # Run main load test
    main_result=$(run_ab_test "$concurrent")

    # Run API test
    api_result=$(run_api_test "$concurrent")

    # Combine results
    combined_result=$(echo "$main_result" | jq --argjson api "$api_result" '. + $api')

    # Add to results file
    jq ".tests += [$combined_result]" "$RESULTS_FILE" > "${RESULTS_FILE}.tmp"
    mv "${RESULTS_FILE}.tmp" "$RESULTS_FILE"

    echo "$(date): Test with $concurrent users completed" >> "$LOG_FILE"

    # Brief pause between tests
    sleep 5
done

# Analyze results
analyze_results

echo "$(date): Load testing completed. Results saved to $RESULTS_FILE" >> "$LOG_FILE"
echo "View detailed results with: cat $RESULTS_FILE | jq ." >> "$LOG_FILE"