# SSPL Automated Health Checks and Rollback System

This document describes the comprehensive deployment reliability system implemented for the SSPL application, ensuring high availability and automatic recovery from deployment failures.

## Overview

The system provides automated health monitoring, deployment verification, and rollback capabilities to ensure deployments can be rolled back within 30 seconds if issues are detected.

## Architecture

### Components

1. **Enhanced Health Check Endpoints**
   - Basic health checks (`/health`)
   - Detailed health checks (`/health/detailed`)
   - Multi-service monitoring (database, external APIs, memory usage)

2. **PM2 Process Management**
   - Health check integration
   - Automatic process restart
   - Memory monitoring and limits

3. **Automated Rollback System**
   - Timestamped deployment history
   - Symlink-based switching
   - Health verification post-rollback

4. **Deployment Verification**
   - Comprehensive health metrics
   - Performance monitoring
   - External service connectivity checks

5. **Monitoring and Alerting**
   - Continuous health monitoring
   - Automatic incident response
   - Configurable alert thresholds

## Files and Scripts

### Core Scripts

- `deploy.sh` - Main deployment script with health verification
- `rollback.sh` - Automated rollback to previous deployments
- `verify-deployment.sh` - Comprehensive deployment verification
- `monitor-deployment.sh` - Continuous monitoring with auto-recovery
- `incident-response.sh` - Automated incident response procedures
- `test-rollback.sh` - Test suite for rollback mechanism validation

### Configuration Files

- `ecosystem.config.cjs` - PM2 process configuration with health checks
- `httpdocs/server.js` - Frontend server with enhanced health endpoints
- `backend/backend/src/app.js` - Backend server with detailed health checks

## Health Check Endpoints

### Frontend Health Checks

**Basic Health Check**
```
GET /health
```
Returns basic server status, uptime, and environment information.

**Detailed Health Check**
```
GET /health/detailed
```
Returns comprehensive health metrics including:
- Memory usage (heap, external, RSS)
- Static file accessibility
- Backend connectivity
- Index file availability
- Response time

### Backend Health Checks

**Basic Health Check**
```
GET /health
```
Returns basic server status and uptime.

**Detailed Health Check**
```
GET /health/detailed
```
Returns comprehensive health metrics including:
- Memory usage
- Razorpay API connectivity
- Database connectivity (PostgreSQL)
- Supabase connectivity
- Service status for each dependency
- Response time

## PM2 Configuration

The `ecosystem.config.cjs` file configures two processes:

### Frontend Process (sspl-frontend)
- Health check URL: `http://localhost:3000/health/detailed`
- Check interval: 30 seconds
- Memory limit: 1GB
- Auto-restart on failure

### Backend Process (sspl-backend)
- Health check URL: `http://localhost:3001/health/detailed`
- Check interval: 30 seconds
- Memory limit: 512MB
- Auto-restart on failure

## Deployment Process

### Standard Deployment

1. **Build and Deploy**
   ```bash
   ./deploy.sh production
   ```

2. **Automatic Verification**
   - Health endpoint checks
   - PM2 process status verification
   - Service connectivity validation

3. **Post-Deployment Monitoring**
   ```bash
   ./verify-deployment.sh production
   ```

### Rollback Process

The system maintains deployment history and can rollback within 30 seconds:

1. **Automatic Rollback** (triggered by monitoring)
   ```bash
   ./rollback.sh
   ```

2. **Manual Rollback to Specific Version**
   ```bash
   ./rollback.sh 20230907_120000
   ```

3. **Health Verification**
   - Automatic health checks during rollback
   - Service restoration verification
   - Performance validation

## Monitoring and Auto-Recovery

### Continuous Monitoring

Start monitoring with automatic recovery:
```bash
./monitor-deployment.sh production
```

**Features:**
- Health check every 60 seconds
- Automatic rollback after 3 consecutive failures
- 5-minute cooldown after recovery
- Comprehensive logging

### Incident Response

Automated incident response system:
```bash
./incident-response.sh auto CRITICAL
```

**Response Levels:**
- **CRITICAL**: Immediate rollback
- **HIGH**: Quick restart, then rollback if failed
- **MEDIUM**: Quick restart
- **LOW/WARNING**: Diagnostics collection

## Testing and Validation

### Test Suite

Run comprehensive validation:
```bash
./test-rollback.sh production
```

