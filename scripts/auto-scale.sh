#!/bin/bash

# Auto-scaling script for handling traffic spikes
# Monitors system metrics and scales Docker services accordingly
# Designed to handle 10x traffic spikes without performance degradation

set -e

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
LOG_FILE="$PROJECT_DIR/logs/auto-scale.log"

# Thresholds for scaling
CPU_THRESHOLD_HIGH=70
CPU_THRESHOLD_LOW=30
MEMORY_THRESHOLD_HIGH=70
MEMORY_THRESHOLD_LOW=30

# Scaling limits
MAX_FRONTEND_INSTANCES=10
MIN_FRONTEND_INSTANCES=3
MAX_BACKEND_INSTANCES=10
MIN_BACKEND_INSTANCES=3

# Monitoring interval (seconds)
MONITOR_INTERVAL=30

# Initialize log
mkdir -p "$PROJECT_DIR/logs"
echo "$(date): Auto-scaling service started" >> "$LOG_FILE"

# Function to get current instance count
get_instance_count() {
    local service=$1
    docker-compose -f "$COMPOSE_FILE" ps "$service" | grep -c "Up" || echo "0"
}

# Function to scale service
scale_service() {
    local service=$1
    local count=$2
    echo "$(date): Scaling $service to $count instances" >> "$LOG_FILE"
    docker-compose -f "$COMPOSE_FILE" up -d --scale "$service=$count"
}

# Function to get system metrics
get_cpu_usage() {
    # Get average CPU usage across all containers
    docker stats --no-stream --format "table {{.CPUPerc}}" | tail -n +2 | sed 's/%//' | awk '{sum+=$1} END {print sum/NR}'
}

get_memory_usage() {
    # Get average memory usage across all containers
    docker stats --no-stream --format "table {{.MemPerc}}" | tail -n +2 | sed 's/%//' | awk '{sum+=$1} END {print sum/NR}'
}

# Function to check nginx request rate
get_request_rate() {
    # Get requests per second from nginx access log
    local log_file="/var/log/nginx/access.log"
    if [ -f "$log_file" ]; then
        local requests_last_minute=$(tail -n 1000 "$log_file" | awk -v now=$(date +%s) '$4 >= now-60 {count++} END {print count}')
        echo $((requests_last_minute / 60))
    else
        echo "0"
    fi
}

# Function to handle traffic spike
handle_traffic_spike() {
    local request_rate=$1
    local current_frontend=$(get_instance_count "frontend")
    local current_backend=$(get_instance_count "backend")

    # Scale up if request rate is high
    if [ "$request_rate" -gt 100 ]; then
        local new_frontend=$((current_frontend + 2))
        local new_backend=$((current_backend + 2))

        if [ "$new_frontend" -le "$MAX_FRONTEND_INSTANCES" ]; then
            scale_service "frontend" "$new_frontend"
        fi

        if [ "$new_backend" -le "$MAX_BACKEND_INSTANCES" ]; then
            scale_service "backend" "$new_backend"
        fi

        echo "$(date): Traffic spike detected ($request_rate req/s). Scaled up." >> "$LOG_FILE"
    fi
}

# Function to scale down when load is low
scale_down_if_needed() {
    local cpu_usage=$(get_cpu_usage | awk '{print int($1)}')
    local memory_usage=$(get_memory_usage | awk '{print int($1)}')
    local current_frontend=$(get_instance_count "frontend")
    local current_backend=$(get_instance_count "backend")

    # Scale down if both CPU and memory are below thresholds
    if [ "$cpu_usage" -lt "$CPU_THRESHOLD_LOW" ] && [ "$memory_usage" -lt "$MEMORY_THRESHOLD_LOW" ]; then
        if [ "$current_frontend" -gt "$MIN_FRONTEND_INSTANCES" ]; then
            local new_frontend=$((current_frontend - 1))
            scale_service "frontend" "$new_frontend"
            echo "$(date): Low load detected. Scaled frontend down to $new_frontend." >> "$LOG_FILE"
        fi

        if [ "$current_backend" -gt "$MIN_BACKEND_INSTANCES" ]; then
            local new_backend=$((current_backend - 1))
            scale_service "backend" "$new_backend"
            echo "$(date): Low load detected. Scaled backend down to $new_backend." >> "$LOG_FILE"
        fi
    fi
}

