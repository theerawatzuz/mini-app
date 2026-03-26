#!/bin/bash

# Weather Map Application - Setup Verification Script
# This script verifies that both backend and frontend are properly set up

echo "🔍 Weather Map Application - Setup Verification"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
ALL_CHECKS_PASSED=true

# Function to print success
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
print_error() {
    echo -e "${RED}✗${NC} $1"
    ALL_CHECKS_PASSED=false
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check Node.js version
echo "Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        print_success "Node.js $NODE_VERSION (>= 18 required)"
    else
        print_error "Node.js $NODE_VERSION found, but version 18+ is required"
    fi
else
    print_error "Node.js is not installed"
fi
echo ""

# Check npm
echo "Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_success "npm $NPM_VERSION"
else
    print_error "npm is not installed"
fi
echo ""

# Check Docker (optional)
echo "Checking Docker (optional)..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_success "$DOCKER_VERSION"
else
    print_warning "Docker is not installed (optional, but recommended)"
fi
echo ""

# Check backend setup
echo "Checking backend setup..."
if [ -d "backend" ]; then
    print_success "Backend directory exists"
    
    # Check package.json
    if [ -f "backend/package.json" ]; then
        print_success "backend/package.json exists"
    else
        print_error "backend/package.json not found"
    fi
    
    # Check node_modules
    if [ -d "backend/node_modules" ]; then
        print_success "backend/node_modules exists (dependencies installed)"
    else
        print_warning "backend/node_modules not found (run: cd backend && npm install)"
    fi
    
    # Check .env file
    if [ -f "backend/.env" ]; then
        print_success "backend/.env exists"
        
        # Check for required environment variables
        if grep -q "WEATHER_API_KEY=" backend/.env; then
            if grep -q "WEATHER_API_KEY=your_api_key_here" backend/.env; then
                print_warning "WEATHER_API_KEY is set to placeholder value"
            else
                print_success "WEATHER_API_KEY is configured"
            fi
        else
            print_error "WEATHER_API_KEY not found in backend/.env"
        fi
        
        if grep -q "WEATHER_PROVIDER=" backend/.env; then
            print_success "WEATHER_PROVIDER is configured"
        else
            print_error "WEATHER_PROVIDER not found in backend/.env"
        fi
    else
        print_warning "backend/.env not found (copy from backend/.env.example)"
    fi
else
    print_error "Backend directory not found"
fi
echo ""

# Check frontend setup
echo "Checking frontend setup..."
if [ -d "frontend" ]; then
    print_success "Frontend directory exists"
    
    # Check package.json
    if [ -f "frontend/package.json" ]; then
        print_success "frontend/package.json exists"
    else
        print_error "frontend/package.json not found"
    fi
    
    # Check node_modules
    if [ -d "frontend/node_modules" ]; then
        print_success "frontend/node_modules exists (dependencies installed)"
    else
        print_warning "frontend/node_modules not found (run: cd frontend && npm install)"
    fi
    
    # Check .env file
    if [ -f "frontend/.env" ]; then
        print_success "frontend/.env exists"
        
        # Check for required environment variables
        if grep -q "VITE_API_URL=" frontend/.env; then
            print_success "VITE_API_URL is configured"
        else
            print_error "VITE_API_URL not found in frontend/.env"
        fi
    else
        print_warning "frontend/.env not found (copy from frontend/.env.example)"
    fi
else
    print_error "Frontend directory not found"
fi
echo ""

# Check docker-compose setup
echo "Checking Docker Compose setup..."
if [ -f "docker-compose.yml" ]; then
    print_success "docker-compose.yml exists"
    
    if [ -f ".env" ]; then
        print_success "Root .env file exists for Docker Compose"
    else
        print_warning "Root .env file not found (needed for docker-compose)"
    fi
else
    print_error "docker-compose.yml not found"
fi
echo ""

# Summary
echo "================================================"
if [ "$ALL_CHECKS_PASSED" = true ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Ensure you have a valid Weather API key"
    echo "2. Run 'docker-compose up' to start both services"
    echo "   OR"
    echo "   Run backend: cd backend && npm run dev"
    echo "   Run frontend: cd frontend && npm run dev"
    echo ""
    echo "See DEVELOPMENT.md for more details"
else
    echo -e "${RED}✗ Some checks failed${NC}"
    echo ""
    echo "Please fix the issues above before proceeding."
    echo "See DEVELOPMENT.md for setup instructions"
fi
echo "================================================"
