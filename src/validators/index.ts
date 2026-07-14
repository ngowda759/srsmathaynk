/**
 * Validators
 * 
 * Zod schemas for input/output validation.
 * All validation uses Zod per ADR-017.
 * 
 * Usage:
 * ```typescript
 * import { validators, validateAnnouncement } from "@/validators";
 * 
 * // Validate data
 * const result = validateAnnouncement(data);
 * if (!result.success) {
 *   // Handle validation errors
 * }
 * 
 * // Use in API routes
 * const handler = withValidation(validators.announcement.create)(
 *   async (req, { body }) => {
 *     // body is typed and validated
 *   }
 * );
 * ```
 */

import { z } from "zod";

// ============================================================================
// Common Validators
// ============================================================================

/**
 * UUID validator
 */
export const uuidSchema = z.string().uuid("Invalid UUID format");

/**
 * Email validator
 */
export const emailSchema = z.string().email("Invalid email format");

/**
 * Phone validator (India)
 */
export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Invalid phone number format");

/**
 * URL validator
 */
export const urlSchema = z.string().url("Invalid URL format").or(z.literal(""));

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ============================================================================
// Common Input Schemas
// ============================================================================

/**
 * Base create input schema (common fields)
 */
export const baseCreateSchema = z.object({
  // Common fields - override in specific validators
});

/**
 * Base update input schema (common fields)
 */
export const baseUpdateSchema = z.object({
  id: uuidSchema,
});

/**
 * Base query schema (common query params)
 */
export const baseQuerySchema = z.object({
  ...paginationSchema.shape,
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
  search: z.string().optional(),
});

// ============================================================================
// Announcement Validators
// ============================================================================

export const announcementValidators = {
  create: z.object({
    title: z.string().min(1).max(255),
    content: z.string().min(1),
    type: z.enum(["GENERAL", "EVENT", "DONATION", "FESTIVAL", "MAINTENANCE", "URGENT"]),
    priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
    isActive: z.boolean().default(true),
    publishAt: z.string().datetime().optional(),
    expiresAt: z.string().datetime().optional(),
  }),

  update: z.object({
    id: uuidSchema,
    title: z.string().min(1).max(255).optional(),
    content: z.string().min(1).optional(),
    type: z.enum(["GENERAL", "EVENT", "DONATION", "FESTIVAL", "MAINTENANCE", "URGENT"]).optional(),
    priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
    isActive: z.boolean().optional(),
    publishAt: z.string().datetime().optional(),
    expiresAt: z.string().datetime().optional(),
  }),

  query: baseQuerySchema.extend({
    type: z.enum(["GENERAL", "EVENT", "DONATION", "FESTIVAL", "MAINTENANCE", "URGENT"]).optional(),
    isActive: z.enum(["true", "false"]).transform(v => v === "true").optional(),
  }),
};

// ============================================================================
// Seva Validators
// ============================================================================

export const sevaValidators = {
  create: z.object({
    name: z.string().min(1).max(255),
    nameKn: z.string().max(255).optional(),
    description: z.string().optional(),
    descriptionKn: z.string().optional(),
    duration: z.number().int().positive().optional(),
    price: z.number().positive().optional(),
    capacity: z.number().int().positive().optional(),
    isActive: z.boolean().default(true),
    categoryId: uuidSchema.optional(),
    imageUrl: urlSchema.optional(),
  }),

  update: z.object({
    id: uuidSchema,
    name: z.string().min(1).max(255).optional(),
    nameKn: z.string().max(255).optional(),
    description: z.string().optional(),
    descriptionKn: z.string().optional(),
    duration: z.number().int().positive().optional(),
    price: z.number().positive().optional(),
    capacity: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
    categoryId: uuidSchema.optional(),
    imageUrl: urlSchema.optional(),
  }),

  query: baseQuerySchema.extend({
    category: z.string().optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
  }),
};

// ============================================================================
// Booking Validators
// ============================================================================

export const bookingValidators = {
  create: z.object({
    type: z.enum(["SEVA", "EVENT", "DONATION", "OTHER"]),
    profileId: uuidSchema,
    items: z.array(z.object({
      referenceId: uuidSchema,
      referenceType: z.enum(["SEVA", "EVENT", "DONATION"]),
      quantity: z.number().int().positive().default(1),
      date: z.string().datetime().optional(),
      notes: z.string().optional(),
    })).min(1),
    paymentMethod: z.enum(["CARD", "UPI", "NET_BANKING", "WALLET", "BANK_TRANSFER", "CASH", "CHEQUE"]).optional(),
    notes: z.string().optional(),
  }),

  update: z.object({
    id: uuidSchema,
    status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REFUNDED"]).optional(),
    notes: z.string().optional(),
  }),

  query: baseQuerySchema.extend({
    type: z.enum(["SEVA", "EVENT", "DONATION", "OTHER"]).optional(),
    status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REFUNDED"]).optional(),
    profileId: uuidSchema.optional(),
  }),
};

// ============================================================================
// Donation Validators
// ============================================================================

