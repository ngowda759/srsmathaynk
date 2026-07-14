/**
 * Transaction Helper
 * 
 * Provides reusable Prisma transaction wrappers for atomic operations.
 * 
 * Features:
 * - executeTransaction: General transaction wrapper
 * - executeReadOnly: Read-only transaction for queries
 * - executeWithRetry: Retry with exponential backoff for transient failures
 */

import { prisma } from "@/lib/db";
import { logger } from "./logger";
import { DatabaseError } from "@/errors";
import type { ServiceResult } from "@/types";
import type { ChildLogger } from "./logger";

// ============================================================================
// Transaction Options
// ============================================================================

export interface TransactionOptions {
  timeout?: number;
  maxWait?: number;
  logger?: ChildLogger;
}

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_TIMEOUT = 30000;
const DEFAULT_MAX_WAIT = 20000;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY = 100;
const DEFAULT_MAX_DELAY = 5000;

// ============================================================================
// Transaction Execution
// ============================================================================

/**
 * Execute a function within a Prisma transaction
 * Returns the result of the function or catches and formats any errors
 */
export async function executeTransaction<T>(
  operation: (tx: Parameters<typeof prisma.$transaction>[0]) => Promise<T>,
  options: TransactionOptions = {}
): Promise<ServiceResult<T>> {
  const { 
    timeout = DEFAULT_TIMEOUT, 
    maxWait = DEFAULT_MAX_WAIT,
    logger: customLogger 
  } = options;

  const log = customLogger || logger;

  try {
    log.debug("Starting transaction", { timeout, maxWait });

    const result = await prisma.$transaction(operation, {
      timeout: timeout,
      maxWait: maxWait,
    });

    log.debug("Transaction completed successfully");
    return { status: "success", data: result };
  } catch (error) {
    log.error("Transaction failed", error as Error);

    if (error instanceof Error) {
      if (error.name === "PrismaClientKnownRequestError") {
        return {
          status: "error",
          code: "DB-002",
          message: error.message,
        };
      }

      return {
        status: "error",
        code: "DB-002",
        message: error.message,
      };
    }

    return {
      status: "error",
      code: "APP-001",
      message: "An unexpected error occurred during transaction",
    };
  }
}

/**
 * Execute a read-only transaction
 * Uses Prisma's interactive transaction with a shorter timeout
 * Read operations are typically faster and less likely to conflict
 */
export async function executeReadOnly<T>(
  operation: (tx: Parameters<typeof prisma.$transaction>[0]) => Promise<T>,
  options: TransactionOptions = {}
): Promise<ServiceResult<T>> {
  const { 
    timeout = 10000, // Shorter timeout for reads
    maxWait = 5000,
    logger: customLogger 
  } = options;

  const log = customLogger || logger;

  try {
    log.debug("Starting read-only transaction");

    const result = await prisma.$transaction(operation, {
      timeout: timeout,
      maxWait: maxWait,
      isolationLevel: "ReadCommitted", // Optional: reduce lock contention
    });

    log.debug("Read-only transaction completed");
    return { status: "success", data: result };
  } catch (error) {
    log.error("Read-only transaction failed", error as Error);

    return {
      status: "error",
      code: "DB-002",
      message: error instanceof Error ? error.message : "Read transaction failed",
    };
  }
}

/**
 * Execute a transaction with automatic retry on transient failures
 * Uses exponential backoff between retries
 * 
 * Best for:
 * - Booking confirmations
 * - Payment processing
 * - Any operation that might fail due to concurrent modifications
 */
export async function executeWithRetry<T>(
  operation: (tx: Parameters<typeof prisma.$transaction>[0]) => Promise<T>,
  options: TransactionOptions & RetryOptions = {}
): Promise<ServiceResult<T>> {
  const {
    maxRetries = DEFAULT_MAX_RETRIES,
    baseDelay = DEFAULT_BASE_DELAY,
    maxDelay = DEFAULT_MAX_DELAY,
    timeout = DEFAULT_TIMEOUT,
    maxWait = DEFAULT_MAX_WAIT,
    logger: customLogger
  } = options;

  const log = customLogger || logger;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      log.debug(`Transaction attempt ${attempt + 1}/${maxRetries + 1}`);

      const result = await prisma.$transaction(operation, {
        timeout: timeout,
        maxWait: maxWait,
      });

      log.debug(`Transaction succeeded on attempt ${attempt + 1}`);
      return { status: "success", data: result };
    } catch (error) {
      lastError = error;
      log.warn(`Transaction attempt ${attempt + 1} failed`, {
        error: error instanceof Error ? error.message : "Unknown error",
        attempt: attempt + 1,
        maxRetries,
      });

      // Check if error is retryable
      if (!isRetryableError(error)) {
        log.error("Non-retryable error, aborting", error as Error);
        break;
      }

      // Don't wait after last attempt
      if (attempt < maxRetries) {
        const delay = calculateBackoff(attempt, baseDelay, maxDelay);
        log.debug(`Waiting ${delay}ms before retry`);
        await sleep(delay);
      }
    }
  }

  return {
    status: "error",
    code: "DB-002",
    message: lastError instanceof Error 
      ? lastError.message 
      : "Transaction failed after retries",
  };
}

