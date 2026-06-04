#!/bin/bash

# AI Video Summarization Feature - Installation & Quick Start

echo "========================================="
echo "YouTube Clone - Video Summarization"
echo "Installation & Quick Start Script"
echo "========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "✅ Creating .env from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your API keys:"
    echo "   - ASSEMBLYAI_API_KEY"
    echo "   - GEMINI_API_KEY"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d node_modules ]; then
    echo "✅ Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "========================================="
echo "✅ Setup Complete!"
echo "========================================="
echo ""
echo "📝 Configuration:"
echo "   - Video Model: Updated with summary fields"
echo "   - Routes: Registered in app.js"
echo "   - Dependencies: Installed (@google/generative-ai, axios)"
echo ""
echo "🚀 Start the server:"
echo "   npm run dev"
echo ""
echo "🧪 Test endpoints:"
echo "   - POST   /api/v1/videos/:videoId/generate-summary"
echo "   - GET    /api/v1/videos/:videoId/summary"
echo ""
echo "📚 Documentation:"
echo "   - SUMMARIZATION_FEATURE_GUIDE.md (complete guide)"
echo "   - SETUP_CHECKLIST.md (quick reference)"
echo "   - postman_collection.json (Postman requests)"
echo ""
echo "========================================="
