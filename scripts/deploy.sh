#!/bin/bash

# VSL-Alchemist Deployment Script for Render
# This script helps prepare and deploy the application to Render

set -e

echo "🚀 VSL-Alchemist Deployment Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if required files exist
echo "📋 Checking required files..."

required_files=(
    "package.json"
    "render.yaml"
    "Dockerfile"
    ".dockerignore"
    "src/server.ts"
    "tsconfig.json"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - MISSING"
        exit 1
    fi
done

# Build the application locally to test
echo ""
echo "🔨 Building application..."
npm install
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# Check environment variables
echo ""
echo "🔑 Checking environment variables..."

required_env_vars=(
    "DATABASE_URL"
    "JWT_SECRET"
)

optional_env_vars=(
    "GOOGLE_API_KEY"
    "OPENAI_API_KEY"
)

echo "Required environment variables:"
for var in "${required_env_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "⚠️  $var - NOT SET (will need to be set in Render)"
    else
        echo "✅ $var - SET"
    fi
done

echo ""
echo "Optional environment variables:"
for var in "${optional_env_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "⚠️  $var - NOT SET (optional)"
    else
        echo "✅ $var - SET"
    fi
done

# Test the application
echo ""
echo "🧪 Testing application..."
node dist/server.js &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test health endpoint
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Stop test server
kill $SERVER_PID 2>/dev/null || true

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to Git repository"
echo "2. Go to https://render.com"
echo "3. Create new Web Service"
echo "4. Connect your Git repository"
echo "5. Set environment variables in Render dashboard"
echo "6. Deploy!"
echo ""
echo "📚 For detailed instructions, see RENDER_DEPLOYMENT.md" 