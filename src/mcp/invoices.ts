import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { invoiceTools } from '../toolkit.js';
import { logger } from '../utils/logger.js';
import crypto from 'node:crypto';

export function registerInvoiceTools(server: McpServer) {
  // Create Invoice Tool
  server.tool(
    'create_invoice',
    'Create a draft PayPal invoice with line items and QR code',
    {
      recipient_email: z.string().email().describe('Recipient email address'),
      currency: z.string().default('USD').describe('Currency code (e.g., USD, EUR)'),
      note: z.string().optional().describe('Optional invoice note'),
      items: z.array(z.object({
        name: z.string().describe('Item name/description'),
        quantity: z.number().positive().default(1).describe('Item quantity'),
        unit_amount: z.number().positive().describe('Price per unit in currency'),
      })).optional().describe('Array of line items'),
      amount_override: z.number().positive().optional().describe('Override total amount'),
    },
    async (input) => {
      logger.info('MCP Tool: create_invoice', input);
      
      const tool = invoiceTools.create_invoice;
      if (!tool || !tool.execute) {
        throw new Error('create_invoice tool not available');
      }

      const result = await tool.execute(input, {
        toolCallId: crypto.randomUUID(),
        messages: [],
      });

      return {
        content: [
          {
            type: 'text',
            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // Send Invoice Tool
  server.tool(
    'send_invoice',
    'Send an existing draft PayPal invoice to the recipient via email',
    {
      invoice_id: z.string().describe('The PayPal invoice ID to send'),
    },
    async (input) => {
      logger.info('MCP Tool: send_invoice', input);
      
      const tool = invoiceTools.send_invoice;
      if (!tool || !tool.execute) {
        throw new Error('send_invoice tool not available');
      }

      const result = await tool.execute(input, {
        toolCallId: crypto.randomUUID(),
        messages: [],
      });

      return {
        content: [
          {
            type: 'text',
            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // Get Invoice Tool
  server.tool(
    'get_invoice',
    'Retrieve detailed information about a specific PayPal invoice',
    {
      invoice_id: z.string().describe('The PayPal invoice ID to retrieve'),
    },
    async (input) => {
      logger.info('MCP Tool: get_invoice', input);
      
      const tool = invoiceTools.get_invoice;
      if (!tool || !tool.execute) {
        throw new Error('get_invoice tool not available');
      }

      const result = await tool.execute(input, {
        toolCallId: crypto.randomUUID(),
        messages: [],
      });

      return {
        content: [
          {
            type: 'text',
            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // List Invoices Tool
  server.tool(
    'list_invoices',
    'List PayPal invoices with optional pagination',
    {
      page: z.number().optional().describe('Page number (starting from 1)'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    async (input) => {
      logger.info('MCP Tool: list_invoices', input);
      
      const tool = invoiceTools.list_invoices;
      if (!tool || !tool.execute) {
        throw new Error('list_invoices tool not available');
      }

      const result = await tool.execute(input || {}, {
        toolCallId: crypto.randomUUID(),
        messages: [],
      });

      return {
        content: [
          {
            type: 'text',
            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  logger.info('Registered 4 PayPal invoice tools with MCP server');
}
