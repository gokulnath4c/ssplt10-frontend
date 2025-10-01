# Infrastructure Scaling and Load Balancing Setup

This document describes the infrastructure scaling and load balancing implementation designed to handle 10x traffic spikes without performance degradation.

## Architecture Overview

The setup includes:
- **Nginx Load Balancer** with upstream servers
- **Auto-scaling** based on CPU, memory, and request metrics
- **Session management** with sticky sessions
- **Rate limiting** and DDoS protection
- **SSL/TLS optimization** and security headers
- **Performance monitoring** and scaling triggers

## Components

### 1. Nginx Load Balancer (`nginx/nginx.conf`)

**Features:**
- Load balancing with `ip_hash` for frontend (sticky sessions)
- `least_conn` for backend API distribution
- Rate limiting zones (10 req/s general, 100 req/s DDoS protection)
- Connection limiting (10 per IP)
- SSL/TLS with modern ciphers
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- Gzip compression and caching

**Upstream Servers:**
- `frontend1-3`: Multiple frontend instances
- `backend1-3`: Multiple backend API instances

### 2. Docker Compose Setup (`docker-compose.yml`)

**Services:**
- `frontend1-3`: Frontend instances with resource limits
- `backend1-3`: Backend instances with resource limits
- `nginx`: Load balancer with SSL termination

**Resource Management:**
- CPU limits: 1.0 core per instance
- Memory limits: 512MB frontend, 1GB backend
- Reservations: 50% of limits

### 3. Auto-Scaling Scripts

#### `scripts/auto-scale.sh`
- Monitors CPU/memory usage and request rates
- Scales up when >70% utilization
- Scales down when <30% utilization
- Handles traffic spikes (>100 req/s triggers scale-up)
- Manual scaling commands: `scale-up`, `scale-down`, `status`

#### `scripts/monitor-performance.sh`
- Collects system and nginx metrics
- JSON metrics storage
- Scaling triggers based on:
  - CPU >75% or Memory >75% or RPS >200
  - Error rate >5% (emergency scale-up)
- Daily performance reports

#### `scripts/scaling-service.sh`
- Service management (start/stop/restart/status)
- PID management for background processes
- Individual service control

### 4. Load Testing (`scripts/load-test.sh`)

**Test Scenarios:**
- 10, 50, 100, 200, 500, 1000 concurrent users
- 60-second test duration
- Performance metrics collection

**Validation Criteria:**
- Minimum 100 requests/second
- Maximum 1 second response time (P95)
- Maximum 5% error rate

## Deployment Instructions

### 1. Prerequisites

```bash
# Install Docker and Docker Compose
# Ensure ports 80, 443 are available
# Create SSL certificates in nginx/ssl/
```

### 2. SSL Certificate Setup

```bash
mkdir -p nginx/ssl
# Place your certificates:
# - fullchain.pem (certificate chain)
# - privkey.pem (private key)
```

### 3. Environment Configuration

Update domain in `nginx/nginx.conf`:
```nginx
server_name your-domain.com www.your-domain.com;
```

### 4. Start Services

```bash
# Start all services
docker-compose up -d

# Start scaling services
./scripts/scaling-service.sh start

# Check status
./scripts/scaling-service.sh status
```

### 5. Verify Setup

```bash
# Test load balancer
curl -I https://your-domain.com

# Check health endpoint
curl https://your-domain.com/health

# View scaling status
./scripts/auto-scale.sh status
```

## Monitoring and Maintenance

### View Logs

```bash
# Scaling logs
tail -f logs/auto-scale.log
tail -f logs/monitor-performance.log

# Nginx logs
docker-compose logs nginx

# Application logs
docker-compose logs frontend1
docker-compose logs backend1
```

### Manual Scaling

```bash
# Scale up
./scripts/auto-scale.sh scale-up

# Scale down
./scripts/auto-scale.sh scale-down

# Check current status
./scripts/auto-scale.sh status
```

### Load Testing

```bash
# Run full load test suite
./scripts/load-test.sh

# View results
cat logs/load-test-results.json | jq .
```

## Performance Expectations

### Normal Load (Baseline)
- 3 frontend instances
- 3 backend instances
- ~50-100 requests/second
- <500ms response time

### High Load (10x Traffic)
- Scales to 10 frontend instances
- Scales to 10 backend instances
- Maintains <1s response time
- <5% error rate
- >200 requests/second

## Security Features

### DDoS Protection
- Rate limiting per IP
- Connection limiting
- Request burst control

### SSL/TLS
- TLS 1.2/1.3 only
- Modern cipher suites
- HSTS enabled
- Certificate pinning ready

### Application Security
- Content Security Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer Policy

## Troubleshooting

### Common Issues

1. **Services not starting**
   ```bash
   docker-compose ps
   docker-compose logs <service_name>
   ```

2. **High error rates**
   ```bash
   tail -f logs/auto-scale.log
   ./scripts/auto-scale.sh status
   ```

3. **SSL certificate issues**
   ```bash
   docker-compose logs nginx
   # Check certificate paths in nginx.conf
   ```

4. **Performance degradation**
   ```bash
   ./scripts/load-test.sh
   cat logs/performance-metrics.json
   ```

### Emergency Procedures

1. **Immediate scale-up**
   ```bash
   ./scripts/auto-scale.sh scale-up
   ```

2. **Restart services**
   ```bash
   ./scripts/scaling-service.sh restart
   ```

3. **Check resource usage**
   ```bash
   docker stats
   ```

## Configuration Tuning

### Nginx Tuning

Edit `nginx/nginx.conf`:
- Adjust `worker_connections`
- Modify rate limits
- Update upstream server weights

### Scaling Thresholds

Edit `scripts/auto-scale.sh`:
- `CPU_THRESHOLD_HIGH/LOW`
- `MEMORY_THRESHOLD_HIGH/LOW`
- `MAX_FRONTEND_INSTANCES`

### Monitoring Intervals

Edit `scripts/monitor-performance.sh`:
- `MONITOR_INTERVAL`
- Metric collection frequency

## Backup and Recovery

### Configuration Backup

```bash
tar -czf backup-$(date +%Y%m%d).tar.gz \
  nginx/ \
  scripts/ \
  docker-compose.yml \
  logs/
```

### Service Recovery

```bash
# Stop all services
./scripts/scaling-service.sh stop
docker-compose down

# Restore from backup
# tar -xzf backup-*.tar.gz

# Restart services
docker-compose up -d
./scripts/scaling-service.sh start
```

This infrastructure is designed to automatically handle traffic spikes while maintaining high availability and performance. The auto-scaling system ensures resources are efficiently utilized, and the comprehensive monitoring provides visibility into system health.