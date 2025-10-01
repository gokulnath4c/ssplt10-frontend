# Blue-Green Deployment Guide for SSPL

This guide covers the complete implementation of blue-green deployments for zero-downtime releases of the Southern Street Premier League application.

## Overview

Blue-green deployment is a technique that reduces downtime and risk by running two identical production environments called Blue and Green. At any time, only one of the environments is live, serving all production traffic. The other environment remains idle, ready to be switched to if needed.

### Key Benefits

- **Zero Downtime**: Traffic can be switched instantly between environments
- **Instant Rollback**: Failed deployments can be rolled back immediately
- **Risk Reduction**: New deployments are tested in production before going live
- **Automated Testing**: Smoke tests validate deployments before traffic switching

## Architecture

### Environment Structure

```
Production Server (62.72.43.74)
/var/www/vhosts/ssplt10.cloud/
├── blue/
│   ├── current -> deployments/20231201_120000/
│   └── deployments/
│       ├── 20231201_120000/
│       └── 20231130_150000/
├── green/
│   ├── current -> deployments/20231201_130000/
│   └── deployments/
│       ├── 20231201_130000/
│       └── 20231130_160000/
├── current -> blue/current (symlink controlled by nginx)
└── logs/
    ├── blue-frontend-out.log
    ├── blue-backend-out.log
    ├── green-frontend-out.log
    ├── green-backend-out.log
    ├── blue-green-deployment.log
    ├── database-migration.log
    └── rollback.log
```

### Port Configuration

- **Blue Environment**: Frontend (3000), Backend (3001)
- **Green Environment**: Frontend (4000), Backend (4001)
- **Nginx**: Routes traffic based on `$active_env` variable

## Prerequisites

### System Requirements

- Ubuntu 20.04+ or CentOS 7+
- Node.js 18+
- Nginx 1.20+
- PM2 5.0+
- PostgreSQL (via Supabase)
- SSH access to deployment server

### Initial Setup

1. **Create Directory Structure**
```bash
sudo mkdir -p /var/www/vhosts/ssplt10.cloud/{blue,green}/deployments
sudo mkdir -p /var/www/vhosts/ssplt10.cloud/logs
sudo chown -R $USER:$USER /var/www/vhosts/ssplt10.cloud
```

2. **Install Dependencies**
```bash
# Install PM2 globally
npm install -g pm2

# Install Nginx (Ubuntu/Debian)
sudo apt update
sudo apt install nginx

# Install jq for JSON processing
sudo apt install jq
```

3. **Configure Nginx**
```bash
# Copy blue-green nginx configuration
sudo cp nginx-blue-green.conf /etc/nginx/sites-available/ssplt10.cloud
sudo ln -s /etc/nginx/sites-available/ssplt10.cloud /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4. **Setup Environment Variables**
```bash
# Create environment file
cat > /var/www/vhosts/ssplt10.cloud/.env << EOF
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name

# Supabase
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_URL=your-supabase-url

# Razorpay
VITE_RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Application
NODE_ENV=production
DOMAIN=https://www.ssplt10.cloud
EOF
```

## Deployment Process

### 1. Automated Blue-Green Deployment

The main deployment script handles the entire blue-green process:

```bash
# Deploy to production (automatically chooses inactive environment)
./blue-green-deployment.sh

# Check deployment status
./blue-green-deployment.sh status

# Manual rollback if needed
./blue-green-deployment.sh rollback
```

### 2. Deployment Steps

1. **Determine Target Environment**
   - Script identifies which environment (blue/green) is currently inactive
   - Prepares deployment to the inactive environment

2. **Deploy Application**
   - Creates timestamped deployment directory
   - Transfers files via rsync
   - Installs dependencies
   - Updates environment variables

3. **Start Services**
   - Launches PM2 processes for target environment
   - Uses different ports for blue (3000/3001) vs green (4000/4001)

4. **Health Checks**
   - Waits for services to become healthy
   - Validates both frontend and backend endpoints

5. **Smoke Tests**
   - Runs automated tests against target environment
   - Validates critical functionality

6. **Traffic Switching**
   - Updates Nginx configuration to route traffic to new environment
   - Reloads Nginx configuration

7. **Post-Deployment Validation**
   - Confirms traffic is flowing correctly
   - Monitors for any issues

### 3. Database Migration

Database migrations are handled separately to ensure zero-downtime:

```bash
# Check migration compatibility
./database-migration-handler.sh check

