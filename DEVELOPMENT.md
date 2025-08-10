# Music Modes App - Development Guide

## 🎵 Quick Start

**New to the project?** Run this single command from the project root:

```bash
./setup-dev.sh
```

This will:
- ✅ Install all dependencies (frontend, backend, tools)
- ✅ Set up pre-commit hooks for instant code quality feedback  
- ✅ Validate your development environment
- ✅ Run initial quality checks

---

## 📋 Development Workflow

### 1. **Make Your Changes**
Edit files in `frontend/src/` or `backend/app/` directories

### 2. **Quality Checks (Automatic on Commit)**
Pre-commit hooks run automatically when you commit:

```bash
git add .
git commit -m "Your commit message"
# Pre-commit hooks run automatically:
# ✓ ESLint auto-fix
# ✓ TypeScript compilation check  
# ✓ Unit & component tests for changed files
# ✓ Python formatting (Black, isort)
# ✓ Python linting (flake8, mypy)
# ✓ Security scanning (bandit)
```

### 3. **Manual Quality Commands** (if needed)

**Frontend Quality:**
```bash
cd frontend

# Fix code style issues
npm run lint:fix

# Check TypeScript compilation
npm run type-check

# Run all tests
npm run test:ci

# Run tests in watch mode  
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only component tests  
npm run test:component

# Run E2E tests
npm run test:e2e
```

**Backend Quality:**
```bash
cd backend

# Format Python code
black .
isort .

# Check code quality
flake8 .
mypy .

# Security scan
bandit -r app/ -f json
```

**Full Project Quality:**
```bash
# Run all pre-commit hooks manually
pre-commit run --all-files

# Update pre-commit hook versions
pre-commit autoupdate
```

### 4. **Running the Application**

**Option A: Docker (Recommended for full-stack development)**
```bash
docker-compose up
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

**Option B: Individual Services**
```bash
# Terminal 1: Frontend
cd frontend && npm run dev
# Runs on http://localhost:5173

# Terminal 2: Backend  
cd backend && uvicorn app.main:app --reload --port 8000
# Runs on http://localhost:8000
```

---

## 🧪 Testing Strategy

### **Unit Tests** (Fast - < 1 second)
- **Purpose:** Test individual functions and utilities
- **Location:** `frontend/tests/unit/`
- **Run:** `npm run test:unit`
- **Scope:** Pure functions, services, utilities

### **Component Tests** (Fast - < 5 seconds) 
- **Purpose:** Test React components in isolation
- **Location:** `frontend/tests/component/`
- **Run:** `npm run test:component`
- **Scope:** Component rendering, user interactions, props

### **E2E Tests** (Slow - 30+ seconds)
- **Purpose:** Test complete user workflows with MIDI support
- **Location:** `frontend/tests/e2e/`
- **Run:** `npm run test:e2e`
- **Scope:** Full application workflows, MIDI functionality, cross-browser testing

**Test Development Tips:**
- Write unit tests for services and utilities
- Write component tests for React components
- Write E2E tests for critical user workflows
- Use `npm run test:watch` during development
- Maintain high test coverage with `npm run test:coverage`

---

## 🚀 Technology Stack

### **Frontend**
- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite 6.2.0
- **Testing:** Vitest 3.2.4 + Playwright 1.54.2
- **Styling:** TailwindCSS 3.4.17
- **UI Components:** Radix UI primitives
- **Code Quality:** ESLint 9.32.0 with TypeScript support

### **Backend**  
- **Framework:** FastAPI 0.111.0
- **Server:** Uvicorn 0.30.1 / Gunicorn 22.0.0
- **Music Theory:** librosa 0.10.1, music21 9.1.0
- **Data Validation:** Pydantic 2.7.4
- **Code Quality:** Black, isort, flake8, mypy, bandit

### **Development Tools**
- **Containerization:** Docker + Docker Compose
- **Git Hooks:** pre-commit 3.0+
- **CI/CD:** GitHub Actions with Claude Code integration
- **IDE Integration:** Claude Code for AI assistance

---

## 🔧 Code Quality Standards

### **Instant Feedback (< 10 seconds)**
Pre-commit hooks provide immediate feedback on code quality:

- **ESLint:** Automatically fixes style issues
- **TypeScript:** Catches type errors before commit
- **Tests:** Runs tests for changed files only
- **Python:** Auto-formats and validates backend code
- **Security:** Scans for vulnerabilities and secrets

### **CI Validation (2-5 minutes)**
GitHub Actions provide comprehensive validation:

- **Quality Gates:** All checks must pass before merge
- **Cross-Browser Testing:** E2E tests across multiple browsers
- **Claude Code Review:** AI-powered code review on PRs
- **Security Scanning:** Comprehensive vulnerability assessment

---

## 🎯 Project-Specific Features

### **Music Theory Integration**
This project includes specialized music theory capabilities:

- **MIDI Support:** Real-time MIDI input detection and processing
- **Scale Analysis:** Comprehensive modal analysis and scale detection  
- **Chord Progression Analysis:** Advanced harmonic analysis
- **Music21 Integration:** Classical music theory computations
- **Audio Processing:** librosa-powered audio analysis

### **Advanced Testing**
- **MIDI Testing:** E2E tests with Web MIDI API simulation
- **Audio Testing:** Mock audio processing for consistent testing
- **Cross-Browser MIDI:** Tests MIDI functionality across browsers
- **Performance Testing:** Load testing and profiling capabilities

### **Claude Integration**
- **AI Code Review:** Automatic code review on pull requests
- **Context-Aware Assistance:** Claude has full project context
- **Music Theory Knowledge:** Claude understands the music domain
- **Real-Time Help:** Use `@claude` mentions in issues and PRs

---

## 🆚 Workflow Comparison

| Aspect | Traditional | Music Modes App + Pre-commit |
|--------|-------------|------------------------------|
| **Code Style** | Fix during PR review | Auto-fixed on commit |
| **Type Errors** | Catch in CI (5+ min wait) | Instant feedback (< 5s) |
| **Test Failures** | Discover in CI | Prevent bad commits locally |
| **Security Issues** | Manual reviews | Automated scanning |
| **MIDI Testing** | Manual browser testing | Automated cross-browser E2E |
| **Music Theory** | Manual validation | Automated theory validation |
| **Claude Help** | Manual consultation | Integrated AI assistance |

---

## 🐛 Troubleshooting

### **Pre-commit Issues**
```bash
# Skip hooks temporarily (not recommended)
git commit --no-verify -m "Emergency commit"

