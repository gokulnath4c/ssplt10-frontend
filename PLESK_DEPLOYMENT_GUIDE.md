# 🚀 Complete Plesk Deployment Guide for Vite + Node.js Applications

## 📋 Prerequisites Checklist

### System Requirements
- ✅ Plesk hosting account with SSH access
- ✅ Node.js support enabled in Plesk
- ✅ Domain configured and pointing to Plesk server
- ✅ SSH client (PuTTY, OpenSSH, or terminal)
- ✅ File transfer client (FileZilla, WinSCP, or SCP)

### Application Requirements
- ✅ Vite + React frontend application
- ✅ Node.js backend server (Express.js)
- ✅ Production environment variables configured
- ✅ Build process tested locally

---

## 🎯 Phase 1: Pre-Deployment Preparation

### Step 1: Local Build Preparation

**1.1 Install Dependencies**
```bash
cd /path/to/your/project
npm install
```

**1.2 Build for Production**
```bash
npm run build
```

**1.3 Verify Build Output**
```bash
ls -la dist/
# Should contain: index.html, assets/, and other built files
```

**1.4 Test Locally (Optional)**
```bash
npm run preview
# Visit http://localhost:4173 to verify build
```

### Step 2: Gather Server Information

**2.1 Server Details**
- Server IP/Host: `62.72.43.74`
- SSH Port: `22`
- Username: `root`
- Domain: `www.ssplt10.cloud`

**2.2 File Paths**
- Application Directory: `/var/www/vhosts/ssplt10.cloud/httpdocs/sspl-app`
- Document Root: `/var/www/vhosts/ssplt10.cloud/httpdocs`

---

## 🔧 Phase 2: Server Connection & Setup

### Step 3: Establish SSH Connection

**3.1 Connect via SSH**
```bash
ssh root@62.72.43.74 -p 22
# Enter password when prompted
```

**3.2 Verify Connection**
```bash
whoami
pwd
ls -la
```

**3.3 Check Node.js Version**
```bash
node --version
npm --version
```

### Step 4: Create Application Directory

**4.1 Navigate to Domain Directory**
```bash
cd /var/www/vhosts/ssplt10.cloud/httpdocs
```

**4.2 Create Application Folder**
```bash
mkdir -p sspl-app
cd sspl-app
```

**4.3 Set Proper Permissions**
```bash
chmod 755 /var/www/vhosts/ssplt10.cloud/httpdocs/sspl-app
```

---

## 📁 Phase 3: File Upload & Transfer

### Step 5: Upload Application Files

**5.1 Configure FileZilla/WinSCP**
```
Host: 62.72.43.74
Username: root
Password: [your-password]
Port: 22
Protocol: SFTP
```

**5.2 Upload Required Files**

**Server Files (upload to `/var/www/vhosts/ssplt10.cloud/httpdocs/sspl-app/`):**
- `server.js` - Main Node.js server
- `package.json` - Dependencies configuration

**Built Frontend Files (upload entire `dist/` folder):**
- `dist/index.html`
- `dist/assets/` (entire folder)
- `dist/Explore the teams/` (entire folder)
- `dist/lovable-uploads/` (entire folder)
- All other files from `dist/`

**5.3 Verify Upload**
```bash
ls -la /var/www/vhosts/ssplt10.cloud/httpdocs/sspl-app/
```

---

## ⚙️ Phase 4: Server Configuration

### Step 6: Install Dependencies

**6.1 Navigate to Application Directory**
```bash
cd /var/www/vhosts/ssplt10.cloud/httpdocs/sspl-app
```

**6.2 Install Production Dependencies**
```bash
npm install --production --ignore-scripts
```

**6.3 Verify Installation**
```bash
ls -la node_modules/
npm list --depth=0
```

### Step 7: Configure Environment Variables

