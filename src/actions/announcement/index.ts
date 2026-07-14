/**
 * Announcement Server Actions
 * 
 * Server actions for the Announcement module.
 * These actions handle:
 * - Authentication (via Supabase auth)
 * - Authorization (via permission checks)
 * - Validation (via Zod schemas)
 * - Service invocation
 * 
 * NO business logic should be in these actions.
 */

"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { ErrorCodes } from "@/errors";
import { AnnouncementService } from "@/services/announcement.service";
import {
  parseCreateInput,
  parseUpdateInput,
  parseSearchInput,
  parsePaginationInput,
  validateAnnouncementId,
} from "@/validators/announcement";
import type { ServiceResult, PaginatedResult } from "@/types";
import type { AnnouncementDomain } from "@/types/announcement";
import type { UserRole } from "@/types/user";

// ============================================================================
// Auth Helper (Production Supabase Auth)
// ============================================================================

interface AuthUser {
  id: string;
  profileId: string;
  email: string;
  role: UserRole;
}

/**
 * Get current user from Supabase session
 * Returns user profile from database with role
 */
async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    // Get user profile from database
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return null;
    }

    return {
      id: user.id,
      profileId: profile.id,
      email: user.email || "",
      role: profile.role as UserRole,
    };
  } catch (error) {
    logger.error("Failed to get current user", error as Error);
    return null;
  }
}

/**
 * Check if user has admin role (ADMIN, SUPER_ADMIN, or STAFF)
 */
function isAdmin(user: AuthUser | null): boolean {
  if (!user) return false;
  return ["ADMIN", "SUPER_ADMIN", "STAFF"].includes(user.role);
}

// ============================================================================
// Response Types
// ============================================================================

interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

function formatResponse<T>(result: ServiceResult<T>): ActionResponse<T> {
  if (result.status === "error") {
    return {
      success: false,
      error: {
        code: result.code,
        message: result.message,
        details: result.details,
      },
    };
  }
  return {
    success: true,
    data: result.data,
  };
}

// ============================================================================
// Create Announcement
// ============================================================================

/**
 * Create a new announcement
 * 
 * Requires: Authentication
 * Permissions: ADMIN or SUPER_ADMIN
 */
export async function createAnnouncement(
  data: unknown
): Promise<ActionResponse<AnnouncementDomain>> {
  const requestId = logger.generateRequestId();

  logger.info("Server action: createAnnouncement", { requestId });

  try {
    // Authentication
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: {
          code: ErrorCodes.AUTH_REQUIRED,
          message: "Authentication required",
        },
      };
    }

    // Authorization
    if (!isAdmin(user)) {
      return {
        success: false,
        error: {
          code: ErrorCodes.AUTHZ_FORBIDDEN,
          message: "Admin permission required",
        },
      };
    }

    // Validation
    const validation = parseCreateInput(data);

    if (!validation.success) {
      return {
        success: false,
        error: {
          code: ErrorCodes.VAL_INVALID_INPUT,
          message: "Validation failed",
          details: validation.errors,
        },
      };
    }

    // Service invocation
    const service = new AnnouncementService();
    const result = await service.createAnnouncement(validation.data, user.profileId);

    // Revalidate cache
    if (result.status === "success") {
      revalidatePath("/admin/announcements");
      revalidatePath("/");
    }

    return formatResponse(result);
  } catch (error) {
    logger.error("Server action error: createAnnouncement", error as Error, { requestId });

    return {
      success: false,
      error: {
        code: ErrorCodes.APP_INTERNAL,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      },
    };
  }
}

// ============================================================================
// Update Announcement
// ============================================================================

/**
 * Update an existing announcement
 * 
 * Requires: Authentication
 * Permissions: ADMIN or SUPER_ADMIN
 */
