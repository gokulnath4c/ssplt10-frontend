#!/bin/bash

# Cloudflare CDN Setup Script for SSPL Website
# This script configures Cloudflare zone, DNS, and CDN settings

set -e

# Configuration
DOMAIN="www.ssplt10.cloud"
ROOT_DOMAIN="ssplt10.cloud"
CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-your_api_token_here}"
CLOUDFLARE_EMAIL="${CLOUDFLARE_EMAIL:-your_email@example.com}"
CLOUDFLARE_API_KEY="${CLOUDFLARE_API_KEY:-your_api_key_here}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    print_info "Checking dependencies..."

    if ! command -v curl &> /dev/null; then
        print_error "curl is required but not installed"
        exit 1
    fi

    if ! command -v jq &> /dev/null; then
        print_error "jq is required but not installed"
        exit 1
    fi

    print_status "Dependencies check passed"
}

# Get zone ID from Cloudflare
get_zone_id() {
    print_info "Getting zone ID for $DOMAIN..."

    local response
    response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$ROOT_DOMAIN" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json")

    if echo "$response" | jq -e '.success' > /dev/null; then
        local zone_id
        zone_id=$(echo "$response" | jq -r '.result[0].id')
        if [ "$zone_id" != "null" ] && [ -n "$zone_id" ]; then
            echo "$zone_id"
            return 0
        fi
    fi

    print_error "Failed to get zone ID. Response: $response"
    return 1
}

# Create DNS records
create_dns_records() {
    local zone_id="$1"
    print_info "Creating DNS records..."

    # A record for root domain
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{
            "type": "A",
            "name": "'$ROOT_DOMAIN'",
            "content": "62.72.43.74",
            "ttl": 300,
            "proxied": true
        }' | jq -e '.success' > /dev/null || print_warning "Failed to create A record for root domain"

    # CNAME record for www subdomain
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{
            "type": "CNAME",
            "name": "www",
            "content": "'$ROOT_DOMAIN'",
            "ttl": 300,
            "proxied": true
        }' | jq -e '.success' > /dev/null || print_warning "Failed to create CNAME record for www"

    print_status "DNS records created"
}

# Configure page rules for caching
configure_page_rules() {
    local zone_id="$1"
    print_info "Configuring page rules for caching..."

    # Cache static assets
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$zone_id/pagerules" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{
            "targets": [{
                "target": "url",
                "constraint": {
                    "operator": "matches",
                    "value": "*.'$DOMAIN'/assets/*"
                }
            }],
            "actions": [
                {
                    "id": "cache_level",
                    "value": "cache_everything"
                },
                {
                    "id": "edge_cache_ttl",
                    "value": 31536000
                },
                {
                    "id": "browser_cache_ttl",
                    "value": 31536000
                }
            ],
            "priority": 1,
            "status": "active"
        }' | jq -e '.success' > /dev/null || print_warning "Failed to create cache rule for assets"

    # Cache images
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$zone_id/pagerules" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{
            "targets": [{
                "target": "url",
                "constraint": {
                    "operator": "matches",
                    "value": "*.'$DOMAIN'/*.(jpg|jpeg|png|gif|webp|avif|svg)"
                }
            }],
            "actions": [
                {
                    "id": "cache_level",
                    "value": "cache_everything"
                },
                {
                    "id": "edge_cache_ttl",
                    "value": 15552000
                },
                {
                    "id": "browser_cache_ttl",
                    "value": 15552000
                },
                {
                    "id": "mirage",
                    "value": "on"
                },
                {
                    "id": "polish",
                    "value": "lossy"
                }
            ],
            "priority": 2,
            "status": "active"
        }' | jq -e '.success' > /dev/null || print_warning "Failed to create cache rule for images"

    print_status "Page rules configured"
}

# Enable Cloudflare features
enable_cloudflare_features() {
    local zone_id="$1"
    print_info "Enabling Cloudflare features..."

    # Enable Always Use HTTPS
    curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$zone_id/settings/always_use_https" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{"value": "on"}' | jq -e '.success' > /dev/null || print_warning "Failed to enable Always Use HTTPS"

    # Enable Automatic HTTPS Rewrites
    curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$zone_id/settings/automatic_https_rewrites" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{"value": "on"}' | jq -e '.success' > /dev/null || print_warning "Failed to enable Automatic HTTPS Rewrites"

    # Enable Brotli compression
    curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$zone_id/settings/brotli" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{"value": "on"}' | jq -e '.success' > /dev/null || print_warning "Failed to enable Brotli compression"

    # Enable Mirage for image optimization
    curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$zone_id/settings/mirage" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{"value": "on"}' | jq -e '.success' > /dev/null || print_warning "Failed to enable Mirage"

    # Enable Polish for image optimization
    curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$zone_id/settings/polish" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{"value": "lossy"}' | jq -e '.success' > /dev/null || print_warning "Failed to enable Polish"

    print_status "Cloudflare features enabled"
}

# Update cdn-config.json with zone ID
update_config() {
    local zone_id="$1"
    print_info "Updating cdn-config.json with zone ID..."

    if [ -f "cdn-config.json" ]; then
        jq --arg zone_id "$zone_id" '.cdn.zones[0].id = $zone_id' cdn-config.json > cdn-config.tmp && mv cdn-config.tmp cdn-config.json
        print_status "Configuration updated"
    else
        print_warning "cdn-config.json not found"
    fi
}

# Main setup function
main() {
    echo "🚀 Setting up Cloudflare CDN for $DOMAIN"
    echo "========================================"

    # Check if API token is provided
    if [ "$CLOUDFLARE_API_TOKEN" = "your_api_token_here" ]; then
        print_error "Please set CLOUDFLARE_API_TOKEN environment variable"
        echo "Get your API token from: https://dash.cloudflare.com/profile/api-tokens"
        exit 1
    fi

    check_dependencies

    local zone_id
    zone_id=$(get_zone_id)

    if [ -z "$zone_id" ]; then
        print_error "Could not find zone for $ROOT_DOMAIN. Please ensure the domain is added to Cloudflare first."
        exit 1
    fi

    print_status "Found zone ID: $zone_id"

    create_dns_records "$zone_id"
    configure_page_rules "$zone_id"
    enable_cloudflare_features "$zone_id"
    update_config "$zone_id"

    echo ""
    echo "🎉 Cloudflare CDN setup completed!"
    echo ""
    echo "📋 Next steps:"
    echo "  1. Verify DNS propagation: dig $DOMAIN"
    echo "  2. Test CDN: curl -I https://$DOMAIN/"
    echo "  3. Check Cloudflare dashboard for analytics"
    echo "  4. Run: ./cloudflare-purge.sh to test cache purging"
}

# Run main function
main "$@"