**7.1 Create .env File**
```bash
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
RAZORPAY_KEY_ID=rzp_live_YOUR_ACTUAL_LIVE_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_ACTUAL_LIVE_KEY_SECRET
DOMAIN=https://www.ssplt10.cloud
VITE_SUPABASE_PROJECT_ID=YOUR_ACTUAL_PROJECT_ID
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_ACTUAL_SUPABASE_KEY
VITE_SUPABASE_URL=https://YOUR_ACTUAL_PROJECT.supabase.co
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_ACTUAL_LIVE_KEY_ID
VITE_APP_NAME=Southern Street Premier League
VITE_APP_VERSION=1.0.0
EOF
```

**7.2 Set File Permissions**
```bash
chmod 600 .env
```

### Step 8: Install PM2 Process Manager

**8.1 Install PM2 Globally**
```bash
npm install -g pm2
```

**8.2 Verify PM2 Installation**
```bash
pm2 --version
pm2 list
```

---

## 🚀 Phase 5: Application Deployment

### Step 9: Start Application with PM2

**9.1 Start the Application**
```bash
cd /var/www/vhosts/ssplt10.cloud/httpdocs/sspl-app
pm2 start server.js --name "sspl-app"
```

**9.2 Save PM2 Configuration**
```bash
pm2 save
```

**9.3 Enable PM2 Startup**
```bash
pm2 startup
# Follow the instructions provided by PM2
```

**9.4 Verify Application Status**
```bash
pm2 status
pm2 logs sspl-app --lines 10
```

---

## 🧪 Phase 6: Testing & Verification

### Step 10: Test Local Endpoints

**10.1 Health Check**
```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Razorpay server is running",
  "environment": "production",
  "timestamp": "2025-09-04T01:55:37.000Z",
  "uptime": 123.456,
  "version": "v18.19.1"
}
```

**10.2 Test API Endpoints**
```bash
# Test create order endpoint
curl -X POST http://localhost:3001/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'

# Test verify payment endpoint
curl -X POST http://localhost:3001/verify-payment \
  -H "Content-Type: application/json" \
  -d '{"paymentId": "test", "orderId": "test", "signature": "test"}'
```

### Step 11: Test Public Access

**11.1 Test Public Health Endpoint**
```bash
curl https://www.ssplt10.cloud/health
```

**11.2 Test Main Application**
- Open browser and visit: `https://www.ssplt10.cloud`
- Verify the application loads correctly
- Test user interactions

---

## 🔧 Phase 7: Plesk Panel Configuration

### Step 12: Configure Domain Settings

**12.1 Access Plesk Panel**
- Login to your Plesk control panel
- Navigate to Domains → www.ssplt10.cloud

**12.2 Configure Document Root**
- Go to "Hosting Settings"
- Document Root: `/httpdocs/sspl-app`
- Or keep as `/httpdocs` if using Apache proxy

**12.3 Configure Apache/Nginx (if needed)**

**Option A: Apache (.htaccess) Configuration**
```apache
# Apache .htaccess Configuration

# Security Headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</IfModule>

# SPA routing - redirect all requests to index.html except existing files
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Don't rewrite for existing files and directories
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]

    # Don't rewrite for API routes
    RewriteRule ^api/ - [L]

    # Rewrite everything else to index.html
    RewriteRule ^ index.html [L]
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Security: Don't list directory contents
Options -Indexes

# Error documents
ErrorDocument 404 /index.html
ErrorDocument 500 /index.html
```

**Option B: Nginx Configuration**
```nginx
# Nginx Configuration

# Security Headers
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# SPA routing
location / {
    try_files $uri $uri/ /index.html;
}

# API proxy
location /api {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Static assets caching
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Step 13: SSL Certificate Setup

**13.1 Enable SSL**
- Go to SSL/TLS Certificates
- Use Let's Encrypt extension
- Add certificate for `www.ssplt10.cloud`

**13.2 Force HTTPS (Optional)**
- Add redirect rules in .htaccess or Apache configuration

---

## 📊 Phase 8: Monitoring & Maintenance

### Step 14: Set Up Monitoring

**14.1 PM2 Monitoring**
```bash
# Monitor all processes
pm2 monit

# View logs
pm2 logs sspl-app

# Check resource usage
pm2 show sspl-app
```

**14.2 Log Rotation**
```bash
# Configure log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Step 15: Backup Strategy

