# 🤖 ChatGPT App for PayPal Invoicing

Complete guide to build and deploy a ChatGPT app using the PayPal Agent Toolkit.

## 🎯 What You're Building

A ChatGPT app that can:
- ✅ Create PayPal invoices
- ✅ Send invoices to customers
- ✅ Retrieve invoice details
- ✅ List all invoices

## 🚀 Quick Start

### 1. Set Environment Variables

Add to your `.env` file:

```env
# PayPal Credentials
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret  
PAYPAL_ENVIRONMENT=SANDBOX

# OpenAI API Key (optional - for testing)
OPENAI_API_KEY=sk-proj-...

# Server Port
PORT=3334
```

### 2. Run the ChatGPT Server

```bash
# Development mode
npm run dev:chatgpt

# Production mode
npm run build
npm run start:chatgpt
```

The server will start on port **3334** (different from MCP server on 3333).

### 3. Test the Server

```bash
# Health check
curl http://localhost:3334/health

# List available actions
curl http://localhost:3334/actions
```

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Chat Endpoint (Full ChatGPT Integration)
```
POST /chat

Body:
{
  "messages": [
    {"role": "user", "content": "Create an invoice for $100 to john@example.com"}
  ],
  "openai_api_key": "sk-proj-..." // Optional
}
```

### Actions Endpoint (Simple Function Calls)
```
POST /actions/:action

Example: POST /actions/create_invoice
Body:
{
  "recipient_email": "customer@example.com",
  "currency": "USD",
  "items": [
    {
      "name": "Web Development",
      "quantity": 1,
      "unit_amount": 100
    }
  ]
}
```

### List Actions
```
GET /actions
```

## 🔧 Integration Options

### Option 1: ChatGPT Actions (Recommended)

Use your server with Custom GPTs:

1. **Create a GPT**:
   - Go to https://chat.openai.com/gpts/editor
   - Click "Create a GPT"
   - Name it "PayPal Invoice Assistant"

2. **Configure Actions**:
   - In Configure → Actions → Add Action
   - Set Schema: `https://your-server-url/actions`
   - Authentication: None (or API key if you add it)

3. **Test**:
   - Ask: "Create an invoice for $500 to customer@example.com"
   - The GPT will call your `/actions/create_invoice` endpoint

### Option 2: Direct API Integration

Use the `/chat` endpoint for full ChatGPT integration:

```typescript
import fetch from 'node-fetch';

const response = await fetch('http://localhost:3334/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      {
        role: 'user',
        content: 'Create an invoice for $250 to john@example.com for consulting services'
      }
    ],
    openai_api_key: 'sk-proj-...'
  })
});

const result = await response.json();
console.log(result.message);
```

### Option 3: GitHub Codespaces + ChatGPT Actions

1. Run the server in your Codespace:
   ```bash
   npm run dev:chatgpt
   ```

2. Get your forwarded URL (port 3334):
   - Go to Ports tab
   - Copy the URL for port 3334
   - Example: `https://sturdy-system-9jjg4g5r6h95g5-3334.github.dev`

3. Create a GPT with Actions:
   - Base URL: Your Codespace URL
   - Add actions for: `create_invoice`, `send_invoice`, `get_invoice`, `list_invoices`

## 📋 Available Tools

### 1. create_invoice

Create a draft PayPal invoice.

**Parameters:**
- `recipient_email` (string, required): Customer email
- `currency` (string, default: "USD"): Currency code
- `note` (string): Optional note
- `items` (array): Line items with name, quantity, unit_amount
- `amount_override` (number): Override total amount

**Example:**
```bash
curl -X POST http://localhost:3334/actions/create_invoice \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_email": "customer@example.com",
    "currency": "USD",
    "items": [
      {
        "name": "Consulting Services",
        "quantity": 5,
        "unit_amount": 100
      }
    ]
  }'
```

### 2. send_invoice

Send an invoice to the recipient.

**Parameters:**
- `invoice_id` (string, required): PayPal invoice ID

**Example:**
```bash
curl -X POST http://localhost:3334/actions/send_invoice \
  -H "Content-Type: application/json" \
  -d '{"invoice_id": "INV2-XXXX-XXXX-XXXX-XXXX"}'
```

### 3. get_invoice

Get full invoice details.

**Parameters:**
- `invoice_id` (string, required): PayPal invoice ID

**Example:**
```bash
curl -X POST http://localhost:3334/actions/get_invoice \
  -H "Content-Type: application/json" \
  -d '{"invoice_id": "INV2-XXXX-XXXX-XXXX-XXXX"}'
```

### 4. list_invoices

List all invoices with pagination.

**Parameters:**
- `page` (number, default: 1): Page number
- `page_size` (number, default: 10): Items per page (1-50)

**Example:**
```bash
curl -X POST http://localhost:3334/actions/list_invoices \
  -H "Content-Type: application/json" \
  -d '{"page": 1, "page_size": 10}'
```

## 🎨 Example GPT Prompts

Once your GPT is configured, you can use natural language:

- "Create an invoice for $500 to john@example.com"
- "Send invoice INV2-XXXX-XXXX-XXXX-XXXX"
- "Show me the details of invoice INV2-YYYY-YYYY-YYYY-YYYY"
- "List my recent invoices"
- "Create an invoice for 3 hours of consulting at $150/hour for client@company.com"

## 🔒 Security Best Practices

### 1. Add Authentication (Production)

Add API key authentication to your server:

```typescript
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

### 2. Use Environment Variables

Never hardcode:
- PayPal credentials
- OpenAI API keys
- API keys

### 3. Rate Limiting

Add rate limiting for production:

```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

## 🚀 Deployment Options

### Option 1: GitHub Codespaces (Development)

Perfect for testing and development:

1. Run in Codespace: `npm run dev:chatgpt`
2. Port 3334 auto-forwards
3. Use the forwarded URL in your GPT
4. Auto-stops after 30 minutes of inactivity

### Option 2: Heroku

```bash
# Add Procfile
echo "web: npm run start:chatgpt" > Procfile

# Deploy
heroku create paypal-invoice-chatgpt
git push heroku main
```

### Option 3: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 4: Railway

```bash
# Deploy to Railway
railway up
```

## 📊 Monitoring

### Log Format

The server logs all operations:

```
[INFO] ChatGPT PayPal Invoice API listening on port 3334
[INFO] Executing create_invoice with args: {...}
[INFO] Action: send_invoice {...}
```

### Health Checks

Monitor your server:

```bash
# Check if server is healthy
curl http://localhost:3334/health

# Expected response
{
  "status": "healthy",
  "service": "paypal-chatgpt-invoice-api",
  "tools": ["create_invoice", "send_invoice", "get_invoice", "list_invoices"]
}
```

## 🐛 Troubleshooting

### Server won't start

**Check:**
1. Port 3334 is available: `lsof -i :3334`
2. Environment variables are set
3. PayPal credentials are valid

### "Tool not found" error

**Solution:**
- Check tool name matches exactly
- Valid tools: `create_invoice`, `send_invoice`, `get_invoice`, `list_invoices`

### ChatGPT Actions not working

**Check:**
1. Server is publicly accessible (not localhost)
2. URL is correct in GPT configuration
3. Check server logs for errors

## 📚 Additional Resources

- [PayPal Agent Toolkit Docs](https://github.com/paypal/paypal-agent-toolkit)
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [ChatGPT Actions](https://platform.openai.com/docs/actions)
- [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)

## 🎉 You're Ready!

Your ChatGPT app for PayPal Invoicing is complete!

Run `npm run dev:chatgpt` and start creating invoices with natural language!

