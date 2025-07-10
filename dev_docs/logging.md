# Logging & Monitoring Implementation Guide

## Overview

The Music Theory Toolkit implements comprehensive structured logging for production monitoring, debugging, and user behavior analysis. All logs are formatted as JSON objects and integrated with Google Cloud Logging for centralized analysis and alerting.

## Architecture

### Server-Side Logging Architecture

The application now uses a comprehensive server-side logging architecture that provides secure, scalable, and reliable logging to Google Cloud Logging.

#### System Components

1. **Client-Side Logger (`src/utils/logger.ts`)**
   - Collects user interactions and application events
   - Sends logs to server endpoint via HTTP POST
   - Maintains browser console logging for development

2. **Server-Side Logging Endpoint (`server/index.js`)**
   - Express.js endpoint at `/api/log`
   - Authenticates with Google Cloud Logging using service accounts
   - Enhances logs with server-side metadata
   - Provides error handling and validation

3. **Google Cloud Logging Integration**
   - Uses `@google-cloud/logging` library
   - Service account authentication (no API keys needed)
   - Proper resource labeling for Cloud Run

#### Core Features
- **Structured JSON Logging**: All logs are JSON objects for easy parsing and filtering
- **Server-Side Authentication**: Uses service account credentials for secure Cloud Logging access
- **Enhanced Metadata**: Combines client and server metadata for comprehensive logging
- **Automatic Metadata**: Timestamps, app name, session IDs, IP addresses, and severity levels
- **Type Safety**: TypeScript interfaces ensure consistent log structure
- **Convenience Methods**: Specialized functions for different interaction types
- **Environment Detection**: Automatically detects production vs development environments
- **Session Tracking**: Unique session IDs for user journey analysis
- **Error Resilience**: Graceful fallback if server logging fails
- **Health Monitoring**: Built-in health check endpoint for monitoring

#### Server-Side Logging Flow

The logging system follows this flow:

1. **Client-Side Collection**: User interactions trigger logging calls
2. **HTTP Transport**: Logs are sent to `/api/log` endpoint via fetch()
3. **Server Processing**: Express.js server validates and enhances logs
4. **Cloud Logging**: Server writes to Google Cloud Logging with service account auth

```typescript
// Client-side logger sends to server
class ServerLogger {
  private async sendToServer(entry: LogEntry): Promise<void> {
    const response = await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
  }
}
```

```javascript
// Server-side endpoint processes and forwards to Cloud Logging
app.post('/api/log', async (req, res) => {
  const { message, severity, app_name, interaction_type, ...metadata } = req.body;

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

  const entry = log.entry({
    resource: { 
      type: 'cloud_run_revision',
      labels: { service_name: 'music-theory-toolkit' }
    },
    severity: severity || 'INFO'
  }, logData);

  await log.write(entry);
});
```

#### Enhanced Log Entry Structure

```typescript
interface LogEntry {
  message: string;
  severity?: 'DEBUG' | 'INFO' | 'NOTICE' | 'WARNING' | 'ERROR' | 'CRITICAL' | 'ALERT' | 'EMERGENCY';
  app_name: string;
  interaction_type?: 'web_click' | 'gemini_request' | 'gemini_response' | 'user_login' | 'db_query' | 'app_init' | 'error';
  timestamp: string;
  session_id: string; // Unique session identifier
  user_agent: string; // Browser user agent
  url: string; // Current page URL
  [key: string]: any; // Additional custom fields
}
```

## Implementation Details

### 1. Web Click Tracking

Tracks all user interactions including tab navigation, button clicks, form submissions, sub-navigation, and popup interactions.

**Implementation Locations:**
- `src/components/QuestionDrivenMusicTool.tsx`: Main component interactions
- `src/components/ModeIdentificationTab.tsx`: Sub-navigation method switching
- `src/hooks/useUnifiedResults.ts`: Unified results popup open/close events
- Tab navigation logging
- Analysis request initiation
- Discovery request initiation
- Sub-navigation method switching
- Unified results popup interactions

**Example Usage:**
```typescript
// Main tab navigation
logger.webClick('User navigated to tab', {
  component: 'QuestionDrivenMusicTool',
  action: 'tab_change',
  previousTab: 'identify',
  newTab: 'discover',
  hasVisibleResults: true
});

// Sub-navigation method switching (direct selection)
logger.webClick('User switched identification method via direct selection', {
  component: 'ModeIdentificationTab',
  action: 'method_switch_direct',
  previousMethod: 'melody',
  newMethod: 'scale',
  trigger: 'method_card_click',
  methodLabel: 'Scale Analysis'
});

// Sub-navigation method switching (validation suggestion)
logger.webClick('User switched identification method via validation suggestion', {
  component: 'ModeIdentificationTab',
  action: 'method_switch_validation',
  previousMethod: 'melody',
  newMethod: 'progression',
  trigger: 'validation_suggestion'
});

// Unified results popup opening
logger.webClick('User opened unified results popup', {
  component: 'UnifiedResultsPanel',
  action: 'popup_open',
  trigger: 'new_results',
  historyId: null,
  hasResults: true,
  currentTab: 'identify'
});

// Unified results popup closing
logger.webClick('User closed unified results popup', {
  component: 'UnifiedResultsPanel',
  action: 'popup_close',
  trigger: 'user_dismiss',
  hadResults: true,
  historyCount: 5,
  currentTab: 'identify'
});
```

