/**
 * @file This file sets up and runs an Express.js server for the Music Theory Toolkit frontend.
 *
 * Key functionalities include:
 * - Serving the static, compiled React application from the 'dist' directory.
 * - Providing a `/health` endpoint for service health monitoring.
 * - Offering a `/api/log` endpoint for the client-side application to send logs to the server.
 * - Conditionally initializing and using Google Cloud Logging for centralized log management,
 *   primarily for production environments. It falls back to console logging if Cloud Logging is
 *   unavailable or disabled.
 * - Handling Cross-Origin Resource Sharing (CORS) to allow requests from different origins,
 *   which is particularly useful during development.
 * - Implementing basic error handling and graceful shutdown procedures for process signals
 *   (SIGTERM, SIGINT).
 */
import express from 'express';
import path from 'path';
import fs from 'fs';
import { Logging } from '@google-cloud/logging';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

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
  console.log(`Environment: ${process.env.NODE_ENV || 'BLAH'}`);
  console.log(`hasGoogleCloudProject: ${hasGoogleCloudProject} || 'BLAH1'}`)
  cloudLoggingEnabled = false;
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../dist')));

// CORS middleware for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'music-theory-toolkit'
  });
});

// Logging endpoint
app.post('/api/log', async (req, res) => {
  try {
    const { message, severity, app_name, interaction_type, ...metadata } = req.body;

    // Validate required fields
    if (!message || !app_name) {
      return res.status(400).json({ 
        error: 'Missing required fields: message and app_name are required' 
      });
    }

    // Create log entry with enhanced metadata
    const logData = {
      message,
      app_name,
      interaction_type: interaction_type || 'unknown',
      ...metadata,
      server_timestamp: new Date().toISOString(),
      client_ip: req.ip || req.connection.remoteAddress,
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

    res.status(200).json({ 
      success: true, 
      request_id: logData.request_id,
      timestamp: logData.server_timestamp
    });

  } catch (error) {
    console.error('Logging error:', error);

    // Log the error to Cloud Logging if available
    if (cloudLoggingEnabled && log) {
      try {
        const errorEntry = log.entry({
          resource: { type: 'cloud_run_revision' },
          severity: 'ERROR'
        }, {
          message: 'Server-side logging error',
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          app_name: 'music-theory-toolkit',
          interaction_type: 'error'
        });
        await log.write(errorEntry);
      } catch (loggingError) {
        console.error('Failed to log error to Cloud Logging:', loggingError);
      }
    }

    res.status(500).json({ 
      error: 'Failed to log message',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Serve runtime configuration as JavaScript ES module
app.get('/config.js', (req, res) => {
  // Create runtime config from environment variables
  const runtimeConfig = {
    GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY,
    GEMINI_MODEL_ID: process.env.VITE_GEMINI_MODEL_ID || 'gemini-2.5-flash',
    GOOGLE_CLOUD_PROJECT: process.env.VITE_GOOGLE_CLOUD_PROJECT,
    GTAG_ID: process.env.VITE_GTAG_ID
  };
  
  // Generate ES module that exports the runtime config and sets global variable for backward compatibility
  const configJs = `
// Set global variable for backward compatibility
window.RUNTIME_CONFIG = ${JSON.stringify(runtimeConfig)};

// Export as ES module
export default ${JSON.stringify(runtimeConfig)};
export const RUNTIME_CONFIG = ${JSON.stringify(runtimeConfig)};
`;
  
  res.setHeader('Content-Type', 'application/javascript');
  res.send(configJs);
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Music Theory Toolkit server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  if (cloudLoggingEnabled) {
    console.log(`Cloud Logging enabled for project: ${process.env.GOOGLE_CLOUD_PROJECT || 'default'}`);
  } else {
    console.log('Cloud Logging disabled - using console logging only');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
