/**
 * Application Error Classes
 * 
 * All application errors extend AppError for consistent error handling.
 * Error codes follow the pattern: PREFIX-XXX (e.g., APP-001, AUTH-001)
 * 
 * Code Ranges:
 * - APP-xxx: Application-level errors
 * - AUTH-xxx: Authentication errors
 * - VAL-xxx: Validation errors
 * - DB-xxx: Database errors
 * - ANN-xxx: Announcement errors
 * - BOOK-xxx: Booking errors
 * - DON-xxx: Donation errors
 * - SEVA-xxx: Seva errors
 * - EVT-xxx: Event errors
 * - USR-xxx: User errors
 */

// ============================================================================
// Error Code Registry
// ============================================================================

export const ErrorCodes = {
  // Application (APP)
  APP_INTERNAL: "APP-001",
  APP_BAD_REQUEST: "APP-002",
  APP_CONFLICT: "APP-003",
  APP_SERVICE_UNAVAILABLE: "APP-004",
  
  // Authentication (AUTH)
  AUTH_REQUIRED: "AUTH-001",
  AUTH_INVALID_TOKEN: "AUTH-002",
  AUTH_EXPIRED_TOKEN: "AUTH-003",
  AUTH_INVALID_CREDENTIALS: "AUTH-004",
  AUTH_ACCOUNT_LOCKED: "AUTH-005",
  AUTH_EMAIL_NOT_VERIFIED: "AUTH-006",
  
  // Authorization (AUTHZ)
  AUTHZ_FORBIDDEN: "AUTHZ-001",
  AUTHZ_INSUFFICIENT_PERMISSIONS: "AUTHZ-002",
  
  // Validation (VAL)
  VAL_INVALID_INPUT: "VAL-001",
  VAL_MISSING_FIELD: "VAL-002",
  VAL_INVALID_FORMAT: "VAL-003",
  VAL_OUT_OF_RANGE: "VAL-004",
  
  // Database (DB)
  DB_CONNECTION: "DB-001",
  DB_QUERY_FAILED: "DB-002",
  DB_CONSTRAINT_VIOLATION: "DB-003",
  DB_NOT_FOUND: "DB-004",
  
  // Announcement (ANN)
  ANN_NOT_FOUND: "ANN-001",
  ANN_PUBLISH_FAILED: "ANN-002",
  ANN_ALREADY_PUBLISHED: "ANN-003",
  
  // Booking (BOOK)
  BOOK_NOT_FOUND: "BOOK-001",
  BOOK_INVALID_STATUS: "BOOK-002",
  BOOK_SEVA_UNAVAILABLE: "BOOK-003",
  BOOK_CAPACITY_EXCEEDED: "BOOK-004",
  BOOK_ALREADY_CONFIRMED: "BOOK-005",
  BOOK_ALREADY_CANCELLED: "BOOK-006",
  BOOK_PAYMENT_REQUIRED: "BOOK-007",
  BOOK_PAYMENT_FAILED: "BOOK-008",
  
  // Donation (DON)
  DON_NOT_FOUND: "DON-001",
  DON_INVALID_AMOUNT: "DON-002",
  DON_PAYMENT_FAILED: "DON-003",
  DON_REFUND_FAILED: "DON-004",
  DON_CAMPAIGN_NOT_FOUND: "DON-005",
  
  // Seva (SEVA)
  SEVA_NOT_FOUND: "SEVA-001",
  SEVA_NOT_AVAILABLE: "SEVA-002",
  SEVA_CAPACITY_EXCEEDED: "SEVA-003",
  
  // Event (EVT)
  EVT_NOT_FOUND: "EVT-001",
  EVT_PAST_REGISTRATION: "EVT-002",
  EVT_REGISTRATION_CLOSED: "EVT-003",
  
  // User (USR)
  USR_NOT_FOUND: "USR-001",
  USR_EMAIL_EXISTS: "USR-002",
  USR_ACCOUNT_DISABLED: "USR-003",
  
  // Payment (PAY)
  PAY_NOT_FOUND: "PAY-001",
  PAY_ALREADY_PROCESSED: "PAY-002",
  PAY_REFUND_NOT_ALLOWED: "PAY-003",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// ============================================================================
// Status Code Mapping
// ============================================================================

const StatusCodes: Record<string, number> = {
  // 4xx Client Errors
  "AUTH-001": 401,
  "AUTH-002": 401,
  "AUTH-003": 401,
  "AUTH-004": 401,
  "AUTH-005": 401,
  "AUTH-006": 401,
  "AUTHZ-001": 403,
  "AUTHZ-002": 403,
  "VAL-001": 400,
  "VAL-002": 400,
  "VAL-003": 400,
  "VAL-004": 400,
  "APP-002": 400,
  "APP-003": 409,
  
  // 5xx Server Errors
  "APP-001": 500,
  "APP-004": 503,
  "DB-001": 500,
  "DB-002": 500,
  "DB-003": 409,
  "DB-004": 404,
};

// ============================================================================
// Base Error Class
// ============================================================================

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly isOperational: boolean;
  public readonly errorId: string;

  constructor(
    message: string,
    code: ErrorCode = ErrorCodes.APP_INTERNAL,
    statusCode?: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode || StatusCodes[code] || 500;
    this.details = details;
    this.isOperational = true;
    this.errorId = generateErrorId();

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      errorId: this.errorId,
      details: this.details,
    };
  }
}

