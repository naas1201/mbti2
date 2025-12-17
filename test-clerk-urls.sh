#!/bin/bash

# Clerk URL Test Script
# Tests all Clerk authentication URLs for the MBTI application

echo "🔍 Testing Clerk Authentication URLs"
echo "======================================"

# Base domain
CLERK_DOMAIN="renewed-serval-10.accounts.dev"

# List of URLs to test
declare -A URLS=(
    ["Sign In"]="https://$CLERK_DOMAIN/sign-in"
    ["Sign Up"]="https://$CLERK_DOMAIN/sign-up"
    ["Unauthorized Sign In"]="https://$CLERK_DOMAIN/unauthorized-sign-in"
    ["User Profile"]="https://$CLERK_DOMAIN/user"
    ["Account Portal"]="https://$CLERK_DOMAIN/"
)

# Test each URL
echo ""
echo "Testing Clerk URLs:"
echo "-------------------"

for name in "${!URLS[@]}"; do
    url="${URLS[$name]}"
    echo -n "• $name ($url): "
    
    # Use curl with timeout and follow redirects
    if curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" | grep -q "200\|302\|307"; then
        echo "✅ SUCCESS"
    else
        echo "❌ FAILED"
    fi
done

# Test with redirect parameter
echo ""
echo "Testing with redirect parameter:"
echo "--------------------------------"

TEST_URL="https://type.va-n.com/test?clerk_callback=success"
ENCODED_URL=$(echo "$TEST_URL" | sed 's/:/%3A/g; s/\//%2F/g; s/?/%3F/g; s/&/%26/g; s/=/%3D/g')

SIGN_IN_WITH_REDIRECT="https://$CLERK_DOMAIN/sign-in?redirect_url=$ENCODED_URL"
echo -n "• Sign In with redirect ($TEST_URL): "

if curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$SIGN_IN_WITH_REDIRECT" | grep -q "200\|302\|307"; then
    echo "✅ SUCCESS"
else
    echo "❌ FAILED"
fi

# Test application URLs
echo ""
echo "Testing Application URLs:"
echo "-------------------------"

declare -A APP_URLS=(
    ["MBTI Test App"]="https://type.va-n.com"
    ["Test Page"]="https://type.va-n.com/test"
    ["API Health"]="https://type.va-n.com/api/health"
    ["Worker URL"]="https://mbti-app.qmpro.workers.dev"
)

for name in "${!APP_URLS[@]}"; do
    url="${APP_URLS[$name]}"
    echo -n "• $name ($url): "
    
    if curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" | grep -q "200\|302\|307"; then
        echo "✅ SUCCESS"
    else
        echo "❌ FAILED"
    fi
done

echo ""
echo "======================================"
echo "📋 Summary:"
echo ""
echo "Clerk Instance: $CLERK_DOMAIN"
echo "Publishable Key: pk_test_cmVuZXdlZC1zZXJ2YWwtMTAuY2xlcmsuYWNjb3VudHMuZGV2JA"
echo ""
echo "Important Notes:"
echo "1. Clerk URLs should return 200 (OK) or 302/307 (Redirect)"
echo "2. Application URLs should return 200 (OK)"
echo "3. If any Clerk URL fails, check:"
echo "   - Clerk instance exists at https://dashboard.clerk.com"
echo "   - Custom domain type.va-n.com is added to allowed redirect URLs"
echo "   - No ad blockers are interfering"
echo ""
echo "To fix 404 errors:"
echo "1. Go to https://dashboard.clerk.com/apps/renewed-serval-10"
echo "2. Add 'https://type.va-n.com/*' to Allowed Redirect URLs"
echo "3. Wait 1-2 minutes for changes to propagate"