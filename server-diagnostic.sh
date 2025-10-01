#!/bin/bash

# SSPL Server Diagnostic Script
# Verifies if server is running the latest commit and checks deployment health
# Usage: ./server-diagnostic.sh [github-repo-url] [branch]

set -e

# Configuration - Update these for your setup
GITHUB_REPO="${1:-https://github.com/gokulnath4c/ssplt10.cloud.git}"
BRANCH="${2:-main}"
DEPLOY_PATH="/var/www/vhosts/ssplt10.cloud/httpdocs"
DOMAIN="www.ssplt10.cloud"
SERVER_HOST="62.72.43.74"
SERVER_USER="root"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Function to get latest GitHub commit
get_github_commit() {
    print_header "Checking Latest GitHub Commit"

    # Try to get latest commit from GitHub API
    if command -v curl &> /dev/null; then
        GITHUB_COMMIT=$(curl -s "https://api.github.com/repos/${GITHUB_REPO#https://github.com/}/commits/${BRANCH}" | grep -o '"sha":"[^"]*"' | head -1 | cut -d'"' -f4)

        if [ -n "$GITHUB_COMMIT" ]; then
            print_success "Latest GitHub commit: ${GITHUB_COMMIT:0:8}"
            echo "$GITHUB_COMMIT"
        else
            print_warning "Could not fetch from GitHub API, trying git ls-remote"
            GITHUB_COMMIT=$(git ls-remote "$GITHUB_REPO" "$BRANCH" | cut -f1)
            if [ -n "$GITHUB_COMMIT" ]; then
                print_success "Latest GitHub commit: ${GITHUB_COMMIT:0:8}"
                echo "$GITHUB_COMMIT"
            else
                print_error "Could not determine latest GitHub commit"
                return 1
            fi
        fi
    else
        print_error "curl not available, cannot check GitHub"
        return 1
    fi
}

# Function to check deployed commit
check_deployed_commit() {
    print_header "Checking Deployed Commit"

    # Check if we can access the server
    if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "echo 'SSH connection successful'" &>/dev/null; then
        print_success "SSH connection to server established"

        # Check if git repository exists on server
        if ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "cd $DEPLOY_PATH && git rev-parse HEAD" &>/dev/null; then
            DEPLOYED_COMMIT=$(ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "cd $DEPLOY_PATH && git rev-parse HEAD")
            print_success "Deployed commit: ${DEPLOYED_COMMIT:0:8}"
            echo "$DEPLOYED_COMMIT"
        else
            print_warning "No git repository found on server"

            # Check for commit hash in deployed files
            DEPLOYED_COMMIT=$(ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "find $DEPLOY_PATH -name '*.js' -o -name '*.css' | head -1 | xargs grep -h 'commit\|build\|version' 2>/dev/null | head -1 || echo ''")
            if [ -n "$DEPLOYED_COMMIT" ]; then
                print_info "Found build info: $DEPLOYED_COMMIT"
            else
                print_warning "No commit information found in deployed files"
            fi
            echo ""
        fi
    else
        print_error "Cannot connect to server via SSH"
        print_info "Make sure your SSH key is configured and server is accessible"
        return 1
    fi
}

# Function to compare commits
compare_commits() {
    print_header "Comparing Commits"

    GITHUB_COMMIT=$1
    DEPLOYED_COMMIT=$2

    if [ -n "$GITHUB_COMMIT" ] && [ -n "$DEPLOYED_COMMIT" ]; then
        if [ "$GITHUB_COMMIT" = "$DEPLOYED_COMMIT" ]; then
            print_success "Server is running the latest commit! 🎉"
        else
            print_warning "Server is NOT running the latest commit"
            print_info "GitHub:    ${GITHUB_COMMIT:0:8}"
            print_info "Deployed:  ${DEPLOYED_COMMIT:0:8}"

            # Check how many commits behind
            if ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "cd $DEPLOY_PATH && git rev-list --count $DEPLOYED_COMMIT..$GITHUB_COMMIT" &>/dev/null; then
                COMMITS_BEHIND=$(ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "cd $DEPLOY_PATH && git rev-list --count $DEPLOYED_COMMIT..$GITHUB_COMMIT")
                print_warning "Server is $COMMITS_BEHIND commits behind"
            fi
        fi
    else
        print_error "Cannot compare commits - missing information"
    fi
}

