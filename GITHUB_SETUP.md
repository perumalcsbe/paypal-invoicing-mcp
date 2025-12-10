# 🚀 Push to GitHub & Open in Codespaces

## Step 1: Initialize Git (if not already done)

```bash
cd /Users/pepalani/work/paypal-invoicing-mcp

# Initialize git (if needed)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: PayPal Invoicing MCP Server"
```

## Step 2: Connect to Your GitHub Repository

Your repository: **https://github.com/perumalcsbe/paypal-invoicing-mcp**

```bash
# Add remote
git remote add origin https://github.com/perumalcsbe/paypal-invoicing-mcp.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Set Up Codespaces Secrets

1. Go to https://github.com/perumalcsbe/paypal-invoicing-mcp/settings/secrets/codespaces
2. Click "New repository secret"
3. Add these three secrets:

   **Secret 1:**
   - Name: `PAYPAL_CLIENT_ID`
   - Value: Your PayPal Client ID

   **Secret 2:**
   - Name: `PAYPAL_CLIENT_SECRET`
   - Value: Your PayPal Client Secret

   **Secret 3:**
   - Name: `PAYPAL_ENVIRONMENT`
   - Value: `sandbox` (or `production` for live)

## Step 4: Open in Codespaces

1. Go to https://github.com/perumalcsbe/paypal-invoicing-mcp
2. Click the green "Code" button
3. Click "Codespaces" tab
4. Click "Create codespace on main"

## Step 5: Wait for Setup

The Codespace will automatically:
- ✅ Install Node.js 20
- ✅ Install all npm dependencies
- ✅ Configure VS Code with extensions
- ✅ Forward port 3333

This takes about 2-3 minutes the first time.

## Step 6: Run the Server

Once the Codespace is ready:

```bash
# The terminal will already be open
npm run dev
```

You'll see:
```
[INFO] MCP server listening on port 3333/mcp
[INFO] Health check available at /health
```

## Step 7: Access Your Server

1. Look for the notification: "Your application running on port 3333 is available"
2. Click "Open in Browser" or go to the "Ports" tab
3. Your server URL will be something like: `https://xxx-3333.app.github.dev`

## Testing Your Server

```bash
# In the Codespace terminal:
curl http://localhost:3333/health

# From outside (use your forwarded URL):
curl https://YOUR-CODESPACE-URL-3333.app.github.dev/health
```

## What's Configured

Your Codespace includes:

✅ **Node.js 20** - Latest LTS version
✅ **TypeScript** - Full support with auto-completion
✅ **Hot Reload** - Changes auto-reload with `npm run dev`
✅ **Port Forwarding** - Port 3333 automatically exposed
✅ **VS Code Extensions**:
  - ESLint
  - Prettier (format on save)
  - TypeScript
  - Code Spell Checker

## Connecting to Claude Desktop

Once your Codespace is running, add this to Claude Desktop's MCP settings:

```json
{
  "mcpServers": {
    "paypal-invoicing": {
      "url": "https://YOUR-CODESPACE-URL-3333.app.github.dev/mcp"
    }
  }
}
```

Replace `YOUR-CODESPACE-URL` with your actual forwarded URL from the Ports tab.

## Managing Your Codespace

### Stopping

Codespaces auto-stop after 30 minutes of inactivity. You can also manually stop:
- Click your avatar → "Your codespaces" → Stop

### Restarting

To restart your Codespace:
1. Go to https://github.com/codespaces
2. Find your codespace
3. Click "..." → "Resume"

### Deleting

To delete a Codespace:
1. Go to https://github.com/codespaces
2. Find your codespace
3. Click "..." → "Delete"

## Cost

GitHub Free includes:
- **120 core hours/month** free for Codespaces
- This 2-core Codespace = **60 hours/month free**
- That's about 2 hours per day!

Perfect for development and testing!

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Set up Codespaces secrets
3. ✅ Open in Codespaces
4. ✅ Run `npm run dev`
5. ✅ Test your MCP server
6. ✅ Connect to Claude Desktop

**You're all set!** 🎉

