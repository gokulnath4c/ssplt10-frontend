#!/bin/bash

# Service management script for auto-scaling and monitoring
# Provides start/stop/status commands for the scaling infrastructure

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AUTO_SCALE_SCRIPT="$PROJECT_DIR/scripts/auto-scale.sh"
MONITOR_SCRIPT="$PROJECT_DIR/scripts/monitor-performance.sh"
PID_DIR="$PROJECT_DIR/logs/pids"
LOG_FILE="$PROJECT_DIR/logs/scaling-service.log"

# Create directories
mkdir -p "$PID_DIR"

# Function to start auto-scaling service
start_auto_scaling() {
    if [ -f "$PID_DIR/auto-scale.pid" ] && kill -0 $(cat "$PID_DIR/auto-scale.pid") 2>/dev/null; then
        echo "Auto-scaling service is already running (PID: $(cat "$PID_DIR/auto-scale.pid"))"
        return 1
    fi

    echo "$(date): Starting auto-scaling service..." >> "$LOG_FILE"
    nohup "$AUTO_SCALE_SCRIPT" > "$PROJECT_DIR/logs/auto-scale.out" 2>&1 &
    echo $! > "$PID_DIR/auto-scale.pid"
    echo "Auto-scaling service started (PID: $!)"
}

# Function to start monitoring service
start_monitoring() {
    if [ -f "$PID_DIR/monitor.pid" ] && kill -0 $(cat "$PID_DIR/monitor.pid") 2>/dev/null; then
        echo "Monitoring service is already running (PID: $(cat "$PID_DIR/monitor.pid"))"
        return 1
    fi

    echo "$(date): Starting monitoring service..." >> "$LOG_FILE"
    nohup "$MONITOR_SCRIPT" > "$PROJECT_DIR/logs/monitor.out" 2>&1 &
    echo $! > "$PID_DIR/monitor.pid"
    echo "Monitoring service started (PID: $!)"
}

# Function to stop auto-scaling service
stop_auto_scaling() {
    if [ -f "$PID_DIR/auto-scale.pid" ] && kill -0 $(cat "$PID_DIR/auto-scale.pid") 2>/dev/null; then
        echo "Stopping auto-scaling service (PID: $(cat "$PID_DIR/auto-scale.pid"))"
        kill $(cat "$PID_DIR/auto-scale.pid")
        rm -f "$PID_DIR/auto-scale.pid"
        echo "Auto-scaling service stopped"
    else
        echo "Auto-scaling service is not running"
    fi
}

# Function to stop monitoring service
stop_monitoring() {
    if [ -f "$PID_DIR/monitor.pid" ] && kill -0 $(cat "$PID_DIR/monitor.pid") 2>/dev/null; then
        echo "Stopping monitoring service (PID: $(cat "$PID_DIR/monitor.pid"))"
        kill $(cat "$PID_DIR/monitor.pid")
        rm -f "$PID_DIR/monitor.pid"
        echo "Monitoring service stopped"
    else
        echo "Monitoring service is not running"
    fi
}

# Function to show status
show_status() {
    echo "=== Scaling Service Status ==="
    echo ""

    # Auto-scaling status
    if [ -f "$PID_DIR/auto-scale.pid" ] && kill -0 $(cat "$PID_DIR/auto-scale.pid") 2>/dev/null; then
        echo "✓ Auto-scaling service: RUNNING (PID: $(cat "$PID_DIR/auto-scale.pid"))"
    else
        echo "✗ Auto-scaling service: STOPPED"
        rm -f "$PID_DIR/auto-scale.pid" 2>/dev/null
    fi

    # Monitoring status
    if [ -f "$PID_DIR/monitor.pid" ] && kill -0 $(cat "$PID_DIR/monitor.pid") 2>/dev/null; then
        echo "✓ Monitoring service: RUNNING (PID: $(cat "$PID_DIR/monitor.pid"))"
    else
        echo "✗ Monitoring service: STOPPED"
        rm -f "$PID_DIR/monitor.pid" 2>/dev/null
    fi

    echo ""
    echo "=== Current Scaling Status ==="
    "$AUTO_SCALE_SCRIPT" status 2>/dev/null || echo "Unable to get scaling status"
}

# Function to restart services
restart_services() {
    echo "Restarting scaling services..."
    stop_auto_scaling
    stop_monitoring
    sleep 2
    start_auto_scaling
    start_monitoring
    echo "Services restarted"
}

# Main command handling
case "${1:-help}" in
    "start")
        start_auto_scaling
        start_monitoring
        ;;
    "stop")
        stop_auto_scaling
        stop_monitoring
        ;;
    "restart")
        restart_services
        ;;
    "status")
        show_status
        ;;
    "start-auto-scale")
        start_auto_scaling
        ;;
    "start-monitor")
        start_monitoring
        ;;
    "stop-auto-scale")
        stop_auto_scaling
        ;;
    "stop-monitor")
        stop_monitoring
        ;;
    "help"|*)
        echo "Usage: $0 {start|stop|restart|status|start-auto-scale|start-monitor|stop-auto-scale|stop-monitor}"
        echo ""
        echo "Commands:"
        echo "  start              Start both auto-scaling and monitoring services"
        echo "  stop               Stop both services"
        echo "  restart            Restart both services"
        echo "  status             Show status of all services"
        echo "  start-auto-scale   Start only auto-scaling service"
        echo "  start-monitor      Start only monitoring service"
        echo "  stop-auto-scale    Stop only auto-scaling service"
        echo "  stop-monitor       Stop only monitoring service"
        echo ""
        echo "Examples:"
        echo "  $0 start           # Start all services"
        echo "  $0 status          # Check service status"
        echo "  $0 restart         # Restart all services"
        ;;
esac