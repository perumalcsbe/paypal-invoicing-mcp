import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { logger } from './utils/logger.js';
import { registerInvoiceTools } from './mcp/invoices.js';

const app = express();
app.use(express.json());

const port = parseInt(process.env.PORT || '8080', 10);
const mcpPath = '/mcp';

/* -------------------------------
   Initialize MCP Server
-------------------------------- */
const mcpServer = new McpServer({
  name: 'paypal-agent-mcp',
  version: '1.0.0',
});

// Register all invoice tools
registerInvoiceTools(mcpServer);

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
   MCP Endpoint Info (GET)
-------------------------------- */
app.get(mcpPath, (req, res) => {
  res.json({
    message: 'MCP Server for ChatGPT Apps',
    protocol: 'Model Context Protocol',
    version: '2024-11-05',
    tools: ['create_invoice', 'send_invoice', 'get_invoice', 'list_invoices'],
    usage: 'POST to this endpoint with MCP protocol messages',
  });
});

/* -------------------------------
   🔥 OFFICIAL MCP ENDPOINT (POST)
   ChatGPT Apps Compatible
-------------------------------- */
app.post(mcpPath, async (req, res) => {
  try {
    const transport = new StreamableHTTPServerTransport({
      req,
      res,
      streamMode: "sse",                // 🔥 REQUIRED: forces text/event-stream
      sessionIdGenerator: crypto.randomUUID,
    } as any);

    await mcpServer.connect(transport); // 🔥 DO NOT call handleRequest()

  } catch (error: any) {
    logger.error("MCP Error:", error);

    if (!res.headersSent) {
      res.status(500).json({
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
