type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  userAgent?: string;
  url?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logQueue: LogEntry[] = [];
  private maxQueueSize = 50;

  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
  }

  private log(level: LogLevel, message: string, data?: any) {
    const entry = this.createLogEntry(level, message, data);

    // Add to queue for potential batch sending
    this.logQueue.push(entry);
    if (this.logQueue.length > this.maxQueueSize) {
      this.logQueue.shift();
    }

    // Console logging in development
    if (this.isDevelopment) {
      const logMethod = level === 'debug' ? 'debug' :
                       level === 'info' ? 'info' :
                       level === 'warn' ? 'warn' : 'error';

      console[logMethod](`[${level.toUpperCase()}] ${message}`, data || '');
    }

    // In production, you could send to a logging service
    if (!this.isDevelopment && level === 'error') {
      this.sendToLoggingService(entry);
    }
  }

  private async sendToLoggingService(entry: LogEntry) {
    try {
      // This could be replaced with actual logging service calls
      // For now, we'll just store in localStorage for debugging
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      logs.push(entry);
      if (logs.length > 100) logs.shift(); // Keep only last 100 logs
      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (error) {
      // Silent fail to avoid infinite loops
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  // Get recent logs (useful for debugging)
  getRecentLogs(): LogEntry[] {
    return [...this.logQueue];
  }

  // Clear logs
  clearLogs() {
    this.logQueue = [];
    if (!this.isDevelopment) {
      localStorage.removeItem('app_logs');
    }
  }
}

export const logger = new Logger();

// React error boundary integration
export const logReactError = (error: Error, errorInfo: any) => {
  logger.error('React Error Boundary', {
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
  });
};

// Performance logging
export const logPerformance = (metric: string, value: number, data?: any) => {
  logger.info(`Performance: ${metric}`, { value, ...data });
};

// User action logging
export const logUserAction = (action: string, data?: any) => {
  logger.info(`User Action: ${action}`, data);
};