# 🚀 Modern Deployment Workflow for SSPL Website

## Overview

This document outlines a modern, automated deployment workflow for the SSPL website that achieves:
- ✅ **Fresh content within 1 minute** of merge to main branch
- ✅ **Automatic cache busting** using Vite's built-in hashing
- ✅ **Minimal downtime** with zero-downtime deployments
- ✅ **Reproducible builds** using Docker and pinned dependencies

## Architecture

- **Frontend**: React + Vite (SPA)
- **Backend**: Node.js + Express
- **Database**: Supabase
- **Hosting**: VPS (62.72.43.74) with Plesk
- **CI/CD**: GitHub Actions
- **Process Management**: PM2
- **Containerization**: Docker (optional)

## Quick Start

### Prerequisites

1. **GitHub Repository** with main branch protection
2. **VPS Server** with SSH access (62.72.43.74)
3. **GitHub Secrets** configured:
   - `SSH_PRIVATE_KEY`: Private SSH key for server access
   - `RAZORPAY_KEY_ID`: Razorpay production key ID
   - `RAZORPAY_KEY_SECRET`: Razorpay production secret
   - `VITE_SUPABASE_PROJECT_ID`: Supabase project ID
   - `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
   - `VITE_SUPABASE_URL`: Supabase project URL
   - `VITE_RAZORPAY_KEY_ID`: Razorpay key for frontend

### Initial Setup

1. **Configure SSH Access**
   ```bash
   # Generate SSH key pair
   ssh-keygen -t rsa -b 4096 -C "github-actions@ssplt10.cloud"

   # Add public key to server (~/.ssh/authorized_keys)
   ssh-copy-id root@62.72.43.74

   # Add private key to GitHub Secrets as SSH_PRIVATE_KEY
   ```

2. **Server Preparation**
   ```bash
   # Connect to server
   ssh root@62.72.43.74

   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2 globally
   sudo npm install -g pm2

   # Create deployment directory structure
   sudo mkdir -p /var/www/vhosts/ssplt10.cloud/httpdocs/deployments
   sudo chown -R root:root /var/www/vhosts/ssplt10.cloud/httpdocs
   ```

3. **GitHub Configuration**
   - Enable GitHub Actions in repository settings
   - Add required secrets (see Prerequisites)
   - Configure branch protection on `main` branch

## Deployment Workflow

### Automatic Deployment (Recommended)

1. **Push to Main Branch**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin main
   ```

2. **GitHub Actions Triggers**
   - Build starts automatically
   - Tests run (if configured)
   - Deployment to production server
   - Health checks performed
   - Notifications sent

3. **Timeline**
   - **Build Time**: ~2-3 minutes
   - **Deployment Time**: ~1-2 minutes
   - **Total Time**: **3-5 minutes** from push to live

### Manual Deployment

```bash
# Trigger deployment manually
gh workflow run deploy.yml -f environment=production

# Or use the existing script
./deploy.sh production
```

## Configuration Files

### GitHub Actions Workflow (`.github/workflows/deploy.yml`)

```yaml
name: Deploy to Production
on:
  push:
    branches: [ main ]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        default: 'production'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Build application
      run: |
        cd httpdocs
        npm ci
        npm run build:production

    - name: Deploy to server
      run: |
        # SSH deployment with rsync
        # PM2 graceful restart
        # Health checks
```

### Docker Configuration

**Frontend Dockerfile** (`httpdocs/Dockerfile`):
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build:production

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose** (`docker-compose.yml`):
```yaml
version: '3.8'
services:
  frontend:
    build: ./httpdocs
    ports:
      - "8080:80"
  backend:
    build:
      context: ./httpdocs
      dockerfile: Dockerfile.backend
    ports:
      - "3001:3001"
```

## Cache Busting Strategy

### Automatic Cache Busting

1. **Vite Build Hashing**
   - All static assets get content-based hashes
   - `main.js` → `main-abc123.js`
   - `style.css` → `style-def456.css`

2. **Service Worker**
   - Current SW unregisters itself (no caching)
   - Can be enhanced for offline functionality

3. **Browser Cache Headers**
   ```nginx
   location /assets/ {
     expires 1y;
     add_header Cache-Control "public, immutable";
   }
   ```

## Zero-Downtime Deployment

### PM2 Graceful Restart

