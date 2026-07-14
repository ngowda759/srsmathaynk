/**
 * Middleware
 * 
 * Provides middleware functions for authentication, authorization, and error handling.
 * 
 * Usage in API routes:
 * ```typescript
 * import { withAuth, withAuthz, withErrorHandler } from "@/middleware";
 * 
 * const handler = withErrorHandler(
 *   withAuth(
 *     withAuthz(["ADMIN", "SUPER_ADMIN"])(async (req, { user }) => {
 *       // Handle request with authenticated user
 *     })
 *   )
 * );
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { AppError, AuthenticationError, AuthorizationError } from "@/errors";
import { PERMISSIONS, USER_ROLES } from "@/lib/constants";
import type { AuthUser, UserRole } from "@/types";

// ============================================================================
// Types
// ============================================================================

export interface AuthenticatedRequest extends NextRequest {
  user?: AuthUser;
}

export interface AuthzOptions {
  roles?: UserRole[];
  permissions?: string[];
}

// ============================================================================
// Authentication Middleware
// ============================================================================

/**
 * Create authentication middleware
 * 
 * Usage:
 * ```typescript
 * const handler = withAuth(async (req, { user }) => {
 *   // Handle authenticated request
 * });
 * ```
 */
export function withAuth<
  T extends (req: AuthenticatedRequest, context: { user: AuthUser }) => Promise<Response>
>(
  handler: T
): (req: NextRequest) => Promise<Response> {
  return async (req: NextRequest) => {
    try {
      // Get authorization header
      const authHeader = req.headers.get("authorization");
      
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AuthenticationError("Missing or invalid authorization header");
      }

      const token = authHeader.substring(7);

      // TODO: Implement actual token validation with Supabase Auth
      // This is a placeholder for the implementation that comes in Sprint 4
      const user = await validateToken(token);

      if (!user) {
        throw new AuthenticationError("Invalid or expired token");
      }

      // Attach user to request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = user;

      // Call the handler with authenticated request
      return handler(authenticatedReq, { user });
    } catch (error) {
      return handleAuthError(error);
    }
  };
}

/**
 * Validate token and return user
 * 
 * This is a placeholder for the implementation that comes in Sprint 4.
 * In Sprint 4, this will validate Supabase JWT tokens.
 */
async function validateToken(token: string): Promise<AuthUser | null> {
  // TODO: Implement with Supabase Auth
  // For now, return null to indicate authentication is not yet implemented
  logger.debug("Token validation called - awaiting Sprint 4 implementation");
  return null;
}

/**
 * Handle authentication errors
 */
function handleAuthError(error: unknown): NextResponse {
  if (error instanceof AuthenticationError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      },
      { status: error.statusCode }
    );
  }

  logger.error("Unexpected auth error", error as Error);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "AUTHENTICATION_ERROR",
        message: "Authentication failed",
      },
    },
    { status: 401 }
  );
}

// ============================================================================
// Authorization Middleware
// ============================================================================

/**
 * Create authorization middleware
 * 
 * Usage:
 * ```typescript
 * // Require specific roles
 * const handler = withAuthz(["ADMIN", "SUPER_ADMIN"])(async (req, { user }) => {
 *   // Handle request with admin user
 * });
 * 
 * // Require specific permissions
 * const handler = withAuthz({ permissions: [PERMISSIONS.USERS_CREATE] })(
 *   async (req, { user }) => {
 *     // Handle request with permission
 *   }
 * );
 * ```
 */
export function withAuthz<T extends (req: AuthenticatedRequest, context: { user: AuthUser }) => Promise<Response>>(
  options: AuthzOptions
): (handler: T) => (req: AuthenticatedRequest) => Promise<Response> {
  return (handler: T) => {
    return async (req: AuthenticatedRequest) => {
      try {
        // Get user from request (set by auth middleware)
        const user = req.user;

        if (!user) {
          throw new AuthenticationError("User not authenticated");
        }

        // Check roles
        if (options.roles && options.roles.length > 0) {
          const hasRole = options.roles.some((role) => user.roles.includes(role));
          if (!hasRole) {
            throw new AuthorizationError(
              `Required roles: ${options.roles.join(", ")}. Your roles: ${user.roles.join(", ")}`
            );
          }
        }

        // Check permissions
        if (options.permissions && options.permissions.length > 0) {
          const hasPermission = options.permissions.every((perm) =>
            user.permissions.includes(perm)
          );
          if (!hasPermission) {
            throw new AuthorizationError(
              `Missing required permissions: ${options.permissions.join(", ")}`
            );
          }
        }

        // Call the handler
        return handler(req, { user });
      } catch (error) {
        return handleAuthzError(error);
      }
    };
  };
}

