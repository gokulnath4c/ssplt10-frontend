#!/bin/bash

# Test Backend Deployment Script
# Run this after deploying the backend to verify everything is working

echo "🧪 Testing SSPL Backend Deployment..."

# Test backend health endpoint
echo "Testing backend health..."
curl -s https://www.ssplt10.cloud/api/health | jq . || echo "❌ Backend health check failed"

# Test PM2 status on server
echo "Testing PM2 status..."
ssh root@62.72.43.74 "pm2 status sspl-backend" || echo "❌ PM2 status check failed"

# Test API endpoints
echo "Testing API endpoints..."
curl -s -X POST https://www.ssplt10.cloud/api/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}' || echo "❌ Create order endpoint failed"

# Test frontend API calls
echo "Testing frontend API integration..."
curl -s https://www.ssplt10.cloud/api/health | grep -q "status.*ok" && echo "✅ API integration working" || echo "❌ API integration failed"

echo ""
echo "📋 Test Results Summary:"
echo "  - Backend Health: $(curl -s https://www.ssplt10.cloud/api/health | jq -r '.status' 2>/dev/null || echo 'FAILED')"
echo "  - PM2 Status: $(ssh root@62.72.43.74 'pm2 jlist sspl-backend | jq -r '.[0].pm2_env.status' 2>/dev/null' || echo 'FAILED')"
echo "  - Nginx Config: $(ssh root@62.72.43.74 'sudo nginx -t 2>&1 | grep -q "successful" && echo "OK" || echo "FAILED"')"

echo ""
echo "🎯 If tests fail, check:"
echo "  1. PM2 logs: pm2 logs sspl-backend"
echo "  2. Nginx error logs: sudo tail -f /var/log/nginx/error.log"
echo "  3. Backend logs: tail -f /var/www/vhosts/ssplt10.cloud/logs/backend.log"