# Apply migrations
./database-migration-handler.sh migrate blue  # or green

# Rollback migrations if needed
./database-migration-handler.sh rollback blue
```

## Monitoring and Health Checks

### Automated Monitoring

Start the monitoring system to continuously check deployment health:

```bash
# Start monitoring in background
./blue-green-monitoring.sh start &

# Check monitoring status
./blue-green-monitoring.sh status

# Manual health check
./blue-green-monitoring.sh check blue
```

### Health Check Endpoints

- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health with environment info
- `GET /api/health` - API-specific health check

### Integration with Existing Systems

The blue-green monitoring integrates with your existing incident response system:

```bash
# Automatic incident response
./incident-response.sh auto CRITICAL  # Triggered by monitoring
```

## Rollback Procedures

### Automatic Rollback

The system automatically rolls back if:
- Health checks fail after traffic switching
- Smoke tests fail
- Critical errors are detected by monitoring

### Manual Rollback

```bash
# Emergency rollback (immediate)
./rollback.sh emergency

# Graceful rollback (controlled)
./rollback.sh graceful "Manual rollback due to issues"

# Check rollback status
./rollback.sh status
```

### Rollback Process

1. **Identify Previous Environment**
   - Determines which environment was active before current deployment

2. **Health Validation**
   - Ensures previous environment is still healthy

3. **Traffic Switching**
   - Routes traffic back to previous environment

4. **Cleanup**
   - Stops services in failed environment
   - Removes failed deployment artifacts

## Smoke Testing

### Automated Smoke Tests

The deployment includes comprehensive smoke tests:

```bash
# Run smoke tests manually
./smoke-tests.sh blue   # or green

# Tests include:
# - HTTP endpoint availability
# - Content validation
# - API response format
# - Database connectivity
# - Authentication flow
# - Payment integration
# - QR code functionality
# - Static asset loading
# - Performance validation
# - Security headers
# - Error handling
```

### Custom Test Configuration

Add custom tests by modifying the `smoke-tests.sh` script:

```bash
# Example custom test function
test_custom_feature() {
    local test_name="Custom Feature Test"

    if curl -f -s "$BASE_URL/api/custom-endpoint" | grep -q "expected response"; then
        record_test "$test_name" "PASS"
        return 0
    else
        record_test "$test_name" "FAIL" "Custom feature not working"
        return 1
    fi
}
```

## Configuration Files

### Nginx Configuration

The `nginx-blue-green.conf` handles traffic routing:

```nginx
# Dynamic environment variable
set $active_env "blue";

# Route to active environment
location / {
    if ($active_env = "blue") {
        proxy_pass http://blue_frontend;
    }
    if ($active_env = "green") {
        proxy_pass http://green_frontend;
    }
}
```

### PM2 Configuration

The `ecosystem-blue-green.config.cjs` manages all application processes:

```javascript
// Blue environment processes
{
  name: "sspl-blue-frontend",
  script: "./httpdocs/server.js",
  env: { PORT: 3000, ENVIRONMENT: 'blue' }
}

