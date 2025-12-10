// OpenAPI 3.0 specification for ChatGPT App
export const openapiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'PayPal Invoicing API',
    description: 'Create, send, and manage PayPal invoices using PayPal Agent Toolkit with QR codes and dashboards.',
    version: '1.0.0',
    contact: {
      name: 'API Support',
      email: 'support@example.com'
    }
  },
  servers: [
    {
      url: 'https://your-codespace-url-3334.github.dev',
      description: 'Production server'
    }
  ],
  paths: {
    '/actions/create_invoice': {
      post: {
        operationId: 'createInvoice',
        summary: 'Create a new PayPal invoice',
        description: 'Creates a draft PayPal invoice with line items',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['recipient_email', 'currency', 'items'],
                properties: {
                  recipient_email: {
                    type: 'string',
                    format: 'email',
                    description: 'Email address of the invoice recipient'
                  },
                  currency: {
                    type: 'string',
                    default: 'USD',
                    description: 'Currency code (e.g., USD, EUR, GBP)'
                  },
                  note: {
                    type: 'string',
                    description: 'Optional note for the invoice'
                  },
                  items: {
                    type: 'array',
                    description: 'Line items for the invoice',
                    items: {
                      type: 'object',
                      required: ['name', 'quantity', 'unit_amount'],
                      properties: {
                        name: {
                          type: 'string',
                          description: 'Item name or description'
                        },
                        quantity: {
                          type: 'number',
                          minimum: 1,
                          description: 'Quantity of items'
                        },
                        unit_amount: {
                          type: 'number',
                          minimum: 0.01,
                          description: 'Price per unit'
                        }
                      }
                    }
                  },
                  amount_override: {
                    type: 'number',
                    description: 'Override the calculated total amount'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Invoice created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    action: { type: 'string' },
                    result: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        status: { type: 'string' },
                        amount: { type: 'object' },
                        links: { type: 'object' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/actions/send_invoice': {
      post: {
        operationId: 'sendInvoice',
        summary: 'Send an invoice to recipient',
        description: 'Sends an existing PayPal invoice to the recipient via email',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['invoice_id'],
                properties: {
                  invoice_id: {
                    type: 'string',
                    description: 'PayPal invoice ID'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Invoice sent successfully'
          }
        }
      }
    },
    '/actions/get_invoice': {
      post: {
        operationId: 'getInvoice',
        summary: 'Get invoice details',
        description: 'Retrieves full details of a PayPal invoice',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['invoice_id'],
                properties: {
                  invoice_id: {
                    type: 'string',
                    description: 'PayPal invoice ID'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Invoice details retrieved'
          }
        }
      }
    },
    '/actions/list_invoices': {
      post: {
        operationId: 'listInvoices',
        summary: 'List invoices',
        description: 'Lists PayPal invoices with pagination',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  page: {
                    type: 'number',
                    minimum: 1,
                    default: 1,
                    description: 'Page number'
                  },
                  page_size: {
                    type: 'number',
                    minimum: 1,
                    maximum: 50,
                    default: 10,
                    description: 'Items per page'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Invoice list retrieved'
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
};