export async function updateAnnouncement(
  data: unknown
): Promise<ActionResponse<AnnouncementDomain>> {
  const requestId = logger.generateRequestId();

  logger.info("Server action: updateAnnouncement", { requestId });

  try {
    // Authentication
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: {
          code: ErrorCodes.AUTH_REQUIRED,
          message: "Authentication required",
        },
      };
    }

    // Authorization
    if (!isAdmin(user)) {
      return {
        success: false,
        error: {
          code: ErrorCodes.AUTHZ_FORBIDDEN,
          message: "Admin permission required",
        },
      };
    }

    // Validation
    const validation = parseUpdateInput(data);

    if (!validation.success) {
      return {
        success: false,
        error: {
          code: ErrorCodes.VAL_INVALID_INPUT,
          message: "Validation failed",
          details: validation.errors,
        },
      };
    }

    const { id, ...updateData } = validation.data;

    // Service invocation
    const service = new AnnouncementService();
    const result = await service.updateAnnouncement(id, updateData, user.profileId);

    // Revalidate cache
    if (result.status === "success") {
      revalidatePath("/admin/announcements");
      revalidatePath("/admin/announcements/[id]", "page");
      revalidatePath("/");
    }

    return formatResponse(result);
  } catch (error) {
    logger.error("Server action error: updateAnnouncement", error as Error, { requestId });

    return {
      success: false,
      error: {
        code: ErrorCodes.APP_INTERNAL,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      },
    };
  }
}

// ============================================================================
// Delete Announcement
// ============================================================================

/**
 * Delete an announcement (soft delete)
 * 
 * Requires: Authentication
 * Permissions: ADMIN or SUPER_ADMIN
 */
export async function deleteAnnouncement(
  id: string
): Promise<ActionResponse<AnnouncementDomain>> {
  const requestId = logger.generateRequestId();

  logger.info("Server action: deleteAnnouncement", { requestId, id });

  try {
    // Authentication
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: {
          code: ErrorCodes.AUTH_REQUIRED,
          message: "Authentication required",
        },
      };
    }

    // Authorization
    if (!isAdmin(user)) {
      return {
        success: false,
        error: {
          code: ErrorCodes.AUTHZ_FORBIDDEN,
          message: "Admin permission required",
        },
      };
    }

    // Validation
    const validation = validateAnnouncementId(id);

    if (!validation.success) {
      return {
        success: false,
        error: {
          code: ErrorCodes.VAL_INVALID_INPUT,
          message: "Invalid announcement ID",
          details: validation.errors,
        },
      };
    }

    // Service invocation
    const service = new AnnouncementService();
    const result = await service.deleteAnnouncement(id, user.profileId);

    // Revalidate cache
    if (result.status === "success") {
      revalidatePath("/admin/announcements");
      revalidatePath("/");
    }

    return formatResponse(result);
  } catch (error) {
    logger.error("Server action error: deleteAnnouncement", error as Error, { requestId });

    return {
      success: false,
      error: {
        code: ErrorCodes.APP_INTERNAL,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      },
    };
  }
}

// ============================================================================
// Restore Announcement
// ============================================================================

/**
 * Restore a soft-deleted announcement
 * 
 * Requires: Authentication
 * Permissions: ADMIN or SUPER_ADMIN
 */
export async function restoreAnnouncement(
  id: string
): Promise<ActionResponse<AnnouncementDomain>> {
  const requestId = logger.generateRequestId();

  logger.info("Server action: restoreAnnouncement", { requestId, id });

  try {
    // Authentication
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: {
          code: ErrorCodes.AUTH_REQUIRED,
          message: "Authentication required",
        },
      };
    }

    // Authorization
    if (!isAdmin(user)) {
      return {
        success: false,
        error: {
          code: ErrorCodes.AUTHZ_FORBIDDEN,
          message: "Admin permission required",
        },
      };
    }

    // Validation
    const validation = validateAnnouncementId(id);

    if (!validation.success) {
      return {
        success: false,
        error: {
          code: ErrorCodes.VAL_INVALID_INPUT,
          message: "Invalid announcement ID",
          details: validation.errors,
        },
      };
    }

    // Service invocation
    const service = new AnnouncementService();
    const result = await service.restoreAnnouncement(id, user.profileId);

    // Revalidate cache
    if (result.status === "success") {
      revalidatePath("/admin/announcements");
      revalidatePath("/admin/announcements/trash");
    }

    return formatResponse(result);
  } catch (error) {
    logger.error("Server action error: restoreAnnouncement", error as Error, { requestId });

    return {
      success: false,
      error: {
        code: ErrorCodes.APP_INTERNAL,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      },
    };
  }
}