function generateErrorId(): string {
  return `err_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

// ============================================================================
// Validation Error (VAL-xxx)
// ============================================================================

export class ValidationError extends AppError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  ) {
    super(
      message,
      ErrorCodes.VAL_INVALID_INPUT,
      400,
      details
    );
  }
}

export class MissingFieldError extends AppError {
  constructor(
    field: string,
    details?: Record<string, unknown>
  ) {
    super(
      `Missing required field: ${field}`,
      ErrorCodes.VAL_MISSING_FIELD,
      400,
      { field, ...details }
    );
  }
}

export class InvalidFormatError extends AppError {
  constructor(
    field: string,
    format: string,
    details?: Record<string, unknown>
  ) {
    super(
      `Invalid format for field '${field}': expected ${format}`,
      ErrorCodes.VAL_INVALID_FORMAT,
      400,
      { field, format, ...details }
    );
  }
}

// ============================================================================
// Not Found Error (xxx-NOT_FOUND)
// ============================================================================

export class NotFoundError extends AppError {
  constructor(
    resource: string,
    identifier?: string | number,
    code: ErrorCode = ErrorCodes.DB_NOT_FOUND
  ) {
    const message = identifier 
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    
    super(
      message,
      code,
      404,
      { resource, identifier }
    );
  }
}

// ============================================================================
// Conflict Error (APP-CONFLICT)
// ============================================================================

export class ConflictError extends AppError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  ) {
    super(
      message,
      ErrorCodes.APP_CONFLICT,
      409,
      details
    );
  }
}

// ============================================================================
// Authorization Errors (AUTHZ-xxx)
// ============================================================================

export class AuthorizationError extends AppError {
  constructor(
    message: string = "You are not authorized to perform this action",
    details?: Record<string, unknown>
  ) {
    super(
      message,
      ErrorCodes.AUTHZ_FORBIDDEN,
      403,
      details
    );
  }
}

export class InsufficientPermissionsError extends AppError {
  constructor(
    required: string[],
    details?: Record<string, unknown>
  ) {
    super(
      `Insufficient permissions. Required: ${required.join(", ")}`,
      ErrorCodes.AUTHZ_INSUFFICIENT_PERMISSIONS,
      403,
      { required, ...details }
    );
  }
}

// ============================================================================
// Authentication Errors (AUTH-xxx)
// ============================================================================

export class AuthenticationError extends AppError {
  constructor(
    message: string = "Authentication required",
    code: ErrorCode = ErrorCodes.AUTH_REQUIRED,
    details?: Record<string, unknown>
  ) {
    super(
      message,
      code,
      401,
      details
    );
  }
}

export class InvalidTokenError extends AppError {
  constructor(details?: Record<string, unknown>) {
    super(
      "Invalid or malformed authentication token",
      ErrorCodes.AUTH_INVALID_TOKEN,
      401,
      details
    );
  }
}

export class ExpiredTokenError extends AppError {
  constructor(details?: Record<string, unknown>) {
    super(
      "Authentication token has expired",
      ErrorCodes.AUTH_EXPIRED_TOKEN,
      401,
      details
    );
  }
}

// ============================================================================
// Database Errors (DB-xxx)
// ============================================================================

export class DatabaseError extends AppError {
  constructor(
    message: string = "Database operation failed",
    code: ErrorCode = ErrorCodes.DB_QUERY_FAILED,
    details?: Record<string, unknown>
  ) {
    super(
      message,
      code,
      500,
      details
    );
  }
}

export class ConstraintViolationError extends DatabaseError {
  constructor(
    constraint: string,
    details?: Record<string, unknown>
  ) {
    super(
      `Database constraint violation: ${constraint}`,
      ErrorCodes.DB_CONSTRAINT_VIOLATION,
      { constraint, ...details }
    );
  }
}

// ============================================================================
// Service Unavailable Error (APP-SERVICE_UNAVAILABLE)
// ============================================================================

export class ServiceUnavailableError extends AppError {
  constructor(
    service: string,
    details?: Record<string, unknown>
  ) {
    super(
      `Service '${service}' is currently unavailable`,
      ErrorCodes.APP_SERVICE_UNAVAILABLE,
      503,
      { service, ...details }
    );
  }
}

// ============================================================================
// Bad Request Error (APP-BAD_REQUEST)
// ============================================================================

export class BadRequestError extends AppError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  ) {
    super(
      message,
      ErrorCodes.APP_BAD_REQUEST,
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
  return ErrorCodes.APP_INTERNAL;
}

export function getStatusCode(error: unknown): number {
  if (isAppError(error)) {
    return error.statusCode;
  }
  return 500;
}