export const donationValidators = {
  create: z.object({
    campaignId: uuidSchema.optional(),
    profileId: uuidSchema,
    amount: z.number().positive(),
    paymentMethod: z.enum(["CARD", "UPI", "NET_BANKING", "WALLET", "BANK_TRANSFER", "CASH", "CHEQUE"]),
    message: z.string().max(500).optional(),
    isAnonymous: z.boolean().default(false),
  }),

  update: z.object({
    id: uuidSchema,
    status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED", "REFUNDED"]).optional(),
    message: z.string().max(500).optional(),
  }),

  query: baseQuerySchema.extend({
    campaignId: uuidSchema.optional(),
    status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED", "REFUNDED"]).optional(),
    minAmount: z.coerce.number().positive().optional(),
    maxAmount: z.coerce.number().positive().optional(),
  }),
};

// ============================================================================
// Event Validators
// ============================================================================

export const eventValidators = {
  create: z.object({
    title: z.string().min(1).max(255),
    titleKn: z.string().max(255).optional(),
    description: z.string().optional(),
    descriptionKn: z.string().optional(),
    type: z.enum(["GENERAL", "FESTIVAL", "WORKSHOP", "SPIRITUAL", "CULTURAL", "MAINTENANCE"]),
    status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).default("UPCOMING"),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    location: z.string().optional(),
    isFeatured: z.boolean().default(false),
    imageUrl: urlSchema.optional(),
  }),

  update: z.object({
    id: uuidSchema,
    title: z.string().min(1).max(255).optional(),
    titleKn: z.string().max(255).optional(),
    description: z.string().optional(),
    descriptionKn: z.string().optional(),
    type: z.enum(["GENERAL", "FESTIVAL", "WORKSHOP", "SPIRITUAL", "CULTURAL", "MAINTENANCE"]).optional(),
    status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    location: z.string().optional(),
    isFeatured: z.boolean().optional(),
    imageUrl: urlSchema.optional(),
  }),

  query: baseQuerySchema.extend({
    type: z.enum(["GENERAL", "FESTIVAL", "WORKSHOP", "SPIRITUAL", "CULTURAL", "MAINTENANCE"]).optional(),
    status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
};

// ============================================================================
// Profile Validators
// ============================================================================

export const profileValidators = {
  create: z.object({
    userId: z.string().min(1),
    email: emailSchema,
    name: z.string().max(255).optional(),
    phone: phoneSchema.optional(),
    address: z.string().optional(),
    avatarId: uuidSchema.optional(),
  }),

  update: z.object({
    id: uuidSchema,
    name: z.string().max(255).optional(),
    phone: phoneSchema.optional(),
    address: z.string().optional(),
    avatarId: uuidSchema.optional(),
    isActive: z.boolean().optional(),
  }),

  query: baseQuerySchema.extend({
    role: z.string().optional(),
    isActive: z.enum(["true", "false"]).transform(v => v === "true").optional(),
  }),
};

// ============================================================================
// Contact Enquiry Validators
// ============================================================================

export const contactEnquiryValidators = {
  create: z.object({
    name: z.string().min(1).max(255),
    email: emailSchema,
    phone: phoneSchema.optional(),
    subject: z.string().min(1).max(255),
    message: z.string().min(1).max(2000),
    category: z.enum(["GENERAL", "SEVA", "DONATION", "EVENT", "VISIT", "COMPLAINT", "FEEDBACK"]).default("GENERAL"),
  }),

  update: z.object({
    id: uuidSchema,
    status: z.enum(["NEW", "IN_PROGRESS", "RESPONDED", "CLOSED", "SPAM"]).optional(),
    response: z.string().optional(),
  }),

  query: baseQuerySchema.extend({
    category: z.enum(["GENERAL", "SEVA", "DONATION", "EVENT", "VISIT", "COMPLAINT", "FEEDBACK"]).optional(),
    status: z.enum(["NEW", "IN_PROGRESS", "RESPONDED", "CLOSED", "SPAM"]).optional(),
  }),
};

// ============================================================================
// Media Validators
// ============================================================================

export const mediaValidators = {
  create: z.object({
    url: z.string().min(1),
    type: z.enum(["IMAGE", "VIDEO", "AUDIO", "DOCUMENT"]),
    name: z.string().min(1).max(255),
    alt: z.string().max(500).optional(),
    caption: z.string().optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    size: z.number().int().positive().optional(),
    mimeType: z.string().optional(),
  }),

  update: z.object({
    id: uuidSchema,
    url: z.string().min(1).optional(),
    name: z.string().min(1).max(255).optional(),
    alt: z.string().max(500).optional(),
    caption: z.string().optional(),
  }),
};

// ============================================================================
// Export all validators
// ============================================================================

export const validators = {
  announcement: announcementValidators,
  seva: sevaValidators,
  booking: bookingValidators,
  donation: donationValidators,
  event: eventValidators,
  profile: profileValidators,
  contactEnquiry: contactEnquiryValidators,
  media: mediaValidators,
};

// ============================================================================
// Generic validation helpers
// ============================================================================

/**
 * Validate data against a schema
 */
export function validate<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): z.infer<T> {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    throw new Error(
      `Validation failed: ${JSON.stringify(result.error.flatten().fieldErrors)}`
    );
  }
  
  return result.data;
}

/**
 * Validate data and return result with success flag
 */
export function safeValidate<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    return { success: false, errors: result.error };
  }
  
  return { success: true, data: result.data };
}