### 2. Gemini API Auditing

Comprehensive tracking of all AI service interactions for performance monitoring and debugging.

**Implementation Locations:**
- `src/services/geminiService.ts`: All API functions
- Request logging with parameters
- Response logging with metadata
- Error tracking with stack traces

**Request Logging:**
```typescript
logger.geminiRequest('Core analysis request to Gemini API', {
  function: 'getCoreAnalysis',
  model: 'gemini-2.5-flash-preview-04-17',
  tonic: 'C',
  analysisTarget: { notes: ['C', 'D', 'E'] },
  temperature: 0.1
});
```

**Response Logging:**
```typescript
logger.geminiResponse('Core analysis response from Gemini API', {
  function: 'getCoreAnalysis',
  responseLength: 1250,
  hasResponse: true,
  tonic: 'C'
});
```

**Error Logging:**
```typescript
logger.error('Core analysis API call failed', {
  function: 'getCoreAnalysis',
  error: 'Network timeout',
  tonic: 'C',
  stack: error.stack
});
```

### 3. Application Lifecycle Events

Tracks application initialization and component mounting for debugging and performance analysis.

**Implementation:**
```typescript
useEffect(() => {
  logger.appInit('Music Theory Toolkit initialized', {
    component: 'QuestionDrivenMusicTool',
    initialTab: 'identify',
    showDebugInfo: false,
    timestamp: Date.now()
  });
}, []);
```

## Google Cloud Logging Integration

### Deployment Configuration

The deployment script (`deploy.sh`) automatically sets up Cloud Logging integration:

#### 1. Enable Required APIs
```bash
gcloud services enable run.googleapis.com \
                       logging.googleapis.com \
                       cloudresourcemanager.googleapis.com \
                       --project="$PROJECT_ID"
```

#### 2. Create API Key for Client-Side Logging
```bash
# Create restricted API key for Cloud Logging
gcloud alpha services api-keys create \
  --display-name="cloud-logging-client-key" \
  --api-target=service=logging.googleapis.com \
  --project="$PROJECT_ID"

# Store API key securely in Secret Manager
echo "$LOGGING_API_KEY" | gcloud secrets create cloud-logging-api-key \
  --replication-policy="automatic" \
  --data-file=- \
  --project="$PROJECT_ID"
```

#### 3. Deploy with Enhanced Configuration
```bash
gcloud run deploy music-theory-toolkit \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest,CLOUD_LOGGING_API_KEY=cloud-logging-api-key:latest \
  --set-env-vars PROJECT_ID="$PROJECT_ID" \
  --project="$PROJECT_ID"
```

#### 4. Runtime Configuration Generation
The `docker-entrypoint.sh` script creates `/usr/share/nginx/html/config.js`:
```javascript
window.RUNTIME_CONFIG = {
  GEMINI_API_KEY: '${GEMINI_API_KEY}',
  CLOUD_LOGGING_API_KEY: '${CLOUD_LOGGING_API_KEY}',
  PROJECT_ID: '${PROJECT_ID}'
};
```

### Log Filtering and Analysis

#### Basic Filters

**All Application Logs:**
```
jsonPayload.app_name="music-theory-toolkit"
```

**Client-Side Logs (New):**
```
jsonPayload.app_name="music-theory-toolkit"
logName="projects/YOUR_PROJECT_ID/logs/music-theory-toolkit-client"
```

**Web Click Interactions:**
```
jsonPayload.app_name="music-theory-toolkit" AND jsonPayload.interaction_type="web_click"
```

**Gemini API Requests:**
```
jsonPayload.app_name="music-theory-toolkit" AND jsonPayload.interaction_type="gemini_request"
```

**Gemini API Responses:**
```
jsonPayload.app_name="music-theory-toolkit" AND jsonPayload.interaction_type="gemini_response"
```

**Error Logs:**
```
jsonPayload.app_name="music-theory-toolkit" AND severity=ERROR
```

#### Advanced Filters

**Component-Specific Logs:**
```
jsonPayload.app_name="music-theory-toolkit" AND jsonPayload.component="QuestionDrivenMusicTool"
```

**Analysis Performance Monitoring:**
```
jsonPayload.app_name="music-theory-toolkit" AND jsonPayload.function="getCoreAnalysis" AND jsonPayload.interaction_type=("gemini_request" OR "gemini_response")
```

**User Journey Tracking:**
```
jsonPayload.app_name="music-theory-toolkit" AND jsonPayload.interaction_type="web_click" AND jsonPayload.action=("tab_change" OR "analysis_request")
```

**Sub-Navigation Method Switching:**
```
jsonPayload.app_name="music-theory-toolkit" AND jsonPayload.component="ModeIdentificationTab" AND jsonPayload.action=("method_switch_direct" OR "method_switch_validation")
```

