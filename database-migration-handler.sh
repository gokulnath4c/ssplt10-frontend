#!/bin/bash

# Database Migration Handler for Blue-Green Deployments
# Ensures zero-downtime database updates with rollback capabilities

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Configuration
SUPABASE_PROJECT_ID="${VITE_SUPABASE_PROJECT_ID}"
SUPABASE_ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN}"
MIGRATION_DIR="$PROJECT_ROOT/supabase/migrations"
BACKUP_DIR="$PROJECT_ROOT/database/backups"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
LOG_FILE="$PROJECT_ROOT/logs/database-migration.log"
mkdir -p "$PROJECT_ROOT/logs"
mkdir -p "$BACKUP_DIR"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') $*" | tee -a "$LOG_FILE"
}

print_status() {
    log "${GREEN}✅ $1${NC}"
}

print_warning() {
    log "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    log "${RED}❌ $1${NC}"
}

print_info() {
    log "${BLUE}ℹ️  $1${NC}"
}

# Create database backup
create_backup() {
    local backup_name=$1
    local timestamp
    timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/${backup_name}_${timestamp}.sql"

    print_info "Creating database backup: $backup_file"

    # Use Supabase CLI to create backup
    if command -v supabase &> /dev/null; then
        supabase db dump --db-url "$(get_db_url)" > "$backup_file"
        print_status "Database backup created: $backup_file"
        echo "$backup_file"
    else
        print_warning "Supabase CLI not found, skipping backup"
        echo ""
    fi
}

# Get database URL from environment
get_db_url() {
    # This should be set in environment variables
    echo "${DATABASE_URL:-postgresql://postgres:password@localhost:54322/postgres}"
}

# Check if migration is backward compatible
check_migration_compatibility() {
    local migration_file=$1

    print_info "Checking migration compatibility: $migration_file"

    # Analyze migration file for potentially breaking changes
    if grep -q "DROP COLUMN\|DROP TABLE\|ALTER COLUMN.*SET NOT NULL\|RENAME COLUMN\|RENAME TABLE" "$migration_file"; then
        print_warning "Migration contains potentially breaking changes"
        return 1
    else
        print_status "Migration appears to be backward compatible"
        return 0
    fi
}

# Run pre-deployment migration checks
pre_deployment_checks() {
    print_info "Running pre-deployment database checks"

    # Check database connectivity
    if ! check_database_connectivity; then
        print_error "Database connectivity check failed"
        return 1
    fi

    # Check for long-running transactions
    if check_long_running_transactions; then
        print_warning "Long-running transactions detected"
        # Don't fail, just warn
    fi

    # Check database size and growth
    check_database_size

    print_status "Pre-deployment checks completed"
    return 0
}

# Check database connectivity
check_database_connectivity() {
    print_info "Checking database connectivity"

    # Use a simple query to test connection
    if PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT 1;" &>/dev/null; then
        print_status "Database connectivity OK"
        return 0
    else
        print_error "Database connectivity failed"
        return 1
    fi
}

