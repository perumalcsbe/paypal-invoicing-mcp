import 'dotenv/config';
import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { logger } from './utils/logger.js';
import { registerInvoiceTools } from './mcp/invoices.js';
import crypto from 'node:crypto';

const server = new McpServer({
  name: 'paypal-agent-mcp',
  version: '1.0.0',
});

// register tool sets
registerInvoiceTools(server);
// registerOrdersTools(server); // later

const app = express();
app.use(express.json());

const port = parseInt(process.env.PORT || '3333', 10);
const mcpPath = process.env.MCP_PATH || '/mcp';

// Health check endpoint for Cloud Run / Load Balancers
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'paypal-agent-mcp' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'paypal-agent-mcp',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      mcp: mcpPath,
      health: '/health',
    },
  });
});

// MCP endpoint
app.post(mcpPath, async (req, res) => {
  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: crypto.randomUUID,
      enableJsonResponse: true,
    });

    res.on('close', () => transport.close());

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    logger.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Start server - bind to 0.0.0.0 for Cloud Run
const httpServer = app.listen(port, '0.0.0.0', () => {
  logger.info(`MCP server listening on port ${port}${mcpPath}`);
  logger.info(`Health check available at /health`);
});

// Graceful shutdown handling
const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