# Function to scale up when load is high
scale_up_if_needed() {
    local cpu_usage=$(get_cpu_usage | awk '{print int($1)}')
    local memory_usage=$(get_memory_usage | awk '{print int($1)}')
    local current_frontend=$(get_instance_count "frontend")
    local current_backend=$(get_instance_count "backend")

    # Scale up if CPU or memory is above thresholds
    if [ "$cpu_usage" -gt "$CPU_THRESHOLD_HIGH" ] || [ "$memory_usage" -gt "$MEMORY_THRESHOLD_HIGH" ]; then
        if [ "$current_frontend" -lt "$MAX_FRONTEND_INSTANCES" ]; then
            local new_frontend=$((current_frontend + 1))
            scale_service "frontend" "$new_frontend"
            echo "$(date): High load detected (CPU: ${cpu_usage}%, Mem: ${memory_usage}%). Scaled frontend up to $new_frontend." >> "$LOG_FILE"
        fi

        if [ "$current_backend" -lt "$MAX_BACKEND_INSTANCES" ]; then
            local new_backend=$((current_backend + 1))
            scale_service "backend" "$new_backend"
            echo "$(date): High load detected (CPU: ${cpu_usage}%, Mem: ${memory_usage}%). Scaled backend up to $new_backend." >> "$LOG_FILE"
        fi
    fi
}

# Function to handle manual scaling commands
handle_manual_scaling() {
    local action=$1
    local current_frontend=$(get_instance_count "frontend")
    local current_backend=$(get_instance_count "backend")

    case $action in
        "scale-up")
            local new_frontend=$((current_frontend + 1))
            local new_backend=$((current_backend + 1))

            if [ "$new_frontend" -le "$MAX_FRONTEND_INSTANCES" ]; then
                scale_service "frontend" "$new_frontend"
            fi

            if [ "$new_backend" -le "$MAX_BACKEND_INSTANCES" ]; then
                scale_service "backend" "$new_backend"
            fi

            echo "$(date): Manual scale-up executed. Frontend: $new_frontend, Backend: $new_backend" >> "$LOG_FILE"
            ;;
        "scale-down")
            local new_frontend=$((current_frontend - 1))
            local new_backend=$((current_backend - 1))

            if [ "$new_frontend" -ge "$MIN_FRONTEND_INSTANCES" ]; then
                scale_service "frontend" "$new_frontend"
            fi

            if [ "$new_backend" -ge "$MIN_BACKEND_INSTANCES" ]; then
                scale_service "backend" "$new_backend"
            fi

            echo "$(date): Manual scale-down executed. Frontend: $new_frontend, Backend: $new_backend" >> "$LOG_FILE"
            ;;
        "status")
            echo "Current scaling status:" >> "$LOG_FILE"
            echo "Frontend instances: $current_frontend" >> "$LOG_FILE"
            echo "Backend instances: $current_backend" >> "$LOG_FILE"
            echo "CPU Usage: $(get_cpu_usage)%" >> "$LOG_FILE"
            echo "Memory Usage: $(get_memory_usage)%" >> "$LOG_FILE"
            echo "Request Rate: $(get_request_rate) req/s" >> "$LOG_FILE"
            ;;
        *)
            echo "$(date): Unknown action: $action" >> "$LOG_FILE"
            echo "Usage: $0 [scale-up|scale-down|status|monitor]" >> "$LOG_FILE"
            exit 1
            ;;
    esac
}

# Check if script is called with arguments
if [ $# -gt 0 ]; then
    handle_manual_scaling "$1"
    exit 0
fi

# Main monitoring loop
echo "$(date): Starting auto-scaling monitoring..." >> "$LOG_FILE"

while true; do
    # Get current metrics
    cpu_usage=$(get_cpu_usage | awk '{print int($1)}')
    memory_usage=$(get_memory_usage | awk '{print int($1)}')
    request_rate=$(get_request_rate)

    echo "$(date): CPU: ${cpu_usage}%, Memory: ${memory_usage}%, Requests/s: ${request_rate}" >> "$LOG_FILE"

    # Handle traffic spikes
    handle_traffic_spike "$request_rate"

    # Scale based on resource usage
    scale_up_if_needed
    scale_down_if_needed

    # Wait for next monitoring cycle
    sleep "$MONITOR_INTERVAL"
done