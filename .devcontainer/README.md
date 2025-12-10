# GitHub Codespaces Development Environment

This directory contains the configuration for GitHub Codespaces.

## Features

- **Node.js 20**: Pre-installed with npm
- **TypeScript**: Fully configured
- **VSCode Extensions**: ESLint, Prettier, TypeScript
- **Auto Port Forwarding**: Port 3333 automatically forwarded
- **Auto Install**: Dependencies installed automatically on startup

## Getting Started

1. Open this repository in GitHub Codespaces
2. Wait for the environment to set up (installs dependencies automatically)
3. Create `.env` file with your PayPal credentials:
   ```env
   PAYPAL_CLIENT_ID=your_client_id
   PAYPAL_CLIENT_SECRET=your_client_secret
   PAYPAL_ENVIRONMENT=SANDBOX
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Access the MCP server at the forwarded port

## Environment Variables

Set these as Codespaces secrets or in a `.env` file:

- `PAYPAL_CLIENT_ID` - Your PayPal API Client ID
- `PAYPAL_CLIENT_SECRET` - Your PayPal API Client Secret
- `PAYPAL_ENVIRONMENT` - Either `SANDBOX` or `PRODUCTION`

## Port Forwarding

Port 3333 is automatically forwarded and labeled as "MCP Server".
You can access it via the Ports panel in VSCode.

