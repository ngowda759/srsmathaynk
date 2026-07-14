/**
 * Temple Validator
 * Zod schemas for temple-related input validation
 */

import { z } from "zod"

// Time format: HH:MM
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

// Temple Settings Schema
export const updateTempleSettingsSchema = z.object({
  templeName: z.string().min(1).max(200).optional(),
  shortName: z.string().max(50).optional(),
  tagline: z.string().max(200).optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional().default("India"),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode").optional().or(z.literal("")),
  phone: z.string().regex(/^[+]?[\d\s-]{10,}$/, "Invalid phone").optional().or(z.literal("")),
  alternatePhone: z.string().regex(/^[+]?[\d\s-]{10,}$/, "Invalid phone").optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  mapEmbedUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  socialFacebook: z.string().url().optional().or(z.literal("")),
  socialTwitter: z.string().url().optional().or(z.literal("")),
  socialInstagram: z.string().url().optional().or(z.literal("")),
  socialYoutube: z.string().url().optional().or(z.literal("")),
  socialWhatsapp: z.string().regex(/^\d{10,}$/).optional().or(z.literal("")),
  bankName: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().regex(/^\d{9,18}$/, "Invalid account number").optional().or(z.literal("")),
  bankIFSCCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code").optional().or(z.literal("")),
  bankUPIId: z.string().optional(),
  establishedYear: z.number().int().min(1000).max(new Date().getFullYear()).optional(),
  priestCount: z.number().int().min(0).optional(),
  dailyVisitors: z.number().int().min(0).optional(),
})

// Homepage Settings Schema
export const updateHomepageSettingsSchema = z.object({
  heroTitle: z.string().max(200).optional(),
  heroSubtitle: z.string().max(300).optional(),
  heroImageUrl: z.string().url().optional().or(z.literal("")),
  heroVideoUrl: z.string().url().optional().or(z.literal("")),
  aboutTitle: z.string().max(200).optional(),
  aboutContent: z.string().optional(),
  aboutImageUrl: z.string().url().optional().or(z.literal("")),
  showFeaturedEvents: z.boolean().optional(),
  showFeaturedSevas: z.boolean().optional(),
  showDonationSection: z.boolean().optional(),
  showGalleryPreview: z.boolean().optional(),
  showAnnouncements: z.boolean().optional(),
  featuredEventsLimit: z.number().int().min(1).max(20).optional(),
  featuredSevasLimit: z.number().int().min(1).max(20).optional(),
  galleryPreviewLimit: z.number().int().min(1).max(20).optional(),
  donationTitle: z.string().max(200).optional(),
  donationSubtitle: z.string().max(300).optional(),
  newsTitle: z.string().max(200).optional(),
})

// Temple Timing Schema
export const templeTimingSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string().regex(timeRegex, "Invalid time format (HH:MM)"),
  closeTime: z.string().regex(timeRegex, "Invalid time format (HH:MM)"),
  isHoliday: z.boolean().optional().default(false),
  notes: z.string().optional(),
})

export const templeTimingsSchema = z.array(templeTimingSchema)

// Facility Schema
export const createFacilitySchema = z.object({
  name: z.string().min(1).max(200),
  nameKannada: z.string().max(200).optional(),
  description: z.string().optional(),
  descriptionKannada: z.string().optional(),
  icon: z.string().max(50).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  instructions: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  order: z.number().int().min(0).optional(),
})

export const updateFacilitySchema = createFacilitySchema.partial()
export const reorderFacilitiesSchema = z.object({
  orderedIds: z.array(z.string()),
})

// Amenity Schema
export const createAmenitySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  icon: z.string().max(50).optional(),
  isAvailable: z.boolean().optional().default(true),
  order: z.number().int().min(0).optional(),
})

export const updateAmenitySchema = createAmenitySchema.partial()

// Future Plan Schema
const planStatuses = ["PLANNING", "APPROVED", "IN_PROGRESS", "COMPLETED", "ON_HOLD"] as const

export const createFuturePlanSchema = z.object({
  title: z.string().min(1).max(200),
  titleKannada: z.string().max(200).optional(),
  description: z.string().optional(),
  descriptionKannada: z.string().optional(),
  icon: z.string().max(50).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  targetAmount: z.number().positive().optional(),
  raisedAmount: z.number().min(0).optional().default(0),
  status: z.enum(planStatuses).optional().default("PLANNING"),
  priority: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  order: z.number().int().min(0).optional(),
  startDate: z.string().datetime().optional(),
  targetDate: z.string().datetime().optional(),
  completedDate: z.string().datetime().optional(),
})

export const updateFuturePlanSchema = createFuturePlanSchema.partial()

// Types
export type UpdateTempleSettingsInput = z.infer<typeof updateTempleSettingsSchema>
export type UpdateHomepageSettingsInput = z.infer<typeof updateHomepageSettingsSchema>
export type TempleTimingInput = z.infer<typeof templeTimingSchema>
export type TempleTimingsInput = z.infer<typeof templeTimingsSchema>
export type CreateFacilityInput = z.infer<typeof createFacilitySchema>
export type UpdateFacilityInput = z.infer<typeof updateFacilitySchema>
export type ReorderFacilitiesInput = z.infer<typeof reorderFacilitiesSchema>
export type CreateAmenityInput = z.infer<typeof createAmenitySchema>
export type UpdateAmenityInput = z.infer<typeof updateAmenitySchema>
export type CreateFuturePlanInput = z.infer<typeof createFuturePlanSchema>
export type UpdateFuturePlanInput = z.infer<typeof updateFuturePlanSchema>

// Validation helpers
export function validateTempleSettings(data: unknown) {
  return updateTempleSettingsSchema.safeParse(data)
}

export function validateHomepageSettings(data: unknown) {
  return updateHomepageSettingsSchema.safeParse(data)
}

export function validateTempleTimings(data: unknown) {
  return templeTimingsSchema.safeParse(data)
}

export function validateCreateFacility(data: unknown) {
  return createFacilitySchema.safeParse(data)
}

export function validateUpdateFacility(data: unknown) {
  return updateFacilitySchema.safeParse(data)
}

export function validateReorderFacilities(data: unknown) {
  return reorderFacilitiesSchema.safeParse(data)
}

export function validateCreateAmenity(data: unknown) {
  return createAmenitySchema.safeParse(data)
}

export function validateUpdateAmenity(data: unknown) {
  return updateAmenitySchema.safeParse(data)
}

export function validateCreateFuturePlan(data: unknown) {
  return createFuturePlanSchema.safeParse(data)
}

export function validateUpdateFuturePlan(data: unknown) {
  return updateFuturePlanSchema.safeParse(data)
}
