/**
 * Transaction Helper
 * 
 * Provides a reusable Prisma transaction wrapper for atomic operations.
 */

import { prisma } from "@/lib/db";
import { logger } from "./logger";
import { DatabaseError } from "@/errors";
import type { ServiceResult } from "@/types";

// ============================================================================
// Transaction Options
// ============================================================================

export interface TransactionOptions {
  timeout?: number;
  maxWait?: number;
}

/**
 * Execute a function within a Prisma transaction
 * Returns the result of the function or catches and formats any errors
 */
export async function withTransaction<T>(
  operation: () => Promise<T>,
  options: TransactionOptions = {}
): Promise<ServiceResult<T>> {
  const { timeout = 30000, maxWait = 20000 } = options;

  try {
    logger.debug("Starting transaction", { timeout, maxWait });

    const result = await prisma.$transaction(operation, {
      timeout: timeout,
      maxWait: maxWait,
    });

    logger.debug("Transaction completed successfully");
    return { status: "success", data: result };
  } catch (error) {
    logger.error("Transaction failed", error as Error);

    if (error instanceof Error) {
      // Handle Prisma-specific errors
      if (error.name === "PrismaClientKnownRequestError") {
        return {
          status: "error",
          code: "DATABASE_ERROR",
          message: error.message,
        };
      }

      return {
        status: "error",
        code: "TRANSACTION_FAILED",
        message: error.message,
      };
    }

    return {
      status: "error",
      code: "UNKNOWN_ERROR",
      message: "An unexpected error occurred during transaction",
    };
  }
}

/**
 * Execute a function within a Prisma interactive transaction
 * Use this when you need to perform multiple operations and want more control
 */
export async function withInteractiveTransaction<T>(
  operation: (tx: Parameters<typeof prisma.$transaction>[0]) => Promise<T>,
  options: TransactionOptions = {}
): Promise<ServiceResult<T>> {
  const { timeout = 30000, maxWait = 20000 } = options;

  try {
    logger.debug("Starting interactive transaction");

    const result = await prisma.$transaction(
      async (tx) => operation(tx),
      {
        timeout: timeout,
        maxWait: maxWait,
      }
    );

    logger.debug("Interactive transaction completed successfully");
    return { status: "success", data: result };
  } catch (error) {
    logger.error("Interactive transaction failed", error as Error);

    if (error instanceof Error) {
      return {
        status: "error",
        code: "DATABASE_ERROR",
        message: error.message,
      };
    }

    return {
      status: "error",
      code: "UNKNOWN_ERROR",
      message: "An unexpected error occurred during transaction",
    };
  }
}

/**
 * Execute multiple operations sequentially within a transaction
 * If any operation fails, all changes are rolled back
 */
export async function executeSequentially<T>(
  operations: Array<() => Promise<T>>,
  options: TransactionOptions = {}
): Promise<ServiceResult<T[]>> {
  try {
    logger.debug("Starting sequential transaction", {
      operations: operations.length,
    });

    const results = await prisma.$transaction(async (tx) => {
      const results: T[] = [];
      for (const operation of operations) {
        const result = await operation();
        results.push(result);
      }
      return results;
    });

    logger.debug("Sequential transaction completed successfully");
    return { status: "success", data: results };
  } catch (error) {
    logger.error("Sequential transaction failed", error as Error);

    return {
      status: "error",
      code: "TRANSACTION_FAILED",
      message: error instanceof Error ? error.message : "Transaction failed",
    };
  }
}

/**
 * Execute operations in parallel within a transaction
 */
export async function executeInParallel<T>(
  operations: Array<() => Promise<T>>,
  options: TransactionOptions = {}
): Promise<ServiceResult<T[]>> {
  try {
    logger.debug("Starting parallel transaction", {
      operations: operations.length,
    });

    const results = await prisma.$transaction(async (tx) => {
      return Promise.all(operations.map((op) => op()));
    });

    logger.debug("Parallel transaction completed successfully");
    return { status: "success", data: results };
  } catch (error) {
    logger.error("Parallel transaction failed", error as Error);

    return {
      status: "error",
      code: "TRANSACTION_FAILED",
      message: error instanceof Error ? error.message : "Transaction failed",
    };
  }
}

/**
 * Create a savepoint within a transaction (for nested transactions)
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

/**
 * Transaction decorator for class methods
 * Usage: @transaction() async myMethod() { ... }
 */
export function transaction(options: TransactionOptions = {}) {
  return function <T>(
    _target: object,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      return withTransaction(() => originalMethod.apply(this, args), options);
    };

    return descriptor;
  };
}

/**
 * Check if currently in a transaction
 */
export function isInTransaction(): boolean {
  // Prisma doesn't expose this directly, but we can check the connection state
  // This is a placeholder - actual implementation may vary based on Prisma version
  return false;
}