# Function to check file timestamps
check_file_timestamps() {
    print_header "Checking File Timestamps"

    if ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "ls -la $DEPLOY_PATH/index.html" &>/dev/null; then
        INDEX_TIMESTAMP=$(ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "stat -c '%Y %n' $DEPLOY_PATH/index.html")
        print_info "index.html last modified: $(date -d "@${INDEX_TIMESTAMP%% *}")"

        # Check other important files
        for file in "assets/index-*.js" "assets/index-*.css"; do
            FILE_PATH=$(ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "find $DEPLOY_PATH -name '$file' 2>/dev/null | head -1")
            if [ -n "$FILE_PATH" ]; then
                FILE_TIMESTAMP=$(ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "stat -c '%Y' '$FILE_PATH'")
                print_info "$(basename "$FILE_PATH") last modified: $(date -d "@$FILE_TIMESTAMP")"
            fi
        done
    else
        print_error "Cannot access deployed files"
    fi
}

# Function to check nginx configuration
check_nginx_config() {
    print_header "Checking Nginx Configuration"

    # Check if nginx is running
    if ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_USER@$SERVER_HOST "systemctl is-active nginx" &>/dev/null; then
        print_success "Nginx is running"
    else
        print_error "Nginx is not running"
    fi

    # Check nginx configuration
    if ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "nginx -t" &>/dev/null; then
        print_success "Nginx configuration is valid"
    else
        print_error "Nginx configuration has errors"
    fi

    # Check deployed site configuration
    NGINX_CONFIG=$(ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "grep -r 'ssplt10.cloud' /etc/nginx/sites-enabled/ 2>/dev/null || echo ''")
    if [ -n "$NGINX_CONFIG" ]; then
        print_success "Nginx site configuration found"
    else
        print_warning "Nginx site configuration not found"
    fi
}

# Function to check caching headers
check_caching_headers() {
    print_header "Checking HTTP Caching Headers"

    if command -v curl &> /dev/null; then
        echo "Testing main page..."
        curl -I -s "https://$DOMAIN/" | grep -E "(Cache-Control|ETag|Last-Modified|Expires)" || print_warning "No caching headers found on main page"

        echo -e "\nTesting static assets..."
        # Test a JS file
        JS_FILE=$(curl -s "https://$DOMAIN/" | grep -o 'assets/[^"]*\.js' | head -1)
        if [ -n "$JS_FILE" ]; then
            echo "Testing JS file: $JS_FILE"
            curl -I -s "https://$DOMAIN/$JS_FILE" | grep -E "(Cache-Control|ETag|Last-Modified|Expires)" || print_warning "No caching headers found on JS file"
        fi

        # Test a CSS file
        CSS_FILE=$(curl -s "https://$DOMAIN/" | grep -o 'assets/[^"]*\.css' | head -1)
        if [ -n "$CSS_FILE" ]; then
            echo "Testing CSS file: $CSS_FILE"
            curl -I -s "https://$DOMAIN/$CSS_FILE" | grep -E "(Cache-Control|ETag|Last-Modified|Expires)" || print_warning "No caching headers found on CSS file"
        fi

        # Test an image
        IMG_FILE=$(curl -s "https://$DOMAIN/" | grep -o 'assets/[^"]*\.(png|jpg|jpeg|webp)' | head -1)
        if [ -n "$IMG_FILE" ]; then
            echo "Testing image file: $IMG_FILE"
            curl -I -s "https://$DOMAIN/$IMG_FILE" | grep -E "(Cache-Control|ETag|Last-Modified|Expires)" || print_warning "No caching headers found on image"
        fi
    else
        print_error "curl not available for HTTP testing"
    fi
}

