# Setup Guide

## Quick Start with GitHub Codespaces

### Option 1: GitHub Codespaces (Easiest)

1. **Open in Codespaces**
   - Go to https://github.com/perumalcsbe/paypal-invoicing-mcp
   - Click "Code" → "Codespaces" → "Create codespace on main"
   - Wait for the environment to set up (~2 minutes)

2. **Set Environment Variables**
   
   **Method A: Repository Secrets (Recommended)**
   - Go to repository Settings → "Secrets and variables" → "Codespaces"
   - Add these secrets:
     - `PAYPAL_CLIENT_ID` = your_client_id
     - `PAYPAL_CLIENT_SECRET` = your_client_secret
     - `PAYPAL_ENVIRONMENT` = sandbox
   
   **Method B: Create .env file**
   ```bash
   cat > .env << EOF
   PAYPAL_CLIENT_ID=your_client_id_here
   PAYPAL_CLIENT_SECRET=your_client_secret_here
   PAYPAL_ENVIRONMENT=sandbox
   EOF
   ```

3. **Run the Server**
   ```bash
   npm run dev
   ```

4. **Access the Server**
   - Port 3333 will be automatically forwarded
   - Click the notification or go to the "Ports" tab
   - Your MCP server is live!

### Option 2: Local Development

1. **Clone and Install**
   ```bash
   git clone https://github.com/perumalcsbe/paypal-invoicing-mcp.git
   cd paypal-invoicing-mcp
   npm install
   ```

2. **Create Environment File**
   
   Create a `.env` file in the project root:
   
   ```env
   # PayPal API Credentials
   PAYPAL_CLIENT_ID=your_client_id_here
   PAYPAL_CLIENT_SECRET=your_client_secret_here
   PAYPAL_ENVIRONMENT=sandbox
   
   # Server Configuration
   PORT=3333
   MCP_PATH=/mcp
   ```

3. **Get PayPal API Credentials**
   
   - Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
   - Log in with your PayPal account
   - Navigate to "Apps & Credentials"
   - Create a new app or use an existing one
   - Copy the Client ID and Secret
   - Paste them into your `.env` file

4. **Build and Run**
   
   ```bash
   # Development mode (with hot reload)
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

5. **Test the Server**
   
   ```bash
   ./test-mcp.sh
   ```
   
   You should see:
   ```
   ✅ Server initialized successfully
   ✅ All tests passed!
   ```

## Verifying the Setup

### Check Server is Running

In your Codespace or local terminal:

```bash
# Health check
curl http://localhost:3333/health

# MCP initialization
curl http://localhost:3333/mcp \
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

Expected response:
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

### Testing in Codespaces

If you're using GitHub Codespaces:
1. The port will be automatically forwarded
2. You'll see a notification with the forwarded URL
3. You can also find it in the "Ports" tab (View → Ports)
4. The URL will be something like: `https://xxx-3333.app.github.dev`

## Common Issues

### Issue: "PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET missing"

**Solution**: 
- In Codespaces: Set repository secrets or create a `.env` file
- Locally: Make sure your `.env` file exists and contains valid credentials

### Issue: "Must use import to load ES Module"

**Solution**: This project uses ES modules. Use `npm run dev` (which uses `tsx`) instead of older tools like `ts-node`.

### Issue: Port already in use (Local only)

**Solution**: Change the `PORT` in your `.env` file or stop the process using port 3333:

```bash
# Find process using port 3333
lsof -i :3333

# Kill the process
kill -9 <PID>
```

### Issue: Codespace not starting

**Solution**:
1. Check your GitHub account has Codespaces enabled
2. Wait for the initial setup to complete (can take 2-3 minutes)
3. Check the "Terminal" tab for error messages
4. Try rebuilding the container: Command Palette → "Codespaces: Rebuild Container"

## Next Steps

Once the server is running:

1. **Connect to Claude Desktop** or another MCP-compatible client
2. **Test the invoice tools**:
   - `create_invoice` - Create a draft invoice
   - `send_invoice` - Send an invoice to a recipient
   - `get_invoice` - Retrieve invoice details
   - `list_invoices` - List all invoices
3. **Extend the server** with additional PayPal features (orders, payments, etc.)

## Development Workflow

### In Codespaces

```bash
# Make changes to TypeScript files in src/
# Server auto-reloads on file changes (npm run dev is already running)

# To restart manually:
npm run dev
```

### Local Development

```bash
# Make changes to TypeScript files in src/
npm run dev  # Auto-reloads on file changes

# Production build
npm run build
npm start
```

## Testing with Real PayPal API

1. Set `PAYPAL_ENVIRONMENT=sandbox` in `.env` or Codespaces secrets
2. Use sandbox credentials from [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
3. Test with sandbox accounts (create buyer/seller test accounts in the dashboard)
4. Once verified, switch to production credentials for live use

## Connecting to Claude Desktop

Add this to your Claude Desktop MCP settings:

```json
{
  "mcpServers": {
    "paypal-invoicing": {
      "url": "https://YOUR-CODESPACE-URL:3333/mcp"
    }
  }
}
```

Replace `YOUR-CODESPACE-URL` with your actual Codespace forwarded URL.

