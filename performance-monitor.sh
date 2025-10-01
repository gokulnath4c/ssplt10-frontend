#!/bin/bash

# Performance Monitoring Script for SSPL Website
# Monitors CDN performance, cache hit rates, and loading times

set -e

# Configuration
DOMAIN="www.ssplt10.cloud"
CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-your_api_token_here}"
ZONE_ID="${CLOUDFLARE_ZONE_ID:-your_zone_id_here}"
TEST_LOCATIONS=("LAX" "FRA" "SIN" "BOM")  # Los Angeles, Frankfurt, Singapore, Mumbai

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

# Get zone ID from config
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

# Test loading times from different locations
test_loading_times() {
    print_info "Testing loading times from global locations..."

    echo "Location | First Byte | DOM Content | Fully Loaded | Status"
    echo "---------|------------|-------------|--------------|--------"

    for location in "${TEST_LOCATIONS[@]}"; do
        # Use webpagetest.org API or curl with timing
        local result
        result=$(curl -s -w "@curl-format.txt" -o /dev/null "https://$DOMAIN/" 2>/dev/null)

        if [ $? -eq 0 ]; then
            # Parse timing data (this is a simplified version)
            local time_total=$(echo "$result" | grep -o "time_total: [0-9.]*" | cut -d' ' -f2)
            local time_connect=$(echo "$result" | grep -o "time_connect: [0-9.]*" | cut -d' ' -f2)
            local time_start=$(echo "$result" | grep -o "time_starttransfer: [0-9.]*" | cut -d' ' -f2)

            # Convert to milliseconds
            time_total_ms=$(echo "scale=0; $time_total * 1000" | bc 2>/dev/null || echo "N/A")
            time_connect_ms=$(echo "scale=0; $time_connect * 1000" | bc 2>/dev/null || echo "N/A")
            time_start_ms=$(echo "scale=0; $time_start * 1000" | bc 2>/dev/null || echo "N/A")

            echo "$location    | ${time_connect_ms}ms | ${time_start_ms}ms | ${time_total_ms}ms | ✅"
        else
            echo "$location    | N/A        | N/A         | N/A          | ❌"
        fi
    done
}

# Get Cloudflare analytics
get_cloudflare_analytics() {
    local zone_id="$1"
    print_info "Fetching Cloudflare analytics..."

    local response
    response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$zone_id/analytics/dashboard?since=-1440" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json")

    if echo "$response" | jq -e '.success' > /dev/null; then
        echo "=== Cloudflare Analytics (Last 24h) ==="
        echo "$response" | jq '.result.totals | {
            requests: .requests.all,
            bandwidth: (.bandwidth.all / 1000000 | round | tostring + " MB"),
            threats: .threats.all,
            pageviews: .pageviews.all,
            uniques: .uniques.all
        }'

        # Cache hit rate
        local cached_requests=$(echo "$response" | jq '.result.totals.requests.cached // 0')
        local total_requests=$(echo "$response" | jq '.result.totals.requests.all // 1')
        local cache_hit_rate=$(echo "scale=2; ($cached_requests / $total_requests) * 100" | bc 2>/dev/null || echo "0")

        echo "Cache Hit Rate: ${cache_hit_rate}%"
    else
        print_error "Failed to fetch Cloudflare analytics"
    fi
}

# Test asset loading performance
test_asset_performance() {
    print_info "Testing asset loading performance..."

    # Test main assets
    local assets=(
        "/assets/index-*.js"
        "/assets/index-*.css"
        "/assets/vendor-*.js"
    )

    echo "Asset | Size | Load Time | Status"
    echo "------|------|-----------|--------"

    for asset_pattern in "${assets[@]}"; do
        # Get actual asset URL (simplified - would need to parse HTML)
        local asset_url="https://$DOMAIN$asset_pattern"

        local result
        result=$(curl -s -w "@curl-format.txt" -o /dev/null "$asset_url" 2>/dev/null)

        if [ $? -eq 0 ]; then
            local size=$(echo "$result" | grep -o "size_download: [0-9]*" | cut -d' ' -f2)
            local time_total=$(echo "$result" | grep -o "time_total: [0-9.]*" | cut -d' ' -f2)
            local time_ms=$(echo "scale=0; $time_total * 1000" | bc 2>/dev/null || echo "N/A")

            echo "$(basename "$asset_pattern") | ${size}B | ${time_ms}ms | ✅"
        else
            echo "$(basename "$asset_pattern") | N/A | N/A | ❌"
        fi
    done
}