/**
 * Handle authorization errors
 */
function handleAuthzError(error: unknown): NextResponse {
  if (error instanceof AuthorizationError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof AuthenticationError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      },
      { status: error.statusCode }
    );
  }

  logger.error("Unexpected authz error", error as Error);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "AUTHORIZATION_ERROR",
        message: "Authorization failed",
      },
    },
    { status: 403 }
  );
}

// ============================================================================
// Error Handler Middleware
// ============================================================================

/**
 * Create error handling middleware
 * 
 * Usage:
 * ```typescript
 * const handler = withErrorHandler(async (req) => {
 *   // Your route handler
 *   throw new NotFoundError("Resource");
 * });
 * ```
 */
export function withErrorHandler<
  T extends (req: NextRequest) => Promise<Response>
>(
  handler: T
): (req: NextRequest) => Promise<Response> {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      return handleAppError(error);
    }
  };
}

/**
 * Handle application errors
 */
function handleAppError(error: unknown): NextResponse {
  // Log the error
  if (error instanceof Error) {
    logger.error("Request error", error);
  }

  // Handle AppError
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle unexpected errors
  logger.error("Unexpected error", error as Error);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: process.env.NODE_ENV === "production"
          ? "An unexpected error occurred"
          : (error as Error)?.message || "An unexpected error occurred",
      },
    },
    { status: 500 }
  );
}

// ============================================================================
// Request Validation Middleware
// ============================================================================

/**
 * Create request validation middleware
 * 
 * Usage:
 * ```typescript
 * import { z } from "zod";
 * 
 * const createSchema = z.object({
 *   name: z.string().min(1),
 *   email: z.string().email(),
 * });
 * 
 * const handler = withValidation(createSchema)(
 *   async (req, { body }) => {
 *     // Handle validated body
 *   }
 * );
 * ```
 */
export function withValidation<T extends z.ZodSchema>(
  schema: T,
  source: "body" | "query" | "params" = "body"
) {
  return function <
    R extends (req: NextRequest, context: { body: z.infer<T> }) => Promise<Response>
  >(
    handler: R
  ): (req: NextRequest) => Promise<Response> {
    return async (req: NextRequest) => {
      try {
        // Get data based on source
        let data: unknown;
        
        if (source === "body") {
          data = await req.json();
        } else if (source === "query") {
          data = Object.fromEntries(new URL(req.url).searchParams);
        } else {
          data = {};
        }

        // Validate data
        const result = schema.safeParse(data);

        if (!result.success) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: "Validation failed",
                details: {
                  errors: result.error.flatten().fieldErrors,
                },
              },
            },
            { status: 400 }
          );
        }

        // Call handler with validated body
        return handler(req, { body: result.data });
      } catch (error) {
        return handleAppError(error);
      }
    };
  };
}

// Import Zod for validation
import { z } from "zod";

// ============================================================================
// Combined Middleware Helper
// ============================================================================

/**
 * Create a fully configured route handler
 * 
 * Usage:
 * ```typescript
 * const handler = createRoute({
 *   auth: true,
 *   authz: { roles: ["ADMIN"] },
 *   schema: createSchema,
 *   handler: async (req, { user, body }) => {
 *     // Your handler logic
 *   }
 * });
 * ```
 */
export function createRoute<
  S extends z.ZodSchema | undefined,
  H extends (req: AuthenticatedRequest, context: { user: AuthUser; body?: z.infer<S> }) => Promise<Response>
>(config: {
  auth?: boolean;
  authz?: AuthzOptions;
  schema?: S;
  handler: H;
}): (req: NextRequest) => Promise<Response> {
  let handler = config.handler;

  // Add validation if schema is provided
  if (config.schema) {
    handler = withValidation(config.schema)(handler as any) as any;
  }

  // Add authorization if roles or permissions are provided
  if (config.authz) {
    handler = withAuthz(config.authz)(handler as any) as any;
  }

  // Add authentication if required
  if (config.auth !== false) {
    handler = withAuth(handler as any) as any;
  }

  // Add error handling
  handler = withErrorHandler(handler);

  return handler;
}
