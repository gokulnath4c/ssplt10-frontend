# 🔍 Quick Diagnostic Commands for SSPL Deployment

## Server Configuration
```bash
# Your server details (update these)
SERVER_HOST="62.72.43.74"
SERVER_USER="root"
DEPLOY_PATH="/var/www/vhosts/ssplt10.cloud/httpdocs"
DOMAIN="www.ssplt10.cloud"
GITHUB_REPO="https://github.com/gokulnath4c/ssplt10.cloud.git"
BRANCH="main"
```

## 🚀 Quick Commit Comparison

### 1. Get Latest GitHub Commit
```bash
# From your local machine
curl -s "https://api.github.com/repos/gokulnath4c/ssplt10.cloud/commits/main" | grep -o '"sha":"[^"]*"' | head -1 | cut -d'"' -f4

# Or using git
git ls-remote https://github.com/gokulnath4c/ssplt10.cloud.git main | cut -f1
```

### 2. Check Deployed Commit
```bash
# SSH to server and check
ssh root@62.72.43.74 "cd /var/www/vhosts/ssplt10.cloud/httpdocs && git rev-parse HEAD"

# If no git repo, check build files
ssh root@62.72.43.74 "find /var/www/vhosts/ssplt10.cloud/httpdocs -name '*.js' | head -1 | xargs grep -h 'build\|commit' 2>/dev/null"
```

### 3. Compare Commits
```bash
# Get both commits and compare
GITHUB_COMMIT=$(curl -s "https://api.github.com/repos/gokulnath4c/ssplt10.cloud/commits/main" | grep -o '"sha":"[^"]*"' | head -1 | cut -d'"' -f4)
DEPLOYED_COMMIT=$(ssh root@62.72.43.74 "cd /var/www/vhosts/ssplt10.cloud/httpdocs && git rev-parse HEAD")

echo "GitHub:    ${GITHUB_COMMIT:0:8}"
echo "Deployed:  ${DEPLOYED_COMMIT:0:8}"

if [ "$GITHUB_COMMIT" = "$DEPLOYED_COMMIT" ]; then
    echo "✅ Server is up to date!"
else
    echo "❌ Server is outdated!"
fi
```

## 🌐 Nginx & Caching Diagnostics

### 4. Check Nginx Status
```bash
# SSH to server
ssh root@62.72.43.74

# Check if nginx is running
systemctl status nginx
systemctl is-active nginx

# Test configuration
nginx -t

# Reload configuration
systemctl reload nginx
```

### 5. Check Caching Headers
```bash
# From your local machine
curl -I https://www.ssplt10.cloud/

# Check specific assets
curl -I https://www.ssplt10.cloud/assets/index-abc123.js
curl -I https://www.ssplt10.cloud/assets/index-abc123.css
curl -I https://www.ssplt10.cloud/assets/image-xyz789.webp

# Look for these headers:
# Cache-Control: public, immutable
# Expires: [future date]
# ETag: [hash]
```

### 6. Check CDN Behavior
```bash
# Check for Cloudflare headers
curl -I https://www.ssplt10.cloud/ | grep -i "CF-"

# Test response time
curl -s -w "%{time_total}\n" -o /dev/null https://www.ssplt10.cloud/

# Check server header
curl -I https://www.ssplt10.cloud/ | grep -i "Server:"
```

## 📊 File & Deployment Health

### 7. Check File Timestamps
```bash
# SSH to server
ssh root@62.72.43.74

# Check when files were last modified
ls -la /var/www/vhosts/ssplt10.cloud/httpdocs/index.html
ls -la /var/www/vhosts/ssplt10.cloud/httpdocs/assets/

# Check file sizes
du -sh /var/www/vhosts/ssplt10.cloud/httpdocs/
du -sh /var/www/vhosts/ssplt10.cloud/httpdocs/assets/
```

### 8. Check Deployment Health
```bash
# Test website accessibility
curl -I https://www.ssplt10.cloud/

# Check for errors on page
curl -s https://www.ssplt10.cloud/ | grep -i "error\|Error"

# Test API endpoints (if applicable)
curl https://www.ssplt10.cloud/health
```

## 🔧 Quick Fix Commands

### 9. Force Redeploy Latest Commit
```bash
# From your local machine
# Trigger GitHub Actions (if webhook configured)
# Or run deployment script
./deploy.sh production

# Or manual deploy
ssh root@62.72.43.74
cd /var/www/vhosts/ssplt10.cloud/httpdocs
git pull origin main
npm install --production
pm2 restart sspl-app
```

### 10. Clear Caches
```bash
# SSH to server
ssh root@62.72.43.74

# Clear nginx cache (if configured)
rm -rf /var/cache/nginx/*

# Restart services
systemctl restart nginx
pm2 restart sspl-app
```

## 📋 Diagnostic Checklist

### Pre-Flight Checks:
- [ ] SSH access to server works
- [ ] GitHub repository is accessible
- [ ] Domain DNS is pointing correctly

### Commit Verification:
- [ ] Get latest GitHub commit hash
- [ ] Get deployed commit hash
- [ ] Compare the two hashes
- [ ] Check how many commits behind (if any)

### Server Health:
- [ ] Nginx is running
- [ ] Nginx configuration is valid
- [ ] Website returns HTTP 200
- [ ] HTTPS is working
- [ ] No error messages on pages

### Caching & Performance:
- [ ] Cache-Control headers present
- [ ] Static assets have long cache times
- [ ] CDN is working (if configured)
- [ ] Response times are reasonable

### File System:
- [ ] Files have recent timestamps
- [ ] File permissions are correct
- [ ] No corrupted files
- [ ] Sufficient disk space

## 🚨 Common Issues & Solutions

### Issue: Server not running latest commit
```bash
# Solution: Redeploy
./deploy.sh production
```

### Issue: Nginx caching not working
```bash
# Check configuration
ssh root@62.72.43.74 "nginx -t"
ssh root@62.72.43.74 "systemctl reload nginx"
```

### Issue: CDN not caching properly
```bash
# Check CDN configuration
# Purge CDN cache if needed
# Verify origin server headers
```

### Issue: Slow response times
```bash
# Check server resources
ssh root@62.72.43.74 "top"
ssh root@62.72.43.74 "df -h"

# Check nginx access logs
ssh root@62.72.43.74 "tail -f /var/log/nginx/access.log"
```

## 📞 Emergency Contacts

- **Server Issues**: Contact your hosting provider
- **GitHub Issues**: Check repository settings
- **CDN Issues**: Check CDN dashboard
- **Application Issues**: Check PM2 logs

---

**Quick Test Command:**
```bash
# Run full diagnostic
./server-diagnostic.sh https://github.com/gokulnath4c/ssplt10.cloud.git main
```

**Update the placeholders with your actual values!**