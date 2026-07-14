/**
 * Application Error Classes
 * 
 * All application errors extend AppError for consistent error handling.
 * Errors include error codes for programmatic handling.
 */

// ============================================================================
// Base Error Class
// ============================================================================

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string = "INTERNAL_ERROR",
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

// ============================================================================
// Validation Error
// ============================================================================

export class ValidationError extends AppError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  ) {
    super(
      message,
      "VALIDATION_ERROR",
      400,
      details
    );
  }
}

// ============================================================================
// Not Found Error
// ============================================================================

export class NotFoundError extends AppError {
  constructor(
    resource: string,
    identifier?: string | number
  ) {
    const message = identifier 
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    
    super(
      message,
      "NOT_FOUND",
      404,
      { resource, identifier }
    );
  }
}

// ============================================================================
// Conflict Error
// ============================================================================

export class ConflictError extends AppError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  ) {
    super(
      message,
      "CONFLICT",
      409,
      details
    );
  }
}

// ============================================================================
// Authorization Error
// ============================================================================

export class AuthorizationError extends AppError {
  constructor(
    message: string = "You are not authorized to perform this action",
    details?: Record<string, unknown>
  ) {
    super(
      message,
      "UNAUTHORIZED",
      403,
      details
    );
  }
}

// ============================================================================
// Authentication Error
// ============================================================================

export class AuthenticationError extends AppError {
  constructor(
    message: string = "Authentication required",
    details?: Record<string, unknown>
  ) {
    super(
      message,
      "AUTHENTICATION_REQUIRED",
      401,
      details
    );
  }
}

// ============================================================================
// Database Error
// ============================================================================

export class DatabaseError extends AppError {
  constructor(
    message: string = "Database operation failed",
    details?: Record<string, unknown>
  ) {
    super(
      message,
      "DATABASE_ERROR",
      500,
      details
    );
  }
}

// ============================================================================
// Service Unavailable Error
// ============================================================================

export class ServiceUnavailableError extends AppError {
  constructor(
    service: string,
    details?: Record<string, unknown>
  ) {
    super(
      `Service '${service}' is currently unavailable`,
      "SERVICE_UNAVAILABLE",
      503,
      { service, ...details }
    );
  }
}

// ============================================================================
// Bad Request Error
// ============================================================================

export class BadRequestError extends AppError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  ) {
    super(
      message,
      "BAD_REQUEST",
      400,
      details
    );
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function getErrorCode(error: unknown): string {
  if (isAppError(error)) {
    return error.code;
  }
  return "INTERNAL_ERROR";
}

export function getStatusCode(error: unknown): number {
  if (isAppError(error)) {
    return error.statusCode;
  }
  return 500;
}
