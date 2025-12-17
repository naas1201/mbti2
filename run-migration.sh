#!/bin/bash

# Database Migration Runner for MBTI Test v2.0
# This script helps apply the comprehensive database migration

set -e

echo "🚀 MBTI Database Migration Runner"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DATABASE_NAME=""
MIGRATION_FILE="migrate_database.sql"
TURSO_CLI="turso"

# Check if turso CLI is installed
check_turso() {
    if ! command -v $TURSO_CLI &> /dev/null; then
        echo -e "${RED}❌ Turso CLI not found${NC}"
        echo -e "${YELLOW}Install Turso CLI:${NC}"
        echo "  macOS: brew install turso"
        echo "  Linux: curl -sSfL https://get.turso.io | sh"
        echo "  Windows: winget install tursodb.turso"
        exit 1
    fi
    echo -e "${GREEN}✅ Turso CLI found${NC}"
}

# List available databases
list_databases() {
    echo -e "\n${BLUE}Available databases:${NC}"
    $TURSO_CLI db list
}

# Check if database exists
check_database() {
    if ! $TURSO_CLI db show "$1" &> /dev/null; then
        echo -e "${RED}❌ Database '$1' not found${NC}"
        return 1
    fi
    echo -e "${GREEN}✅ Database '$1' found${NC}"
    return 0
}

# Backup database before migration
backup_database() {
    echo -e "\n${BLUE}Creating backup of '$1'...${NC}"
    BACKUP_ID=$($TURSO_CLI db backup create "$1" --json | jq -r '.id' 2>/dev/null || echo "unknown")
    if [ -n "$BACKUP_ID" ] && [ "$BACKUP_ID" != "unknown" ]; then
        echo -e "${GREEN}✅ Backup created: $BACKUP_ID${NC}"
    else
        echo -e "${YELLOW}⚠️ Could not create backup (continuing anyway)${NC}"
    fi
}

# Run migration
run_migration() {
    echo -e "\n${BLUE}Running migration from '$2'...${NC}"
    
    # Check if migration file exists
    if [ ! -f "$2" ]; then
        echo -e "${RED}❌ Migration file '$2' not found${NC}"
        exit 1
    fi
    
    # Count lines in migration file
    LINE_COUNT=$(wc -l < "$2")
    echo "Migration file has $LINE_COUNT lines"
    
    # Run migration
    echo -e "${YELLOW}Applying migration (this may take a moment)...${NC}"
    
    if $TURSO_CLI db shell "$1" < "$2"; then
        echo -e "\n${GREEN}✅ Migration completed successfully!${NC}"
    else
        echo -e "\n${RED}❌ Migration failed${NC}"
        exit 1
    fi
}

# Verify migration
verify_migration() {
    echo -e "\n${BLUE}Verifying migration...${NC}"
    
    # Run verification queries
    echo "Checking tables..."
    $TURSO_CLI db shell "$1" "
        SELECT 'users' as table_name, COUNT(*) as record_count FROM users
        UNION ALL
        SELECT 'test_results', COUNT(*) FROM test_results
        UNION ALL
        SELECT 'tests', COUNT(*) FROM tests
        UNION ALL
        SELECT 'questions', COUNT(*) FROM questions WHERE test_id = 'mbti-v2'
        UNION ALL
        SELECT 'answer_options', COUNT(*) FROM answer_options 
        WHERE question_id IN (SELECT id FROM questions WHERE test_id = 'mbti-v2')
        UNION ALL
        SELECT 'user_answers', COUNT(*) FROM user_answers;
    " 2>/dev/null || echo -e "${YELLOW}⚠️ Could not run verification queries${NC}"
    
    # Check for specific v2.0 features
    echo -e "\n${BLUE}Checking v2.0 features...${NC}"
    $TURSO_CLI db shell "$1" "
        SELECT '✅ Tests table' as check, COUNT(*) as count FROM tests WHERE id = 'mbti-v2'
        UNION ALL
        SELECT '✅ Questions count', COUNT(*) FROM questions WHERE test_id = 'mbti-v2'
        UNION ALL
        SELECT '✅ Answer options', COUNT(*) FROM answer_options 
        WHERE question_id IN (SELECT id FROM questions WHERE test_id = 'mbti-v2')
        UNION ALL
        SELECT '✅ Test results columns', COUNT(*) FROM pragma_table_info('test_results') 
        WHERE name IN ('answer_variance', 'is_turbulent');
    " 2>/dev/null || echo -e "${YELLOW}⚠️ Could not check v2.0 features${NC}"
}

# Show usage
show_usage() {
    echo -e "${BLUE}Usage:${NC}"
    echo "  $0 <database-name> [migration-file]"
    echo ""
    echo "${BLUE}Examples:${NC}"
    echo "  $0 mbti-database                    # Run default migration"
    echo "  $0 mbti-database migrate_database.sql # Run specific migration"
    echo "  $0 --list                          # List databases"
    echo ""
    echo "${BLUE}Options:${NC}"
    echo "  <database-name>    Name of the Turso database"
    echo "  [migration-file]   Path to migration SQL file (default: migrate_database.sql)"
    echo "  --list, -l         List available databases"
    echo "  --help, -h         Show this help message"
}

# Main execution
main() {
    # Check for help flag
    if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
        show_usage
        exit 0
    fi
    
    # Check for list flag
    if [ "$1" = "--list" ] || [ "$1" = "-l" ]; then
        check_turso
        list_databases
        exit 0
    fi
    
    # Check arguments
    if [ $# -lt 1 ]; then
        echo -e "${RED}❌ Error: Database name required${NC}"
        show_usage
        exit 1
    fi
    
    DATABASE_NAME="$1"
    
    # Use custom migration file if provided
    if [ $# -ge 2 ]; then
        MIGRATION_FILE="$2"
    fi
    
    echo -e "${BLUE}Starting migration for database:${NC} $DATABASE_NAME"
    echo -e "${BLUE}Using migration file:${NC} $MIGRATION_FILE"
    
    # Check prerequisites
    check_turso
    
    # Check database exists
    if ! check_database "$DATABASE_NAME"; then
        list_databases
        exit 1
    fi
    
    # Show database info
    echo -e "\n${BLUE}Database information:${NC}"
    $TURSO_CLI db show "$DATABASE_NAME"
    
    # Confirm migration
    echo -e "\n${YELLOW}⚠️  WARNING: This will modify the database structure${NC}"
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Migration cancelled${NC}"
        exit 0
    fi
    
    # Create backup
    backup_database "$DATABASE_NAME"
    
    # Run migration
    run_migration "$DATABASE_NAME" "$MIGRATION_FILE"
    
    # Verify migration
    verify_migration "$DATABASE_NAME"
    
    # Final message
    echo -e "\n${GREEN}=========================================${NC}"
    echo -e "${GREEN}✅ Migration completed successfully!${NC}"
    echo -e "${GREEN}=========================================${NC}"
    
    echo -e "\n${BLUE}Next steps:${NC}"
    echo "1. Test the application: ./test-mbti.sh"
    echo "2. Deploy to production: npm run deploy"
    echo "3. Monitor logs: npx wrangler tail"
    
    echo -e "\n${BLUE}Application URLs:${NC}"
    echo "Local: http://localhost:8787"
    echo "Production: https://mbti-app.qmpro.workers.dev"
}

# Run main function with all arguments
main "$@"

exit 0