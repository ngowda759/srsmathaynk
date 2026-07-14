/**
 * Events Validator
 * Zod schemas for events-related input validation
 */

import { z } from "zod"

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
const eventTypes = ["GENERAL", "FESTIVAL", "WORKSHOP", "SPIRITUAL", "CULTURAL", "MAINTENANCE"] as const
const eventStatuses = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"] as const
const bookingStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const

// Event Schema
export const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  titleKannada: z.string().max(200).optional(),
  description: z.string().optional(),
  descriptionKannada: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  startTime: z.string().regex(timeRegex).optional(),
  endTime: z.string().regex(timeRegex).optional(),
  location: z.string().max(500).optional(),
  isOnline: z.boolean().optional().default(false),
  onlineLink: z.string().url().optional().or(z.literal("")),
  type: z.enum(eventTypes).optional().default("GENERAL"),
  status: z.enum(eventStatuses).optional().default("UPCOMING"),
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(false),
  imageUrl: z.string().url().optional().or(z.literal("")),
  bannerUrl: z.string().url().optional().or(z.literal("")),
  maxAttendees: z.number().int().positive().optional(),
  organizer: z.string().max(200).optional(),
  contactPhone: z.string().regex(/^[+]?[\d\s-]{10,}$/).optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
})

export const updateEventSchema = createEventSchema.partial().omit({ startDate: true })

export const eventFiltersSchema = z.object({
  type: z.enum(eventTypes).optional(),
  status: z.enum(eventStatuses).optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
})

export const eventListParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  filters: eventFiltersSchema.optional(),
  orderBy: z.object({
    field: z.enum(["startDate", "createdAt", "title"]).default("startDate"),
    order: z.enum(["asc", "desc"]).default("desc"),
  }).optional(),
})

// Event Booking Schema
export const createEventBookingSchema = z.object({
  eventId: z.string().min(1),
  userId: z.string().optional(),
  attendeeName: z.string().min(1).max(200),
  attendeeEmail: z.string().email(),
  attendeePhone: z.string().regex(/^[+]?[\d\s-]{10,}$/).optional().or(z.literal("")),
  tickets: z.number().int().positive().optional().default(1),
  notes: z.string().optional(),
})

export const updateEventBookingSchema = z.object({
  tickets: z.number().int().positive().optional(),
  status: z.enum(bookingStatuses).optional(),
  notes: z.string().optional(),
})

// Festival Schema
export const createFestivalSchema = z.object({
  name: z.string().min(1).max(200),
  nameKannada: z.string().max(200).optional(),
  date: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  description: z.string().optional(),
  descriptionKannada: z.string().optional(),
  significance: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isMajorFestival: z.boolean().optional().default(false),
  isHoliday: z.boolean().optional().default(true),
})

export const updateFestivalSchema = createFestivalSchema.partial()

// Pooja Schedule Schema
export const createPoojaScheduleSchema = z.object({
  name: z.string().min(1).max(200),
  nameKannada: z.string().max(200).optional(),
  time: z.string().regex(timeRegex, "Invalid time format (HH:MM)"),
  description: z.string().optional(),
  descriptionKannada: z.string().optional(),
  category: z.string().max(50).optional(),
  isSpecial: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
  order: z.number().int().min(0).optional(),
})

export const updatePoojaScheduleSchema = createPoojaScheduleSchema.partial()

// Types
export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type EventFiltersInput = z.infer<typeof eventFiltersSchema>
export type EventListParamsInput = z.infer<typeof eventListParamsSchema>
export type CreateEventBookingInput = z.infer<typeof createEventBookingSchema>
export type UpdateEventBookingInput = z.infer<typeof updateEventBookingSchema>
export type CreateFestivalInput = z.infer<typeof createFestivalSchema>
export type UpdateFestivalInput = z.infer<typeof updateFestivalSchema>
export type CreatePoojaScheduleInput = z.infer<typeof createPoojaScheduleSchema>
export type UpdatePoojaScheduleInput = z.infer<typeof updatePoojaScheduleSchema>

// Validation helpers
export function validateCreateEvent(data: unknown) { return createEventSchema.safeParse(data) }
export function validateUpdateEvent(data: unknown) { return updateEventSchema.safeParse(data) }
export function validateEventListParams(data: unknown) { return eventListParamsSchema.safeParse(data) }
export function validateCreateEventBooking(data: unknown) { return createEventBookingSchema.safeParse(data) }
export function validateUpdateEventBooking(data: unknown) { return updateEventBookingSchema.safeParse(data) }
export function validateCreateFestival(data: unknown) { return createFestivalSchema.safeParse(data) }
export function validateUpdateFestival(data: unknown) { return updateFestivalSchema.safeParse(data) }
export function validateCreatePoojaSchedule(data: unknown) { return createPoojaScheduleSchema.safeParse(data) }
export function validateUpdatePoojaSchedule(data: unknown) { return updatePoojaScheduleSchema.safeParse(data) }
