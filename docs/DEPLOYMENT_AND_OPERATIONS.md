# Music Theory Toolkit - Deployment & Operations

> **📋 Consolidated Documentation**: This document consolidates deployment procedures, logging implementation, and operational guidelines into a single comprehensive reference.

## Table of Contents

1. [Overview](#overview)
2. [Deployment Architecture](#deployment-architecture)
3. [Server-Side Logging Implementation](#server-side-logging-implementation)
4. [Development vs Production](#development-vs-production)
5. [Deployment Procedures](#deployment-procedures)
6. [Monitoring & Observability](#monitoring--observability)
7. [Troubleshooting](#troubleshooting)

## Overview

The Music Theory Toolkit uses a modern deployment architecture with Google Cloud Run hosting a Node.js/Express server that serves the React application and provides logging capabilities. This document covers the complete deployment and operational procedures.

### 🎯 Architecture Evolution Notice
**Important**: The application is undergoing a major evolution to integrate Reference section analysis capabilities with main features. This will improve theoretical accuracy and reduce AI dependency. Monitor deployment performance during the Music Theory Integration phases. See [Music Theory Integration Roadmap](MUSIC_THEORY_INTEGRATION_ROADMAP.md) for implementation timeline.

### Architecture Summary
- **Frontend**: React SPA built with Vite
- **Server**: Express.js for static serving and API endpoints
- **Hosting**: Google Cloud Run with containerized deployment
- **Logging**: Server-side Cloud Logging integration
- **Authentication**: Service account-based (no API keys)

## Deployment Architecture

### Current Architecture: Server-Side Logging Solution

The application has been successfully migrated from client-side Cloud Logging (which had API key limitations) to a robust server-side logging architecture.

#### Before: Client-Side Logging Issues
- ❌ API keys cannot write to Cloud Logging (IAM permission restrictions)
- ❌ Security concerns with exposed API keys in browser
- ❌ Limited metadata and context
- ❌ Unreliable due to browser limitations

#### After: Server-Side Logging Solution
- ✅ Service account authentication for secure Cloud Logging access
- ✅ Enhanced metadata with both client and server context
- ✅ Reliable logging through dedicated server endpoint
- ✅ Proper error handling and validation
- ✅ Health monitoring and observability

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT SIDE                             │
├─────────────────────────────────────────────────────────────────┤
│  React Application (Browser)                                   │
│  ├── User Interactions                                         │
│  ├── Music Analysis                                            │
│  └── Logger (ServerLogger class)                               │
│      └── HTTP POST to /api/log                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUD RUN CONTAINER                         │
├─────────────────────────────────────────────────────────────────┤
│  Express.js Server (Node.js)                                   │
│  ├── Static File Serving (React app)                           │
│  ├── /api/log - Logging endpoint                               │
│  ├── /health - Health check endpoint                           │
│  └── Service Account Authentication                             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   GOOGLE CLOUD LOGGING                         │
├─────────────────────────────────────────────────────────────────┤
│  ├── Structured Logs with Enhanced Metadata                    │
│  ├── Cloud Run Resource Labeling                               │
│  ├── Filtering and Analysis Capabilities                       │
│  └── Real-time Monitoring and Alerting                         │
└─────────────────────────────────────────────────────────────────┘
```

## Server-Side Logging Implementation

### 1. Server Infrastructure (`server/index.js`)

**Express.js Application with:**
- `/api/log` - Logging endpoint for client requests
- `/health` - Health check endpoint for monitoring
- Static file serving for React application
- Comprehensive error handling
- CORS support for development
- **Conditional Cloud Logging initialization**

**Key Features:**

**Conditional Cloud Logging Initialization:**
```javascript
// Initialize Cloud Logging conditionally
let logging = null;
let log = null;
let cloudLoggingEnabled = false;

// Only initialize Cloud Logging in production or when credentials are available
const isProduction = process.env.NODE_ENV === 'production';
const hasGoogleCloudProject = !!process.env.GOOGLE_CLOUD_PROJECT;

if (isProduction || hasGoogleCloudProject) {
  try {
    logging = new Logging();
    log = logging.log('music-theory-toolkit');
    cloudLoggingEnabled = true;
    console.log('Cloud Logging initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize Cloud Logging, falling back to console logging:', error.message);
    cloudLoggingEnabled = false;
  }
} else {
  console.log('Cloud Logging disabled in development environment');
  cloudLoggingEnabled = false;
}
```

**Enhanced Log Processing with Conditional Cloud Logging:**
```javascript
// Enhanced log processing with server metadata
const logData = {
  message,
  app_name,
  interaction_type: interaction_type || 'unknown',
  ...metadata,
  server_timestamp: new Date().toISOString(),
  client_ip: req.ip,
  user_agent: req.get('User-Agent'),
  request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
};

// Write to Cloud Logging if available, otherwise just log to console
if (cloudLoggingEnabled && log) {
  try {
    const entry = log.entry({
      resource: { 
        type: 'cloud_run_revision',
        labels: {
          service_name: 'music-theory-toolkit',
          revision_name: process.env.K_REVISION || 'unknown'
        }
      },
      severity: severity || 'INFO',
      labels: {
        app_name: app_name,
        interaction_type: interaction_type || 'unknown',
        environment: process.env.NODE_ENV || 'production'
      }
    }, logData);

    await log.write(entry);
  } catch (cloudError) {
    console.warn('Failed to write to Cloud Logging:', cloudError.message);
  }
}

// Always log to console for development/debugging
console.log(`[${severity || 'INFO'}] ${message}`, JSON.stringify(logData, null, 2));
```

### 2. Client-Side Logger (`src/utils/logger.ts`)

**Updated Architecture:**
- `ServerLogger` class replaces `CloudLogger`
- HTTP POST requests to `/api/log` endpoint
- Enhanced client metadata collection
- Graceful error handling

**Enhanced Metadata:**
```typescript
const logEntry = {
  ...entry,
  app_name: APP_NAME,
  client_timestamp: new Date().toISOString(),
  user_agent: navigator.userAgent,
  url: window.location.href,
  session_id: this.getSessionId(),
  viewport: { width: window.innerWidth, height: window.innerHeight },
  referrer: document.referrer || 'direct'
};
```

### 3. Dependencies Added

```json
{
  "dependencies": {
    "@google-cloud/logging": "^11.2.0",
    "express": "^4.21.2"
  }
}
```

## Development vs Production

### Local Development (`npm run dev:server`)

```bash
npm run dev:server
# Runs: NODE_ENV=development node server/index.js
```

**What it does:**
- Starts the Express.js server on `localhost:8080`
- Sets `NODE_ENV=development` for development-specific behavior
- Serves the built React app from `./dist` directory
- Provides `/api/log` endpoint for logging
- Includes CORS headers for cross-origin requests
- Shows detailed error messages in development mode

**Key Features in Development:**
- **Conditional Cloud Logging**: Gracefully handles missing Google Cloud credentials
- **Console Logging**: All logs output to console for debugging
- **No Credentials Required**: Works without Google Cloud setup for local development
- **Optional Cloud Logging**: Can be enabled by setting `GOOGLE_CLOUD_PROJECT` environment variable
- CORS enabled for local development
- Serves static files from local `dist` directory

**Logging Behavior in Development:**
```javascript
// Server startup messages
console.log('Cloud Logging disabled in development environment');
console.log('Cloud Logging disabled - using console logging only');

// All log entries are written to console with full metadata
console.log(`[INFO] User clicked scale analysis button`, {
  message: "User clicked scale analysis button",
  app_name: "music-theory-toolkit",
  interaction_type: "web_click",
  server_timestamp: "2024-01-15T10:30:00.000Z",
  client_ip: "::1",
  user_agent: "Mozilla/5.0...",
  request_id: "req_1705312200000_abc123"
});
```

### Production Deployment (Google Cloud Run)

```bash
# In production container:
node server/index.js
# With: NODE_ENV=production (set by deploy.sh)
```

**What it does:**
- Runs the exact same `server/index.js` file
- Sets `NODE_ENV=production` for production optimizations
- Uses Google Cloud service account authentication
- Serves the React app to public internet
- Handles production-level traffic and scaling

## Deployment Procedures

### 1. Development Phase
```bash
# Build the React application
npm run build

# Test the server locally
npm run dev:server
```

### 2. Containerization (Dockerfile)

**Updated Dockerfile:**
- Node.js-based instead of nginx
- Multi-stage build for optimization
- Security hardening with non-root user
- Built-in health checks

```dockerfile
# Build stage: Creates the React dist files
FROM node:20-alpine AS builder
COPY . .
RUN npm run build

# Production stage: Sets up the server
FROM node:20-alpine
COPY --from=builder /app/dist ./dist  # React build
COPY server ./server                   # Express server
COPY package*.json ./
RUN npm install --production

# Run the same server as development
CMD ["node", "server/index.js"]
```

### 3. Cloud Deployment (deploy.sh)

**Updated deploy.sh:**
- Service account authentication (no API keys)
- Enhanced Cloud Run configuration
- Proper environment variables
- Resource allocation optimization

```bash
# Build Docker image
docker build -t gcr.io/$PROJECT_ID/music-theory-toolkit .

# Push to Google Container Registry
docker push gcr.io/$PROJECT_ID/music-theory-toolkit

# Deploy to Cloud Run
gcloud run deploy music-theory-toolkit \
  --image gcr.io/$PROJECT_ID/music-theory-toolkit \
  --port 8080 \
  --set-env-vars NODE_ENV=production
```

### Complete Deployment Script

The `deploy.sh` script handles the complete deployment pipeline:

1. **Environment Setup**
   - Project ID configuration
   - Service enablement
   - Authentication setup

2. **Build Process**
   - React application build
   - Docker image creation
   - Container registry push

3. **Cloud Run Deployment**
   - Service deployment
   - Environment variable configuration
   - Health check setup

4. **Post-Deployment Verification**
   - Health endpoint testing
   - Logging verification
   - Performance monitoring

## Monitoring & Observability

### Health Monitoring

**Health Check Endpoint**: `/health`
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || 'unknown'
  });
});
```

### Logging Strategy

#### Structured Logging Utility Implementation
- Web click and user interaction tracking
- Gemini API request/response auditing
- Google Cloud Logging integration and filtering
- Log analysis and monitoring strategies

#### Log Categories
1. **User Interactions**: Button clicks, tab switches, input changes
2. **Analysis Requests**: Mode identification, scale discovery, chord analysis
3. **API Calls**: Gemini AI requests and responses
4. **Errors**: Client-side errors, server errors, API failures
5. **Performance**: Load times, response times, resource usage

#### Cloud Logging Integration and Filtering

**Log Filtering Examples:**
```bash
# View all application logs
resource.type="cloud_run_revision" 
resource.labels.service_name="music-theory-toolkit"

# Filter by interaction type
resource.type="cloud_run_revision" 
jsonPayload.interaction_type="mode_identification"

# Filter by severity
resource.type="cloud_run_revision" 
severity>=WARNING

# Filter by user session
resource.type="cloud_run_revision" 
jsonPayload.session_id="session_123456"
```

### Performance Monitoring

#### Key Metrics
- **Response Times**: API endpoint performance
- **Error Rates**: Client and server error frequencies
- **User Engagement**: Feature usage patterns
- **Resource Usage**: Memory, CPU, and network utilization

#### Monitoring Dashboards
- Cloud Run service metrics
- Custom application metrics
- User interaction analytics
- Error tracking and alerting

## Troubleshooting

### Common Issues and Solutions

#### 1. Deployment Failures

**Issue**: Docker build failures
**Solution**: 
- Check Dockerfile syntax
- Verify all dependencies are listed in package.json
- Ensure build context includes all necessary files

**Issue**: Cloud Run deployment timeouts
**Solution**:
- Increase memory allocation
- Optimize Docker image size
- Check for blocking operations in startup

#### 2. Logging Issues

**Issue**: Logs not appearing in Cloud Logging
**Solution**:
- Verify service account permissions
- Check Cloud Logging API is enabled
- Validate log entry format and structure

**Issue**: High logging costs
**Solution**:
- Implement log level filtering
- Reduce verbose logging in production
- Set up log retention policies

#### 3. Performance Issues

**Issue**: Slow application loading
**Solution**:
- Optimize React bundle size
- Implement code splitting
- Use CDN for static assets

**Issue**: High memory usage
**Solution**:
- Profile memory usage patterns
- Implement garbage collection optimization
- Monitor for memory leaks

### Debugging Commands

```bash
# Local development debugging
npm run dev:server
curl http://localhost:8080/health

# Production debugging
gcloud run services describe music-theory-toolkit --region=us-central1
gcloud logs read "resource.type=cloud_run_revision" --limit=50

# Container debugging
docker run -it --rm gcr.io/$PROJECT_ID/music-theory-toolkit sh
```

### Log Analysis and Monitoring Strategies

#### Real-time Monitoring
- Set up Cloud Monitoring alerts for error rates
- Configure uptime checks for health endpoints
- Monitor resource utilization trends

#### Log Analysis
- Use Cloud Logging queries for user behavior analysis
- Track feature usage patterns
- Monitor API performance and error patterns

#### Alerting
- Configure alerts for high error rates
- Set up notifications for service downtime
- Monitor resource usage thresholds

---

*This document consolidates information from SERVER_SIDE_LOGGING_IMPLEMENTATION.md, DEV_SERVER_CLOUD_DEPLOYMENT.md, CLOUD_LOGGING_API_KEY_ISSUE_RESOLUTION.md, CLIENT_SIDE_LOGGING_SOLUTION.md, and relevant dev_docs files to provide a comprehensive deployment and operations guide.*
