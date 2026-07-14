/**
 * Sevas Validator
 * Zod schemas for sevas-related input validation
 */

import { z } from "zod"

const bookingStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const
const paymentStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const

// Seva Schema
export const createSevaSchema = z.object({
  name: z.string().min(1).max(200),
  nameKannada: z.string().max(200).optional(),
  description: z.string().optional(),
  descriptionKannada: z.string().optional(),
  price: z.number().min(0).optional().default(0),
  priceKannada: z.number().min(0).optional(),
  currency: z.string().length(3).optional().default("INR"),
  duration: z.string().max(50).optional(),
  category: z.string().max(50).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  iconName: z.string().max(50).optional(),
  active: z.boolean().optional().default(true),
  featured: z.boolean().optional().default(false),
  maxPerDay: z.number().int().positive().optional(),
  minAdvanceBooking: z.number().int().min(0).optional(),
  maxAdvanceBooking: z.number().int().positive().optional(),
  instructions: z.string().optional(),
  benefits: z.string().optional(),
  order: z.number().int().min(0).optional(),
})

export const updateSevaSchema = createSevaSchema.partial()

export const sevaFiltersSchema = z.object({
  category: z.string().optional(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  search: z.string().optional(),
})

export const sevaListParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  filters: sevaFiltersSchema.optional(),
  orderBy: z.object({
    field: z.enum(["order", "price", "name", "createdAt"]).default("order"),
    order: z.enum(["asc", "desc"]).default("asc"),
  }).optional(),
})

// Seva Booking Schema
export const createSevaBookingSchema = z.object({
  userId: z.string().min(1),
  sevaId: z.string().min(1),
  bookingDate: z.string().datetime(),
  preferredTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  notes: z.string().optional(),
  amount: z.number().min(0),
  currency: z.string().length(3).optional().default("INR"),
  devoteeName: z.string().max(200).optional(),
  gothra: z.string().max(100).optional(),
  nakshatra: z.string().max(100).optional(),
})

export const updateSevaBookingSchema = z.object({
  bookingDate: z.string().datetime().optional(),
  preferredTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  status: z.enum(bookingStatuses).optional(),
  notes: z.string().optional(),
  paymentStatus: z.enum(paymentStatuses).optional(),
  receiptNumber: z.string().optional(),
  receiptUrl: z.string().url().optional(),
})

// Types
export type CreateSevaInput = z.infer<typeof createSevaSchema>
export type UpdateSevaInput = z.infer<typeof updateSevaSchema>
export type SevaFiltersInput = z.infer<typeof sevaFiltersSchema>
export type SevaListParamsInput = z.infer<typeof sevaListParamsSchema>
export type CreateSevaBookingInput = z.infer<typeof createSevaBookingSchema>
export type UpdateSevaBookingInput = z.infer<typeof updateSevaBookingSchema>

// Validation helpers
export function validateCreateSeva(data: unknown) { return createSevaSchema.safeParse(data) }
export function validateUpdateSeva(data: unknown) { return updateSevaSchema.safeParse(data) }
export function validateSevaListParams(data: unknown) { return sevaListParamsSchema.safeParse(data) }
export function validateCreateSevaBooking(data: unknown) { return createSevaBookingSchema.safeParse(data) }
export function validateUpdateSevaBooking(data: unknown) { return updateSevaBookingSchema.safeParse(data) }
