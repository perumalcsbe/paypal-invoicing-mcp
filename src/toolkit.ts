import 'dotenv/config';
import { logger } from './utils/logger.js';
import { PayPalAgentToolkit } from '@paypal/agent-toolkit/ai-sdk';

const clientId = process.env.PAYPAL_CLIENT_ID!;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
const environment = process.env.PAYPAL_ENVIRONMENT || 'sandbox';

if (!clientId || !clientSecret) {
  logger.warn('PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET missing – toolkit will not work.');
}

export const paypalToolkit = new PayPalAgentToolkit({
  clientId,
  clientSecret,
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
      sandbox: environment.toUpperCase() === 'SANDBOX',
    },
  },
});

export const invoiceTools = paypalToolkit.getTools();

