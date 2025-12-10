# PayPal Invoicing AI Agents

AI agent servers for PayPal invoicing using the PayPal Agent Toolkit. Build agents for both **Claude (MCP)** and **ChatGPT (OpenAI)**.

**✨ Ready to run in GitHub Codespaces!**

## Features

- **Create Invoice**: Create draft PayPal invoices with line items and QR codes
- **Send Invoice**: Send invoices to recipients via email
- **Get Invoice**: Retrieve full details of a specific invoice
- **List Invoices**: List all invoices with pagination support
- **Dual Server Support**: 
  - **MCP Server** (port 3333) - For Claude Desktop
  - **ChatGPT Server** (port 3334) - For ChatGPT/GPTs
- **GitHub Codespaces**: Pre-configured development environment

## Quick Start with GitHub Codespaces

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=perumalcsbe/paypal-invoicing-mcp)

1. Click the button above or go to your repository and click "Code" → "Create codespace on main"
2. Wait for the environment to set up (dependencies install automatically)
3. Create a `.env` file with your PayPal credentials (see below)
4. Run `npm run dev`
5. Your MCP server is now running on port 3333!

## Prerequisites

- PayPal Developer Account
- PayPal API credentials (Client ID and Secret)
- (Optional) GitHub account for Codespaces

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
PAYPAL_ENVIRONMENT=SANDBOX  # or 'PRODUCTION'

# Server Configuration
PORT=3333
MCP_PATH=/mcp
```

### 3. Build the Project

```bash
npm run build
```

## Quick Start

### Choose Your AI Platform

**For Claude (MCP):**
```bash
npm run dev              # Runs on port 3333
```
See [SETUP.md](./SETUP.md) for Claude Desktop integration

**For ChatGPT:**
```bash
npm run dev:chatgpt      # Runs on port 3334
```
See [CHATGPT_SETUP.md](./CHATGPT_SETUP.md) for GPT integration

### GitHub Codespaces (Recommended)

Click the badge above and both servers are ready to use!

### Local Machine

```bash
# Install dependencies
npm install

# Create .env file (see below)

# Run MCP server (Claude)
npm run dev

# Or run ChatGPT server
npm run dev:chatgpt

# Production mode
npm run build
npm start              # MCP server
npm run start:chatgpt  # ChatGPT server
```

## Testing

Run the test script to verify the server is working:

```bash
./test-mcp.sh
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

## GitHub Codespaces Setup

### Environment Variables in Codespaces

You can set environment variables in two ways:

#### Option 1: Repository Secrets (Recommended)

1. Go to your repository settings
2. Navigate to "Secrets and variables" → "Codespaces"
3. Add secrets:
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
   - `PAYPAL_ENVIRONMENT` (value: `sandbox` or `production`)

#### Option 2: Local .env File

Create a `.env` file in the Codespace:

```env
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_ENVIRONMENT=sandbox
```

### Accessing Your Server

When running in Codespaces:
1. The server starts on port 3333
2. GitHub automatically forwards the port
3. You'll see a notification with the URL
4. Click it to access your MCP server

## Architecture

### Technology Stack

- **MCP SDK**: `@modelcontextprotocol/sdk` v1.24.3
- **PayPal Agent Toolkit**: `@paypal/agent-toolkit` v1.8.0
- **Express**: HTTP server for MCP transport
- **TypeScript**: Type-safe development
- **Zod**: Schema validation

### Project Structure

```
paypal-invoicing-mcp/
├── .devcontainer/            # GitHub Codespaces configuration
│   ├── devcontainer.json    # Codespaces setup
│   └── README.md            # Codespaces docs
├── src/
│   ├── server.ts            # Main MCP server setup
│   ├── toolkit.ts           # PayPal Agent Toolkit configuration
│   ├── mcp/
│   │   └── invoices.ts      # Invoice tool implementations
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

