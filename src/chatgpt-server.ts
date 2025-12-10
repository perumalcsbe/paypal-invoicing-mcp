import 'dotenv/config';
import express from 'express';
import OpenAI from 'openai';
import { PayPalAgentToolkit } from '@paypal/agent-toolkit/openai';
import { logger } from './utils/logger.js';

const app = express();
app.use(express.json());

const port = parseInt(process.env.PORT || '3334', 10);

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
const tools = paypalToolkit.getTools() as Record<string, any>;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key', // Will use client's key
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'paypal-chatgpt-invoice-api',
    tools: Object.keys(tools),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'PayPal Invoice API for ChatGPT',
    version: '1.0.0',
    available_tools: Object.keys(tools),
    endpoints: {
      chat: '/chat',
      actions: '/actions',
      health: '/health',
    },
  });
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

        // Add function result to conversation
        conversationMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: typeof result === 'string' ? result : JSON.stringify(result),
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

    res.json({
      success: true,
      action: action,
      result: typeof result === 'string' ? JSON.parse(result) : result,
    });

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

