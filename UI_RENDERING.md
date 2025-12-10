# 🎨 UI Rendering Guide

Your app now includes **rich UI formatting** for both ChatGPT and Claude!

## ✨ What's New

### Before (Raw JSON)
```json
{
  "id": "INV2-XXXX-XXXX",
  "status": "DRAFT",
  "amount": {"value": "500.00", "currency_code": "USD"},
  "items": [{"name": "Consulting", "quantity": 1, "unit_amount": {"value": "500.00"}}]
}
```

### After (Rich Formatting)

## 🧾 Invoice Created Successfully!

**Invoice ID:** `INV2-XXXX-XXXX`  
**Status:** 📝 DRAFT  
**Amount:** USD $500.00  
**Recipient:** customer@example.com  

### 📋 Line Items

| Item | Quantity | Unit Price | Total |
|------|----------|------------|-------|
| Consulting | 1 | USD $500.00 | USD $500.00 |

### 💳 Payment Link
[Pay Invoice](https://paypal.com/invoice/INV2-XXXX)

### 📱 QR Code
![QR Code](https://qr.paypal.com/...)  
*Scan to pay instantly*

### ✨ Next Steps
- 📧 Send invoice to customer: Use `send_invoice` with ID `INV2-XXXX`
- ✏️ Edit invoice in PayPal dashboard

---

## 🎯 Features

### 1. Invoice Creation
**When user says:** "Create an invoice for $500"

**ChatGPT shows:**
- ✅ Formatted invoice details with emoji
- ✅ Markdown tables for line items
- ✅ Payment links (clickable)
- ✅ QR code images (if available)
- ✅ Next step suggestions

### 2. Invoice List
**When user says:** "List my invoices"

**ChatGPT shows:**

## 📊 Invoice List

**Total Invoices:** 25  
**Page:** 1 of 3  

| Invoice ID | Status | Amount | Recipient | Date |
|------------|--------|--------|-----------|------|
| `INV2-XXXX...` | ✅ PAID | USD $500 | john@example.com | 12/10/2024 |
| `INV2-YYYY...` | 📧 SENT | USD $250 | jane@example.com | 12/09/2024 |
| `INV2-ZZZZ...` | 📝 DRAFT | USD $100 | bob@example.com | 12/08/2024 |

### 📈 Summary
- ✅ **PAID**: 10
- 📧 **SENT**: 8
- 📝 **DRAFT**: 7

### 3. Invoice Details
**When user says:** "Show invoice INV2-XXXX"

**ChatGPT shows:**

## 🧾 Invoice Details

### 📋 Basic Information
- **Invoice ID:** `INV2-XXXX-XXXX`
- **Status:** ✅ **PAID**
- **Amount:** **USD $500.00**
- **Invoice Date:** 12/10/2024
- **Due Date:** 12/20/2024
- **Recipient:** customer@example.com

### 🛒 Line Items

| Item | Description | Quantity | Unit Price | Total |
|------|-------------|----------|------------|-------|
| Web Development | Frontend work | 5 | USD $100.00 | USD $500.00 |

### 💰 Payment Information
- **Paid Amount:** USD $500.00
- **Refunded Amount:** USD $0.00

### 🔗 Actions
- [💳 Pay Invoice](https://paypal.com/invoice/pay/INV2-XXXX)
- [👀 View in PayPal](https://paypal.com/invoice/INV2-XXXX)

### 4. Send Confirmation
**When user says:** "Send invoice INV2-XXXX"

**ChatGPT shows:**

## ✅ Invoice Sent Successfully!

**Invoice ID:** `INV2-XXXX-XXXX`

### 📧 What Happens Next?
1. Customer receives email with invoice details
2. They can click to view and pay online
3. You'll get notified when they pay
4. Funds will appear in your PayPal account

### 🔔 Track Your Invoice
- Check status: Use `get_invoice` with ID `INV2-XXXX`
- View all invoices: Use `list_invoices`

---

## 🎨 Visual Elements

### Emoji Status Indicators
- 📝 **DRAFT** - Not yet sent
- 📧 **SENT** - Sent to customer
- ⏰ **UNPAID** - Awaiting payment
- ⏳ **PAYMENT_PENDING** - Payment processing
- ✅ **PAID** - Payment received
- ❌ **CANCELLED** - Invoice cancelled
- ↩️ **REFUNDED** - Payment refunded
- 📅 **SCHEDULED** - Scheduled to send

### Markdown Tables
Clean, structured data display:
- Line items with calculations
- Invoice lists with status
- Payment breakdowns

### Action Links
Clickable buttons that work in ChatGPT:
- Payment links
- View in PayPal
- QR code images

### QR Codes
If PayPal Agent Toolkit provides QR codes:
- Displayed as images
- Scannable on mobile
- Quick payment option

---

## 🔧 How It Works

### MCP Server (Claude)
Uses `structuredContent` field:
```typescript
{
  content: [{ type: 'text', text: 'Created invoice' }],
  structuredContent: {
    type: 'paypal.invoice',
    invoice: { /* data */ }
  }
}
```

Claude renders this with its own UI components.

### ChatGPT Server
Uses markdown formatting:
```typescript
const formatted = formatInvoiceForChatGPT(invoice);
// Returns: "## 🧾 Invoice Created...\n\n**Status:** ..."
```

ChatGPT renders markdown natively with:
- Headers (##, ###)
- Bold (**text**)
- Tables (|---|---|)
- Links ([text](url))
- Images (![alt](url))
- Lists (-, 1., 2.)

---

## 📊 Comparison

| Feature | MCP (Claude) | ChatGPT |
|---------|--------------|---------|
| **Format** | structuredContent | Markdown |
| **Tables** | ✅ Native components | ✅ Markdown tables |
| **Emoji** | ✅ Supported | ✅ Supported |
| **Links** | ✅ Clickable | ✅ Clickable |
| **Images** | ✅ QR codes | ✅ QR codes |
| **Layout** | ✅ Custom | ✅ Markdown |

Both platforms provide excellent UI rendering!

---

## 🎯 User Experience

### Natural Language → Rich UI

**User:** "Create an invoice for $500 to john@example.com for consulting"

**AI understands and shows:**
1. ✅ Formatted invoice card
2. 📋 Line items table
3. 💳 Payment link
4. 📱 QR code (if available)
5. ✨ Next action suggestions

**User:** "List my unpaid invoices"

**AI shows:**
1. 📊 Filtered table
2. 📈 Summary statistics
3. 💡 Quick actions

---

## 🚀 Benefits

### For Users
- ✅ **Professional appearance**
- ✅ **Easy to scan**
- ✅ **Actionable buttons**
- ✅ **Visual status indicators**
- ✅ **Mobile-friendly QR codes**

### For Your App
- ✅ **Better engagement**
- ✅ **Clearer information**
- ✅ **Higher conversion**
- ✅ **Professional brand**
- ✅ **Reduced support questions**

---

## 📝 Customization

Want to customize the formatting? Edit `src/formatters.ts`:

### Change Emoji
```typescript
function getStatusEmoji(status: string): string {
  const statusMap = {
    'PAID': '💰', // Change to whatever you like
    'SENT': '✉️',
    // ...
  };
}
```

### Modify Layout
```typescript
export function formatInvoiceForChatGPT(invoice: any): string {
  let message = `## Your Custom Header\n\n`;
  // Add your custom formatting
  return message;
}
```

### Add Fields
```typescript
// Add tax information
if (invoice.tax) {
  message += `**Tax:** ${invoice.tax.percent}%\n`;
}
```

---

## 🧪 Testing

### Test in ChatGPT
```bash
# Start server
npm run dev:chatgpt

# Create invoice
curl -X POST http://localhost:3334/actions/create_invoice \
  -H "Content-Type: application/json" \
  -d '{"recipient_email":"test@example.com","currency":"USD","items":[{"name":"Test","quantity":1,"unit_amount":100}]}'

# Check the "formatted" field in response
```

### Test in Claude
```bash
# Start MCP server
npm run dev

# Use Claude Desktop to test
# The structuredContent will render automatically
```

---

## ✅ Current Status

Your app now provides:
- ✅ **Rich UI rendering** for ChatGPT
- ✅ **Structured content** for Claude (MCP)
- ✅ **Emoji status indicators**
- ✅ **Markdown tables**
- ✅ **Clickable links**
- ✅ **QR code support**
- ✅ **Professional formatting**

**Both platforms show beautiful, actionable UIs!** 🎉