```bash
# Graceful restart with fallback
pm2 reload sspl-app || pm2 start server.js --name sspl-app

# Health check loop
for i in {1..30}; do
  if curl -f http://localhost:3001/health >/dev/null 2>&1; then
    break
  fi
  sleep 5
done
```

### Deployment Strategy

1. **Create new deployment directory**
2. **Copy files with rsync** (fast, incremental)
3. **Install dependencies**
4. **Update environment variables**
5. **Graceful PM2 restart**
6. **Health checks**
7. **Update symlink** (atomic switch)
8. **Cleanup old deployments**

## Reproducible Builds

### Node.js Version Pinning

```bash
# .nvmrc
18.19.1

# package.json engines
"engines": {
  "node": "18.19.1",
  "npm": "9.x"
}
```

### Docker-based Builds

```bash
# Build with Docker for consistency
docker build -t sspl-frontend ./httpdocs
docker run --rm sspl-frontend npm run build:production
```

### Dependency Locking

- `package-lock.json` ensures exact dependency versions
- `npm ci` installs from lockfile
- No floating versions in dependencies

## Monitoring & Rollback

### Health Checks

```bash
# Application health
curl https://www.ssplt10.cloud/health

# PM2 status
pm2 status

# Logs
pm2 logs sspl-app
```

### Rollback Procedure

```bash
# Quick rollback to previous deployment
ssh root@62.72.43.74
cd /var/www/vhosts/ssplt10.cloud/httpdocs
ls -la deployments/  # Find previous deployment
ln -sfn deployments/20231201_120000 current
pm2 restart sspl-app
```

### Deployment History

```bash
# List deployments
ls -la /var/www/vhosts/ssplt10.cloud/httpdocs/deployments/

# Deployment info
cat /var/www/vhosts/ssplt10.cloud/httpdocs/current/.env | grep BUILD_
```

## Performance Optimization

### Build Optimizations

1. **Vite Configuration**
   - Code splitting with manual chunks
   - Terser minification
   - Image optimization
   - Dependency pre-bundling

2. **Caching Strategy**
   - Static assets: 1 year cache
   - HTML: No cache (for updates)
   - API responses: Appropriate cache headers

3. **Compression**
   ```nginx
   gzip on;
   gzip_types text/css application/javascript application/json;
   ```

## Security Considerations

### Environment Variables

- Never commit secrets to Git
- Use GitHub Secrets for CI/CD
- Rotate keys regularly
- Use different keys for different environments

### Server Security

```bash
# SSH hardening
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear caches
   rm -rf node_modules/.vite
   npm ci
   npm run build:production
   ```

2. **Deployment Failures**
   ```bash
   # Check SSH connection
   ssh -T root@62.72.43.74

   # Check server resources
   df -h
   free -h
   ```

3. **Application Not Starting**
   ```bash
   # Check PM2
   pm2 status
   pm2 logs sspl-app

   # Manual start
   cd /var/www/vhosts/ssplt10.cloud/httpdocs/current
   npm start
   ```

### Debug Commands

```bash
# Check deployment status
./check-deployment-status.sh

# View build logs
gh run list --workflow=deploy.yml
gh run view <run-id> --log

# Server diagnostics
ssh root@62.72.43.74 './server-diagnostic.sh'
```

## Maintenance

### Regular Tasks

1. **Update Dependencies**
   ```bash
   npm audit
   npm update
   npm audit fix
   ```

2. **Clean Old Deployments**
   ```bash
   # Keep last 5 deployments
   cd /var/www/vhosts/ssplt10.cloud/httpdocs/deployments
   ls -t | tail -n +6 | xargs rm -rf
   ```

3. **Monitor Resources**
   ```bash
   # Check disk usage
   df -h

   # Check PM2 processes
   pm2 monit
   ```

## Success Metrics

- ✅ **Deployment Time**: < 5 minutes from push to live
- ✅ **Uptime**: > 99.9%
- ✅ **Cache Hit Rate**: > 95% for static assets
- ✅ **Build Reproducibility**: 100% consistent builds
- ✅ **Rollback Time**: < 2 minutes

## Next Steps

1. **Add Tests** to CI/CD pipeline
2. **Implement Blue-Green Deployment** for even less downtime
3. **Add Performance Monitoring** (Lighthouse CI)
4. **Configure CDN** for global distribution
5. **Add Database Migrations** to deployment process

---

**Last Updated**: December 2024
**Version**: 1.0
**Contact**: DevOps Team