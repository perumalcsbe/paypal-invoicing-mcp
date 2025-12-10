import { z } from 'zod';
import { invoiceTools } from '../toolkit.js';
import { logger } from '../utils/logger.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { randomUUID } from 'crypto';

export function registerInvoiceTools(server: McpServer) {
  /**
   * create_invoice
   */
  server.tool(
    'create_invoice',
    'Create a draft PayPal invoice with optional line items and QR code, using PayPal Agent Toolkit.',
    {
      recipient_email: z.string().email(),
      currency: z.string().default('USD'),
      note: z.string().default(''),
      items: z.array(
        z.object({
          name: z.string(),
          quantity: z.number().positive().default(1),
          unit_amount: z.number().positive(),
        })
      ).default([]),
      amount_override: z.number().positive().optional(),
    },
    async (input, extra) => {
      const { recipient_email, currency } = input;

      logger.info('AgentToolkit: create_invoice for', recipient_email);

      // Use the Agent Toolkit to create an invoice
      const invoiceJSON = await invoiceTools.create_invoice!.execute!(input, {
        toolCallId: randomUUID(),
        messages: [],
        abortSignal: extra.signal,
      });
      const invoice = JSON.parse(invoiceJSON);

      // The toolkit may already return a paymentLink / qrCode
      const payLink = invoice.paymentLink || invoice.links?.payer_action;
      const qr = invoice.qrCode || undefined; // if toolkit gives a QR, just use it

      const structured = {
        type: 'paypal.invoice',
        invoice: {
          id: invoice.id,
          status: invoice.status,
          amount: invoice.amount?.value,
          currency: invoice.amount?.currency_code ?? currency,
          recipient: recipient_email,
          items: (invoice.items || []).map((i: any) => ({
            name: i.name,
            quantity: i.quantity,
            unit_amount: i.unit_amount?.value,
          })),
          qr_code: qr, // base64 or URL provided by toolkit
          links: {
            pay: payLink,
            self: invoice.links?.self,
          },
        },
        actions: [
          {
            type: 'tool',
            name: 'send_invoice',
            label: 'Send Invoice',
            args: { invoice_id: invoice.id },
          },
        ],
      };

      return {
        content: [
          {
            type: 'text',
            text: `Created draft invoice ${invoice.id} for ${recipient_email}.`,
          },
        ],
        structuredContent: structured,
      };
    }
  );

  /**
   * send_invoice
   */
  server.tool(
    'send_invoice',
    'Send a PayPal invoice by ID using PayPal Agent Toolkit.',
    {
      invoice_id: z.string(),
    },
    async ({ invoice_id }, extra) => {
      logger.info('AgentToolkit: send_invoice', invoice_id);

      await invoiceTools.send_invoice!.execute!({ invoice_id }, {
        toolCallId: randomUUID(),
        messages: [],
        abortSignal: extra.signal,
      });

      return {
        content: [
          {
            type: 'text',
            text: `Invoice ${invoice_id} has been sent to the recipient.`,
          },
        ],
        structuredContent: {
          type: 'paypal.invoice_action_result',
          action: 'send',
          invoice_id,
          status: 'SENT',
        },
      };
    }
  );

  /**
   * get_invoice
   */
  server.tool(
    'get_invoice',
    'Get full details of a PayPal invoice using PayPal Agent Toolkit.',
    {
      invoice_id: z.string(),
    },
    async ({ invoice_id }, extra) => {
      logger.info('AgentToolkit: get_invoice', invoice_id);

      const invoiceJSON = await invoiceTools.get_invoice!.execute!({ invoice_id }, {
        toolCallId: randomUUID(),
        messages: [],
        abortSignal: extra.signal,
      });
      const invoice = JSON.parse(invoiceJSON);

      const payLink = invoice.paymentLink || invoice.links?.payer_action;
      const qr = invoice.qrCode || undefined;

      const structured = {
        type: 'paypal.invoice',
        invoice: {
          id: invoice.id,
          status: invoice.status,
          amount: invoice.amount?.value,
          currency: invoice.amount?.currency_code,
          recipient:
            invoice.primary_recipients?.[0]?.billing_info?.email_address,
          items: (invoice.items || []).map((i: any) => ({
            name: i.name,
            quantity: i.quantity,
            unit_amount: i.unit_amount?.value,
          })),
          qr_code: qr,
          links: {
            pay: payLink,
            self: invoice.links?.self,
          },
        },
      };

      return {
        content: [
          {
            type: 'text',
            text: `Invoice ${invoice.id} is currently ${invoice.status}.`,
          },
        ],
        structuredContent: structured,
      };
    }
  );

  /**
   * list_invoices
   */
  server.tool(
    'list_invoices',
    'List PayPal invoices using PayPal Agent Toolkit.',
    {
      page: z.number().int().min(1).default(1),
      page_size: z.number().int().min(1).max(50).default(10),
    },
    async ({ page, page_size }, extra) => {
      logger.info('AgentToolkit: list_invoices page', page);

      const resultJSON = await invoiceTools.list_invoices!.execute!({
        page,
        page_size,
      }, {
        toolCallId: randomUUID(),
        messages: [],
        abortSignal: extra.signal,
      });
      const result = JSON.parse(resultJSON);

      const structured = {
        type: 'paypal.invoice_list',
        page,
        total_pages: result.total_pages,
        total_items: result.total_items,
        invoices: (result.items || []).map((inv: any) => ({
          id: inv.id,
          status: inv.status,
          amount: inv.amount?.value,
          currency: inv.amount?.currency_code,
          recipient:
            inv.primary_recipients?.[0]?.billing_info?.email_address,
        })),
      };

      return {
        content: [
        {
            type: 'text',
            text: `Found ${result.total_items} invoices (page ${page}/${result.total_pages}).`,
          },
        ],
        structuredContent: structured,
      };
    }
  );
}
