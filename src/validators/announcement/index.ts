/**
 * Announcement Validators
 * 
 * Zod schemas for Announcement input validation.
 * All validation uses Zod per ADR-017.
 */

import { z } from "zod";

// ============================================================================
// Announcement Enums
// ============================================================================

export const announcementTypeSchema = z.enum([
  "GENERAL",
  "EVENT",
  "DONATION",
  "FESTIVAL",
  "MAINTENANCE",
  "URGENT",
]);

export const announcementPrioritySchema = z.enum([
  "LOW",
  "NORMAL",
  "HIGH",
  "URGENT",
]);

// ============================================================================
// Create Schema
// ============================================================================

export const createAnnouncementSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  content: z
    .string()
    .min(1, "Content is required"),
  excerpt: z
    .string()
    .max(500, "Excerpt must be less than 500 characters")
    .optional(),
  type: announcementTypeSchema.default("GENERAL"),
  priority: announcementPrioritySchema.default("NORMAL"),
  isPinned: z.boolean().default(false),
  isActive: z.boolean().default(true),
  publishAt: z
    .string()
    .datetime({ message: "Invalid publish date format" })
    .optional()
    .nullable(),
  expiresAt: z
    .string()
    .datetime({ message: "Invalid expiration date format" })
    .optional()
    .nullable(),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;

// ============================================================================
// Update Schema
// ============================================================================

export const updateAnnouncementSchema = z.object({
  id: z.string().uuid("Invalid announcement ID"),
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(255, "Title must be less than 255 characters")
    .optional(),
  content: z
    .string()
    .min(1, "Content cannot be empty")
    .optional(),
  excerpt: z
    .string()
    .max(500, "Excerpt must be less than 500 characters")
    .optional()
    .nullable(),
  type: announcementTypeSchema.optional(),
  priority: announcementPrioritySchema.optional(),
  isPinned: z.boolean().optional(),
  isActive: z.boolean().optional(),
  publishAt: z
    .string()
    .datetime({ message: "Invalid publish date format" })
    .optional()
    .nullable(),
  expiresAt: z
    .string()
    .datetime({ message: "Invalid expiration date format" })
    .optional()
    .nullable(),
});

export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;

// ============================================================================
// Search Schema
// ============================================================================

export const searchAnnouncementSchema = z.object({
  query: z.string().optional(),
  type: announcementTypeSchema.optional(),
  priority: announcementPrioritySchema.optional(),
  isPinned: z.boolean().optional(),
  isActive: z.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type SearchAnnouncementInput = z.infer<typeof searchAnnouncementSchema>;

// ============================================================================
// Pagination Schema
// ============================================================================

export const paginationAnnouncementSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z
    .enum(["createdAt", "updatedAt", "publishAt", "priority", "title"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  type: announcementTypeSchema.optional(),
  isActive: z.boolean().optional(),
  includeDeleted: z.boolean().default(false),
});

export type PaginationAnnouncementInput = z.infer<typeof paginationAnnouncementSchema>;

// ============================================================================
// ID Schema
// ============================================================================

export const announcementIdSchema = z.object({
  id: z.string().uuid("Invalid announcement ID"),
});

export type AnnouncementIdInput = z.infer<typeof announcementIdSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate dates relationship
 */
export function validateAnnouncementDates(
  publishAt: string | null | undefined,
  expiresAt: string | null | undefined
): { valid: boolean; error?: string } {
  if (publishAt && expiresAt) {
    const publishDate = new Date(publishAt);
    const expiresDate = new Date(expiresAt);
    
    if (publishDate >= expiresDate) {
      return {
        valid: false,
        error: "Publish date must be before expiration date",
      };
    }
  }
  
  return { valid: true };
}

/**
 * Parse and validate create input
 */
export function parseCreateInput(data: unknown) {
  const result = createAnnouncementSchema.safeParse(data);
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }
  
  const datesValidation = validateAnnouncementDates(
    result.data.publishAt ?? undefined,
    result.data.expiresAt ?? undefined
  );
  
  if (!datesValidation.valid) {
    return {
      success: false,
      errors: { dates: [datesValidation.error!] },
    };
  }
  
  return {
    success: true,
    data: {
      ...result.data,
      publishAt: result.data.publishAt ? new Date(result.data.publishAt) : null,
      expiresAt: result.data.expiresAt ? new Date(result.data.expiresAt) : null,
    },
  };
}

/**
 * Parse and validate update input
 */
export function parseUpdateInput(data: unknown) {
  const result = updateAnnouncementSchema.safeParse(data);
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }
  
  const datesValidation = validateAnnouncementDates(
    result.data.publishAt ?? undefined,
    result.data.expiresAt ?? undefined
  );
  
  if (!datesValidation.valid) {
    return {
      success: false,
      errors: { dates: [datesValidation.error!] },
    };
  }
  
  return {
    success: true,
    data: {
      ...result.data,
      publishAt: result.data.publishAt ? new Date(result.data.publishAt) : result.data.publishAt,
      expiresAt: result.data.expiresAt ? new Date(result.data.expiresAt) : result.data.expiresAt,
    },
  };
}

/**
 * Parse search input
 */
export function parseSearchInput(data: unknown) {
  const result = searchAnnouncementSchema.safeParse(data);
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }
  
  return {
    success: true,
    data: result.data,
  };
}

/**
 * Parse pagination input
 */
export function parsePaginationInput(data: unknown) {
  const result = paginationAnnouncementSchema.safeParse(data);
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }
  
  return {
    success: true,
    data: result.data,
  };
}

/**
 * Validate announcement ID
 */
export function validateAnnouncementId(id: unknown) {
  const result = announcementIdSchema.safeParse({ id });
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }
  
  return {
    success: true,
    data: result.data,
  };
}
