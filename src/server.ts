import 'dotenv/config';
import express from 'express';
import OpenAI from 'openai';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { PayPalAgentToolkit } from '@paypal/agent-toolkit/openai';
import { logger } from './utils/logger.js';
import { openapiSpec } from './openapi-spec.js';
import {
  formatInvoiceForChatGPT,
  formatInvoiceListForChatGPT,
  formatInvoiceDetailsForChatGPT,
  formatSendConfirmationForChatGPT
} from './formatters.js';
import crypto from 'node:crypto';
import { z } from 'zod';

const app = express();
app.use(express.json());

const port = parseInt(process.env.PORT || '3333', 10);
const mcpPath = '/mcp';

// Initialize PayPal Toolkit for OpenAI
const paypalToolkit = new PayPalAgentToolkit({
  clientId: process.env.PAYPAL_CLIENT_ID!,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET!,
  configuration: {
    actions: {
      invoices: {
        create: true,
        list: true,
        send: true,
        get: true,
      },
    },
    context: {
      sandbox: process.env.PAYPAL_ENVIRONMENT?.toUpperCase() === 'SANDBOX',
    },
  },
});

// Get PayPal tools in OpenAI format
const toolsRaw = paypalToolkit.getTools();

// Log for debugging
logger.info('Tools type:', Array.isArray(toolsRaw) ? 'Array' : 'Object');
logger.info('Tools keys/length:', Array.isArray(toolsRaw) ? toolsRaw.length : Object.keys(toolsRaw).length);
if (Array.isArray(toolsRaw) && toolsRaw.length > 0) {
  logger.info('First tool structure:', JSON.stringify(Object.keys(toolsRaw[0] || {})));
}

const tools: Record<string, any> = toolsRaw;
const toolNames = Object.keys(tools);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key', // Will use client's key
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'paypal-chatgpt-invoice-api',
    tools: toolNames,
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'PayPal Invoicing',
    description: 'Create, send, and manage PayPal invoices using PayPal Agent Toolkit with QR codes and dashboards.',
    version: '1.0.0',
    available_tools: toolNames,
    endpoints: {
      mcp: mcpPath,  // For ChatGPT Apps (MCP protocol)
      chat: '/chat',
      actions: '/actions',
      openapi: '/openapi.json',
      manifest: '/.well-known/ai-plugin.json',
      health: '/health',
    },
  });
});

// OpenAPI specification endpoint (required for ChatGPT Apps)
app.get('/openapi.json', (req, res) => {
  // Update server URL dynamically
  const serverUrl = `${req.protocol}://${req.get('host')}`;
  const spec = {
    ...openapiSpec,
    servers: [{ url: serverUrl, description: 'Current server' }]
  };
  res.json(spec);
});

// ChatGPT App manifest (well-known location)
app.get('/.well-known/ai-plugin.json', (req, res) => {
  const serverUrl = `${req.protocol}://${req.get('host')}`;
  res.json({
    schema_version: 'v1',
    name_for_human: 'PayPal Invoicing',
    name_for_model: 'paypal_invoicing',
    description_for_human: 'Create, send, and manage PayPal invoices using PayPal Agent Toolkit with QR codes and dashboards.',
    description_for_model: 'A PayPal invoicing assistant that helps users create, send, retrieve, and list PayPal invoices. Creates invoices with QR codes for easy payment. Use this when users want to: create invoices for customers, send existing invoices, check invoice status with dashboards, or list their PayPal invoices. Supports line items, custom amounts, and automatic QR code generation.',
    auth: {
      type: 'none'  // Update to 'oauth' when implementing authentication
    },
    api: {
      type: 'openapi',
      url: `${serverUrl}/openapi.json`
    },
    logo_url: 'https://www.paypalobjects.com/marketing/web/logos/paypal-mark-color_new.svg',
    contact_email: 'support@example.com',
    legal_info_url: `${serverUrl}/legal`
  });
});

// Initialize MCP Server for ChatGPT Apps (native MCP support)
const mcpServer = new McpServer({
  name: 'paypal-invoicing',
  version: '1.0.0',
});