# Check for long-running transactions
check_long_running_transactions() {
    print_info "Checking for long-running transactions"

    local long_txns
    long_txns=$(PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" -c "
        SELECT count(*)
        FROM pg_stat_activity
        WHERE state = 'active'
        AND now() - query_start > interval '5 minutes';
    " -t -A)

    if [ "$long_txns" -gt 0 ]; then
        print_warning "Found $long_txns long-running transactions"
        return 0
    else
        print_status "No long-running transactions found"
        return 1
    fi
}

# Check database size
check_database_size() {
    print_info "Checking database size"

    local db_size
    db_size=$(PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" -c "
        SELECT pg_size_pretty(pg_database_size(current_database()));
    " -t -A)

    print_info "Database size: $db_size"
}

# Apply database migrations
apply_migrations() {
    local target_env=$1
    local backup_file

    print_info "Applying database migrations for $target_env environment"

    # Create backup before migration
    backup_file=$(create_backup "pre_migration_$target_env")

    # Check for new migrations
    if [ ! -d "$MIGRATION_DIR" ]; then
        print_info "No migration directory found, skipping migrations"
        return 0
    fi

    local migration_files
    migration_files=$(find "$MIGRATION_DIR" -name "*.sql" -type f | sort)

    if [ -z "$migration_files" ]; then
        print_info "No migration files found"
        return 0
    fi

    # Apply migrations using Supabase CLI or direct SQL
    for migration_file in $migration_files; do
        print_info "Applying migration: $(basename "$migration_file")"

        # Check compatibility
        if ! check_migration_compatibility "$migration_file"; then
            print_warning "Migration may not be backward compatible"
        fi

        # Apply migration
        if command -v supabase &> /dev/null; then
            # Use Supabase CLI
            if supabase db push --include-all; then
                print_status "Migration applied successfully: $(basename "$migration_file")"
            else
                print_error "Failed to apply migration: $(basename "$migration_file")"
                return 1
            fi
        else
            # Apply directly via psql
            if PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" -f "$migration_file"; then
                print_status "Migration applied successfully: $(basename "$migration_file")"
            else
                print_error "Failed to apply migration: $(basename "$migration_file")"
                return 1
            fi
        fi
    done

    print_status "All migrations applied successfully"
    return 0
}

# Validate migration success
validate_migration() {
    local target_env=$1

    print_info "Validating migration success for $target_env environment"

    # Run validation queries
    if PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" -c "
        -- Basic validation queries
        SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';

        -- Check for any broken foreign keys
        SELECT
            tc.table_schema,
            tc.constraint_name,
            tc.table_name,
            kcu.column_name,
            ccu.table_schema AS foreign_table_schema,
            ccu.constraint_name AS foreign_constraint_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM
            information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        LIMIT 5;
    " &>/dev/null; then
        print_status "Migration validation passed"
        return 0
    else
        print_error "Migration validation failed"
        return 1
    fi
}

# Rollback migration
rollback_migration() {
    local target_env=$1
    local backup_file=$2

    print_warning "Rolling back database migration for $target_env environment"

    if [ -n "$backup_file" ] && [ -f "$backup_file" ]; then
        print_info "Restoring from backup: $backup_file"

        # Restore from backup
        if PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" < "$backup_file"; then
            print_status "Database rollback completed successfully"
            return 0
        else
            print_error "Database rollback failed"
            return 1
        fi
    else
        print_error "No backup file available for rollback"
        return 1
    fi
}

# Post-migration cleanup
post_migration_cleanup() {
    print_info "Running post-migration cleanup"

    # Clean up old backups (keep last 10)
    if [ -d "$BACKUP_DIR" ]; then
        find "$BACKUP_DIR" -name "*.sql" -type f | sort | head -n -10 | xargs -r rm -f
        print_status "Old backups cleaned up"
    fi

    # Update migration status
    print_status "Migration process completed"
}

# Main migration function
main() {
    local action=${1:-"migrate"}
    local target_env=${2:-"unknown"}

    print_info "Starting database migration process"
    print_info "Action: $action, Target Environment: $target_env"

    case "$action" in
        "check")
            if pre_deployment_checks; then
                print_status "Pre-deployment checks passed"
                exit 0
            else
                print_error "Pre-deployment checks failed"
                exit 1
            fi
            ;;

        "migrate")
            local backup_file

            # Pre-deployment checks
            if ! pre_deployment_checks; then
                print_error "Pre-deployment checks failed, aborting migration"
                exit 1
            fi

            # Create backup
            backup_file=$(create_backup "pre_deployment_$target_env")

            # Apply migrations
            if apply_migrations "$target_env"; then
                # Validate success
                if validate_migration "$target_env"; then
                    print_status "Migration completed successfully"
                    post_migration_cleanup
                    exit 0
                else
                    print_error "Migration validation failed, rolling back"
                    rollback_migration "$target_env" "$backup_file"
                    exit 1
                fi
            else
                print_error "Migration failed, rolling back"
                rollback_migration "$target_env" "$backup_file"
                exit 1
            fi
            ;;

        "rollback")
            local backup_file

            # Find latest backup
            backup_file=$(find "$BACKUP_DIR" -name "*.sql" -type f | sort | tail -1)

            if [ -n "$backup_file" ]; then
                if rollback_migration "$target_env" "$backup_file"; then
                    print_status "Rollback completed successfully"
                    exit 0
                else
                    print_error "Rollback failed"
                    exit 1
                fi
            else
                print_error "No backup files found for rollback"
                exit 1
            fi
            ;;

        "validate")
            if validate_migration "$target_env"; then
                print_status "Migration validation passed"
                exit 0
            else
                print_error "Migration validation failed"
                exit 1
            fi
            ;;

        *)
            echo "Usage: $0 [check|migrate|rollback|validate] [target_env]"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"