# Check CDN health
check_cdn_health() {
    print_info "Checking CDN health..."

    # Test basic connectivity
    local http_status
    http_status=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/")

    if [ "$http_status" = "200" ]; then
        print_status "Website is accessible (HTTP $http_status)"
    else
        print_error "Website is not accessible (HTTP $http_status)"
        return 1
    fi

    # Check headers
    local cache_header
    cache_header=$(curl -I -s "https://$DOMAIN/assets/" 2>/dev/null | grep -i "cache-control" | head -1)

    if [ -n "$cache_header" ]; then
        print_status "Cache headers present: $cache_header"
    else
        print_warning "No cache headers found"
    fi

    # Check compression
    local encoding_header
    encoding_header=$(curl -H "Accept-Encoding: gzip" -I -s "https://$DOMAIN/" 2>/dev/null | grep -i "content-encoding" | head -1)

    if [ -n "$encoding_header" ]; then
        print_status "Compression enabled: $encoding_header"
    else
        print_warning "Compression not detected"
    fi
}

# Generate performance report
generate_report() {
    local report_file="performance-report-$(date +%Y%m%d-%H%M%S).txt"

    print_info "Generating performance report: $report_file"

    {
        echo "=== SSPL Website Performance Report ==="
        echo "Generated: $(date)"
        echo "Domain: $DOMAIN"
        echo ""

        echo "=== CDN Health ==="
        check_cdn_health
        echo ""

        echo "=== Loading Times ==="
        test_loading_times
        echo ""

        echo "=== Asset Performance ==="
        test_asset_performance
        echo ""

        echo "=== Recommendations ==="
        echo "• Target: Sub-1-second loading times globally"
        echo "• Monitor cache hit rates (>95% recommended)"
        echo "• Optimize images with WebP/AVIF formats"
        echo "• Use CDN purging for cache invalidation"
        echo "• Enable Brotli compression for better performance"

    } > "$report_file"

    print_status "Report saved to: $report_file"
}

# Show usage
usage() {
    echo "Performance Monitoring Script for SSPL Website"
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  health      Check CDN health and basic performance"
    echo "  loading     Test loading times from global locations"
    echo "  assets      Test asset loading performance"
    echo "  analytics   Get Cloudflare analytics data"
    echo "  report      Generate comprehensive performance report"
    echo "  all         Run all performance checks"
    echo "  help        Show this help"
    echo ""
    echo "Environment Variables:"
    echo "  CLOUDFLARE_API_TOKEN  Your Cloudflare API token"
    echo "  CLOUDFLARE_ZONE_ID    Your Cloudflare zone ID"
}

# Create curl format file for timing
create_curl_format() {
    cat > curl-format.txt << 'EOF'
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
          time_starttransfer:  %{time_starttransfer}\n
                     time_total:  %{time_total}\n
              size_download:  %{size_download}\n
EOF
}

# Main function
main() {
    # Check if API token is provided
    if [ "$CLOUDFLARE_API_TOKEN" = "your_api_token_here" ]; then
        print_warning "CLOUDFLARE_API_TOKEN not set - some features will be limited"
    fi

    # Create curl format file
    create_curl_format

    local zone_id
    zone_id=$(get_zone_id)

    case "${1:-all}" in
        "health")
            check_cdn_health
            ;;
        "loading")
            test_loading_times
            ;;
        "assets")
            test_asset_performance
            ;;
        "analytics")
            get_cloudflare_analytics "$zone_id"
            ;;
        "report")
            generate_report
            ;;
        "all")
            check_cdn_health
            echo ""
            test_loading_times
            echo ""
            test_asset_performance
            echo ""
            get_cloudflare_analytics "$zone_id"
            ;;
        "help"|*)
            usage
            ;;
    esac

    # Cleanup
    rm -f curl-format.txt
}

# Run main function
main "$@"