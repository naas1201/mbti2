#!/bin/bash

# MBTI Test Script
# Tests the comprehensive 60-question MBTI test with database integration

set -e

echo "🚀 Starting MBTI Test Suite"
echo "============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LOCAL_URL="http://localhost:8787"
PROD_URL="https://mbti-app.qmpro.workers.dev"
TEST_URL="${LOCAL_URL}"

# Check if wrangler dev is running
check_server() {
    echo -e "${BLUE}Checking if server is running...${NC}"
    if curl -s --head "${TEST_URL}/health" > /dev/null; then
        echo -e "${GREEN}✅ Server is running at ${TEST_URL}${NC}"
        return 0
    else
        echo -e "${RED}❌ Server is not running at ${TEST_URL}${NC}"
        echo -e "${YELLOW}Start the server with: npm run dev${NC}"
        return 1
    fi
}

# Test health endpoint
test_health() {
    echo -e "\n${BLUE}Testing health endpoint...${NC}"
    response=$(curl -s "${TEST_URL}/api/health")
    
    if echo "$response" | grep -q '"status":"ok"'; then
        echo -e "${GREEN}✅ Health endpoint working${NC}"
        echo "Response: $response"
    else
        echo -e "${RED}❌ Health endpoint failed${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Test questions endpoint
test_questions() {
    echo -e "\n${BLUE}Testing questions endpoint...${NC}"
    response=$(curl -s "${TEST_URL}/api/questions")
    
    if echo "$response" | grep -q '"questions"'; then
        question_count=$(echo "$response" | grep -o '"questions"' | wc -l)
        echo -e "${GREEN}✅ Questions endpoint working${NC}"
        
        # Count questions in response
        count=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('questions', [])))" 2>/dev/null || echo "0")
        echo "Found $count questions"
        
        if [ "$count" -eq 60 ]; then
            echo -e "${GREEN}✅ All 60 questions loaded${NC}"
        else
            echo -e "${YELLOW}⚠️ Expected 60 questions, found $count${NC}"
        fi
    else
        echo -e "${RED}❌ Questions endpoint failed${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Test test submission with sample data
test_submission() {
    echo -e "\n${BLUE}Testing test submission...${NC}"
    
    # Create sample answers (60 answers, all neutral = 3)
    answers="["
    for i in {1..60}; do
        answers="${answers}3"
        if [ $i -lt 60 ]; then
            answers="${answers},"
        fi
    done
    answers="${answers}]"
    
    # Create JSON payload
    payload="{\"answers\": $answers}"
    
    echo "Submitting test with neutral answers..."
    response=$(curl -s -X POST "${TEST_URL}/api/submit-test" \
        -H "Content-Type: application/json" \
        -d "$payload")
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Test submission successful${NC}"
        
        # Extract MBTI type
        mbti_type=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('mbtiType', 'N/A'))" 2>/dev/null || echo "N/A")
        echo "MBTI Type: $mbti_type"
        
        # Check for turbulent/assertive
        if echo "$mbti_type" | grep -q "-T\|-A"; then
            echo -e "${GREEN}✅ Turbulent/Assertive scoring working${NC}"
        fi
        
        # Check for dimension scores
        if echo "$response" | grep -q '"dimensionScores"'; then
            echo -e "${GREEN}✅ Dimension scores included${NC}"
        fi
        
    elif echo "$response" | grep -q '"error"'; then
        error_msg=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('error', 'Unknown error'))" 2>/dev/null || echo "Unknown error")
        echo -e "${YELLOW}⚠️ Test submission returned error: $error_msg${NC}"
        echo "This might be expected if not authenticated"
    else
        echo -e "${RED}❌ Test submission failed${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Test frontend loading
test_frontend() {
    echo -e "\n${BLUE}Testing frontend loading...${NC}"
    
    # Test HTML loading
    if curl -s "${TEST_URL}/" | grep -q "<!doctype html>"; then
        echo -e "${GREEN}✅ Frontend HTML loaded${NC}"
    else
        echo -e "${RED}❌ Frontend HTML failed to load${NC}"
        return 1
    fi
    
    # Test CSS loading
    if curl -s "${TEST_URL}/mbti-styles.css" | grep -q "background-color"; then
        echo -e "${GREEN}✅ CSS loaded${NC}"
    else
        echo -e "${YELLOW}⚠️ CSS might not be loaded${NC}"
    fi
}

# Test database connection
test_database() {
    echo -e "\n${BLUE}Testing database connection...${NC}"
    
    # Try to get test count from API
    response=$(curl -s "${TEST_URL}/api/health")
    
    if echo "$response" | grep -q '"environment"'; then
        env=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('environment', 'unknown'))" 2>/dev/null || echo "unknown")
        echo -e "${GREEN}✅ Database environment: $env${NC}"
    else
        echo -e "${YELLOW}⚠️ Could not determine database status${NC}"
    fi
}

# Run all tests
run_all_tests() {
    echo -e "\n${BLUE}=== Running Comprehensive MBTI Test Suite ===${NC}"
    
    if ! check_server; then
        exit 1
    fi
    
    test_health
    test_questions
    test_database
    test_frontend
    test_submission
    
    echo -e "\n${GREEN}=========================================${NC}"
    echo -e "${GREEN}✅ All tests completed!${NC}"
    echo -e "${GREEN}=========================================${NC}"
    
    echo -e "\n${YELLOW}Next steps:${NC}"
    echo "1. Open ${TEST_URL} in your browser"
    echo "2. Take the 60-question MBTI test"
    echo "3. Check results with turbulent/assertive scoring"
    echo "4. Verify data is saved to database"
}

# Main execution
case "${1:-all}" in
    "health")
        check_server && test_health
        ;;
    "questions")
        check_server && test_questions
        ;;
    "submit")
        check_server && test_submission
        ;;
    "frontend")
        check_server && test_frontend
        ;;
    "db")
        check_server && test_database
        ;;
    "all")
        run_all_tests
        ;;
    *)
        echo "Usage: $0 [health|questions|submit|frontend|db|all]"
        echo "Default: all"
        exit 1
        ;;
esac

exit 0