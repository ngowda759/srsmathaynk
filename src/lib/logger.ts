/**
 * Structured Logger
 * 
 * Provides structured logging with levels: debug, info, warn, error
 * All logs are written to stderr in JSON format for easy parsing.
 * 
 * DO NOT use console.log, console.error, etc. in application code.
 * Always use this logger instead.
 */

import type { LogLevel, LogContext, LogEntry } from "@/types";

// ============================================================================
// Configuration
// ============================================================================

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

interface LoggerConfig {
  level: LogLevel;
  environment: string;
  service: string;
}

let config: LoggerConfig = {
  level: (process.env.LOG_LEVEL as LogLevel) || "info",
  environment: process.env.NODE_ENV || "development",
  service: process.env.SERVICE_NAME || "srsmatha-portal",
};

// ============================================================================
// Internal Functions
// ============================================================================

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[config.level];
}

function formatEntry(entry: LogEntry): string {
  const output = {
    timestamp: entry.timestamp,
    level: entry.level.toUpperCase(),
    service: config.service,
    environment: config.environment,
    message: entry.message,
    ...(entry.context && { context: entry.context }),
    ...(entry.error && {
      error: {
        name: entry.error.name,
        message: entry.error.message,
        stack: entry.error.stack,
      },
    }),
  };

  return JSON.stringify(output);
}

function writeLog(entry: LogEntry): void {
  if (!shouldLog(entry.level)) {
    return;
  }

  const formatted = formatEntry(entry);
  
  switch (entry.level) {
    case "error":
      process.stderr.write(formatted + "\n");
      break;
    case "warn":
      process.stderr.write(formatted + "\n");
      break;
    default:
      process.stderr.write(formatted + "\n");
  }
}

function createEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error
): LogEntry {
  return {
    level,
    message,
    context,
    error,
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// Logger API
// ============================================================================

export const logger = {
  /**
   * Configure logger settings
   */
  configure(newConfig: Partial<LoggerConfig>): void {
    config = { ...config, ...newConfig };
  },

  /**
   * Get current configuration
   */
  getConfig(): Readonly<LoggerConfig> {
    return { ...config };
  },

  /**
   * Debug level logging - detailed information for debugging
   */
  debug(message: string, context?: LogContext): void {
    writeLog(createEntry("debug", message, context));
  },

  /**
   * Info level logging - general operational information
   */
  info(message: string, context?: LogContext): void {
    writeLog(createEntry("info", message, context));
  },

  /**
   * Warn level logging - potential issues that need attention
   */
  warn(message: string, context?: LogContext): void {
    writeLog(createEntry("warn", message, context));
  },

  /**
   * Error level logging - errors that need to be investigated
   */
  error(message: string, error?: Error, context?: LogContext): void {
    writeLog(createEntry("error", message, context, error));
  },

  /**
   * Log a child logger with additional context
   */
  child(childContext: LogContext): ChildLogger {
    return new ChildLogger(this, childContext);
  },
};

// ============================================================================
// Child Logger
// ============================================================================

class ChildLogger {
  private parent: typeof logger;
  private context: LogContext;

  constructor(parent: typeof logger, context: LogContext) {
    this.parent = parent;
    this.context = context;
  }

  debug(message: string, context?: LogContext): void {
    this.parent.debug(message, { ...this.context, ...context });
  }

  info(message: string, context?: LogContext): void {
    this.parent.info(message, { ...this.context, ...context });
  }

  warn(message: string, context?: LogContext): void {
    this.parent.warn(message, { ...this.context, ...context });
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.parent.error(message, error, { ...this.context, ...context });
  }

  child(additionalContext: LogContext): ChildLogger {
    return new ChildLogger(this.parent, { ...this.context, ...additionalContext });
  }
}

// ============================================================================
// Export for use in other modules
// ============================================================================

export type { LogContext, LogLevel };

// Prevent direct console usage (ESLint will catch this)
export const _console = console;
