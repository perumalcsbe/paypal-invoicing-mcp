// Formatters for rich UI rendering in ChatGPT

export function formatInvoiceForChatGPT(invoice: any): string {
  const amount = invoice.amount?.value || 'N/A';
  const currency = invoice.amount?.currency_code || 'USD';
  const status = invoice.status || 'DRAFT';
  const recipient = invoice.primary_recipients?.[0]?.billing_info?.email_address || 'N/A';
  
  let message = `## 🧾 Invoice Created Successfully!\n\n`;
  message += `**Invoice ID:** \`${invoice.id}\`\n`;
  message += `**Status:** ${getStatusEmoji(status)} ${status}\n`;
  message += `**Amount:** ${currency} $${amount}\n`;
  message += `**Recipient:** ${recipient}\n\n`;
  
  // Line items
  if (invoice.items && invoice.items.length > 0) {
    message += `### 📋 Line Items\n\n`;
    message += `| Item | Quantity | Unit Price | Total |\n`;
    message += `|------|----------|------------|-------|\n`;
    
    invoice.items.forEach((item: any) => {
      const itemTotal = (item.quantity || 1) * (item.unit_amount?.value || 0);
      message += `| ${item.name} | ${item.quantity || 1} | ${currency} $${item.unit_amount?.value || 0} | ${currency} $${itemTotal} |\n`;
    });
    message += `\n`;
  }
  
  // Payment link
  if (invoice.paymentLink || invoice.links?.payer_action) {
    const payLink = invoice.paymentLink || invoice.links.payer_action;
    message += `### 💳 Payment Link\n`;
    message += `[Pay Invoice](${payLink})\n\n`;
  }
  
  // QR Code
  if (invoice.qrCode) {
    message += `### 📱 QR Code\n`;
    message += `![QR Code](${invoice.qrCode})\n`;
    message += `*Scan to pay instantly*\n\n`;
  }
  
  // Next steps
  message += `### ✨ Next Steps\n`;
  if (status === 'DRAFT') {
    message += `- 📧 Send invoice to customer: Use \`send_invoice\` with ID \`${invoice.id}\`\n`;
    message += `- ✏️ Edit invoice in PayPal dashboard\n`;
  } else if (status === 'SENT') {
    message += `- 👀 View invoice status: Use \`get_invoice\` with ID \`${invoice.id}\`\n`;
    message += `- 📊 Check payment status\n`;
  }
  
  return message;
}

