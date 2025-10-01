#!/bin/bash

# Performance monitoring script for auto-scaling triggers
# Collects metrics and triggers scaling decisions
# Designed to ensure 10x traffic handling capability

set -e

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
METRICS_FILE="$PROJECT_DIR/logs/performance-metrics.json"
LOG_FILE="$PROJECT_DIR/logs/performance-monitor.log"

# Create directories
mkdir -p "$PROJECT_DIR/logs"

# Function to collect system metrics
collect_system_metrics() {
    local timestamp=$(date +%s)
    local cpu_usage=$(docker stats --no-stream --format "table {{.CPUPerc}}" | tail -n +2 | sed 's/%//' | awk '{sum+=$1} END {print sum/NR}')
    local memory_usage=$(docker stats --no-stream --format "table {{.MemPerc}}" | tail -n +2 | sed 's/%//' | awk '{sum+=$1} END {print sum/NR}')
    local network_rx=$(docker stats --no-stream --format "table {{.NetIO}}" | tail -n +2 | awk -F'/' '{sum+=$1} END {print sum/NR}' | sed 's/[^0-9.]//g')
    local network_tx=$(docker stats --no-stream --format "table {{.NetIO}}" | tail -n +2 | awk -F'/' '{sum+=$2} END {print sum/NR}' | sed 's/[^0-9.]//g')

    # Get container count
    local container_count=$(docker ps | wc -l)
    local container_count=$((container_count - 1))  # Subtract header

    cat << EOF > "$METRICS_FILE"
{
  "timestamp": $timestamp,
  "cpu_usage_percent": ${cpu_usage:-0},
  "memory_usage_percent": ${memory_usage:-0},
  "network_rx_mb": ${network_rx:-0},
  "network_tx_mb": ${network_tx:-0},
  "container_count": $container_count
}
EOF
}

# Function to collect nginx metrics
collect_nginx_metrics() {
    local nginx_log="/var/log/nginx/access.log"
    local timestamp=$(date +%s)

    if [ -f "$nginx_log" ]; then
        # Requests per second (last 60 seconds)
        local requests_per_second=$(tail -n 1000 "$nginx_log" | awk -v now="$timestamp" '$4 >= now-60 {count++} END {print count/60}')

        # Response time average
        local avg_response_time=$(tail -n 1000 "$nginx_log" | awk '{sum+=$NF} END {print sum/NR}')

        # Error rate
        local error_count=$(tail -n 1000 "$nginx_log" | awk '$9 >= 400 {count++} END {print count}')
        local total_requests=$(tail -n 1000 "$nginx_log" | wc -l)
        local error_rate=0
        if [ "$total_requests" -gt 0 ]; then
            error_rate=$(echo "scale=2; $error_count / $total_requests * 100" | bc -l)
        fi

        # Update metrics file
        local temp_file=$(mktemp)
        jq ".requests_per_second = ${requests_per_second:-0} | .avg_response_time = ${avg_response_time:-0} | .error_rate_percent = ${error_rate:-0}" "$METRICS_FILE" > "$temp_file"
        mv "$temp_file" "$METRICS_FILE"
    fi
}

# Function to check scaling triggers
check_scaling_triggers() {
    if [ ! -f "$METRICS_FILE" ]; then
        echo "$(date): Metrics file not found" >> "$LOG_FILE"
        return
    fi

    local cpu_usage=$(jq '.cpu_usage_percent' "$METRICS_FILE")
    local memory_usage=$(jq '.memory_usage_percent' "$METRICS_FILE")
    local requests_per_second=$(jq '.requests_per_second // 0' "$METRICS_FILE")
    local error_rate=$(jq '.error_rate_percent // 0' "$METRICS_FILE")

    echo "$(date): CPU: ${cpu_usage}%, Memory: ${memory_usage}%, RPS: ${requests_per_second}, Error Rate: ${error_rate}%" >> "$LOG_FILE"

    # Scaling triggers
    local scale_up=false
    local scale_down=false

    # Scale up conditions
    if (( $(echo "$cpu_usage > 75" | bc -l) )) || (( $(echo "$memory_usage > 75" | bc -l) )) || (( $(echo "$requests_per_second > 200" | bc -l) )); then
        scale_up=true
    fi

    # Scale down conditions
    if (( $(echo "$cpu_usage < 25" | bc -l) )) && (( $(echo "$memory_usage < 25" | bc -l) )) && (( $(echo "$requests_per_second < 50" | bc -l) )); then
        scale_down=true
    fi

    # Emergency scale up for high error rates
    if (( $(echo "$error_rate > 5" | bc -l) )); then
        echo "$(date): HIGH ERROR RATE DETECTED: ${error_rate}%. Emergency scale up triggered." >> "$LOG_FILE"
        scale_up=true
    fi

    # Trigger scaling actions
    if [ "$scale_up" = true ]; then
        echo "$(date): Scaling UP triggered" >> "$LOG_FILE"
        # Call auto-scale script with scale-up parameter
        "$PROJECT_DIR/scripts/auto-scale.sh" scale-up &
    elif [ "$scale_down" = true ]; then
        echo "$(date): Scaling DOWN triggered" >> "$LOG_FILE"
        # Call auto-scale script with scale-down parameter
        "$PROJECT_DIR/scripts/auto-scale.sh" scale-down &
    fi
}

# Function to generate performance report
generate_report() {
    local report_file="$PROJECT_DIR/logs/performance-report-$(date +%Y%m%d-%H%M%S).txt"

    echo "Performance Report - $(date)" > "$report_file"
    echo "=================================" >> "$report_file"
    echo "" >> "$report_file"

    if [ -f "$METRICS_FILE" ]; then
        echo "Current Metrics:" >> "$report_file"
        cat "$METRICS_FILE" | jq . >> "$report_file"
        echo "" >> "$report_file"
    fi

    echo "Recent Scaling Events:" >> "$report_file"
    tail -n 20 "$LOG_FILE" >> "$report_file"

    echo "Report generated: $report_file" >> "$LOG_FILE"
}

# Main monitoring loop
echo "$(date): Performance monitoring started" >> "$LOG_FILE"

while true; do
    collect_system_metrics
    collect_nginx_metrics
    check_scaling_triggers

    # Generate daily report at midnight
    if [ "$(date +%H%M)" = "0000" ]; then
        generate_report
    fi

    sleep 30  # Monitor every 30 seconds
done