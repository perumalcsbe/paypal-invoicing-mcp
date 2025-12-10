import { PayPalAgentToolkit } from '@paypal/agent-toolkit/openai';

// Initialize PayPal Agent Toolkit for OpenAI integration
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

// Export invoice tools as a record
const toolsRaw = paypalToolkit.getTools();
export const invoiceTools: Record<string, any> = Array.isArray(toolsRaw)
  ? toolsRaw.reduce((acc: Record<string, any>, tool: any, index: number) => {
      const toolName = tool.name || `tool_${index}`;
      acc[toolName] = tool;
      return acc;
    }, {})
  : toolsRaw;

