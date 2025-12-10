# PayPal Invoicing - ChatGPT App

Create, send, and manage PayPal invoices using PayPal Agent Toolkit with QR codes and dashboards.

**🤖 ChatGPT App** - Ready to publish to ChatGPT App Store  
**✨ GitHub Codespaces Ready** - Start developing in 2 minutes  
**🎨 Rich UI** - Beautiful formatted responses with tables and emoji

## Features

- ✅ **Create Invoice** - Create draft PayPal invoices with line items and QR codes
- ✅ **Send Invoice** - Send invoices to recipients via email
- ✅ **Get Invoice** - Retrieve full details of a specific invoice
- ✅ **List Invoices** - List all invoices with pagination
- ✅ **Rich UI** - Beautiful markdown formatting with tables and emoji
- ✅ **ChatGPT App Ready** - Native ChatGPT app support
- ✅ **GitHub Codespaces** - Pre-configured development environment

## Quick Start with GitHub Codespaces

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=perumalcsbe/paypal-invoicing-mcp)

1. Click the button above or go to your repository and click "Code" → "Create codespace on main"
2. Wait for the environment to set up (dependencies install automatically)
3. Create a `.env` file with your PayPal credentials (see below)
4. Run `npm run dev`
5. Your MCP server is now running on port 3333!

## Prerequisites