// ============================================================================
// Publish Announcement
// ============================================================================

/**
 * Publish an announcement
 * 
 * Requires: Authentication
 * Permissions: ADMIN or SUPER_ADMIN
 */
export async function publishAnnouncement(
  id: string
): Promise<ActionResponse<AnnouncementDomain>> {
  const requestId = logger.generateRequestId();

  logger.info("Server action: publishAnnouncement", { requestId, id });

  try {
    // Authentication
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: {
          code: ErrorCodes.AUTH_REQUIRED,
          message: "Authentication required",
        },
      };
    }

    // Authorization
    if (!isAdmin(user)) {
      return {
        success: false,
        error: {
          code: ErrorCodes.AUTHZ_FORBIDDEN,
          message: "Admin permission required",
        },
      };
    }

    // Validation
    const validation = validateAnnouncementId(id);

    if (!validation.success) {
      return {
        success: false,
        error: {
          code: ErrorCodes.VAL_INVALID_INPUT,
          message: "Invalid announcement ID",
          details: validation.errors,
        },
      };
    }

    // Service invocation
    const service = new AnnouncementService();
    const result = await service.publishAnnouncement(id, user.profileId);

    // Revalidate cache
    if (result.status === "success") {
      revalidatePath("/admin/announcements");
      revalidatePath("/admin/announcements/[id]", "page");
      revalidatePath("/");
    }

    return formatResponse(result);
  } catch (error) {
    logger.error("Server action error: publishAnnouncement", error as Error, { requestId });

    return {
      success: false,
      error: {
        code: ErrorCodes.APP_INTERNAL,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      },
    };
  }
}

// ============================================================================
// Unpublish Announcement
// ============================================================================

/**
 * Unpublish an announcement
 * 
 * Requires: Authentication
 * Permissions: ADMIN or SUPER_ADMIN
 */
export async function unpublishAnnouncement(
  id: string
): Promise<ActionResponse<AnnouncementDomain>> {
  const requestId = logger.generateRequestId();

  logger.info("Server action: unpublishAnnouncement", { requestId, id });

  try {
    // Authentication
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: {
          code: ErrorCodes.AUTH_REQUIRED,
          message: "Authentication required",
        },
      };
    }

    // Authorization
    if (!isAdmin(user)) {
      return {
        success: false,
        error: {
          code: ErrorCodes.AUTHZ_FORBIDDEN,
          message: "Admin permission required",
        },
      };
    }

    // Validation
    const validation = validateAnnouncementId(id);

    if (!validation.success) {
      return {
        success: false,
        error: {
          code: ErrorCodes.VAL_INVALID_INPUT,
          message: "Invalid announcement ID",
          details: validation.errors,
        },
      };
    }

    // Service invocation
    const service = new AnnouncementService();
    const result = await service.unpublishAnnouncement(id, user.profileId);

    // Revalidate cache
    if (result.status === "success") {
      revalidatePath("/admin/announcements");
      revalidatePath("/admin/announcements/[id]", "page");
      revalidatePath("/");
    }

    return formatResponse(result);
  } catch (error) {
    logger.error("Server action error: unpublishAnnouncement", error as Error, { requestId });

    return {
      success: false,
      error: {
        code: ErrorCodes.APP_INTERNAL,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      },
    };
  }
}

// ============================================================================
// Get Public Announcements
// ============================================================================

/**
 * Get public announcements (no auth required)
 */