**15.1 Application Backup**
```bash
# Create backup script
cat > /var/www/vhosts/ssplt10.cloud/httpdocs/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/www/vhosts/ssplt10.cloud/backups"
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/sspl-app_$DATE.tar.gz -C /var/www/vhosts/ssplt10.cloud/httpdocs sspl-app

# Backup PM2 configuration
pm2 save
cp ~/.pm2/dump.pm2 $BACKUP_DIR/pm2_dump_$DATE.pm2

echo "Backup completed: $BACKUP_DIR/sspl-app_$DATE.tar.gz"
EOF

chmod +x /var/www/vhosts/ssplt10.cloud/httpdocs/backup.sh
```

**15.2 Schedule Backups**
```bash
# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /var/www/vhosts/ssplt10.cloud/httpdocs/backup.sh
```

---

## 🚨 Phase 9: Troubleshooting

### Common Issues & Solutions

**Issue: Application not starting**
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs sspl-app

# Restart application
pm2 restart sspl-app
```

**Issue: Port 3001 already in use**
```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 [PID]

# Or change port in .env
PORT=3002
```

**Issue: Dependencies not installing**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install --production --ignore-scripts
```

**Issue: Public URL not working**
- Check domain DNS configuration
- Verify Apache/Nginx configuration
- Check SSL certificate status
- Ensure PM2 app is running

---

## 📚 Useful Commands Reference

### PM2 Commands
```bash
pm2 start server.js --name "sspl-app"    # Start app
pm2 stop sspl-app                       # Stop app
pm2 restart sspl-app                    # Restart app
pm2 delete sspl-app                     # Remove app
pm2 logs sspl-app                       # View logs
pm2 monit                               # Monitor apps
pm2 status                              # Show status
```

### System Commands
```bash
df -h                                   # Check disk space
free -h                                 # Check memory
top                                     # Process monitor
netstat -tlnp | grep :3001             # Check port usage
```

### File Management
```bash
ls -la                                  # List files
chmod 755 filename                     # Set permissions
chown root:root filename               # Set ownership
```

---

## ✅ Deployment Checklist

- [ ] Local build completed successfully
- [ ] SSH connection established
- [ ] Application directory created
- [ ] Files uploaded via FileZilla
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] PM2 installed and configured
- [ ] Application started with PM2
- [ ] Local health check working
- [ ] Public URL accessible
- [ ] SSL certificate configured
- [ ] Domain settings verified
- [ ] Backup strategy implemented
- [ ] Monitoring set up

---

## 🎯 Success Indicators

**Deployment is successful when:**
1. ✅ `pm2 status` shows app as "online"
2. ✅ `curl http://localhost:3001/health` returns valid JSON
3. ✅ `https://www.ssplt10.cloud/health` is accessible
4. ✅ `https://www.ssplt10.cloud` loads your application
5. ✅ Payment integration works with test amounts

---

## 📝 Deployment Notes

**Server Information:**
- **Host:** 62.72.43.74
- **Port:** 22
- **Username:** root
- **Domain:** www.ssplt10.cloud
- **Application Path:** /var/www/vhosts/ssplt10.cloud/httpdocs/sspl-app

**Important Security Notes:**
- Never commit `.env` files to version control
- Use strong passwords for SSH access
- Regularly update dependencies
- Monitor server resources
- Keep backups of your application

**Performance Optimization:**
- Enable gzip compression
- Set up CDN for static assets
- Configure proper caching headers
- Monitor memory and CPU usage

---

## 🆘 Emergency Contacts

**If deployment fails:**
1. Check PM2 logs: `pm2 logs sspl-app`
2. Verify file permissions: `ls -la`
3. Test Node.js: `node --version`
4. Check disk space: `df -h`

**For Plesk-specific issues:**
- Contact your hosting provider
- Check Plesk documentation
- Review Apache/Nginx error logs

---

**🎉 Your Vite + Node.js application is now fully deployed and operational on Plesk!**

*Last Updated: September 4, 2025*
*Deployment Guide Version: 1.0*