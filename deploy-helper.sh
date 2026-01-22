#!/bin/bash

# Deployment Helper Script for Render
# This script helps you prepare your app for deployment

echo "========================================="
echo "  Bus Booking App - Render Deployment"
echo "========================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "⚠️  Git not initialized. Initializing..."
    git init
    echo "✅ Git initialized"
fi

# Check for .env.production
if [ ! -f frontend/.env.production ]; then
    echo "⚠️  frontend/.env.production not found!"
    echo "Please create it with your production URLs"
    exit 1
fi

echo "📋 Checking files..."
echo ""

# List important files
echo "Backend files:"
ls -la backend/server.js backend/package.json backend/.env 2>/dev/null || echo "⚠️  Some backend files missing"
echo ""

echo "Frontend files:"
ls -la frontend/package.json frontend/.env.production 2>/dev/null || echo "⚠️  Some frontend files missing"
echo ""

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "📝 Uncommitted changes found. Staging all files..."
    git add .
    
    echo ""
    echo "Enter commit message (or press Enter for default):"
    read commit_msg
    
    if [ -z "$commit_msg" ]; then
        commit_msg="Prepare for Render deployment"
    fi
    
    git commit -m "$commit_msg"
    echo "✅ Changes committed"
else
    echo "✅ No uncommitted changes"
fi

echo ""
echo "========================================="
echo "  Ready for Render Deployment!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Push to GitHub:"
echo "   git remote add origin <your-repo-url>"
echo "   git push -u origin main"
echo ""
echo "2. Deploy Backend on Render:"
echo "   - Go to https://dashboard.render.com"
echo "   - New Web Service → Connect GitHub"
echo "   - Root Directory: backend"
echo "   - Build: npm install"
echo "   - Start: npm start"
echo ""
echo "3. Deploy Frontend on Render:"
echo "   - New Static Site → Connect GitHub"
echo "   - Root Directory: frontend"
echo "   - Build: npm install && npm run build"
echo "   - Publish: dist"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
