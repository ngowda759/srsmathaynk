/**
 * User/Profile Validator
 * Zod schemas for user-related input validation
 */

import { z } from "zod"
import { UserRole } from "@prisma/client"

// User roles enum
const userRoles = ["DEVOTEE", "VOLUNTEER", "PRIEST", "STAFF", "ADMIN", "SUPER_ADMIN"] as const

// Create profile schema
export const createProfileSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required").optional(),
  role: z.enum(userRoles).optional().default("DEVOTEE"),
  phone: z.string().regex(/^[+]?[\d\s-]{10,}$/, "Invalid phone number").optional().or(z.literal("")),
  address: z.string().optional(),
  avatarUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
})

// Update profile schema
export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  role: z.enum(userRoles).optional(),
  phone: z.string().regex(/^[+]?[\d\s-]{10,}$/, "Invalid phone number").optional().or(z.literal("")),
  address: z.string().optional(),
  avatarUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  emailVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

// Profile filters schema
export const profileFiltersSchema = z.object({
  role: z.enum(userRoles).optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
})

// Profile list params schema
export const profileListParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  filters: profileFiltersSchema.optional(),
  orderBy: z.object({
    field: z.enum(["createdAt", "name", "role"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
  }).optional(),
})

// Change role schema
export const changeRoleSchema = z.object({
  role: z.enum(userRoles, {
    errorMap: () => ({ message: "Invalid role" }),
  }),
})

// Types inferred from schemas
export type CreateProfileInput = z.infer<typeof createProfileSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ProfileFiltersInput = z.infer<typeof profileFiltersSchema>
export type ProfileListParamsInput = z.infer<typeof profileListParamsSchema>
export type ChangeRoleInput = z.infer<typeof changeRoleSchema>

// Validation helper functions
export function validateCreateProfile(data: unknown) {
  return createProfileSchema.safeParse(data)
}

export function validateUpdateProfile(data: unknown) {
  return updateProfileSchema.safeParse(data)
}

export function validateProfileListParams(data: unknown) {
  return profileListParamsSchema.safeParse(data)
}

export function validateChangeRole(data: unknown) {
  return changeRoleSchema.safeParse(data)
}

export function isValidRole(role: string): role is UserRole {
  return userRoles.includes(role as any)
}