// Register PayPal invoice tools with MCP protocol
mcpServer.tool(
  'create_invoice',
  'Create a draft PayPal invoice with line items and QR code',
  {
    recipient_email: z.string().email().describe('Recipient email address'),
    currency: z.string().default('USD').describe('Currency code'),
    note: z.string().optional().describe('Invoice note'),
    items: z.array(z.object({
      name: z.string().describe('Item name'),
      quantity: z.number().positive().default(1).describe('Quantity'),
      unit_amount: z.number().positive().describe('Unit price'),
    })).optional().describe('Line items'),
    amount_override: z.number().positive().optional().describe('Total amount override'),
  },
  async (input) => {
    logger.info('MCP: create_invoice', input);
    const tool = tools['create_invoice' as keyof typeof tools];
    const result = await tool.execute(input, {
      toolCallId: crypto.randomUUID(),
      messages: [],
    });
    return { content: [{ type: 'text', text: result }] };
  }
);

mcpServer.tool(
  'send_invoice',
  'Send an existing PayPal invoice to the recipient',
  {
    invoice_id: z.string().describe('Invoice ID to send'),
  },
  async (input) => {
    logger.info('MCP: send_invoice', input);
    const tool = tools['send_invoice' as keyof typeof tools];
    const result = await tool.execute(input, {
      toolCallId: crypto.randomUUID(),
      messages: [],
    });
    return { content: [{ type: 'text', text: result }] };
  }
);

mcpServer.tool(
  'get_invoice',
  'Get details of a specific PayPal invoice',
  {
    invoice_id: z.string().describe('Invoice ID to retrieve'),
  },
  async (input) => {
    logger.info('MCP: get_invoice', input);
    const tool = tools['get_invoice' as keyof typeof tools];
    const result = await tool.execute(input, {
      toolCallId: crypto.randomUUID(),
      messages: [],
    });
    return { content: [{ type: 'text', text: result }] };
  }
);

mcpServer.tool(
  'list_invoices',
  'List PayPal invoices with optional filters',
  {
    page: z.number().optional().describe('Page number'),
    page_size: z.number().optional().describe('Results per page'),
  },
  async (input) => {
    logger.info('MCP: list_invoices', input);
    const tool = tools['list_invoices' as keyof typeof tools];
    const result = await tool.execute(input || {}, {
      toolCallId: crypto.randomUUID(),
      messages: [],
    });
    return { content: [{ type: 'text', text: result }] };
  }
);

// MCP endpoint - GET handler for browser testing
app.get(mcpPath, (req, res) => {
  res.json({
    message: 'MCP Server for ChatGPT Apps',
    protocol: 'Model Context Protocol',
    tools: ['create_invoice', 'send_invoice', 'get_invoice', 'list_invoices'],
    usage: 'This endpoint supports MCP protocol for ChatGPT Apps. Use POST with MCP protocol messages.',
  });
});

