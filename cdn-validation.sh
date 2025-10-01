#!/bin/bash

# CDN Validation Script for SSPL Website
# Tests and validates the Cloudflare CDN configuration

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

# Get zone ID from config
get_zone_id() {
    if [ "$ZONE_ID" = "your_zone_id_here" ] && [ -f "cdn-config.json" ]; then
        ZONE_ID=$(jq -r '.cdn.zones[0].id' cdn-config.json 2>/dev/null || echo "your_zone_id_here")
    fi

    if [ "$ZONE_ID" = "your_zone_id_here" ] || [ -z "$ZONE_ID" ]; then
        print_error "Zone ID not found. Please set CLOUDFLARE_ZONE_ID or update cdn-config.json"
        return 1
    fi

    echo "$ZONE_ID"
}

# Validate DNS configuration
validate_dns() {
    print_info "Validating DNS configuration..."

    # Check if domain resolves to Cloudflare
    local cf_ray
    cf_ray=$(curl -s -I "https://$DOMAIN/" | grep -i "cf-ray" | head -1)

    if [ -n "$cf_ray" ]; then
        print_status "Domain is served through Cloudflare"
    else
        print_warning "Domain may not be properly configured with Cloudflare"
    fi

    # Check DNS records
    local dns_records
    dns_records=$(dig +short "$DOMAIN" 2>/dev/null)

    if [ -n "$dns_records" ]; then
        print_status "DNS records found: $dns_records"
    else
        print_error "No DNS records found for $DOMAIN"
        return 1
    fi
}

# Test CDN caching
test_caching() {
    print_info "Testing CDN caching..."

    # Test static asset caching
    local cache_header
    cache_header=$(curl -I -s "https://$DOMAIN/assets/" 2>/dev/null | grep -i "cache-control" | head -1)

    if [ -n "$cache_header" ]; then
        print_status "Static assets caching: $cache_header"
    else
        print_warning "No cache headers found for static assets"
    fi

    # Test image caching
    local image_cache
    image_cache=$(curl -I -s "https://$DOMAIN/" 2>/dev/null | grep -i "cf-cache-status" | head -1)

    if [ -n "$image_cache" ]; then
        print_status "Cloudflare cache status: $image_cache"
    else
        print_warning "No Cloudflare cache status header found"
    fi
}

# Test image optimization
test_image_optimization() {
    print_info "Testing image optimization..."

    # Check if WebP is supported
    local webp_support
    webp_support=$(curl -H "Accept: image/webp" -I -s "https://$DOMAIN/" 2>/dev/null | grep -i "content-type" | head -1)

    if echo "$webp_support" | grep -qi "webp"; then
        print_status "WebP format support detected"
    else
        print_warning "WebP format support not detected"
    fi

    # Check Polish status
    local polish_header
    polish_header=$(curl -I -s "https://$DOMAIN/" 2>/dev/null | grep -i "cf-polished" | head -1)

    if [ -n "$polish_header" ]; then
        print_status "Image optimization (Polish) active: $polish_header"
    else
        print_warning "Image optimization may not be active"
    fi
}

# Test compression
test_compression() {
    print_info "Testing compression..."

    # Test Brotli compression
    local brotli_header
    brotli_header=$(curl -H "Accept-Encoding: br" -I -s "https://$DOMAIN/" 2>/dev/null | grep -i "content-encoding" | head -1)

    if echo "$brotli_header" | grep -qi "br"; then
        print_status "Brotli compression enabled"
    else
        # Test gzip compression
        local gzip_header
        gzip_header=$(curl -H "Accept-Encoding: gzip" -I -s "https://$DOMAIN/" 2>/dev/null | grep -i "content-encoding" | head -1)

        if echo "$gzip_header" | grep -qi "gzip"; then
            print_status "Gzip compression enabled"
        else
            print_warning "No compression detected"
        fi
    fi
}

