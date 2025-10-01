#!/bin/bash

# SSPL Backend Deployment Script
# This script deploys the backend server to production

set -e

echo "🚀 Starting backend deployment to production..."

# Server details
SERVER_HOST="62.72.43.74"
SERVER_USER="root"
BACKEND_DIR="/var/www/vhosts/ssplt10.cloud/backend"
FRONTEND_DIR="/var/www/vhosts/ssplt10.cloud/httpdocs"

echo "📋 Deployment checklist:"
echo "  ✅ Upload backend files to server"
echo "  ✅ Install backend dependencies"
echo "  ✅ Configure environment variables"
echo "  ✅ Start backend with PM2"
echo "  ✅ Configure Nginx proxy for API routes"
echo "  ✅ Test backend endpoints"

# Create deployment package
echo "📦 Creating deployment package..."
cd backend/backend
tar -czf ../../backend-deployment.tar.gz .

echo "📤 Uploading backend to server..."
scp ../../backend-deployment.tar.gz $SERVER_USER@$SERVER_HOST:/tmp/

# Execute deployment on server
ssh $SERVER_USER@$SERVER_HOST << 'EOF'
    set -e

    echo "🔧 Setting up backend on server..."

    # Create backend directory
    sudo mkdir -p /var/www/vhosts/ssplt10.cloud/backend
    cd /var/www/vhosts/ssplt10.cloud/backend

    # Extract deployment package
    sudo tar -xzf /tmp/backend-deployment.tar.gz
    sudo rm /tmp/backend-deployment.tar.gz

    # Install dependencies
    echo "📦 Installing backend dependencies..."
    sudo npm ci --production

    # Set proper permissions
    sudo chown -R www-data:www-data /var/www/vhosts/ssplt10.cloud/backend
    sudo chmod -R 755 /var/www/vhosts/ssplt10.cloud/backend

    # Create logs directory
    sudo mkdir -p /var/www/vhosts/ssplt10.cloud/logs

    echo "✅ Backend files deployed successfully"
EOF

echo "🔧 Configuring backend environment..."
ssh $SERVER_USER@$SERVER_HOST << 'EOF'
    cd /var/www/vhosts/ssplt10.cloud/backend

    # Create production environment file
    sudo cat > .env << 'ENV_EOF'
NODE_ENV=production
PORT=3001

# Razorpay LIVE keys (REPLACE WITH YOUR ACTUAL LIVE KEYS)
RAZORPAY_KEY_ID=YOUR_LIVE_RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_LIVE_RAZORPAY_KEY_SECRET

# Domain & API
DOMAIN=https://www.ssplt10.cloud
VITE_API_URL=https://www.ssplt10.cloud/api

# Supabase
VITE_SUPABASE_PROJECT_ID=fazpykekypcktcmniwbj
VITE_SUPABASE_URL=https://fazpykekypcktcmniwbj.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM

# Frontend settings
VITE_RAZORPAY_KEY_ID=YOUR_LIVE_RAZORPAY_KEY_ID
VITE_APP_NAME="Southern Street Premier League"
VITE_APP_VERSION=1.0.0
ENV_EOF

    # Set proper permissions for env file
    sudo chmod 600 .env
EOF

echo "🔄 Starting backend with PM2..."
ssh $SERVER_USER@$SERVER_HOST << 'EOF'
    cd /var/www/vhosts/ssplt10.cloud/backend

    # Stop existing backend process if running
    pm2 stop sspl-backend || true
    pm2 delete sspl-backend || true

    # Start backend with PM2
    pm2 start src/app.js --name "sspl-backend"
    pm2 save

    # Enable PM2 startup
    pm2 startup | grep -v "sudo" | bash

    echo "✅ Backend started with PM2"
EOF

echo "🌐 Configuring Nginx proxy for API routes..."
ssh $SERVER_USER@$SERVER_HOST << 'EOF'
    # Create Nginx configuration for API proxy
    sudo cat > /etc/nginx/conf.d/sspl-api-proxy.conf << 'NGINX_EOF'
# SSPL API Proxy Configuration
location /api {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # CORS headers
    add_header 'Access-Control-Allow-Origin' 'https://www.ssplt10.cloud' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;

    # Handle preflight requests
    if ($request_method = 'OPTIONS') {
        return 204;
    }
}

# Health check endpoint
location /api/health {
    proxy_pass http://127.0.0.1:3001/health;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
NGINX_EOF

    # Test Nginx configuration
    sudo nginx -t

    # Reload Nginx
    sudo systemctl reload nginx

    echo "✅ Nginx proxy configured"
EOF

echo "🧪 Testing backend deployment..."
ssh $SERVER_USER@$SERVER_HOST << 'EOF'
    echo "Testing backend health..."
    curl -f http://localhost:3001/health || echo "❌ Backend health check failed"

    echo "Testing PM2 status..."
    pm2 status

    echo "Testing Nginx configuration..."
    sudo nginx -t
EOF

echo ""
echo "🎉 Backend deployment completed!"
echo ""
echo "📋 Next steps:"
echo "  1. Update the Razorpay keys in the .env file with your LIVE credentials"
echo "  2. Test the API endpoints: https://www.ssplt10.cloud/api/health"
echo "  3. Verify the frontend can now make API calls"
echo "  4. Test payment functionality with live Razorpay keys"
echo ""
echo "🔧 To update Razorpay keys:"
echo "  1. SSH into the server: ssh root@62.72.43.74"
echo "  2. Edit: /var/www/vhosts/ssplt10.cloud/backend/.env"
echo "  3. Replace YOUR_LIVE_RAZORPAY_KEY_ID and YOUR_LIVE_RAZORPAY_KEY_SECRET"
echo "  4. Restart backend: pm2 restart sspl-backend"