export async function getPublicAnnouncements(
  params?: { type?: string; limit?: number }
): Promise<ActionResponse<AnnouncementDomain[]>> {
  const requestId = logger.generateRequestId();

  logger.info("Server action: getPublicAnnouncements", { requestId, params });

  try {
    const service = new AnnouncementService();
    const result = await service.getPublicAnnouncements(params);

    return formatResponse(result);
  } catch (error) {
    logger.error("Server action error: getPublicAnnouncements", error as Error, { requestId });

    return {
      success: false,
      error: {
        code: ErrorCodes.APP_INTERNAL,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      },
    };
  }
}

// ============================================================================
// Get Admin Announcements
// ============================================================================

/**
 * Get all announcements for admin (with pagination)
 * 
 * Requires: Authentication
 * Permissions: ADMIN or SUPER_ADMIN
 */
export async function getAnnouncements(
  params?: unknown
): Promise<ActionResponse<PaginatedResult<AnnouncementDomain>>> {
  const requestId = logger.generateRequestId();

  logger.info("Server action: getAnnouncements", { requestId, params });

  try {
    // Authentication
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: {
          code: ErrorCodes.AUTH_REQUIRED,
          message: "Authentication required",
        },
      };
    }

    // Authorization
    if (!isAdmin(user)) {
      return {
        success: false,
        error: {
          code: ErrorCodes.AUTHZ_FORBIDDEN,
          message: "Admin permission required",
        },
      };
    }

    // Validation
    const validation = parsePaginationInput(params);

    if (!validation.success) {
      return {
        success: false,
        error: {
          code: ErrorCodes.VAL_INVALID_INPUT,
          message: "Validation failed",
          details: validation.errors,
        },
      };
    }

    // Service invocation
    const service = new AnnouncementService();
    const result = await service.getAdminAnnouncements(validation.data);

    return formatResponse(result);
  } catch (error) {
    logger.error("Server action error: getAnnouncements", error as Error, { requestId });

    return {
      success: false,
      error: {
        code: ErrorCodes.APP_INTERNAL,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      },
    };
  }
}

// ============================================================================
// Get Single Announcement
// ============================================================================

/**
 * Get a single announcement by ID
 */
export async function getAnnouncement(
  id: string
): Promise<ActionResponse<AnnouncementDomain>> {
  const requestId = logger.generateRequestId();

  logger.info("Server action: getAnnouncement", { requestId, id });

  try {
    // Validation
    const validation = validateAnnouncementId(id);

    if (!validation.success) {
      return {
        success: false,
        error: {
          code: ErrorCodes.VAL_INVALID_INPUT,
          message: "Invalid announcement ID",
          details: validation.errors,
        },
      };
    }

    // Service invocation
    const service = new AnnouncementService();
    const result = await service.getAnnouncement(id);

    return formatResponse(result);
  } catch (error) {
    logger.error("Server action error: getAnnouncement", error as Error, { requestId });

    return {
      success: false,
      error: {
        code: ErrorCodes.APP_INTERNAL,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      },
    };
  }
}

// ============================================================================
// Search Announcements
// ============================================================================

/**
 * Search announcements
 */
export async function searchAnnouncements(
  params: unknown
): Promise<ActionResponse<PaginatedResult<AnnouncementDomain>>> {
  const requestId = logger.generateRequestId();

  logger.info("Server action: searchAnnouncements", { requestId, params });

  try {
    // Validation
    const validation = parseSearchInput(params);

    if (!validation.success) {
      return {
        success: false,
        error: {
          code: ErrorCodes.VAL_INVALID_INPUT,
          message: "Validation failed",
          details: validation.errors,
        },
      };
    }

    // Service invocation
    const service = new AnnouncementService();
    const result = await service.searchAnnouncements(validation.data);

    return formatResponse(result);
  } catch (error) {
    logger.error("Server action error: searchAnnouncements", error as Error, { requestId });

    return {
      success: false,
      error: {
        code: ErrorCodes.APP_INTERNAL,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      },
    };
  }
}
