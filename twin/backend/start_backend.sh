#!/bin/bash

# Cement Plant Digital Twin Backend Startup Script

echo "🏭 Starting Cement Plant Digital Twin Backend..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file..."
    cp env_example.txt .env
    echo "📝 Please update .env file with your API keys and configuration"
fi

# Create data directory
mkdir -p data
mkdir -p chroma_db

# Generate sample data if not exists
if [ ! -f "data/raw_grinding_operations.xlsx" ]; then
    echo "📊 Generating sample data..."
    python3 generate_data.py
fi

# Start the FastAPI server
echo "🚀 Starting FastAPI server..."
echo "Backend will be available at: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo "Press Ctrl+C to stop the server"

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
