/**
 * Base Service
 * 
 * Provides a foundation for all services with ServiceResult pattern.
 * Business logic MUST go through services per ADR-001.
 * Services should NOT access Prisma directly - use repositories instead.
 * 
 * Usage:
 * ```typescript
 * class AnnouncementService extends BaseService {
 *   constructor(
 *     private repository: AnnouncementRepository
 *   ) {
 *     super();
 *   }
 * 
 *   async getAnnouncement(id: string): Promise<ServiceResult<Announcement>> {
 *     try {
 *       const announcement = await this.repository.findById(id);
 *       return this.success(announcement);
 *     } catch (error) {
 *       return this.handleError(error);
 *     }
 *   }
 * }
 * ```
 */

import { logger } from "@/lib/logger";
import { AppError, DatabaseError, NotFoundError, ConflictError } from "@/errors";
import type { ServiceResult, ServiceSuccess, ServiceError } from "@/types";

// ============================================================================
// Service Result Helpers
// ============================================================================

export abstract class BaseService {
  protected readonly serviceName: string;

  constructor(serviceName?: string) {
    this.serviceName = serviceName || this.constructor.name.replace("Service", "");
  }

  // ==========================================================================
  // ServiceResult Helpers
  // ==========================================================================

  /**
   * Create a success result
   */
  protected success<T>(
    data: T,
    message?: string
  ): ServiceSuccess<T> {
    return {
      status: "success",
      data,
      message,
    };
  }

  /**
   * Create an error result
   */
  protected error(
    code: string,
    message: string,
    details?: Record<string, unknown>
  ): ServiceError {
    return {
      status: "error",
      code,
      message,
      details,
    };
  }

  /**
   * Handle errors and convert to ServiceError
   */
  protected handleError(error: unknown): ServiceError {
    if (error instanceof AppError) {
      logger.warn(`${this.serviceName} error`, {
        code: error.code,
        message: error.message,
      });

      return {
        status: "error",
        code: error.code,
        message: error.message,
        details: error.details,
      };
    }

    if (error instanceof Error) {
      logger.error(`${this.serviceName} unexpected error`, error);

      return {
        status: "error",
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      };
    }

    logger.error(`${this.serviceName} unknown error`, { error });

    return {
      status: "error",
      code: "UNKNOWN_ERROR",
      message: "An unexpected error occurred",
    };
  }

  // ==========================================================================
  // Validation Helpers
  // ==========================================================================

  /**
   * Check if a result is a success
   */
  protected isSuccess<T>(result: ServiceResult<T>): result is ServiceSuccess<T> {
    return result.status === "success";
  }

  /**
   * Check if a result is an error
   */
  protected isError<T>(result: ServiceResult<T>): result is ServiceError {
    return result.status === "error";
  }

  /**
   * Extract data from result or throw
   */
  protected unwrap<T>(result: ServiceResult<T>): T {
    if (this.isError(result)) {
      throw new Error(result.message);
    }
    return result.data;
  }

  /**
   * Extract data from result or return default
   */
  protected unwrapOr<T>(result: ServiceResult<T>, defaultValue: T): T {
    if (this.isError(result)) {
      return defaultValue;
    }
    return result.data;
  }

  // ==========================================================================
  // Logging Helpers
  // ==========================================================================

  protected logInfo(message: string, context?: Record<string, unknown>): void {
    logger.info(`${this.serviceName}: ${message}`, context);
  }

  protected logWarn(message: string, context?: Record<string, unknown>): void {
    logger.warn(`${this.serviceName}: ${message}`, context);
  }

  protected logError(message: string, error?: Error, context?: Record<string, unknown>): void {
    logger.error(`${this.serviceName}: ${message}`, error, context);
  }

  protected logDebug(message: string, context?: Record<string, unknown>): void {
    logger.debug(`${this.serviceName}: ${message}`, context);
  }
}

// ============================================================================
// Service Composition
// ============================================================================

/**
 * Compose multiple service results
 */
export async function compose<T, R>(
  operations: Array<() => Promise<ServiceResult<T>>>,
  transform: (results: T[]) => R
): Promise<ServiceResult<R>> {
  const results: T[] = [];

  for (const operation of operations) {
    const result = await operation();
    if (result.status === "error") {
      return result;
    }
    results.push(result.data);
  }

  return {
    status: "success",
    data: transform(results),
  };
}

/**
 * Chain service operations
 */
export async function chain<T, R>(
  operation: () => Promise<ServiceResult<T>>,
  transform: (data: T) => ServiceResult<R>
): Promise<ServiceResult<R>> {
  const result = await operation();
  
  if (result.status === "error") {
    return result;
  }

  return transform(result.data);
}

/**
 * Map over service results
 */
export async function mapResults<T, R>(
  items: T[],
  operation: (item: T) => Promise<ServiceResult<R>>
): Promise<ServiceResult<R[]>> {
  const results: R[] = [];
  const errors: ServiceError[] = [];

  for (const item of items) {
    const result = await operation(item);
    if (result.status === "error") {
      errors.push(result);
    } else {
      results.push(result.data);
    }
  }

  if (errors.length > 0) {
    return {
      status: "error",
      code: "PARTIAL_FAILURE",
      message: `${errors.length} operations failed out of ${items.length}`,
      details: { errors, successCount: results.length, failureCount: errors.length },
    };
  }

  return {
    status: "success",
    data: results,
  };
}

// ============================================================================
// Async Wrapper
// ============================================================================

/**
 * Wrap an async function with error handling
 */
export function withErrorHandling<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  serviceName: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      logger.error(`${serviceName} error`, error as Error);
      
      if (error instanceof AppError) {
        return {
          status: "error",
          code: error.code,
          message: error.message,
          details: error.details,
        };
      }

      return {
        status: "error",
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      };
    }
  }) as T;
}