# Test security headers
test_security() {
    print_info "Testing security headers..."

    local headers
    headers=$(curl -I -s "https://$DOMAIN/" 2>/dev/null)

    # Check HTTPS
    if echo "$headers" | grep -qi "strict-transport-security"; then
        print_status "HTTPS Strict Transport Security enabled"
    else
        print_warning "HTTPS Strict Transport Security not found"
    fi

    # Check XSS protection
    if echo "$headers" | grep -qi "x-xss-protection"; then
        print_status "XSS protection enabled"
    else
        print_warning "XSS protection not found"
    fi

    # Check content type options
    if echo "$headers" | grep -qi "x-content-type-options"; then
        print_status "Content type options set"
    else
        print_warning "Content type options not set"
    fi
}

# Test performance
test_performance() {
    print_info "Testing performance..."

    # Test response time
    local start_time
    start_time=$(date +%s%N)
    curl -s "https://$DOMAIN/" > /dev/null
    local end_time
    end_time=$(date +%s%N)

    local response_time
    response_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds

    if [ $response_time -lt 1000 ]; then
        print_status "Response time: ${response_time}ms (sub-1-second target achieved)"
    else
        print_warning "Response time: ${response_time}ms (above 1-second target)"
    fi

    # Test asset loading
    local asset_time
    start_time=$(date +%s%N)
    curl -s "https://$DOMAIN/assets/" > /dev/null
    end_time=$(date +%s%N)
    asset_time=$(( (end_time - start_time) / 1000000 ))

    if [ $asset_time -lt 500 ]; then
        print_status "Asset loading time: ${asset_time}ms"
    else
        print_warning "Asset loading time: ${asset_time}ms (may need optimization)"
    fi
}

# Generate validation report
generate_validation_report() {
    local report_file="cdn-validation-report-$(date +%Y%m%d-%H%M%S).txt"

    print_info "Generating validation report: $report_file"

    {
        echo "=== SSPL CDN Validation Report ==="
        echo "Generated: $(date)"
        echo "Domain: $DOMAIN"
        echo ""

        echo "=== DNS Configuration ==="
        validate_dns 2>/dev/null || echo "DNS validation failed"
        echo ""

        echo "=== Caching Tests ==="
        test_caching 2>/dev/null || echo "Caching tests failed"
        echo ""

        echo "=== Image Optimization ==="
        test_image_optimization 2>/dev/null || echo "Image optimization tests failed"
        echo ""

        echo "=== Compression Tests ==="
        test_compression 2>/dev/null || echo "Compression tests failed"
        echo ""

        echo "=== Security Tests ==="
        test_security 2>/dev/null || echo "Security tests failed"
        echo ""

        echo "=== Performance Tests ==="
        test_performance 2>/dev/null || echo "Performance tests failed"
        echo ""

        echo "=== Recommendations ==="
        echo "• Ensure CLOUDFLARE_API_TOKEN is set for full validation"
        echo "• Verify zone ID in cdn-config.json"
        echo "• Check Cloudflare dashboard for additional configuration"
        echo "• Monitor performance metrics regularly"

    } > "$report_file"

    print_status "Validation report saved to: $report_file"
}

# Show usage
usage() {
    echo "CDN Validation Script for SSPL Website"
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dns        Validate DNS configuration"
    echo "  cache      Test CDN caching"
    echo "  images     Test image optimization"
    echo "  compression Test compression settings"
    echo "  security   Test security headers"
    echo "  performance Test loading performance"
    echo "  report     Generate comprehensive validation report"
    echo "  all        Run all validation tests"
    echo "  help       Show this help"
    echo ""
    echo "Environment Variables:"
    echo "  CLOUDFLARE_API_TOKEN  Your Cloudflare API token"
    echo "  CLOUDFLARE_ZONE_ID    Your Cloudflare zone ID"
}

# Main function
main() {
    case "${1:-all}" in
        "dns")
            validate_dns
            ;;
        "cache")
            test_caching
            ;;
        "images")
            test_image_optimization
            ;;
        "compression")
            test_compression
            ;;
        "security")
            test_security
            ;;
        "performance")
            test_performance
            ;;
        "report")
            generate_validation_report
            ;;
        "all")
            validate_dns
            echo ""
            test_caching
            echo ""
            test_image_optimization
            echo ""
            test_compression
            echo ""
            test_security
            echo ""
            test_performance
            ;;
        "help"|*)
            usage
            ;;
    esac
}

# Run main function
main "$@"