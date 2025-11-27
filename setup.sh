#!/bin/bash

# Electoral Systems Simulator - Quick Start Script

echo "🗳️  Electoral Systems Simulator - Python Backend Setup"
echo "======================================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"
echo ""

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip not found. Please install pip."
    exit 1
fi

echo "✅ pip found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pip3 install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "======================================================"
echo "🚀 Setup Complete!"
echo ""
echo "To start the backend server, run:"
echo "  python3 backend.py"
echo ""
echo "Then open index.html in your browser."
echo "The frontend will automatically connect to the backend."
echo ""
echo "======================================================"

