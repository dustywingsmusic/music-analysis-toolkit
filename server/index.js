import express from 'express';
import path from 'path';
import { Logging } from '@google-cloud/logging';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Initialize Cloud Logging
const logging = new Logging();
const log = logging.log('music-theory-toolkit');

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

    // Create Cloud Logging entry
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

    // Write to Cloud Logging
    await log.write(entry);

    // Also log to console for development/debugging
    console.log(`[${severity || 'INFO'}] ${message}`, JSON.stringify(logData, null, 2));

    res.status(200).json({ 
      success: true, 
      request_id: logData.request_id,
      timestamp: logData.server_timestamp
    });

  } catch (error) {
    console.error('Logging error:', error);

    // Log the error to Cloud Logging as well
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

    res.status(500).json({ 
      error: 'Failed to log message',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
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
  console.log(`Cloud Logging initialized for project: ${process.env.GOOGLE_CLOUD_PROJECT || 'default'}`);
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
