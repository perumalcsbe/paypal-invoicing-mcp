# 🚀 Deploy to Render.com

## Quick Setup (5 minutes)

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account (recommended)
3. Authorize Render to access your repositories

### Step 2: Deploy from Dashboard

#### Option A: Using Blueprint (Automatic)
1. Click **"New"** → **"Blueprint"**
2. Connect your GitHub repository: `perumalcsbe/paypal-invoicing-mcp`
3. Render will detect `render.yaml` and configure everything automatically
4. Click **"Apply"**

#### Option B: Manual Setup
1. Click **"New"** → **"Web Service"**
2. Connect your GitHub repository: `perumalcsbe/paypal-invoicing-mcp`
3. Configure:
   - **Name:** `paypal-invoicing-mcp`
   - **Region:** Oregon (or closest to you)
   - **Branch:** `main`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free

### Step 3: Add Environment Variables

In Render Dashboard → Environment:

```
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_client_secret_here
PAYPAL_ENVIRONMENT=SANDBOX
OPENAI_API_KEY=your_openai_key (optional)
PORT=3333
NODE_ENV=production
```

**Important:** Click **"Save Changes"** after adding variables!

### Step 4: Deploy

1. Click **"Create Web Service"** or **"Manual Deploy"**
2. Wait 2-3 minutes for build
3. Your app will be live at: `https://paypal-invoicing-mcp.onrender.com`

### Step 5: Test Your Deployment

```bash
# Health check
curl https://paypal-invoicing-mcp.onrender.com/health

# MCP endpoint
curl https://paypal-invoicing-mcp.onrender.com/mcp
```

### Step 6: Add to ChatGPT

Now use your stable Render URL in ChatGPT:

```
MCP Server URL:
https://paypal-invoicing-mcp.onrender.com/mcp

Authentication: No Auth
```

## ✨ Benefits of Render.com

✅ **Stable URL** - No random codespace names
✅ **Always On** - Free tier includes 750 hours/month
✅ **Auto-Deploy** - Commits to main branch auto-deploy
✅ **Free SSL** - HTTPS included
✅ **Health Checks** - Automatic monitoring
✅ **Logs** - View server logs in dashboard

## ⚠️ Free Tier Limitations

- Spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds (cold start)
- 750 hours/month (plenty for development)

**Tip:** ChatGPT will wake up your service automatically!

## 🔧 Troubleshooting

### Build Fails
- Check logs in Render dashboard
- Make sure all dependencies are in `package.json`
- Verify `npm run build` works locally

### Environment Variables Missing
- Go to Environment tab
- Add all required variables
- Click "Save Changes"
- Manually redeploy

### Service Won't Start
- Check logs for errors
- Verify `PORT` is set to `3333`
- Make sure `npm start` works locally

### Health Check Fails
- Endpoint: `/health`
- Should return: `{"status":"healthy"}`
- Check if server is binding to `0.0.0.0` (it is!)

## 🔄 Auto-Deploy Setup

Render automatically deploys when you push to GitHub:

```bash
# Make a change
git add .
git commit -m "Update feature"
git push origin main

# Render auto-deploys in ~2 minutes!
```

## 📊 Monitoring

In Render Dashboard you can see:
- **Logs** - Real-time server logs
- **Metrics** - CPU/Memory usage
- **Events** - Deploy history
- **Health** - Uptime status

## 💰 Upgrade Options (Optional)

If you need more than free tier:

- **Starter ($7/mo)** - No spin-down, 512MB RAM
- **Standard ($25/mo)** - 2GB RAM, priority support

Free tier is fine for development and testing!

## 🌐 Your URLs

After deployment:

- **Web Service:** `https://paypal-invoicing-mcp.onrender.com`
- **MCP Endpoint:** `https://paypal-invoicing-mcp.onrender.com/mcp`
- **Health Check:** `https://paypal-invoicing-mcp.onrender.com/health`
- **OpenAPI:** `https://paypal-invoicing-mcp.onrender.com/openapi.json`

## 🎉 Next Steps

1. Deploy to Render ✅
2. Test endpoints
3. Add to ChatGPT Apps
4. Start invoicing! 🧾

No more Codespaces issues! 🚀

