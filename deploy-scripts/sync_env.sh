#!/bin/bash

# SSPL Environment Sync Script
# Usage: ./sync_env.sh [environment]
# Environments: development, preview, production

set -e

ENVIRONMENT=${1:-"production"}
PROJECT_ROOT="/var/www/vhosts/ssplt10.cloud"
BACKEND_DIR="$PROJECT_ROOT/backend"

echo "🔄 Syncing environment files for $ENVIRONMENT..."

# Validate environment
if [[ "$ENVIRONMENT" != "development" && "$ENVIRONMENT" != "preview" && "$ENVIRONMENT" != "production" ]]; then
    echo "❌ Invalid environment: $ENVIRONMENT"
    echo "Valid environments: development, preview, production"
    exit 1
fi

# Function to sync environment file
sync_env_file() {
    cd "$BACKEND_DIR"

    if [ "$ENVIRONMENT" = "production" ]; then
        if [ -f ".env.production" ]; then
            cp .env.production .env
            echo "✅ Copied .env.production to .env"
        else
            echo "❌ .env.production not found"
            exit 1
        fi
    elif [ "$ENVIRONMENT" = "preview" ]; then
        if [ -f ".env.preview" ]; then
            cp .env.preview .env
            echo "✅ Copied .env.preview to .env"
        else
            echo "❌ .env.preview not found"
            exit 1
        fi
    else
        if [ -f ".env" ]; then
            echo "✅ Using existing .env for development"
        else
            echo "❌ .env not found"
            exit 1
        fi
    fi
}

# Function to verify environment variables
verify_env_vars() {
    echo "🔍 Verifying environment variables..."

    # Check for required variables
    required_vars=("RAZORPAY_KEY_ID" "RAZORPAY_KEY_SECRET" "VITE_API_URL" "VITE_SUPABASE_PROJECT_ID")

    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" .env; then
            echo "❌ Missing required environment variable: $var"
            exit 1
        fi
    done

    echo "✅ All required environment variables are present"
}

# Main sync flow
sync_env_file
verify_env_vars

echo ""
echo "🎉 Environment sync for $ENVIRONMENT completed successfully!"
echo ""
echo "📋 Current environment configuration:"
echo "  - Environment: $ENVIRONMENT"
echo "  - Backend directory: $BACKEND_DIR"
echo "  - Active .env file: $(pwd)/.env"