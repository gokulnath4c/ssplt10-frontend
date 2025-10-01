#!/bin/bash

# 🚀 Nginx Configuration Deployment Script for Plesk
# This script helps deploy the updated nginx configuration to your Plesk server

echo "🚀 Starting Nginx Configuration Deployment"
echo "=========================================="

# Server details
SERVER="62.72.43.74"
REMOTE_USER="root"
REMOTE_PATH="/var/www/vhosts/ssplt10.cloud/httpdocs/sspl-app"
NGINX_CONF_PATH="/etc/nginx/sites-available/ssplt10.cloud.conf"

echo "📋 Deployment Checklist:"
echo "1. ✅ Upload updated dist/ folder"
echo "2. ✅ Upload nginx.conf to server"
echo "3. ✅ Update nginx configuration"
echo "4. ✅ Test configuration"
echo "5. ✅ Reload nginx"
echo "6. ✅ Verify favicon access"

echo ""
echo "📁 Step 1: Upload files to server"
echo "Use FileZilla or scp to upload:"
echo "  - Local: ./httpdocs/dist/ → Remote: $REMOTE_PATH/"
echo "  - Local: ./httpdocs/nginx.conf → Remote: $REMOTE_PATH/"

echo ""
echo "🔧 Step 2: SSH into server and update configuration"
echo "ssh $REMOTE_USER@$SERVER"
echo ""
echo "# Commands to run on server:"
echo "sudo cp $REMOTE_PATH/nginx.conf $NGINX_CONF_PATH"
echo "sudo nginx -t  # Test configuration"
echo "sudo systemctl reload nginx  # Reload nginx"
echo ""
echo "# Restart your Node.js application:"
echo "cd $REMOTE_PATH"
echo "pm2 restart sspl-app"
echo ""
echo "# Verify favicon access:"
echo "curl -I https://www.ssplt10.cloud/favicon.ico"
echo "curl -I https://www.ssplt10.cloud/favicon-16x16.png"

echo ""
echo "✨ Deployment Complete!"
echo "======================"
echo "Your favicon 403 errors should now be resolved."
echo "Test by visiting: https://www.ssplt10.cloud/favicon.ico"