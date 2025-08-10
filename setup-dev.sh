#!/bin/bash

set -e  # Exit on any error

echo "🎵 Setting up Music Modes App development environment..."
echo "=================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if we're in the right directory
if [[ ! -f "docker-compose.yml" ]] || [[ ! -d "frontend" ]] || [[ ! -d "backend" ]]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

# Check Node.js version
print_info "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 20+ and npm 10+"
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [[ "$NODE_VERSION" -lt 20 ]]; then
    print_error "Node.js version $NODE_VERSION is too old. Please install Node.js 20+"
    exit 1
fi
print_status "Node.js version $(node -v) is compatible"

# Check Python version
print_info "Checking Python version..."
if ! command -v python3 &> /dev/null; then
    print_error "Python3 is not installed. Please install Python 3.8+"
    exit 1
fi

PYTHON_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
if ! python3 -c "import sys; sys.exit(0 if sys.version_info >= (3, 8) else 1)"; then
    print_error "Python version $PYTHON_VERSION is too old. Please install Python 3.8+"
    exit 1
fi
print_status "Python version $PYTHON_VERSION is compatible"

# Install pre-commit
print_info "Installing pre-commit..."
if ! command -v pre-commit &> /dev/null; then
    if command -v pip3 &> /dev/null; then
        pip3 install pre-commit
    elif command -v pip &> /dev/null; then
        pip install pre-commit
    else
        print_error "pip is not available. Please install pip and try again"
        exit 1
    fi
    print_status "Pre-commit installed successfully"
else
    print_status "Pre-commit is already installed"
fi

# Install root dependencies (if package.json exists)
if [[ -f "package.json" ]]; then
    print_info "Installing root dependencies..."
    npm install
    print_status "Root dependencies installed"
fi

# Install frontend dependencies
print_info "Installing frontend dependencies..."
cd frontend
npm install
print_status "Frontend dependencies installed"
cd ..

# Install backend dependencies
print_info "Installing backend dependencies..."
cd backend
if [[ -f "requirements-dev.txt" ]]; then
    print_info "Installing development dependencies..."
    pip3 install -r requirements-dev.txt
elif [[ -f "requirements.txt" ]]; then
    pip3 install -r requirements.txt
fi
print_status "Backend dependencies installed"
cd ..

# Install pre-commit hooks
print_info "Installing pre-commit hooks..."
pre-commit install
pre-commit install --hook-type pre-push
print_status "Pre-commit hooks installed successfully"

# Initialize secrets detection baseline (if not exists)
if [[ ! -f ".secrets.baseline" ]]; then
    print_info "Creating secrets detection baseline..."
    detect-secrets scan --baseline .secrets.baseline || print_warning "Secrets detection baseline creation failed (will be created on first run)"
fi

# Run initial validation
print_info "Running initial quality checks..."
echo "===================================== Initial Frontend Checks ====================================="
cd frontend
if npm run type-check; then
    print_status "TypeScript compilation passed"
else
    print_warning "TypeScript compilation issues detected - review and fix before committing"
fi

if npm run lint; then
    print_status "ESLint checks passed"
else
    print_warning "ESLint issues detected - run 'npm run lint:fix' to auto-fix"
fi
cd ..

# Test pre-commit hooks
print_info "Testing pre-commit installation..."
if pre-commit run --all-files --verbose; then
    print_status "Pre-commit hooks are working correctly"
else
    print_warning "Some pre-commit hooks failed - this is normal for the first run"
    print_info "Run 'pre-commit run --all-files' again to fix any remaining issues"
fi

echo ""
echo "=================================================================================================="
echo -e "${GREEN}🎉 Development environment setup complete!${NC}"
echo "=================================================================================================="
echo ""
echo "📋 Next Steps:"
echo "   1. Review and fix any linting issues: cd frontend && npm run lint:fix"
echo "   2. Run the full test suite: npm run test:ci (from root) or cd frontend && npm run test:ci"
echo "   3. Start development servers: docker-compose up OR npm run dev (from root, if configured)"
echo "   4. Run E2E tests: cd frontend && npm run test:e2e"
echo ""
echo "🔧 Development Commands:"
echo "   • npm run lint (check code style)"
echo "   • npm run lint:fix (fix code style issues)"
echo "   • npm run test (run unit tests)"
echo "   • npm run test:e2e (run Playwright E2E tests)"
echo "   • pre-commit run --all-files (run all quality checks)"
echo ""
echo "📖 See DEVELOPMENT.md for detailed workflow information"
echo "🎵 Happy coding with Music Modes App!"