// ============================================================================
// Retry Logic Helpers
// ============================================================================

/**
 * Check if an error is retryable
 * Transient errors (timeouts, deadlocks, connection issues) are retryable
 */
function isRetryableError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const err = error as Record<string, unknown>;
  
  // Prisma error codes that indicate transient failures
  const retryableCodes = [
    "P2034", // Transaction timeout
    "P2037", // Too many connections
    "P2028", // Transaction API error
  ];

  if (err.code && typeof err.code === "string" && retryableCodes.includes(err.code)) {
    return true;
  }

  // Network errors
  if (err.name === "NetworkError" || err.name === "ConnectionError") {
    return true;
  }

  // Timeout errors
  if (err.message && typeof err.message === "string") {
    const timeoutIndicators = ["timeout", "timed out", "ETIMEDOUT", "ECONNRESET"];
    return timeoutIndicators.some(indicator => 
      err.message.toLowerCase().includes(indicator)
    );
  }

  return false;
}

/**
 * Calculate exponential backoff with jitter
 */
function calculateBackoff(
  attempt: number,
  baseDelay: number,
  maxDelay: number
): number {
  // Exponential backoff: base * 2^attempt
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  
  // Cap at max delay
  const cappedDelay = Math.min(exponentialDelay, maxDelay);
  
  // Add jitter (±25%) to prevent thundering herd
  const jitter = cappedDelay * 0.25 * (Math.random() * 2 - 1);
  
  return Math.floor(cappedDelay + jitter);
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Legacy Aliases (for backwards compatibility)
// ============================================================================

/**
 * @deprecated Use executeTransaction instead
 */
export async function withTransaction<T>(
  operation: () => Promise<T>,
  options: TransactionOptions = {}
): Promise<ServiceResult<T>> {
  return executeTransaction(async (tx) => operation(), options);
}

/**
 * @deprecated Use executeTransaction instead
 */
export async function withInteractiveTransaction<T>(
  operation: (tx: Parameters<typeof prisma.$transaction>[0]) => Promise<T>,
  options: TransactionOptions = {}
): Promise<ServiceResult<T>> {
  return executeTransaction(operation, options);
}

/**
 * Execute multiple operations sequentially within a transaction
 */
export async function executeSequentially<T>(
  operations: Array<(tx: Parameters<typeof prisma.$transaction>[0]) => Promise<T>>,
  options: TransactionOptions = {}
): Promise<ServiceResult<T[]>> {
  return executeTransaction(async (tx) => {
    const results: T[] = [];
    for (const operation of operations) {
      const result = await operation(tx);
      results.push(result);
    }
    return results;
  }, options);
}

/**
 * Execute operations in parallel within a transaction
 */
export async function executeInParallel<T>(
  operations: Array<(tx: Parameters<typeof prisma.$transaction>[0]) => Promise<T>>,
  options: TransactionOptions = {}
): Promise<ServiceResult<T[]>> {
  return executeTransaction(async (tx) => {
    return Promise.all(operations.map((op) => op(tx)));
  }, options);
}

// ============================================================================
// Savepoint Support (PostgreSQL only)
// ============================================================================

/**
 * Create a savepoint within a transaction
 * Useful for partial rollbacks
 */
export async function withSavepoint<T>(
  savepointName: string,
  operation: () => Promise<T>
): Promise<T> {
  logger.debug("Creating savepoint", { savepointName });

  try {
    await prisma.$executeRaw`SAVEPOINT ${savepointName}`;
    const result = await operation();
    await prisma.$executeRaw`RELEASE SAVEPOINT ${savepointName}`;
    return result;
  } catch (error) {
    await prisma.$executeRaw`ROLLBACK TO SAVEPOINT ${savepointName}`;
    throw error;
  }
}

// ============================================================================
// Transaction Decorator
// ============================================================================

/**
 * Transaction decorator for class methods
 * Usage: @transaction() async myMethod() { ... }
 */
export function transaction(options: TransactionOptions & RetryOptions = {}) {
  const useRetry = options.maxRetries !== undefined && options.maxRetries > 0;
  
  return function <T>(
    _target: object,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      if (useRetry) {
        return executeWithRetry(async () => originalMethod.apply(this, args), options);
      }
      return executeTransaction(async () => originalMethod.apply(this, args), options);
    };

    return descriptor;
  };
}

/**
 * Read-only transaction decorator
 * Usage: @readOnly() async myQuery() { ... }
 */
export function readOnly(options: Omit<TransactionOptions, "timeout"> = {}) {
  return function <T>(
    _target: object,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      return executeReadOnly(async () => originalMethod.apply(this, args), options);
    };

    return descriptor;
  };
}

// ============================================================================
// Transaction Utilities
// ============================================================================

/**
 * Check if currently in a transaction
 * Note: Prisma doesn't expose this directly, this is a best-effort check
 */
export function isInTransaction(): boolean {
  // This is a placeholder - Prisma v6+ may provide better introspection
  return false;
}
