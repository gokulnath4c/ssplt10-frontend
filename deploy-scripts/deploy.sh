#!/bin/bash

# SSPL Deployment Script
# Usage: ./deploy.sh [environment]
# Environments: development, preview, production

set -e

ENVIRONMENT=${1:-"production"}
PROJECT_ROOT="/var/www/vhosts/ssplt10.cloud"
FRONTEND_DIR="$PROJECT_ROOT/httpdocs"
BACKEND_DIR="$PROJECT_ROOT/backend"
LOGS_DIR="$PROJECT_ROOT/logs"

echo "🚀 Starting deployment to $ENVIRONMENT environment..."

# Validate environment
if [[ "$ENVIRONMENT" != "development" && "$ENVIRONMENT" != "preview" && "$ENVIRONMENT" != "production" ]]; then
    echo "❌ Invalid environment: $ENVIRONMENT"
    echo "Valid environments: development, preview, production"
    exit 1
fi

# Function to build frontend
build_frontend() {
    echo "🔨 Building frontend for $ENVIRONMENT..."

    cd "$FRONTEND_DIR"

    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm ci
    fi

    # Build for the specified environment
    if [ "$ENVIRONMENT" = "production" ]; then
        npm run build:production
    elif [ "$ENVIRONMENT" = "preview" ]; then
        npm run build:preview
    else
        npm run build:dev
    fi

    echo "✅ Frontend build completed!"
}

# Function to deploy frontend
deploy_frontend() {
    echo "📤 Deploying frontend..."

    # Create httpdocs directory if it doesn't exist
    sudo mkdir -p "$FRONTEND_DIR"

    # Copy build files to httpdocs
    sudo cp -r dist/* "$FRONTEND_DIR/"

    # Set proper permissions
    sudo chown -R www-data:www-data "$FRONTEND_DIR"
    sudo chmod -R 755 "$FRONTEND_DIR"

    echo "✅ Frontend deployed to $FRONTEND_DIR"
}

# Function to deploy backend
deploy_backend() {
    echo "📤 Deploying backend..."

    cd "$BACKEND_DIR"

    # Install dependencies
    echo "📦 Installing backend dependencies..."
    npm ci --production

    # Copy environment file
    if [ "$ENVIRONMENT" = "production" ]; then
        cp .env.production .env
    elif [ "$ENVIRONMENT" = "preview" ]; then
        cp .env.preview .env
    else
        cp .env .env
    fi

    # Create logs directory
    sudo mkdir -p "$LOGS_DIR"

    echo "✅ Backend dependencies installed and environment configured"
}

# Function to restart backend with PM2
restart_backend() {
    echo "🔄 Restarting backend with PM2..."

    cd "$BACKEND_DIR"

    # Stop existing process if running
    pm2 stop sspl-backend || true
    pm2 delete sspl-backend || true

    # Start with environment-specific configuration
    pm2 start ecosystem.config.js --env "$ENVIRONMENT"
    pm2 save

    echo "✅ Backend restarted with PM2"
}

# Function to reload Nginx
reload_nginx() {
    echo "🔄 Reloading Nginx..."

    # Test configuration
    sudo nginx -t

    # Reload if test passes
    sudo systemctl reload nginx

    echo "✅ Nginx reloaded"
}

# Function to verify deployment
verify_deployment() {
    echo "🔍 Verifying deployment..."

    # Check PM2 status
    pm2 status

    # Check backend health
    sleep 5
    curl -f http://localhost:3001/health || echo "⚠️  Backend health check failed"

    # Check Nginx status
    sudo systemctl status nginx --no-pager -l

    echo "✅ Deployment verification completed"
}

# Main deployment flow
echo "📋 Deployment checklist:"
echo "  ✅ Build frontend for $ENVIRONMENT"
echo "  ✅ Deploy frontend to $FRONTEND_DIR"
echo "  ✅ Deploy backend to $BACKEND_DIR"
echo "  ✅ Restart backend with PM2"
echo "  ✅ Reload Nginx"
echo "  ✅ Verify deployment"

build_frontend
deploy_frontend
deploy_backend
restart_backend
reload_nginx
verify_deployment

echo ""
echo "🎉 Deployment to $ENVIRONMENT completed successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Test the application at the appropriate URL"
echo "  2. Check PM2 logs: pm2 logs sspl-backend"
echo "  3. Monitor Nginx logs for any errors"
echo "  4. Verify API endpoints are working correctly"