# Function to check CDN behavior
check_cdn_behavior() {
    print_header "Checking CDN Behavior"

    if command -v curl &> /dev/null; then
        echo "Testing CDN headers..."

        # Check for Cloudflare headers
        CF_RAY=$(curl -I -s "https://$DOMAIN/" | grep -i "CF-RAY" | head -1)
        if [ -n "$CF_RAY" ]; then
            print_success "Cloudflare CDN detected: $CF_RAY"
        else
            print_info "No Cloudflare headers detected"
        fi

        # Check for other CDN indicators
        SERVER=$(curl -I -s "https://$DOMAIN/" | grep -i "Server:" | head -1)
        if [ -n "$SERVER" ]; then
            print_info "Server header: $SERVER"
        fi

        # Test response time
        RESPONSE_TIME=$(curl -s -w "%{time_total}" -o /dev/null "https://$DOMAIN/")
        if (( $(echo "$RESPONSE_TIME < 1.0" | bc -l 2>/dev/null) )); then
            print_success "Response time: ${RESPONSE_TIME}s (Fast - possible CDN)"
        elif (( $(echo "$RESPONSE_TIME < 3.0" | bc -l 2>/dev/null) )); then
            print_success "Response time: ${RESPONSE_TIME}s (Good)"
        else
            print_warning "Response time: ${RESPONSE_TIME}s (Slow)"
        fi

        # Test from different geographic locations (if available)
        print_info "Consider testing from different locations for CDN validation"
    else
        print_error "curl not available for CDN testing"
    fi
}

# Function to check deployment health
check_deployment_health() {
    print_header "Checking Deployment Health"

    # Test HTTP status
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/")
    if [ "$HTTP_STATUS" = "200" ]; then
        print_success "Website is accessible (HTTP $HTTP_STATUS)"
    else
        print_error "Website is not accessible (HTTP $HTTP_STATUS)"
    fi

    # Test HTTPS
    HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/")
    if [ "$HTTPS_STATUS" = "200" ]; then
        print_success "HTTPS is working (HTTP $HTTPS_STATUS)"
    else
        print_error "HTTPS is not working (HTTP $HTTPS_STATUS)"
    fi

    # Check for common issues
    if curl -s "https://$DOMAIN/" | grep -q "Error\|error\|Error 500"; then
        print_error "Error messages found on the page"
    else
        print_success "No error messages detected on main page"
    fi
}

# Function to generate deployment report
generate_report() {
    print_header "Deployment Diagnostic Report"
    echo "Generated at: $(date)"
    echo "Domain: $DOMAIN"
    echo "Server: $SERVER_HOST"
    echo "Deploy Path: $DEPLOY_PATH"
    echo "GitHub Repo: $GITHUB_REPO"
    echo "Branch: $BRANCH"
    echo ""
    echo "=== QUICK CHECKLIST ==="
    echo "□ Server accessible via SSH"
    echo "□ GitHub commit matches deployed commit"
    echo "□ Nginx is running and configured"
    echo "□ Website is accessible (HTTP 200)"
    echo "□ HTTPS is working"
    echo "□ Caching headers are present"
    echo "□ CDN is functioning (if configured)"
    echo "□ No error messages on pages"
    echo ""
    echo "=== RECOMMENDED ACTIONS ==="
    echo "1. If commits don't match: Run deployment script"
    echo "2. If nginx issues: Check nginx configuration"
    echo "3. If caching issues: Verify nginx config headers"
    echo "4. If CDN issues: Check CDN configuration"
}

# Main execution
main() {
    echo -e "${PURPLE}🔍 SSPL Server Diagnostic Tool${NC}"
    echo "=================================="

    # Get GitHub commit
    GITHUB_COMMIT=$(get_github_commit)

    # Check deployed commit
    DEPLOYED_COMMIT=$(check_deployed_commit)

    # Compare commits
    if [ -n "$GITHUB_COMMIT" ] && [ -n "$DEPLOYED_COMMIT" ]; then
        compare_commits "$GITHUB_COMMIT" "$DEPLOYED_COMMIT"
    fi

    # Additional checks
    check_file_timestamps
    check_nginx_config
    check_caching_headers
    check_cdn_behavior
    check_deployment_health

    # Generate report
    generate_report

    echo -e "\n${GREEN}Diagnostic complete!${NC}"
}

# Run main function
main "$@"