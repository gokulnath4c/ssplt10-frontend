#!/bin/bash

# Blue-Green Deployment Setup Script
# Initializes the blue-green deployment infrastructure

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DEPLOY_HOST="62.72.43.74"
DEPLOY_USER="root"
DEPLOY_PATH="/var/www/vhosts/ssplt10.cloud"

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

print_header() {
    echo -e "${BLUE}🚀 $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"

    local missing_deps=()

    # Check if running on deployment server
    if ! ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "echo 'SSH connection successful'" >/dev/null 2>&1; then
        print_error "Cannot connect to deployment server $DEPLOY_HOST"
        exit 1
    fi
    print_status "SSH connection to deployment server verified"

    # Check local dependencies
    command -v rsync >/dev/null 2>&1 || missing_deps+=("rsync")
    command -v jq >/dev/null 2>&1 || missing_deps+=("jq")

    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        echo "Install with: sudo apt install ${missing_deps[*]}"
        exit 1
    fi

    print_status "All local prerequisites met"
}

# Setup directory structure
setup_directories() {
    print_header "Setting up Directory Structure"

    ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        # Create main directories
        mkdir -p $DEPLOY_PATH/{blue,green}/deployments
        mkdir -p $DEPLOY_PATH/logs

        # Create log files
        touch $DEPLOY_PATH/logs/{blue-frontend,blue-backend,green-frontend,green-backend}-{out,error}.log
        touch $DEPLOY_PATH/logs/{blue-green-deployment,database-migration,rollback,smoke-tests}.log

        # Set permissions
        chown -R $DEPLOY_USER:$DEPLOY_USER $DEPLOY_PATH
        chmod -R 755 $DEPLOY_PATH
    "

    print_status "Directory structure created"
}

# Setup Nginx configuration
setup_nginx() {
    print_header "Setting up Nginx Configuration"

    # Copy nginx configuration to server
    scp -o StrictHostKeyChecking=no nginx-blue-green.conf $DEPLOY_USER@$DEPLOY_HOST:/tmp/

    ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        # Backup existing configuration
        if [ -f /etc/nginx/sites-available/ssplt10.cloud ]; then
            cp /etc/nginx/sites-available/ssplt10.cloud /etc/nginx/sites-available/ssplt10.cloud.backup.$(date +%Y%m%d_%H%M%S)
        fi

        # Install new configuration
        cp /tmp/nginx-blue-green.conf /etc/nginx/sites-available/ssplt10.cloud

        # Enable site
        ln -sf /etc/nginx/sites-available/ssplt10.cloud /etc/nginx/sites-enabled/

        # Test configuration
        if nginx -t; then
            print_status 'Nginx configuration is valid'
        else
            print_error 'Nginx configuration test failed'
            exit 1
        fi
    "

    print_status "Nginx configuration updated"
}

# Setup PM2 configuration
setup_pm2() {
    print_header "Setting up PM2 Configuration"

    # Copy PM2 configuration to server
    scp -o StrictHostKeyChecking=no ecosystem-blue-green.config.cjs $DEPLOY_USER@$DEPLOY_HOST:/tmp/

    ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        # Install new PM2 configuration
        cp /tmp/ecosystem-blue-green.config.cjs $DEPLOY_PATH/

        # Update paths in configuration
        sed -i 's|/path/to/your/project|$DEPLOY_PATH|g' $DEPLOY_PATH/ecosystem-blue-green.config.cjs
    "

    print_status "PM2 configuration updated"
}

# Setup environment variables
setup_environment() {
    print_header "Setting up Environment Variables"

    ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        # Create environment file if it doesn't exist
        if [ ! -f $DEPLOY_PATH/.env ]; then
            cat > $DEPLOY_PATH/.env << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://user:password@host:5432/dbname
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name

# Supabase Configuration
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_URL=your-supabase-url

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Application Configuration
NODE_ENV=production
DOMAIN=https://www.ssplt10.cloud
VITE_APP_NAME='Southern Street Premier League'
VITE_APP_VERSION=1.0.0
EOF
            print_info 'Created default .env file - UPDATE WITH PRODUCTION VALUES'
        else
            print_info 'Environment file already exists'
        fi
    "

    print_status "Environment setup completed"
}

# Setup log rotation
setup_log_rotation() {
    print_header "Setting up Log Rotation"

    ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        # Create logrotate configuration
        cat > /etc/logrotate.d/blue-green << 'EOF'
/var/www/vhosts/ssplt10.cloud/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
    "

    print_status "Log rotation configured"
}

# Setup initial deployment
setup_initial_deployment() {
    print_header "Setting up Initial Deployment"

    print_info "Creating initial blue environment structure"

    ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        # Create initial deployment directory for blue
        mkdir -p $DEPLOY_PATH/blue/deployments/initial
        echo 'Initial deployment placeholder' > $DEPLOY_PATH/blue/deployments/initial/README.md

        # Create symlink to initial deployment
        ln -sf $DEPLOY_PATH/blue/deployments/initial $DEPLOY_PATH/blue/current

        # Set active environment to blue initially
        ln -sf $DEPLOY_PATH/blue/current $DEPLOY_PATH/current
    "

    print_status "Initial deployment structure created"
}