**Test Coverage:**
- Script validation and permissions
- PM2 ecosystem configuration
- Health endpoint accessibility
- Rollback time simulation (30-second target)
- Monitoring script validation
- Deployment structure verification

### Performance Metrics

The system tracks and validates:
- Response times (< 1 second target)
- Memory usage limits
- Health check success rates
- Rollback completion times

## Configuration Options

### Environment Variables

**Frontend (.env)**
```
NODE_ENV=production
PORT=3000
BACKEND_URL=http://localhost:3001
```

**Backend (.env)**
```
NODE_ENV=production
PORT=3001
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
DATABASE_URL=your_db_url
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### Monitoring Configuration

**monitor-deployment.sh**
- `MONITOR_INTERVAL`: Check interval (default: 60s)
- `MAX_FAILURES`: Failures before recovery (default: 3)
- `RECOVERY_COOLDOWN`: Cooldown after recovery (default: 300s)

## Logging and Diagnostics

### Log Files

- `logs/monitoring.log` - Monitoring activities
- `logs/incidents.log` - Incident records
- `logs/incident_responses.log` - Response actions
- `test_results.txt` - Test suite results

### Diagnostic Collection

Automatic diagnostic gathering:
```bash
./incident-response.sh diagnose
```

**Collected Data:**
- System information
- PM2 process status
- Application logs
- Health check outputs
- Network connections
- Disk and memory usage

## Security Considerations

### Access Control
- Health endpoints are publicly accessible
- Detailed endpoints may contain sensitive information
- Consider IP restrictions for production

### Log Security
- Avoid logging sensitive configuration data
- Implement log rotation
- Secure log file permissions

## Troubleshooting

### Common Issues

1. **Health Checks Failing**
   - Verify service ports are open
   - Check PM2 process status
   - Review application logs

2. **Rollback Not Working**
   - Ensure deployment history exists
   - Check file permissions
   - Verify PM2 configuration

3. **Monitoring Not Starting**
   - Check script permissions
   - Verify jq is installed
   - Review system resources

### Debug Commands

```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs

# Test health endpoints
curl http://localhost:3000/health/detailed
curl http://localhost:3001/health/detailed

# Manual health check
./verify-deployment.sh production
```

## Performance Optimization

### Health Check Optimization
- Lightweight basic health checks
- Cached detailed health data
- Configurable check intervals

### Memory Management
- PM2 memory limits
- Automatic process restart on memory issues
- Memory usage monitoring

### Network Efficiency
- Local health checks
- Minimal external dependencies
- Connection pooling

## Enhanced Monitoring Features

### Real-time Deployment Metrics Collection

The system now includes comprehensive real-time metrics collection with the following KPIs:

- **Deployment Success Rate**: Percentage of successful deployments
- **Error Rate**: Rate of errors across the application
- **System Uptime**: Availability percentage
- **Response Time**: Average response time for API calls
- **Memory Usage**: Current memory utilization
- **Active Users**: Number of concurrent users
- **Build Performance**: Build time, bundle size, and asset counts

### Performance Monitoring Dashboard

Enhanced dashboard with multiple tabs:

1. **Deployment Tab**: Real-time deployment metrics and KPIs
2. **Performance Tab**: System performance metrics
3. **Build Tab**: Build performance tracking and history
4. **Logs Tab**: Recent application logs
5. **Backups Tab**: Backup management
6. **Alerts Tab**: Active alerts and alert rules

### Automated Alerting System

Comprehensive alerting system with:

- **Multiple Alert Channels**:
  - Console logging (always enabled)
  - Email notifications (configurable)
  - Slack integration (configurable)
  - Webhook support (configurable)
  - SMS alerts (configurable)

- **Pre-configured Alert Rules**:
  - High error rate (>5%)
  - High memory usage (>80%)
  - Slow response time (>2 seconds)
  - Low uptime (<99.5%)
  - Build failures
  - Service downtime

- **Alert Management**:
  - Configurable severity levels (low, medium, high, critical)
  - Cooldown periods to prevent alert spam
  - Alert history and resolution tracking

### Build Performance Tracking

Automated build tracking with:

- **Build Metrics Collection**:
  - Build duration
  - Bundle size
  - Asset count
  - Warning/error counts
  - Build status

- **Build History**: Last 100 builds with detailed metrics
- **Performance Trends**: Comparison with previous builds
- **Build Tracker Script**: Integrated into npm build scripts

### External Monitoring Integration

Optional integration with external monitoring services:

- **DataDog**: Metrics and events integration
- **New Relic**: Application performance monitoring
- **Prometheus**: Metrics collection and alerting
- **Sentry**: Error tracking and alerting

### Trend Analysis

Performance trend analysis with:

- **Response Time Trends**: Improving/degrading/stable
- **Error Rate Trends**: Improving/degrading/stable
- **Memory Usage Trends**: Improving/degrading/stable
- **Historical Comparisons**: Performance over time

## Configuration

### Environment Variables

Add these to your `.env` file for external monitoring:

```bash
# DataDog
DATADOG_API_KEY=your_datadog_api_key
DATADOG_APP_KEY=your_datadog_app_key
DATADOG_SITE=datadoghq.com

