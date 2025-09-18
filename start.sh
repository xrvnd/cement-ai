#!/bin/bash

echo "🏭 Starting Cement Plant Digital Twin Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Copy Excel data files to public directory if they don't exist
if [ ! -f "public/data/kiln_simulation_data.xlsx" ]; then
    echo "📊 Setting up Excel data files..."
    mkdir -p public/data
    cp data/kiln_simulation_data.xlsx public/data/ 2>/dev/null || echo "⚠️  Kiln data file not found"
    cp data/mill_simulation_data.xlsx public/data/ 2>/dev/null || echo "⚠️  Mill data file not found"
fi

echo "🚀 Starting development server..."
echo "🌐 Application will be available at: http://localhost:3000"
echo "📖 Press Ctrl+C to stop the server"

npm start
