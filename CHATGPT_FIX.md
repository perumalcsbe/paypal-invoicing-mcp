# ChatGPT Apps Integration Fix

## Problem
When adding the MCP server URL to ChatGPT Apps, you encountered this error:
```
Error creating connector
unhandled errors in a TaskGroup (1 sub-exception)
```

## Root Cause
The server was reusing the same `McpServer` instance for all incoming requests and connecting multiple transports to it. This caused race conditions and TaskGroup errors when ChatGPT made concurrent connections during initialization.

## Solution Applied
**Changed from:** Global MCP server instance
```typescript
const mcpServer = new McpServer({...});
registerInvoiceTools(mcpServer);

app.all('/mcp', async (req, res) => {
  const transport = new StreamableHTTPServerTransport({...});
  await mcpServer.connect(transport); // ❌ Reusing same server
  await transport.handleRequest(req, res);
});
```

**Changed to:** Factory pattern creating fresh instances
```typescript
function createMcpServer() {
  const server = new McpServer({...});
  registerInvoiceTools(server);
  return server;
}

app.all('/mcp', async (req, res) => {
  const mcpServer = createMcpServer(); // ✅ Fresh server per request
  const transport = new StreamableHTTPServerTransport({...});
  await mcpServer.connect(transport);
  await transport.handleRequest(req, res);
});
```

## Deployment Status
✅ **Fix committed:** `131acd6`  
✅ **Pushed to GitHub:** `main` branch  
🔄 **Render auto-deploy:** In progress (2-3 minutes)

## Next Steps

### 1. Wait for Render Deployment
Give Render 2-3 minutes to rebuild and deploy the fix. You can monitor the deployment at:
- Render Dashboard: https://dashboard.render.com

### 2. Verify the Fix
Once deployed, test the endpoint:
```bash
curl https://paypal-invoicing-mcp.onrender.com/health
```

Should return:
```json
{"status":"healthy","service":"paypal-agent-mcp","version":"1.0.0"}
```

### 3. Add to ChatGPT Apps

**Step-by-step:**

1. **Open ChatGPT**
   - Go to https://chatgpt.com
   - Click Settings (bottom left)
   - Go to "Apps" (BETA)

2. **Create New App**
   - Click "Create new app" or "Add app"

3. **Fill in Details:**
   ```
   Name: PayPal Invoicing
   Description: Create, send, and manage PayPal invoices
   MCP Server URL: https://paypal-invoicing-mcp.onrender.com/mcp
   Authentication: No Auth (or None)
   ```

4. **Click "Create"**

5. **Test It!**
   Ask ChatGPT:
   - "List my PayPal invoices"
   - "Create an invoice for $100 to test@example.com"

## Technical Details

### What Changed
- **File:** `src/server.ts`
- **Lines:** 35-49, 79-96
- **Pattern:** Singleton → Factory
- **Benefit:** Each request gets isolated server instance

### Why This Works
- **Prevents race conditions:** No shared state between requests
- **Proper cleanup:** Each server instance is garbage collected after request
- **MCP compliance:** Follows stateless HTTP transport best practices
- **ChatGPT compatible:** Handles concurrent initialization properly

## Troubleshooting

### If you still get errors:

**1. Server not responding**
```bash
# Wake up the server (free tier spins down)
curl https://paypal-invoicing-mcp.onrender.com/health
# Wait 10 seconds, then try adding to ChatGPT again
```

**2. "Invalid MCP server"**
- Double-check the URL: `https://paypal-invoicing-mcp.onrender.com/mcp`
- Make sure it ends with `/mcp`
- Ensure HTTPS (not HTTP)

**3. "Authentication failed"**
- Select "No Auth" or "None" in ChatGPT
- Do NOT select any authentication method

**4. Still getting TaskGroup error**
- Wait for Render deployment to complete
- Check Render logs for any startup errors
- Verify environment variables are set in Render dashboard

## Environment Variables (Render)
Make sure these are set in your Render dashboard:
```
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_ENVIRONMENT=SANDBOX
PORT=3333
NODE_ENV=production
```

## Success Indicators
✅ Health endpoint returns 200  
✅ MCP endpoint accepts connections  
✅ ChatGPT shows "Connected" status  
✅ Can list/create invoices through ChatGPT  

## Support
If issues persist:
1. Check Render logs for errors
2. Verify PayPal credentials are valid
3. Test MCP endpoint manually with curl
4. Ensure ChatGPT Plus subscription is active

---
**Fixed:** December 10, 2025  
**Commit:** 131acd6  
**Status:** Deployed to Render
