#!/bin/bash

# Cloudflare Cache Purge Script for SSPL Website
# Automates cache invalidation for deployments and manual purges

set -e

# Configuration
DOMAIN="www.ssplt10.cloud"
CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-your_api_token_here}"
ZONE_ID="${CLOUDFLARE_ZONE_ID:-your_zone_id_here}"

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

# Get zone ID from config if not provided
get_zone_id() {
    if [ "$ZONE_ID" = "your_zone_id_here" ] && [ -f "cdn-config.json" ]; then
        ZONE_ID=$(jq -r '.cdn.zones[0].id' cdn-config.json 2>/dev/null || echo "your_zone_id_here")
    fi

    if [ "$ZONE_ID" = "your_zone_id_here" ] || [ -z "$ZONE_ID" ]; then
        print_error "Zone ID not found. Please set CLOUDFLARE_ZONE_ID or update cdn-config.json"
        exit 1
    fi

    echo "$ZONE_ID"
}

# Purge everything
purge_all() {
    local zone_id="$1"
    print_info "Purging all cache..."

    local response
    response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$zone_id/purge_cache" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{"purge_everything": true}')

    if echo "$response" | jq -e '.success' > /dev/null; then
        print_status "All cache purged successfully"
    else
        print_error "Failed to purge cache: $(echo "$response" | jq -r '.errors[0].message')"
        return 1
    fi
}

# Purge specific files
purge_files() {
    local zone_id="$1"
    shift
    local files=("$@")

    if [ ${#files[@]} -eq 0 ]; then
        print_error "No files specified for purging"
        return 1
    fi

    print_info "Purging specific files..."

    # Convert files to Cloudflare format
    local files_json
    files_json=$(printf '%s\n' "${files[@]}" | jq -R . | jq -s .)

    local response
    response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$zone_id/purge_cache" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data "{\"files\": $files_json}")

    if echo "$response" | jq -e '.success' > /dev/null; then
        print_status "Files purged successfully"
    else
        print_error "Failed to purge files: $(echo "$response" | jq -r '.errors[0].message')"
        return 1
    fi
}

# Purge by tags
purge_tags() {
    local zone_id="$1"
    shift
    local tags=("$@")

    if [ ${#tags[@]} -eq 0 ]; then
        print_error "No tags specified for purging"
        return 1
    fi

    print_info "Purging by tags..."

    local tags_json
    tags_json=$(printf '%s\n' "${tags[@]}" | jq -R . | jq -s .)

    local response
    response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$zone_id/purge_cache" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data "{\"tags\": $tags_json}")

    local response
    response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$zone_id/purge_cache" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data "{\"tags\": $tags_json}")

    if echo "$response" | jq -e '.success' > /dev/null; then
        print_status "Tags purged successfully"
    else
        print_error "Failed to purge tags: $(echo "$response" | jq -r '.errors[0].message')"
        return 1
    fi
}

# Purge static assets
purge_assets() {
    local zone_id="$1"
    print_info "Purging static assets..."

    local response
    response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$zone_id/purge_cache" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{
            "files": [
                "https://'$DOMAIN'/assets/*",
                "https://'$DOMAIN'/*.(css|js|png|jpg|jpeg|gif|webp|avif|svg|woff|woff2|ttf|eot)"
            ]
        }')

    if echo "$response" | jq -e '.success' > /dev/null; then
        print_status "Static assets purged successfully"
    else
        print_error "Failed to purge assets: $(echo "$response" | jq -r '.errors[0].message')"
        return 1
    fi
}

# Get cache analytics
get_cache_stats() {
    local zone_id="$1"
    print_info "Getting cache analytics..."

    local response
    response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$zone_id/analytics/dashboard?since=-168" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json")

    if echo "$response" | jq -e '.success' > /dev/null; then
        echo "$response" | jq '.result.totals'
    else
        print_error "Failed to get cache stats"
    fi
}

# Deployment-triggered purge
purge_on_deploy() {
    local zone_id="$1"
    print_info "Running deployment-triggered cache purge..."

    # Purge static assets
    purge_assets "$zone_id"

    # Wait a moment for propagation
    sleep 5

    # Purge API cache if needed
    print_info "Purging API cache..."
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$zone_id/purge_cache" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{
            "hosts": ["'$DOMAIN'"],
            "tags": ["api", "data"]
        }' > /dev/null

    print_status "Deployment purge completed"
}

# Show usage
usage() {
    echo "Cloudflare Cache Purge Script"
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  all          Purge all cache"
    echo "  assets       Purge static assets only"
    echo "  files URL1 URL2  Purge specific files"
    echo "  tags TAG1 TAG2   Purge by cache tags"
    echo "  deploy       Purge cache after deployment"
    echo "  stats        Show cache analytics"
    echo "  help         Show this help"
    echo ""
    echo "Environment Variables:"
    echo "  CLOUDFLARE_API_TOKEN  Your Cloudflare API token"
    echo "  CLOUDFLARE_ZONE_ID    Your Cloudflare zone ID"
    echo ""
    echo "Examples:"
    echo "  $0 all"
    echo "  $0 assets"
    echo "  $0 files https://www.ssplt10.cloud/assets/main.js"
    echo "  $0 tags api data"
    echo "  CLOUDFLARE_API_TOKEN=token $0 stats"
}

# Main function
main() {
    # Check if API token is provided
    if [ "$CLOUDFLARE_API_TOKEN" = "your_api_token_here" ]; then
        print_error "Please set CLOUDFLARE_API_TOKEN environment variable"
        exit 1
    fi

    local zone_id
    zone_id=$(get_zone_id)

    case "${1:-help}" in
        "all")
            purge_all "$zone_id"
            ;;
        "assets")
            purge_assets "$zone_id"
            ;;
        "files")
            shift
            purge_files "$zone_id" "$@"
            ;;
        "tags")
            shift
            purge_tags "$zone_id" "$@"
            ;;
        "deploy")
            purge_on_deploy "$zone_id"
            ;;
        "stats")
            get_cache_stats "$zone_id"
            ;;
        "help"|*)
            usage
            ;;
    esac
}

# Run main function
main "$@"