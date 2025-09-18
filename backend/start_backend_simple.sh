#!/bin/bash

# Cement Plant Digital Twin Backend Startup Script (Simplified)
# Compatible with Python 3.13

echo "🏭 Starting Cement Plant Digital Twin Backend (Simplified)..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Get Python version
PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
echo "🐍 Using Python $PYTHON_VERSION"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install minimal dependencies
echo "📥 Installing minimal dependencies..."
pip install --upgrade pip
pip install -r requirements_minimal.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file..."
    cat > .env << EOF
# Cement Plant Digital Twin Environment Variables
ENVIRONMENT=development
DEBUG=true
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000"]
EOF
    echo "📝 Created .env file with default settings"
fi

# Create data directory
mkdir -p data
mkdir -p logs

# Start the simplified FastAPI server
echo "🚀 Starting simplified FastAPI server..."
echo "Backend will be available at: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo "Health Check: http://localhost:8000/health"
echo ""
echo "✨ Features available:"
echo "   📊 Real-time sensor data simulation"
echo "   🔥 Kiln operation monitoring"
echo "   ⚙️ Mill performance tracking"
echo "   🚨 Alert system"
echo "   📈 Dashboard summary"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 main_simple_fixed.py