// MCP endpoint - POST handler for actual MCP protocol
app.post(mcpPath, async (req, res) => {
  try {
    // Set Accept header if not present (for ChatGPT compatibility)
    if (!req.headers.accept || !req.headers.accept.includes('text/event-stream')) {
      req.headers.accept = 'application/json, text/event-stream';
    }

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: crypto.randomUUID,
      enableJsonResponse: true,
    });

    res.on('close', () => {
      try {
        transport.close();
      } catch (e) {
        // Ignore close errors
      }
    });

    // Connect and handle request in one session
    await mcpServer.connect(transport);
    await transport.handleRequest(req, res, req.body);
    
    // Close transport after handling request
    setTimeout(() => {
      try {
        transport.close();
      } catch (e) {
        // Ignore close errors
      }
    }, 100);
  } catch (error) {
    logger.error('MCP Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Chat endpoint - Full ChatGPT integration with function calling
app.post('/chat', async (req, res) => {
  try {
    const { messages, openai_api_key } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array required' });
    }

    // Use client's OpenAI key if provided
    const client = openai_api_key 
      ? new OpenAI({ apiKey: openai_api_key })
      : openai;

    // Convert PayPal tools to OpenAI function format
    const openaiTools = Object.entries(tools).map(([name, tool]: [string, any]) => ({
      type: 'function' as const,
      function: {
        name: name,
        description: tool.description || `PayPal ${name} operation`,
        parameters: tool.parameters || {},
      },
    }));

    // Initial chat completion
    let response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      tools: openaiTools,
      tool_choice: 'auto',
    });

    let responseMessage = response.choices[0].message;
    const conversationMessages = [...messages, responseMessage];

    // Handle function calls
    while (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        logger.info(`Executing ${functionName} with args:`, functionArgs);

        // Execute PayPal tool
        const tool = tools[functionName as keyof typeof tools];
        if (!tool || !tool.execute) {
          throw new Error(`Tool ${functionName} not found or not executable`);
        }

        const result = await tool.execute(functionArgs, {
          toolCallId: toolCall.id,
          messages: conversationMessages,
        });

        // Format result for better UI rendering
        let formattedResult: string;
        try {
          const parsedResult = typeof result === 'string' ? JSON.parse(result) : result;
          
          // Format based on action type
          if (functionName === 'create_invoice') {
            formattedResult = formatInvoiceForChatGPT(parsedResult);
          } else if (functionName === 'list_invoices') {
            formattedResult = formatInvoiceListForChatGPT(parsedResult);
          } else if (functionName === 'get_invoice') {
            formattedResult = formatInvoiceDetailsForChatGPT(parsedResult);
          } else if (functionName === 'send_invoice') {
            formattedResult = formatSendConfirmationForChatGPT(functionArgs.invoice_id);
          } else {
            // Fallback to JSON
            formattedResult = JSON.stringify(parsedResult, null, 2);
          }
        } catch (e) {
          // If formatting fails, use original result
          formattedResult = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
        }

        // Add formatted result to conversation
        conversationMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: formattedResult,
        });
      }

      // Get next response
      response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: conversationMessages,
        tools: openaiTools,
      });

      responseMessage = response.choices[0].message;
      conversationMessages.push(responseMessage);
    }

    res.json({
      message: responseMessage.content,
      conversation: conversationMessages,
      usage: response.usage,
    });

  } catch (error: any) {
    logger.error('Chat error:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.stack,
    });
  }
});

// Simple actions endpoint - For ChatGPT Actions/GPTs
app.post('/actions/:action', async (req, res) => {
  try {
    const { action } = req.params;
    const params = req.body;

    logger.info(`Action: ${action}`, params);

    const tool = tools[action as keyof typeof tools];
    if (!tool) {
      return res.status(404).json({ error: `Action ${action} not found` });
    }

    if (!tool.execute) {
      return res.status(400).json({ error: `Action ${action} is not executable` });
    }

    const result = await tool.execute(params, {
      toolCallId: `action-${Date.now()}`,
      messages: [],
    });

    // Format result for better UI rendering
    let formattedResult: string;
    try {
      const parsedResult = typeof result === 'string' ? JSON.parse(result) : result;
      
      // Format based on action type
      if (action === 'create_invoice') {
        formattedResult = formatInvoiceForChatGPT(parsedResult);
      } else if (action === 'list_invoices') {
        formattedResult = formatInvoiceListForChatGPT(parsedResult);
      } else if (action === 'get_invoice') {
        formattedResult = formatInvoiceDetailsForChatGPT(parsedResult);
      } else if (action === 'send_invoice') {
        formattedResult = formatSendConfirmationForChatGPT(params.invoice_id);
      } else {
        formattedResult = JSON.stringify(parsedResult, null, 2);
      }
      
      res.json({
        success: true,
        action: action,
        result: parsedResult,
        formatted: formattedResult // Markdown-formatted version
      });
    } catch (error) {
      res.json({
        success: true,
        action: action,
        result: typeof result === 'string' ? JSON.parse(result) : result,
      });
    }

  } catch (error: any) {
    logger.error('Action error:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error',
    });
  }
});

// List available actions
app.get('/actions', (req, res) => {
  const actions = Object.entries(tools).map(([name, tool]: [string, any]) => ({
    name,
    description: tool.description || `PayPal ${name} operation`,
    parameters: tool.parameters,
  }));

  res.json({
    actions,
    usage: {
      endpoint: '/actions/:action',
      method: 'POST',
      example: '/actions/create_invoice',
    },
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  logger.info(`ChatGPT PayPal Invoice API listening on port ${port}`);
  logger.info(`Available tools: ${Object.keys(tools).join(', ')}`);
  logger.info(`Chat endpoint: http://localhost:${port}/chat`);
  logger.info(`Actions endpoint: http://localhost:${port}/actions/:action`);
});

