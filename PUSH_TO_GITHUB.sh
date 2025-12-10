#!/bin/bash

# Quick script to push your code to GitHub
# Repository: https://github.com/perumalcsbe/paypal-invoicing-mcp

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║        Pushing PayPal MCP Server to GitHub                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the right directory?"
    exit 1
fi

echo "📦 Checking project status..."
echo ""

# Initialize git if needed
if [ ! -d ".git" ]; then
    echo "🔧 Initializing git repository..."
    git init
    git branch -M main
fi

# Add all files
echo "📝 Staging all files..."
git add .

# Show status
echo ""
echo "📋 Files to be committed:"
git status --short

echo ""
read -p "Continue with commit? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 1
fi

# Commit
echo ""
echo "💾 Committing changes..."
git commit -m "Setup PayPal Invoicing MCP Server for GitHub Codespaces

- Configured for GitHub Codespaces
- Added MCP server with PayPal Agent Toolkit integration
- 4 invoice tools: create, send, get, list
- TypeScript with hot-reload
- Health check endpoints
- GitHub Actions CI pipeline
"

# Check if remote exists
if ! git remote get-url origin &>/dev/null; then
    echo ""
    echo "🔗 Adding GitHub remote..."
    git remote add origin https://github.com/perumalcsbe/paypal-invoicing-mcp.git
fi

# Push
echo ""
echo "🚀 Pushing to GitHub..."
git push -u origin main

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    ✅ PUSH SUCCESSFUL!                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "🎉 Your code is now on GitHub!"
echo ""
echo "Next steps:"
echo ""
echo "1. Set Codespaces secrets:"
echo "   https://github.com/perumalcsbe/paypal-invoicing-mcp/settings/secrets/codespaces"
echo ""
echo "2. Open in Codespaces:"
echo "   https://github.com/perumalcsbe/paypal-invoicing-mcp"
echo "   Click: Code → Codespaces → Create codespace on main"
echo ""
echo "3. In Codespace, run:"
echo "   npm run dev"
echo ""
echo "📖 Full guide: GITHUB_SETUP.md"
echo ""