**Unified Results Popup Interactions:**
```
jsonPayload.app_name="music-theory-toolkit" AND jsonPayload.component="UnifiedResultsPanel" AND jsonPayload.action=("popup_open" OR "popup_close")
```

**Method Switching Analysis:**
```
jsonPayload.app_name="music-theory-toolkit" AND jsonPayload.action="method_switch_direct" AND jsonPayload.trigger="method_card_click"
```

**Popup Usage Patterns:**
```
jsonPayload.app_name="music-theory-toolkit" AND jsonPayload.action="popup_open" AND jsonPayload.trigger=("new_results" OR "history_restore")
```

**Error Analysis:**
```
jsonPayload.app_name="music-theory-toolkit" AND (severity=ERROR OR jsonPayload.interaction_type="error")
```

## Monitoring Strategies

### Key Metrics to Track

1. **User Engagement:**
   - Tab navigation patterns
   - Analysis request frequency
   - Feature usage distribution
   - Sub-navigation method switching patterns
   - Unified results popup usage frequency
   - Method preference analysis (melody vs scale vs progression)

2. **API Performance:**
   - Gemini API response times
   - Error rates by function
   - Request/response size analysis

3. **Application Health:**
   - Error frequency and types
   - Component initialization success
   - User session patterns

### Alerting Recommendations

**High Priority Alerts:**
- Error rate > 5% in 5-minute window
- Gemini API failures > 10% in 10-minute window
- Application initialization failures

**Medium Priority Alerts:**
- Unusual spike in user activity
- Slow API response times (>5 seconds)
- High volume of specific error types

## Development Guidelines

### Adding Logging to New Components

1. **Import the logger:**
   ```typescript
   import { logger } from '../utils/logger';
   ```

2. **Add initialization logging:**
   ```typescript
   useEffect(() => {
     logger.appInit('Component initialized', {
       component: 'ComponentName',
       props: Object.keys(props)
     });
   }, []);
   ```

3. **Log user interactions:**
   ```typescript
   const handleClick = () => {
     logger.webClick('User clicked button', {
       component: 'ComponentName',
       action: 'button_click',
       buttonType: 'analyze'
     });
     // ... rest of handler
   };
   ```

4. **Log API calls:**
   ```typescript
   const callAPI = async () => {
     logger.geminiRequest('API request initiated', {
       function: 'functionName',
       parameters: { /* relevant params */ }
     });

     try {
       const response = await apiCall();
       logger.geminiResponse('API response received', {
         function: 'functionName',
         responseLength: response.length
       });
     } catch (error) {
       logger.error('API call failed', {
         function: 'functionName',
         error: error.message,
         stack: error.stack
       });
     }
   };
   ```

### Best Practices

1. **Be Descriptive**: Use clear, human-readable messages
2. **Include Context**: Add relevant metadata for debugging
3. **Avoid Sensitive Data**: Never log API keys, user credentials, or PII
4. **Use Appropriate Severity**: Match severity to the actual impact
5. **Structure Consistently**: Follow the established log structure patterns

## Testing Logging

### Local Development

Logs are output to the browser console in development mode. Use browser developer tools to inspect log structure and content.

### Production Verification

1. Deploy to Cloud Run
2. Generate test interactions
3. Check Google Cloud Logging Console
4. Verify log structure and filtering

### Log Analysis Tools

- **Google Cloud Logging Console**: Primary interface for log analysis
- **Log-based Metrics**: Create custom metrics from log data
- **Cloud Monitoring**: Set up alerts and dashboards
- **BigQuery**: Export logs for advanced analysis

## Troubleshooting

### Common Issues

1. **Logs not appearing in Cloud Logging:**
   - Verify APIs are enabled
   - Check Cloud Run service permissions
   - Ensure JSON format is valid

2. **Filtering not working:**
   - Verify field names match log structure
   - Check for typos in app_name or interaction_type
   - Use exact string matching for custom fields

3. **Performance impact:**
   - Logging is asynchronous and shouldn't impact performance
   - Monitor log volume in high-traffic scenarios
   - Consider log sampling for very high-volume events

### Debug Mode

Enable additional logging by setting debug flags in the logger utility for development environments.

## Future Enhancements

1. ✅ **User Session Tracking**: **COMPLETED** - Session IDs are now automatically generated and tracked
2. **Performance Metrics**: Add timing data for component rendering and API calls
3. **A/B Testing Support**: Log experiment participation and outcomes
4. **Real-time Monitoring**: Implement real-time log streaming for critical events
5. **Log Aggregation**: Create summary logs for daily/weekly usage patterns
6. **User Journey Analytics**: Implement funnel analysis and user flow tracking
7. **Error Rate Monitoring**: Automated alerts for error rate spikes
8. **Log Sampling**: Implement intelligent log sampling for high-volume scenarios
9. **Custom Dashboards**: Create Cloud Monitoring dashboards for key metrics
10. **Log-based Metrics**: Convert log data into actionable metrics and KPIs
