import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { logger } from './utils/logger.js';
import { registerInvoiceTools } from './mcp/invoices.js';

const app = express();

// CORS middleware for ChatGPT Apps
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, mcp-session-id');
  // CRITICAL: Expose Mcp-Session-Id header for ChatGPT Apps
  res.header('Access-Control-Expose-Headers', 'mcp-session-id');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Conditionally apply JSON parsing - skip for MCP endpoint
app.use((req, res, next) => {
  if (req.path === '/mcp') {
    // Let MCP transport handle raw body parsing
    return next();
  }
  express.json()(req, res, next);
});

const port = parseInt(process.env.PORT || '8080', 10);
const mcpPath = '/mcp';

/* -------------------------------
   MCP Server Factory
   Creates a fresh server instance for each connection
-------------------------------- */
function createMcpServer() {
  const server = new McpServer({
    name: 'paypal-agent-mcp',
    version: '1.0.0',
  });

  // Register all invoice tools
  registerInvoiceTools(server);

  return server;
}

/* -------------------------------
   Health Check Endpoint
-------------------------------- */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'paypal-agent-mcp',
    version: '1.0.0',
  });
});

/* -------------------------------
   Root Endpoint
-------------------------------- */
app.get('/', (req, res) => {
  res.json({
    name: 'paypal-agent-mcp',
    version: '1.0.0',
    status: 'running',
    mcp_endpoint: mcpPath,
    tools: ['create_invoice', 'send_invoice', 'get_invoice', 'list_invoices'],
  });
});

/* -------------------------------
   MCP Endpoint (GET & POST)
   Handles both SSE streams and JSON-RPC messages
-------------------------------- */
app.all(mcpPath, async (req, res) => {
  try {
    logger.info(`MCP ${req.method} request received`);

    // Create a fresh MCP server instance for THIS request
    const mcpServer = createMcpServer();

    // Create a new transport for this request
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => crypto.randomUUID(),
    });

    // Connect the transport to the server
    await mcpServer.connect(transport);

    // Let the transport handle the request completely
    // Do NOT pass pre-parsed body - let transport read raw stream
    await transport.handleRequest(req, res);

  } catch (error: any) {
    logger.error("MCP Error:", error);

    if (!res.headersSent) {
      res.status(500).setHeader('Content-Type', 'application/json').json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: error.message ?? "Internal server error",
        },
        id: null,
      });
    }
  }
});

/* -------------------------------
   Start Server
-------------------------------- */
app.listen(port, '0.0.0.0', () => {
  logger.info(`MCP server running on port ${port}`);
  logger.info(`MCP endpoint: ${mcpPath}`);
  logger.info(`Health check: /health`);
});
