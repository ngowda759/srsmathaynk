/**
 * Structured Logger
 * 
 * Provides structured logging with levels: debug, info, warn, error
 * All logs are written to stderr in JSON format for easy parsing.
 * 
 * Features:
 * - Correlation IDs for request tracing
 * - Child loggers with inherited context
 * - No console.log in application code
 * 
 * Usage:
 * ```typescript
 * // In request handler
 * const requestId = logger.generateRequestId();
 * const reqLogger = logger.withCorrelationId(requestId);
 * 
 * // Pass to service/repository
 * reqLogger.info("Processing request");
 * 
 * // Repository layer logs with same correlation ID
 * reqLogger.info("Query completed", { rows: 5 });
 * ```
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
// Request ID Management
// ============================================================================

let currentRequestId: string | null = null;

/**
 * Generate a unique request ID for tracing
 */
function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
}

/**
 * Get the current request ID
 */
export function getRequestId(): string | null {
  return currentRequestId;
}

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
    ...(entry.requestId && { requestId: entry.requestId }),
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
  error?: Error,
  requestId?: string | null
): LogEntry {
  return {
    level,
    message,
    context,
    error,
    timestamp: new Date().toISOString(),
    requestId: requestId || currentRequestId,
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
   * Generate a unique request ID
   */
  generateRequestId(): string {
    return generateRequestId();
  },

  /**
   * Create a logger with correlation ID
   */
  withCorrelationId(requestId: string): ChildLogger {
    return new ChildLogger(this, { requestId });
  },

  /**
   * Set current request ID for the scope
   */
  withRequestId<T>(requestId: string, fn: () => T): T {
    const previousId = currentRequestId;
    currentRequestId = requestId;
    try {
      return fn();
    } finally {
      currentRequestId = previousId;
    }
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

export class ChildLogger {
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

  withCorrelationId(requestId: string): ChildLogger {
    return this.parent.withCorrelationId(requestId);
  }
}

// ============================================================================
// Export for use in other modules
// ============================================================================

export type { LogContext, LogLevel };

// Prevent direct console usage (ESLint will catch this)
export const _console = console;
