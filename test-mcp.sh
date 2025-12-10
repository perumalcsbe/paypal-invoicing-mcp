#!/bin/bash

# Test script for PayPal MCP Server
# This script tests the MCP server endpoints

BASE_URL="http://localhost:3333/mcp"
HEADERS='-H "Content-Type: application/json" -H "Accept: application/json, text/event-stream"'

echo "Testing PayPal MCP Server..."
echo "================================"
echo ""

# Test 1: Initialize
echo "1. Testing initialize..."
INIT_RESPONSE=$(curl -s $BASE_URL \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    }
  }')

echo "$INIT_RESPONSE" | jq .
echo ""

# Check if initialization was successful
if echo "$INIT_RESPONSE" | jq -e '.result.serverInfo.name == "paypal-agent-mcp"' > /dev/null; then
  echo "✅ Server initialized successfully"
else
  echo "❌ Server initialization failed"
  exit 1
fi

echo ""
echo "================================"
echo "✅ All tests passed!"
echo ""
echo "Available tools:"
echo "  - create_invoice: Create a draft PayPal invoice"
echo "  - send_invoice: Send a PayPal invoice by ID"
echo "  - get_invoice: Get full details of a PayPal invoice"
echo "  - list_invoices: List PayPal invoices"
echo ""
echo "Server is running at: $BASE_URL"

