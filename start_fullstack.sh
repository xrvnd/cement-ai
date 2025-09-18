#!/bin/bash

# Cement Plant Digital Twin Full-Stack Startup Script

echo "🏭 Starting Cement Plant Digital Twin Full-Stack Application..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists python3; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install Node.js and npm."
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Start backend in background
echo "🚀 Starting Python backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
source venv/bin/activate
pip install -r requirements_minimal.txt > /dev/null 2>&1

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    cp env_example.txt .env
    echo "📝 Created .env file - please update with your API keys"
fi

# Generate data if not exists
if [ ! -f "data/raw_grinding_operations.xlsx" ]; then
    echo "📊 Generating sample data..."
    python3 generate_data.py
fi

# Start backend server in background
echo "🔄 Starting FastAPI backend server..."
python3 main_simple_fixed.py > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Check if backend is running
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo "✅ Backend started successfully (PID: $BACKEND_PID)"
else
    echo "❌ Backend failed to start. Check backend.log for details."
    exit 1
fi

# Start frontend
echo "🎨 Starting React frontend..."
cd ..

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start frontend server
echo "🚀 Starting React development server..."
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📱 Available Pages:"
echo "   🏭 Main View: Digital twin visualization"
echo "   🤖 PlantGPT: AI-powered chat assistant"
echo "   📊 Dashboard: Operations dashboard"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start frontend (this will block)
npm start

# If we reach here, frontend stopped, so cleanup
cleanup
