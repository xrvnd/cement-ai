#!/bin/bash

# Cement Plant Digital Twin - Development Setup Script
# This script sets up the development environment

set -e  # Exit on any error

echo "🏭 Cement Plant Digital Twin - Development Setup"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16 or higher."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.11 or higher."
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

# Setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    print_success "Frontend setup completed"
}

# Setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    print_status "Activating virtual environment..."
    source venv/bin/activate
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    pip install -r requirements.txt
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        print_warning "Creating .env file from example..."
        cp env_example.txt .env
        print_warning "Please update .env file with your API keys"
    fi
    
    cd ..
    print_success "Backend setup completed"
}

# Show setup information
show_setup_info() {
    echo ""
    echo "🎉 Development Setup Complete!"
    echo "============================="
    echo ""
    echo "📋 Next Steps:"
    echo "1. Update backend/.env with your API keys"
    echo "2. Run './start_fullstack.sh' to start development servers"
    echo "3. Open http://localhost:3000 in your browser"
    echo ""
    echo "🔧 Available Commands:"
    echo "  ./start_fullstack.sh  - Start both frontend and backend"
    echo "  ./deploy.sh          - Deploy to Firebase"
    echo "  npm start            - Start frontend only"
    echo "  cd backend && python main.py - Start backend only"
    echo ""
}

# Main setup function
main() {
    echo "Starting development setup..."
    echo ""
    
    check_prerequisites
    setup_frontend
    setup_backend
    show_setup_info
    
    print_success "Development setup completed!"
}

# Run main function
main "$@"
