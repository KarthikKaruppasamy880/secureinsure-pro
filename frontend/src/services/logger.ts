import { toast } from 'react-hot-toast';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  details?: any;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  stackTrace?: string;
}

export interface LogFilter {
  level?: LogLevel;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  searchText?: string;
}

class LoggerService {
  private logs: LogEntry[] = [];
  private maxLogs = 10000; // Keep last 10k logs in memory
  private storageKey = 'secureinsure_logs';
  private sessionId: string;
  private isInitialized = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  private initialize() {
    try {
      // Load existing logs from localStorage
      const storedLogs = localStorage.getItem(this.storageKey);
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
        // Keep only recent logs to avoid memory issues
        if (this.logs.length > this.maxLogs) {
          this.logs = this.logs.slice(-this.maxLogs);
        }
      }

      // Set up periodic log persistence
      setInterval(() => this.persistLogs(), 30000); // Every 30 seconds

      // Set up error boundary logging
      window.addEventListener('error', (event) => {
        this.error('GlobalError', 'Unhandled JavaScript error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error?.stack
        });
      });

      // Set up unhandled promise rejection logging
      window.addEventListener('unhandledrejection', (event) => {
        this.error('GlobalError', 'Unhandled promise rejection', {
          reason: event.reason,
          promise: event.promise
        });
      });

      this.isInitialized = true;
      this.info('Logger', 'Logger service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize logger:', error);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createLogEntry(
    level: LogLevel,
    category: string,
    message: string,
    details?: any
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      details,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Add user ID if available
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.id) {
        entry.userId = user.id;
      }
    } catch (error) {
      // Ignore parsing errors
    }

    // Add stack trace for errors
    if (level === LogLevel.ERROR || level === LogLevel.CRITICAL) {
      entry.stackTrace = new Error().stack;
    }

    return entry;
  }

  private async persistLogs() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
      
      // Also send critical logs to backend if available
      const criticalLogs = this.logs.filter(log => log.level === LogLevel.CRITICAL);
      if (criticalLogs.length > 0) {
        await this.sendLogsToBackend(criticalLogs);
      }
    } catch (error) {
      console.error('Failed to persist logs:', error);
    }
  }

  private async sendLogsToBackend(logs: LogEntry[]) {
    try {
      const response = await fetch('/api/v1/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send logs to backend:', error);
    }
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    
    // Remove old logs if we exceed the limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Show toast for critical errors
    if (entry.level === LogLevel.CRITICAL) {
      toast.error(`Critical Error: ${entry.message}`, {
        duration: 10000,
        position: 'top-center'
      });
    }

    // Show toast for errors
    if (entry.level === LogLevel.ERROR) {
      toast.error(`Error: ${entry.message}`, {
        duration: 5000,
        position: 'top-right'
      });
    }

    // Show toast for warnings
    if (entry.level === LogLevel.WARN) {
      toast(`Warning: ${entry.message}`, {
        duration: 3000,
        position: 'top-right',
        icon: '⚠️'
      });
    }

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = entry.level === LogLevel.ERROR || entry.level === LogLevel.CRITICAL 
        ? 'error' 
        : entry.level === LogLevel.WARN 
        ? 'warn' 
        : 'log';
      
      console[consoleMethod](`[${entry.level}] ${entry.category}: ${entry.message}`, entry.details || '');
    }
  }

  debug(category: string, message: string, details?: any) {
    const entry = this.createLogEntry(LogLevel.DEBUG, category, message, details);
    this.addLog(entry);
  }

  info(category: string, message: string, details?: any) {
    const entry = this.createLogEntry(LogLevel.INFO, category, message, details);
    this.addLog(entry);
  }

  warn(category: string, message: string, details?: any) {
    const entry = this.createLogEntry(LogLevel.WARN, category, message, details);
    this.addLog(entry);
  }

  error(category: string, message: string, details?: any) {
    const entry = this.createLogEntry(LogLevel.ERROR, category, message, details);
    this.addLog(entry);
  }

  critical(category: string, message: string, details?: any) {
    const entry = this.createLogEntry(LogLevel.CRITICAL, category, message, details);
    this.addLog(entry);
  }

  // Get logs with filtering
  getLogs(filter?: LogFilter): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filter?.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filter.level);
    }

    if (filter?.category) {
      filteredLogs = filteredLogs.filter(log => log.category === filter.category);
    }

    if (filter?.startDate) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= filter.startDate!);
    }

    if (filter?.endDate) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= filter.endDate!);
    }

    if (filter?.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filter.userId);
    }

    if (filter?.searchText) {
      const searchLower = filter.searchText.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(searchLower) ||
        log.category.toLowerCase().includes(searchLower)
      );
    }

    return filteredLogs.reverse(); // Most recent first
  }

  // Get log statistics
  getLogStats(): { [key in LogLevel]: number } {
    const stats = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 0,
      [LogLevel.WARN]: 0,
      [LogLevel.ERROR]: 0,
      [LogLevel.CRITICAL]: 0
    };

    this.logs.forEach(log => {
      stats[log.level]++;
    });

    return stats;
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    localStorage.removeItem(this.storageKey);
    this.info('Logger', 'All logs cleared');
  }

  // Export logs
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['Timestamp', 'Level', 'Category', 'Message', 'Details', 'UserId', 'SessionId', 'URL'];
      const csvContent = [
        headers.join(','),
        ...this.logs.map(log => [
          log.timestamp,
          log.level,
          log.category,
          `"${log.message.replace(/"/g, '""')}"`,
          log.details ? `"${JSON.stringify(log.details).replace(/"/g, '""')}"` : '',
          log.userId || '',
          log.sessionId,
          log.url || ''
        ].join(','))
      ].join('\n');
      
      return csvContent;
    } else {
      return JSON.stringify(this.logs, null, 2);
    }
  }

  // Download logs
  downloadLogs(format: 'json' | 'csv' = 'json') {
    const content = this.exportLogs(format);
    const blob = new Blob([content], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `secureinsure-logs-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Get recent errors for quick issue identification
  getRecentErrors(limit: number = 10): LogEntry[] {
    return this.logs
      .filter(log => log.level === LogLevel.ERROR || log.level === LogLevel.CRITICAL)
      .slice(-limit)
      .reverse();
  }

  // Check for critical issues
  hasCriticalIssues(): boolean {
    return this.logs.some(log => log.level === LogLevel.CRITICAL);
  }

  // Get system health status
  getSystemHealth(): 'healthy' | 'warning' | 'critical' {
    const stats = this.getLogStats();
    const recentLogs = this.logs.slice(-100); // Last 100 logs
    
    const recentErrors = recentLogs.filter(log => 
      log.level === LogLevel.ERROR || log.level === LogLevel.CRITICAL
    ).length;
    
    if (stats[LogLevel.CRITICAL] > 0 || recentErrors > 10) {
      return 'critical';
    } else if (stats[LogLevel.ERROR] > 5 || recentErrors > 5) {
      return 'warning';
    } else {
      return 'healthy';
    }
  }
}

// Create singleton instance
export const logger = new LoggerService();

// Export convenience functions
export const logDebug = (category: string, message: string, details?: any) => 
  logger.debug(category, message, details);
export const logInfo = (category: string, message: string, details?: any) => 
  logger.info(category, message, details);
export const logWarn = (category: string, message: string, details?: any) => 
  logger.warn(category, message, details);
export const logError = (category: string, message: string, details?: any) => 
  logger.error(category, message, details);
export const logCritical = (category: string, message: string, details?: any) => 
  logger.critical(category, message, details);
