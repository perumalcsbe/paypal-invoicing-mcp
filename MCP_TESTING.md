# 🧪 Testing Your MCP Server

Your MCP server is running at: `https://sturdy-system-9jjg4g5r6h95g5-3333.app.github.dev`

## ✅ Quick Tests

### 1. Browser Test (GET)

Just open in your browser:
```
https://sturdy-system-9jjg4g5r6h95g5-3333.app.github.dev/mcp
```

You'll see server info and available tools! 🎉

### 2. Health Check

```bash
curl https://sturdy-system-9jjg4g5r6h95g5-3333.app.github.dev/health
```

Expected:
```json
{
  "status": "healthy",
  "service": "paypal-agent-mcp"
}
```

### 3. MCP Initialize (Proper Protocol)

```bash
curl https://sturdy-system-9jjg4g5r6h95g5-3333.app.github.dev/mcp \
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
  }'
```

Expected:
```json
{
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {
        "listChanged": true
      }
    },
    "serverInfo": {
      "name": "paypal-agent-mcp",
      "version": "1.0.0"
    }
  },
  "jsonrpc": "2.0",
  "id": 1
}
```

## 🔌 Connect to Claude Desktop

### 1. Get Your Codespace URL

Your MCP server URL:
```
https://sturdy-system-9jjg4g5r6h95g5-3333.app.github.dev/mcp
```

### 2. Configure Claude Desktop

Edit Claude Desktop config:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Add:
```json
{
  "mcpServers": {
    "paypal-invoicing": {
      "url": "https://sturdy-system-9jjg4g5r6h95g5-3333.app.github.dev/mcp"
    }
  }
}
```

### 3. Restart Claude Desktop

Close and reopen Claude Desktop. You should see:
- 🔧 4 new tools available
- PayPal invoicing capabilities

### 4. Test in Claude

Try these prompts:
- "List my PayPal invoices"
- "Create an invoice for $500 to john@example.com"
- "Show me invoice details for INV2-XXXX"

## 🤖 Connect to ChatGPT

For ChatGPT integration, use the ChatGPT server on port 3334:

```
https://sturdy-system-9jjg4g5r6h95g5-3334.app.github.dev
```

See [CHATGPT_SETUP.md](./CHATGPT_SETUP.md) for details.

## 🔍 Available Tools

Your MCP server provides 4 tools:

1. **create_invoice** - Create draft invoices
2. **send_invoice** - Send invoices to customers
3. **get_invoice** - Get invoice details
4. **list_invoices** - List all invoices

## 🐛 Troubleshooting

### "Connection refused"

**Check:**
- Is the server running? `npm run dev`
- Is port 3333 forwarded? Check Ports tab
- Is port visibility set to Public?

### "Server not initialized"

**Solution:**
- MCP requires an `initialize` call first
- Claude Desktop handles this automatically
- For manual testing, use the curl command above

### "PAYPAL_CLIENT_ID missing"

**Solution:**
- Set environment variables in `.env` or Codespaces secrets
- Restart the server after adding credentials

## 📊 Monitoring

### View Logs

In your Codespace terminal where the server is running:
```
[INFO] MCP server listening on port 3333/mcp
[INFO] Health check available at /health
```

### Test Script

Run the included test script:
```bash
./test-mcp.sh
```

## 🎯 Next Steps

1. ✅ Server is running
2. ✅ MCP endpoint working
3. ✅ Tools available
4. 🔜 Connect to Claude Desktop
5. 🔜 Test invoice creation
6. 🔜 Deploy to production

## 📚 Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [Claude Desktop](https://claude.ai/download)
- [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)

Your MCP server is ready! 🚀

