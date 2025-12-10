import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
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

// Session management for SSE transports
const sessions = new Map<string, SSEServerTransport>();

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
   MCP SSE Connection (GET)
-------------------------------- */
app.get(mcpPath, async (req, res) => {
  try {
    logger.info(`Establishing SSE connection`);
    
    const transport = new SSEServerTransport(mcpPath, res);
    const sessionId = transport.sessionId;
    sessions.set(sessionId, transport);
    
    // Clean up on connection close
    req.on('close', () => {
      logger.info(`SSE connection closed for session: ${sessionId}`);
      sessions.delete(sessionId);
    });
    
    // Start the SSE stream
    await transport.start();
    
    // Connect to MCP server
    await mcpServer.connect(transport);
    
  } catch (error: any) {
    logger.error("SSE Error:", error);
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
   MCP Message Handler (POST)
-------------------------------- */
app.post(mcpPath, async (req, res) => {
  try {
    const sessionId = req.headers['x-mcp-session-id'] as string;
    
    if (!sessionId) {
      return res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32600,
          message: "Missing x-mcp-session-id header",
        },
        id: null,
      });
    }
    
    const transport = sessions.get(sessionId);
    
    if (!transport) {
      return res.status(404).json({
        jsonrpc: "2.0",
        error: {
          code: -32001,
          message: "Session not found",
        },
        id: null,
      });
    }
    
    // Handle the POST message via the transport
    await transport.handlePostMessage(req, res, req.body);
    
  } catch (error: any) {
    logger.error("MCP POST Error:", error);
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
