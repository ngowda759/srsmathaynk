/**
 * Logger utility for consistent logging across the application
 */

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const LOG_LEVELS: Record<string, LogLevel> = {
  development: LogLevel.DEBUG,
  production: LogLevel.INFO,
  test: LogLevel.DEBUG,
}

const currentLevel = LOG_LEVELS[process.env.NODE_ENV || "development"] ?? LogLevel.INFO

function formatMessage(level: string, message: string, meta?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString()
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : ""
  return `[${timestamp}] [${level}] ${message}${metaStr}`
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>) {
    if (currentLevel <= LogLevel.DEBUG) {
      console.debug(formatMessage("DEBUG", message, meta))
    }
  },

  info(message: string, meta?: Record<string, unknown>) {
    if (currentLevel <= LogLevel.INFO) {
      console.info(formatMessage("INFO", message, meta))
    }
  },

  warn(message: string, meta?: Record<string, unknown>) {
    if (currentLevel <= LogLevel.WARN) {
      console.warn(formatMessage("WARN", message, meta))
    }
  },

  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>) {
    if (currentLevel <= LogLevel.ERROR) {
      const errorMeta: Record<string, unknown> = { ...meta }
      
      if (error instanceof Error) {
        errorMeta.errorName = error.name
        errorMeta.errorMessage = error.message
        errorMeta.stack = error.stack
      } else if (error) {
        errorMeta.error = String(error)
      }
      
      console.error(formatMessage("ERROR", message, errorMeta))
    }
  },
}

// Export convenience functions
export const log = logger
export default logger
