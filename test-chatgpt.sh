#!/bin/bash

# Test script for ChatGPT Server
# This script tests the ChatGPT API endpoints

BASE_URL="http://localhost:3334"

echo "Testing PayPal ChatGPT Server..."
echo "================================"
echo ""

# Test 1: Health Check
echo "1. Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s $BASE_URL/health)

echo "$HEALTH_RESPONSE" | jq .
echo ""

# Check if health check was successful
if echo "$HEALTH_RESPONSE" | jq -e '.status == "healthy"' > /dev/null; then
  echo "✅ Server is healthy"
else
  echo "❌ Server health check failed"
  exit 1
fi

# Test 2: List available actions
echo ""
echo "2. Testing /actions endpoint..."
ACTIONS_RESPONSE=$(curl -s $BASE_URL/actions)

echo "$ACTIONS_RESPONSE" | jq .
echo ""

# Check if actions are available
if echo "$ACTIONS_RESPONSE" | jq -e '.actions | length > 0' > /dev/null; then
  echo "✅ Actions endpoint working"
else
  echo "❌ Actions endpoint failed"
  exit 1
fi

echo ""
echo "================================"
echo "✅ All tests passed!"
echo ""
echo "Available tools:"
echo "$ACTIONS_RESPONSE" | jq -r '.actions[].name'
echo ""
echo "Server is running at: $BASE_URL"
echo ""
echo "Try creating an invoice:"
echo "  curl -X POST $BASE_URL/actions/create_invoice \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"recipient_email\":\"test@example.com\",\"currency\":\"USD\",\"items\":[{\"name\":\"Test\",\"quantity\":1,\"unit_amount\":100}]}'"
echo ""

