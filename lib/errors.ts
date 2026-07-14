/**
 * Error handling utilities for consistent error management
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = "AppError"
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, "VALIDATION_ERROR", 400)
    this.name = "ValidationError"
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, "AUTHENTICATION_ERROR", 401)
    this.name = "AuthenticationError"
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, "AUTHORIZATION_ERROR", 403)
    this.name = "AuthorizationError"
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, "NOT_FOUND", 404)
    this.name = "NotFoundError"
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = "Database error occurred") {
    super(message, "DATABASE_ERROR", 500)
    this.name = "DatabaseError"
  }
}

// Error response formatter
export function formatErrorResponse(error: Error | AppError) {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.field && { field: error.field }),
      },
    }
  }

  // Unknown errors
  return {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: process.env.NODE_ENV === "production" 
        ? "An unexpected error occurred" 
        : error.message,
    },
  }
}

// Error handler for API routes
export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return Response.json(formatErrorResponse(error), {
      status: error.statusCode,
    })
  }

  // Log unexpected errors
  console.error("Unexpected error:", error)

  return Response.json(formatErrorResponse(new AppError("Internal server error", "INTERNAL_ERROR", 500)), {
    status: 500,
  })
}

// Supabase error handler
export function handleSupabaseError(error: unknown): AppError {
  if (error && typeof error === "object" && "message" in error) {
    const message = error.message as string

    if (message.includes("JWT")) {
      return new AuthenticationError("Invalid or expired token")
    }

    if (message.includes("duplicate") || message.includes("unique")) {
      return new ValidationError("A record with this value already exists")
    }

    if (message.includes("foreign key")) {
      return new ValidationError("Referenced record does not exist")
    }

    return new DatabaseError(message)
  }

  return new AppError("An unexpected database error occurred", "DATABASE_ERROR", 500)
}

// Prisma error handler
export function handlePrismaError(error: unknown): AppError {
  if (error && typeof error === "object") {
    const prismaError = error as { code?: string; message?: string }

    switch (prismaError.code) {
      case "P2002":
        return new ValidationError("A record with this value already exists")
      case "P2025":
        return new NotFoundError("Record")
      case "P2003":
        return new ValidationError("Referenced record does not exist")
      case "P2000":
        return new ValidationError(prismaError.message || "Invalid input")
      default:
        return new DatabaseError(prismaError.message || "Database error")
    }
  }

  return new DatabaseError("An unexpected database error occurred")
}