# New Relic
NEW_RELIC_LICENSE_KEY=your_new_relic_key
NEW_RELIC_APP_NAME=SSPL

# Sentry
SENTRY_DSN=your_sentry_dsn

# Prometheus
PROMETHEUS_PUSHGATEWAY_URL=http://your-prometheus-pushgateway:9091
PROMETHEUS_JOB_NAME=sspl
```

### Build Integration

The build tracker is automatically integrated into npm scripts:

```bash
npm run build          # Tracked build
npm run build:production  # Tracked production build
npm run build:fast      # Tracked fast build
```

## Files and Scripts

### New Core Files

- `src/utils/deploymentMetrics.ts` - Deployment metrics collection
- `src/utils/alertingService.ts` - Alerting system
- `src/utils/externalMonitoring.ts` - External service integration
- `build-tracker.js` - Build performance tracking script

### Updated Files

- `src/components/admin/MonitoringDashboard.tsx` - Enhanced dashboard
- `package.json` - Build script integration

## Usage

### Accessing the Dashboard

1. Navigate to the admin panel
2. Go to the Monitoring section
3. View real-time metrics across all tabs

### Managing Alerts

1. Go to the Alerts tab in the monitoring dashboard
2. View active alerts and alert rules
3. Configure alert channels and rules as needed

### Build Performance

1. Run any build command (automatically tracked)
2. View build metrics in the Build tab
3. Monitor build trends and performance

## Future Enhancements

### Planned Features
- Advanced performance profiling
- Multi-region deployment support
- Blue-green deployment strategy
- Custom dashboard widgets
- Advanced analytics and reporting

### Integration Points
- CI/CD pipeline integration
- Container orchestration
- Load balancer health checks
- Advanced external monitoring services

## Support and Maintenance

### Regular Tasks
- Monitor log files for issues
- Review incident reports
- Update health check thresholds
- Test rollback procedures monthly

### Emergency Procedures
1. Check system status: `./incident-response.sh check`
2. Quick restart: `./incident-response.sh restart`
3. Emergency rollback: `./incident-response.sh rollback`
4. Gather diagnostics: `./incident-response.sh diagnose`

## Compliance and Standards

The system follows industry best practices for:
- Health check standards (IETF RFC 5785)
- Process management (PM2 best practices)
- Logging standards (ISO 20000)
- Incident response (ITIL framework)

---

## Quick Start Guide

### Basic Monitoring Setup

1. **Deploy Application**
   ```bash
   ./deploy.sh production
   ```

2. **Verify Deployment**
   ```bash
   ./verify-deployment.sh production
   ```

3. **Start Monitoring**
   ```bash
   ./monitor-deployment.sh production &
   ```

4. **Test System**
   ```bash
   ./test-rollback.sh production
   ```

### Enhanced Monitoring Features

1. **Access Dashboard**
   - Navigate to the admin panel
   - Go to Monitoring section
   - View real-time metrics and alerts

2. **Configure External Monitoring** (Optional)
   ```bash
   # Add to .env file
   DATADOG_API_KEY=your_key
   NEW_RELIC_LICENSE_KEY=your_key
   SENTRY_DSN=your_dsn
   ```

3. **Build with Tracking**
   ```bash
   npm run build  # Automatically tracked
   ```

4. **Monitor Alerts**
   - Check Alerts tab for active notifications
   - Configure alert channels as needed
   - Review alert history

### Key Features at a Glance

- ✅ Real-time deployment metrics
- ✅ Automated alerting (console, email, Slack)
- ✅ Build performance tracking
- ✅ Trend analysis
- ✅ External monitoring integration
- ✅ Comprehensive dashboard

The system is now ready to provide automated health monitoring and ensure deployment reliability with 30-second rollback capability, plus comprehensive performance tracking and alerting.