# Setup monitoring
setup_monitoring() {
    print_header "Setting up Monitoring"

    # Copy monitoring scripts to server
    scp -o StrictHostKeyChecking=no blue-green-monitoring.sh $DEPLOY_USER@$DEPLOY_HOST:/tmp/

    ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        # Install monitoring script
        cp /tmp/blue-green-monitoring.sh $DEPLOY_PATH/
        chmod +x $DEPLOY_PATH/blue-green-monitoring.sh

        # Create cron job for monitoring (optional)
        # This would start monitoring on server boot
        cat > /tmp/blue-green-monitoring.cron << 'EOF'
@reboot root cd $DEPLOY_PATH && ./blue-green-monitoring.sh start
EOF
    "

    print_status "Monitoring setup completed"
}

# Create deployment scripts
create_deployment_scripts() {
    print_header "Creating Deployment Scripts"

    # Copy all deployment scripts to server
    scp -o StrictHostKeyChecking=no blue-green-deployment.sh $DEPLOY_USER@$DEPLOY_HOST:/tmp/
    scp -o StrictHostKeyChecking=no database-migration-handler.sh $DEPLOY_USER@$DEPLOY_HOST:/tmp/
    scp -o StrictHostKeyChecking=no smoke-tests.sh $DEPLOY_USER@$DEPLOY_HOST:/tmp/
    scp -o StrictHostKeyChecking=no rollback.sh $DEPLOY_USER@$DEPLOY_HOST:/tmp/

    ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        # Install deployment scripts
        cp /tmp/blue-green-deployment.sh $DEPLOY_PATH/
        cp /tmp/database-migration-handler.sh $DEPLOY_PATH/
        cp /tmp/smoke-tests.sh $DEPLOY_PATH/
        cp /tmp/rollback.sh $DEPLOY_PATH/

        # Make scripts executable
        chmod +x $DEPLOY_PATH/{blue-green-deployment,database-migration-handler,smoke-tests,rollback}.sh

        # Update script paths in deployment script
        sed -i 's|SCRIPT_DIR=.*|SCRIPT_DIR=\"$DEPLOY_PATH\"|g' $DEPLOY_PATH/blue-green-deployment.sh
    "

    print_status "Deployment scripts installed"
}

# Final verification
final_verification() {
    print_header "Final Verification"

    ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        echo '=== Directory Structure ==='
        ls -la $DEPLOY_PATH/

        echo ''
        echo '=== Nginx Configuration ==='
        nginx -t && echo 'Nginx configuration: OK' || echo 'Nginx configuration: FAILED'

        echo ''
        echo '=== Environment File ==='
        if [ -f $DEPLOY_PATH/.env ]; then
            echo 'Environment file: EXISTS'
            grep -c '^[^#]' $DEPLOY_PATH/.env | xargs echo 'Non-comment lines:'
        else
            echo 'Environment file: MISSING'
        fi

        echo ''
        echo '=== Deployment Scripts ==='
        for script in blue-green-deployment.sh database-migration-handler.sh smoke-tests.sh rollback.sh; do
            if [ -x $DEPLOY_PATH/\$script ]; then
                echo \"\$script: EXECUTABLE\"
            else
                echo \"\$script: NOT EXECUTABLE OR MISSING\"
            fi
        done
    "

    print_status "Setup verification completed"
}

# Print usage instructions
print_usage() {
    print_header "Blue-Green Deployment Setup Complete"

    echo ""
    echo "Next steps:"
    echo "1. Update $DEPLOY_PATH/.env with your production values"
    echo "2. Run initial deployment: ./blue-green-deployment.sh"
    echo "3. Start monitoring: ./blue-green-monitoring.sh start &"
    echo "4. Test deployment: ./blue-green-deployment.sh status"
    echo ""
    echo "Available commands:"
    echo "  ./blue-green-deployment.sh        # Deploy to next environment"
    echo "  ./blue-green-deployment.sh status # Check deployment status"
    echo "  ./rollback.sh status             # Check rollback status"
    echo "  ./blue-green-monitoring.sh check # Manual health check"
    echo ""
    echo "For detailed documentation, see: BLUE_GREEN_DEPLOYMENT_GUIDE.md"
}

# Main setup function
main() {
    print_header "SSPL Blue-Green Deployment Setup"
    echo "This will configure blue-green deployment infrastructure on $DEPLOY_HOST"
    echo ""

    # Confirm setup
    read -p "Continue with setup? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Setup cancelled"
        exit 0
    fi

    # Run setup steps
    check_prerequisites
    setup_directories
    setup_nginx
    setup_pm2
    setup_environment
    setup_log_rotation
    setup_initial_deployment
    setup_monitoring
    create_deployment_scripts
    final_verification
    print_usage

    print_status "Blue-Green deployment setup completed successfully!"
}

# Run main function
main "$@"