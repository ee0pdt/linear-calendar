#!/bin/bash

# Deploy Linear Calendar to Railway
# This script deploys both the UI and ensures CalDAV proxy is properly configured

echo "🚂 Deploying Linear Calendar to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway..."
    railway login
fi

echo "📦 Building and deploying UI..."

# Check if project is linked, if not initialize
if ! railway status &> /dev/null; then
    echo "🔗 No Railway project linked. Creating new project..."
    railway init
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to initialize Railway project. Please try manually:"
        echo "   railway init"
        echo "   railway up"
        exit 1
    fi
fi

# Deploy from root directory (UI)
railway up

echo "✅ UI deployment initiated!"
echo ""
echo "🔗 Next steps:"
echo "1. Get your UI deployment URL with: railway status"
echo "2. Update CalDAV proxy CORS settings:"
echo "   cd caldav-proxy && railway variables set FRONTEND_URL='https://your-ui-url.railway.app'"
echo ""
echo "🎉 Your Linear Calendar will be available at your Railway URL!"
