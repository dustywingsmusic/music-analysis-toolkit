// logger.ts - Enhanced logging utility with server-side Cloud Logging integration
interface LogEntry {
  message: string;
  severity?: 'DEBUG' | 'INFO' | 'NOTICE' | 'WARNING' | 'ERROR' | 'CRITICAL' | 'ALERT' | 'EMERGENCY';
  app_name: string; // To filter all logs for this app
  interaction_type?: 'web_click' | 'gemini_request' | 'gemini_response' | 'user_login' | 'db_query' | 'app_init' | 'error'; // To filter within the app
  [key: string]: any; // Allow for other custom fields
}

const APP_NAME = 'music-theory-toolkit';

class ServerLogger {
  private isProduction: boolean;
  private logEndpoint: string;

  constructor() {
    this.isProduction = window.location.hostname !== 'localhost';
    // Use relative URL so it works in both development and production
    this.logEndpoint = '/api/log';
  }

  private async sendToServer(entry: LogEntry): Promise<void> {
    try {
      const response = await fetch(this.logEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Failed to send log to server: ${response.status} ${response.statusText}`, errorText);
      }
    } catch (error) {
      console.warn('Failed to send log to server:', error);
    }
  }

  public async log(entry: LogEntry): Promise<void> {
    const logEntry = {
      ...entry,
      app_name: APP_NAME,
      client_timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      url: window.location.href,
      session_id: this.getSessionId(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      referrer: document.referrer || 'direct'
    };

    // Always log to console for development and debugging
    console.log(JSON.stringify(logEntry));

    // Send to server for Cloud Logging (both development and production)
    // Don't await to avoid blocking the UI
    this.sendToServer(logEntry).catch(error => {
      console.warn('Server logging failed:', error);
    });
  }

  private getSessionId(): string {
    // Generate or retrieve session ID for tracking user sessions
    let sessionId = sessionStorage.getItem('logging_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('logging_session_id', sessionId);
    }
    return sessionId;
  }
}

const serverLogger = new ServerLogger();

function log(entry: LogEntry) {
  // Maintain backward compatibility with synchronous interface
  serverLogger.log(entry);
}

// Convenience functions for different log levels
export const logger = {
  debug: (message: string, data?: Record<string, any>) => {
    log({
      message,
      severity: 'DEBUG',
      app_name: APP_NAME,
      ...data
    });
  },

  info: (message: string, data?: Record<string, any>) => {
    log({
      message,
      severity: 'INFO',
      app_name: APP_NAME,
      ...data
    });
  },

  warn: (message: string, data?: Record<string, any>) => {
    log({
      message,
      severity: 'WARNING',
      app_name: APP_NAME,
      ...data
    });
  },

  error: (message: string, data?: Record<string, any>) => {
    log({
      message,
      severity: 'ERROR',
      app_name: APP_NAME,
      interaction_type: 'error',
      ...data
    });
  },

  // Specific logging functions for different interaction types
  webClick: (message: string, data?: Record<string, any>) => {
    log({
      message,
      severity: 'INFO',
      app_name: APP_NAME,
      interaction_type: 'web_click',
      ...data
    });
  },

  geminiRequest: (message: string, data?: Record<string, any>) => {
    log({
      message,
      severity: 'INFO',
      app_name: APP_NAME,
      interaction_type: 'gemini_request',
      ...data
    });
  },

  geminiResponse: (message: string, data?: Record<string, any>) => {
    log({
      message,
      severity: 'INFO',
      app_name: APP_NAME,
      interaction_type: 'gemini_response',
      ...data
    });
  },

  appInit: (message: string, data?: Record<string, any>) => {
    log({
      message,
      severity: 'INFO',
      app_name: APP_NAME,
      interaction_type: 'app_init',
      ...data
    });
  }
};

export default log;