- PayPal Developer Account ([Sign up](https://developer.paypal.com/))
- PayPal API credentials (Client ID and Secret)
- GitHub account (for Codespaces)
- ChatGPT Plus account (to use ChatGPT Apps)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# PayPal API Credentials
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_client_secret_here
PAYPAL_ENVIRONMENT=SANDBOX

# OpenAI API Key (optional, for testing /chat endpoint)
OPENAI_API_KEY=sk-proj-...

# Server Configuration  
PORT=3333
```

### 3. Build the Project

```bash
npm run build
```

## Quick Start

### GitHub Codespaces (Recommended)

1. Click the badge above
2. Wait for setup (~2 minutes)
3. Run: `npm run dev`
4. Add to ChatGPT with your Codespace URL!

### Local Machine

```bash
# Install dependencies
npm install

# Create .env file (see below)

# Development mode with hot-reloading
npm run dev

# Production mode
npm run build
npm start
```

The server runs on port **3333**.

## Testing

Test the server is working:

```bash
# Health check
curl http://localhost:3333/health

# List available actions
curl http://localhost:3333/actions

# Test creating an invoice
curl -X POST http://localhost:3333/actions/create_invoice \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_email": "test@example.com",
    "currency": "USD",
    "items": [{"name": "Test", "quantity": 1, "unit_amount": 100}]
  }'
```

Or use the test script:
```bash
./test-chatgpt.sh
```

## MCP Tools

### create_invoice

Create a draft PayPal invoice with optional line items and QR code.

**Parameters:**
- `recipient_email` (string, required): Email address of the invoice recipient
- `currency` (string, default: "USD"): Currency code
- `note` (string, default: ""): Optional note for the invoice
- `items` (array, default: []): Line items with name, quantity, and unit_amount
- `amount_override` (number, optional): Override the calculated total amount

**Example:**
```json
{
  "recipient_email": "customer@example.com",
  "currency": "USD",
  "note": "Thank you for your business",
  "items": [
    {
      "name": "Web Development Services",
      "quantity": 10,
      "unit_amount": 100
    }
  ]
}
```

### send_invoice

Send a PayPal invoice by ID to the recipient.

**Parameters:**
- `invoice_id` (string, required): The PayPal invoice ID

**Example:**
```json
{
  "invoice_id": "INV2-XXXX-XXXX-XXXX-XXXX"
}
```

### get_invoice

Get full details of a PayPal invoice.

**Parameters:**
- `invoice_id` (string, required): The PayPal invoice ID

**Example:**
```json
{
  "invoice_id": "INV2-XXXX-XXXX-XXXX-XXXX"
}
```

### list_invoices

List PayPal invoices with pagination.

**Parameters:**
- `page` (number, default: 1): Page number (minimum: 1)
- `page_size` (number, default: 10): Items per page (minimum: 1, maximum: 50)

**Example:**
```json
{
  "page": 1,
  "page_size": 10
}
```

## Adding to ChatGPT

### Step 1: Start Your Server

In GitHub Codespaces or locally:
```bash
npm run dev
```

### Step 2: Get Your Server URL

**In Codespaces:** Your URL will be like:
```
https://your-codespace-3333.app.github.dev
```

Find it in the **Ports** tab (make sure it's set to **Public**!)

**Local:** Use:
```
http://localhost:3333
```

### Step 3: Add to ChatGPT

1. Open ChatGPT app
2. Go to Settings → Apps (BETA)
3. Click "New App"
4. Fill in:
   - **Name:** PayPal Invoicing
   - **Description:** Create, send, and manage PayPal invoices using PayPal Agent Toolkit with QR codes and dashboards.
   - **MCP Server URL:** Your Codespace URL + `/mcp`
   - **Authentication:** No Auth
5. Click "Create"

### Step 4: Start Using!

Ask ChatGPT:
- "Create an invoice for $500 to customer@example.com"
- "List my PayPal invoices"
- "Send invoice INV2-XXXX"

## Architecture

### Technology Stack

- **PayPal Agent Toolkit**: `@paypal/agent-toolkit` v1.8.0 - Official PayPal AI integration
- **OpenAI SDK**: `openai` v4.86.1 - ChatGPT function calling
- **Express**: HTTP server for API endpoints
- **TypeScript**: Type-safe development
- **Zod**: Schema validation

### Project Structure

```
paypal-invoicing-mcp/
├── .devcontainer/            # GitHub Codespaces configuration
├── .github/workflows/        # CI/CD pipeline
├── src/
│   ├── server.ts            # Main ChatGPT app server
│   ├── formatters.ts        # Rich UI formatting
│   ├── openapi-spec.ts      # OpenAPI specification
│   └── utils/
│       └── logger.ts        # Logging utility
├── build/                   # Compiled JavaScript output
├── .env                     # Environment variables (local)
├── package.json
├── tsconfig.json
└── README.md
```

## Integration Notes

This server bridges two frameworks:

1. **Model Context Protocol (MCP)**: Provides a standardized way for AI assistants to interact with external tools
2. **PayPal Agent Toolkit**: Provides PayPal API integration designed for AI SDK frameworks

The integration handles:
- Converting MCP tool calls to PayPal Agent Toolkit format
- Mapping MCP's `RequestHandlerExtra` to AI SDK's `ToolExecutionOptions`
- Providing proper abort signal propagation for cancellation support
- Generating synthetic tool call IDs required by the AI SDK

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PAYPAL_CLIENT_ID` | PayPal API Client ID | Required |
| `PAYPAL_CLIENT_SECRET` | PayPal API Client Secret | Required |
| `PAYPAL_ENVIRONMENT` | PayPal environment (sandbox/production) | `sandbox` |
| `PORT` | Server port | `3333` |
| `MCP_PATH` | MCP endpoint path | `/mcp` |

## Development

### Type Safety

The project uses TypeScript with strict mode enabled. All PayPal API interactions are type-checked through the Agent Toolkit.

### Hot Reloading

The development server uses `tsx` with watch mode for instant feedback during development.

### Building

The build process compiles TypeScript to JavaScript with ES module output:

```bash
npm run build
```

Output is placed in the `build/` directory.

## Troubleshooting

### "Must use import to load ES Module" Error

This project uses ES modules (`"type": "module"` in package.json). Make sure you're using `tsx` (not `ts-node-dev`) for development.

### PayPal API Errors

Ensure your `.env` file has valid PayPal credentials and the correct environment setting.

### Server Not Responding

Check that:
1. The server is running (`npm run dev` or `npm start`)
2. The port is not in use by another process
3. Environment variables are properly set

## License

ISC

## Contributing

Contributions are welcome! Please ensure:
- Code passes TypeScript compilation (`npm run build`)
- Follow the existing code style
- Update documentation as needed

