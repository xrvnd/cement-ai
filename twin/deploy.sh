#!/bin/bash

# Cement Plant Digital Twin - Firebase Deployment Script
# This script automates the deployment process to Firebase

set -e  # Exit on any error

echo "🏭 Cement Plant Digital Twin - Firebase Deployment"
echo "=================================================="

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

# Check if required tools are installed
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
    
    if ! command -v firebase &> /dev/null; then
        print_error "Firebase CLI is not installed. Please install it with: npm install -g firebase-tools"
        exit 1
    fi
    
    if ! command -v gcloud &> /dev/null; then
        print_error "Google Cloud CLI is not installed. Please install it."
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

# Check if user is logged in
check_auth() {
    print_status "Checking authentication..."
    
    if ! firebase projects:list &> /dev/null; then
        print_error "Not logged in to Firebase. Please run: firebase login"
        exit 1
    fi
    
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        print_error "Not logged in to Google Cloud. Please run: gcloud auth login"
        exit 1
    fi
    
    print_success "Authentication verified"
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    
    # Clean install dependencies (always fresh install for deployment)
    print_status "Installing frontend dependencies (clean install)..."
    npm ci --only=production || npm install --production
    
    # Build for production
    print_status "Building React app for production..."
    npm run build
    
    if [ ! -d "build" ]; then
        print_error "Build failed. No build directory found."
        exit 1
    fi
    
    print_success "Frontend built successfully"
}

# Prepare backend
prepare_backend() {
    print_status "Preparing backend for deployment..."
    
    cd backend
    
    # Copy Firebase-specific requirements
    if [ -f "requirements-firebase.txt" ]; then
        cp requirements-firebase.txt requirements.txt
        print_status "Using Firebase-optimized requirements"
    fi
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from example..."
        if [ -f "env_example.txt" ]; then
            cp env_example.txt .env
            print_warning "Please update .env file with your production values"
        else
            print_error "No .env or env_example.txt file found"
            exit 1
        fi
    fi
    
    cd ..
    print_success "Backend prepared for deployment"
}

# Deploy to Firebase
deploy_firebase() {
    print_status "Deploying to Firebase..."
    
    # Deploy hosting (frontend)
    print_status "Deploying frontend to Firebase Hosting..."
    firebase deploy --only hosting
    
    # Deploy functions (backend)
    print_status "Deploying backend to Firebase Functions..."
    firebase deploy --only functions
    
    print_success "Deployment completed successfully"
}

# Show deployment information
show_deployment_info() {
    print_status "Getting deployment information..."
    
    # Get project ID
    PROJECT_ID=$(firebase use --project | grep -o 'Using project [^[:space:]]*' | cut -d' ' -f3)
    
    if [ -n "$PROJECT_ID" ]; then
        echo ""
        echo "🎉 Deployment Complete!"
        echo "======================"
        echo "Frontend URL: https://${PROJECT_ID}.web.app"
        echo "API URL: https://us-central1-${PROJECT_ID}.cloudfunctions.net"
        echo "Firebase Console: https://console.firebase.google.com/project/${PROJECT_ID}"
        echo ""
        echo "📊 Next Steps:"
        echo "1. Test your application at the frontend URL"
        echo "2. Check Firebase Console for logs and monitoring"
        echo "3. Configure custom domain if needed"
        echo "4. Set up monitoring and alerts"
        echo ""
    else
        print_warning "Could not determine project ID. Check Firebase Console for URLs."
    fi
}

# Main deployment function
main() {
    echo "Starting deployment process..."
    echo ""
    
    check_prerequisites
    check_auth
    build_frontend
    prepare_backend
    deploy_firebase
    show_deployment_info
    
    print_success "Deployment process completed!"
}

# Handle script interruption
trap 'print_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"