// Green environment processes
{
  name: "sspl-green-frontend",
  script: "./httpdocs/server.js",
  env: { PORT: 4000, ENVIRONMENT: 'green' }
}
```

## Troubleshooting

### Common Issues

1. **Traffic Not Switching**
   ```bash
   # Check nginx configuration
   sudo nginx -t
   sudo systemctl reload nginx

   # Verify active environment
   ./blue-green-deployment.sh status
   ```

2. **Services Not Starting**
   ```bash
   # Check PM2 status
   pm2 status

   # View logs
   pm2 logs sspl-blue-frontend
   ```

3. **Health Checks Failing**
   ```bash
   # Manual health check
   curl http://localhost:3000/health

   # Check monitoring logs
   tail -f logs/blue-green-monitoring.log
   ```

4. **Database Connection Issues**
   ```bash
   # Test database connectivity
   ./database-migration-handler.sh check
   ```

### Log Files

Monitor these log files for issues:

- `logs/blue-green-deployment.log` - Deployment activities
- `logs/blue-green-monitoring.log` - Health monitoring
- `logs/database-migration.log` - Database operations
- `logs/rollback.log` - Rollback operations
- `logs/smoke-tests.log` - Test results

## Performance Considerations

### Resource Requirements

- **CPU**: Additional 20-30% overhead for dual environments
- **Memory**: ~2x memory usage during transitions
- **Disk**: ~2x storage for dual deployments
- **Network**: Minimal additional bandwidth

### Optimization Tips

1. **Resource Cleanup**
   ```bash
   # Remove old deployments
   find /var/www/vhosts/ssplt10.cloud/blue/deployments -mtime +7 -type d -exec rm -rf {} \;
   ```

2. **Log Rotation**
   ```bash
   # Configure logrotate for blue-green logs
   sudo logrotate -f /etc/logrotate.d/blue-green
   ```

3. **Monitoring Optimization**
   ```bash
   # Adjust monitoring intervals based on load
   MONITORING_INTERVAL=120 ./blue-green-monitoring.sh start
   ```

## Security Considerations

### Access Control

- Restrict SSH access to deployment server
- Use SSH keys instead of passwords
- Implement least privilege for deployment user

### Environment Security

- Encrypt sensitive environment variables
- Use secret management systems
- Regularly rotate API keys and credentials

### Network Security

- Configure firewall rules for application ports
- Use HTTPS for all external communications
- Implement rate limiting in Nginx

## Maintenance

### Regular Tasks

1. **Clean Old Deployments**
   ```bash
   # Weekly cleanup
   0 2 * * 1 ./cleanup-deployments.sh
   ```

2. **Update Dependencies**
   ```bash
   # Monthly security updates
   0 3 1 * * ./update-dependencies.sh
   ```

3. **Backup Validation**
   ```bash
   # Daily backup checks
   0 1 * * * ./validate-backups.sh
   ```

### Monitoring Dashboards

Consider implementing monitoring dashboards for:

- Deployment success rates
- Rollback frequency
- Environment health metrics
- Performance comparisons between blue/green

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Blue-Green Deployment

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Deploy to Production
        run: |
          chmod +x blue-green-deployment.sh
          ./blue-green-deployment.sh
        env:
          DEPLOY_HOST: ${{ secrets.DEPLOY_HOST }}
          DEPLOY_USER: ${{ secrets.DEPLOY_USER }}
```

### Jenkins Pipeline Example

```groovy
pipeline {
    agent any

    stages {
        stage('Deploy Blue-Green') {
            steps {
                sh '''
                    chmod +x blue-green-deployment.sh
                    ./blue-green-deployment.sh
                '''
            }
        }
    }

    post {
        failure {
            sh './rollback.sh emergency'
        }
    }
}
```

## Support and Maintenance

### Documentation Updates

Keep this guide updated as the system evolves:

- Document any custom modifications
- Update contact information for support
- Maintain change logs for deployment scripts

### Training

Ensure team members are trained on:

- Blue-green deployment concepts
- Rollback procedures
- Monitoring and alerting
- Troubleshooting common issues

### Support Contacts

- **Development Team**: For code-related issues
- **DevOps Team**: For infrastructure and deployment issues
- **Database Team**: For database migration issues

---

This blue-green deployment system provides a robust, automated solution for zero-downtime deployments with comprehensive monitoring, testing, and rollback capabilities.