export function formatInvoiceListForChatGPT(result: any): string {
  const totalItems = result.total_items || 0;
  const page = result.page || 1;
  const totalPages = result.total_pages || 1;
  const invoices = result.items || [];
  
  let message = `## 📊 Invoice List\n\n`;
  message += `**Total Invoices:** ${totalItems}\n`;
  message += `**Page:** ${page} of ${totalPages}\n\n`;
  
  if (invoices.length === 0) {
    message += `*No invoices found.*\n`;
    return message;
  }
  
  message += `| Invoice ID | Status | Amount | Recipient | Date |\n`;
  message += `|------------|--------|--------|-----------|------|\n`;
  
  invoices.forEach((inv: any) => {
    const status = inv.status || 'N/A';
    const amount = inv.amount?.value || 'N/A';
    const currency = inv.amount?.currency_code || 'USD';
    const recipient = inv.primary_recipients?.[0]?.billing_info?.email_address || 'N/A';
    const date = inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString() : 'N/A';
    
    message += `| \`${inv.id.substring(0, 12)}...\` | ${getStatusEmoji(status)} ${status} | ${currency} $${amount} | ${recipient} | ${date} |\n`;
  });
  
  message += `\n`;
  
  // Summary by status
  const statusCounts = invoices.reduce((acc: any, inv: any) => {
    const status = inv.status || 'UNKNOWN';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  
  if (Object.keys(statusCounts).length > 0) {
    message += `### 📈 Summary\n`;
    Object.entries(statusCounts).forEach(([status, count]) => {
      message += `- ${getStatusEmoji(status)} **${status}**: ${count}\n`;
    });
  }
  
  return message;
}

export function formatInvoiceDetailsForChatGPT(invoice: any): string {
  const amount = invoice.amount?.value || 'N/A';
  const currency = invoice.amount?.currency_code || 'USD';
  const status = invoice.status || 'UNKNOWN';
  const recipient = invoice.primary_recipients?.[0]?.billing_info?.email_address || 'N/A';
  const invoiceDate = invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : 'N/A';
  const dueDate = invoice.payment_term?.due_date ? new Date(invoice.payment_term.due_date).toLocaleDateString() : 'N/A';
  
  let message = `## 🧾 Invoice Details\n\n`;
  
  // Header
  message += `### 📋 Basic Information\n`;
  message += `- **Invoice ID:** \`${invoice.id}\`\n`;
  message += `- **Status:** ${getStatusEmoji(status)} **${status}**\n`;
  message += `- **Amount:** **${currency} $${amount}**\n`;
  message += `- **Invoice Date:** ${invoiceDate}\n`;
  message += `- **Due Date:** ${dueDate}\n`;
  message += `- **Recipient:** ${recipient}\n\n`;
  
  // Line items
  if (invoice.items && invoice.items.length > 0) {
    message += `### 🛒 Line Items\n\n`;
    message += `| Item | Description | Quantity | Unit Price | Total |\n`;
    message += `|------|-------------|----------|------------|-------|\n`;
    
    invoice.items.forEach((item: any) => {
      const itemTotal = (item.quantity || 1) * (item.unit_amount?.value || 0);
      const desc = item.description || '-';
      message += `| ${item.name} | ${desc} | ${item.quantity || 1} | ${currency} $${item.unit_amount?.value || 0} | ${currency} $${itemTotal} |\n`;
    });
    message += `\n`;
  }
  
  // Payment info
  if (invoice.payments) {
    message += `### 💰 Payment Information\n`;
    message += `- **Paid Amount:** ${currency} $${invoice.payments.paid_amount?.value || 0}\n`;
    message += `- **Refunded Amount:** ${currency} $${invoice.payments.refunded_amount?.value || 0}\n\n`;
  }
  
  // Links
  message += `### 🔗 Actions\n`;
  if (invoice.links?.payer_action) {
    message += `- [💳 Pay Invoice](${invoice.links.payer_action})\n`;
  }
  if (invoice.links?.self) {
    message += `- [👀 View in PayPal](${invoice.links.self})\n`;
  }
  
  // QR Code
  if (invoice.qrCode) {
    message += `\n### 📱 Quick Pay QR Code\n`;
    message += `![QR Code](${invoice.qrCode})\n`;
    message += `*Scan with your phone to pay instantly*\n`;
  }
  
  return message;
}

export function formatSendConfirmationForChatGPT(invoiceId: string): string {
  let message = `## ✅ Invoice Sent Successfully!\n\n`;
  message += `**Invoice ID:** \`${invoiceId}\`\n\n`;
  message += `### 📧 What Happens Next?\n`;
  message += `1. Customer receives email with invoice details\n`;
  message += `2. They can click to view and pay online\n`;
  message += `3. You'll get notified when they pay\n`;
  message += `4. Funds will appear in your PayPal account\n\n`;
  message += `### 🔔 Track Your Invoice\n`;
  message += `- Check status: Use \`get_invoice\` with ID \`${invoiceId}\`\n`;
  message += `- View all invoices: Use \`list_invoices\`\n`;
  
  return message;
}

function getStatusEmoji(status: string): string {
  const statusMap: Record<string, string> = {
    'DRAFT': '📝',
    'SENT': '📧',
    'SCHEDULED': '📅',
    'PAID': '✅',
    'MARKED_AS_PAID': '✅',
    'CANCELLED': '❌',
    'REFUNDED': '↩️',
    'PARTIALLY_PAID': '⏳',
    'PARTIALLY_REFUNDED': '⏳',
    'MARKED_AS_REFUNDED': '↩️',
    'UNPAID': '⏰',
    'PAYMENT_PENDING': '⏳',
  };
  
  return statusMap[status] || '📄';
}

