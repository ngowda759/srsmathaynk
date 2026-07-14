/**
 * Announcements Validator & Service
 */

import { z } from "zod"
import { announcementsRepository } from "./announcements.repository"
import { CreateAnnouncementDTO, UpdateAnnouncementDTO, AnnouncementFilters, AnnouncementListParams } from "./types"

const announcementTypes = ["GENERAL", "EVENT", "DONATION", "FESTIVAL", "MAINTENANCE", "URGENT"] as const
const priorities = ["LOW", "NORMAL", "HIGH", "URGENT"] as const

export const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  excerpt: z.string().max(300).optional(),
  type: z.enum(announcementTypes).optional().default("GENERAL"),
  priority: z.enum(priorities).optional().default("NORMAL"),
  isPinned: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
  expiresAt: z.string().datetime().optional().nullable(),
  authorId: z.string().optional(),
})

export const updateAnnouncementSchema = createAnnouncementSchema.partial()

export const announcementFiltersSchema = z.object({
  type: z.enum(announcementTypes).optional(),
  priority: z.enum(priorities).optional(),
  isPinned: z.boolean().optional(),
  active: z.boolean().optional(),
  search: z.string().optional(),
})

export const announcementListParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  filters: announcementFiltersSchema.optional(),
  orderBy: z.object({
    field: z.enum(["createdAt", "priority", "title"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
  }).optional(),
})

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>

export function validateCreateAnnouncement(data: unknown) { return createAnnouncementSchema.safeParse(data) }
export function validateUpdateAnnouncement(data: unknown) { return updateAnnouncementSchema.safeParse(data) }
export function validateAnnouncementListParams(data: unknown) { return announcementListParamsSchema.safeParse(data) }

export class AnnouncementsService {
  async getAnnouncement(id: string) { return announcementsRepository.findById(id) }

  async getAnnouncements(params: unknown) {
    const v = validateAnnouncementListParams(params)
    if (!v.success) return { success: false, error: v.error.errors.map(e => e.message).join(", ") }
    return announcementsRepository.findAll(v.data as AnnouncementListParams)
  }

  async getActiveAnnouncements() { return announcementsRepository.findActive() }
  async getPinnedAnnouncements() { return announcementsRepository.findPinned() }
  async getAnnouncementsByType(type: string) { return announcementsRepository.findByType(type) }

  async createAnnouncement(data: unknown) {
    const v = validateCreateAnnouncement(data)
    if (!v.success) return { success: false, error: v.error.errors.map(e => e.message).join(", ") }
    const input = { ...v.data } as any
    if (input.expiresAt) input.expiresAt = new Date(input.expiresAt)
    return announcementsRepository.create(input)
  }

  async updateAnnouncement(id: string, data: unknown) {
    const v = validateUpdateAnnouncement(data)
    if (!v.success) return { success: false, error: v.error.errors.map(e => e.message).join(", ") }
    const input = { ...v.data } as any
    if (input.expiresAt) input.expiresAt = new Date(input.expiresAt)
    return announcementsRepository.update(id, input)
  }

  async deleteAnnouncement(id: string) { return announcementsRepository.delete(id) }
  async togglePin(id: string) { return announcementsRepository.togglePin(id) }
  async toggleActive(id: string) { return announcementsRepository.toggleActive(id) }
}

export const announcementsService = new AnnouncementsService()