# Update hook versions
pre-commit autoupdate

# Clean hook cache
pre-commit clean
pre-commit install --install-hooks

# Run specific hook
pre-commit run eslint-fix --all-files
```

### **Test Issues**
```bash
# Clear test cache
cd frontend && npm run test:clean

# Regenerate test snapshots
npm run test -- --update-snapshots

# Debug specific test
npm run test -- --reporter=verbose ComponentName.test.tsx

# E2E test debugging
npm run test:e2e -- --debug
```

### **MIDI Issues**
```bash
# Check MIDI permissions in browser
# Chrome: chrome://settings/content/midi
# Firefox: about:config -> dom.webmidi.enabled

# Test MIDI functionality manually
npm run dev:pw  # Opens Playwright codegen with MIDI support
```

### **Environment Issues**
```bash
# Reset entire development environment
rm -rf frontend/node_modules backend/__pycache__ .git/hooks
./setup-dev.sh

# Check system requirements
node --version  # Should be 20+
python3 --version  # Should be 3.8+
pre-commit --version  # Should be 3.0+
```

---

## 📚 Additional Resources

- **Music Theory Documentation:** See `docs/` directory for comprehensive music theory integration guides
- **API Documentation:** Backend API docs available when running the server
- **Test Reports:** Generated in `reports/` after running tests
- **Claude Integration:** See `.github/workflows/` for AI assistance configuration
- **Deployment:** Use `docker-compose` for local development matching production

---

## 🎵 Final Notes

This development environment is optimized for:
- **Fast Feedback Loops:** Quality issues caught in seconds, not minutes
- **Music-Specific Workflows:** MIDI testing, audio processing, theory validation
- **AI-Assisted Development:** Integrated Claude support for enhanced productivity
- **Comprehensive Testing:** Unit, component, E2E, and cross-browser coverage

The 6-day sprint development cycle is supported by instant local feedback, allowing you to maintain development momentum while ensuring code quality.

**Happy coding with Music Modes App! 🎵**