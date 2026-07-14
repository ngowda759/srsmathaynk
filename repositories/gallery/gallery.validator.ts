/**
 * Gallery Validator & Service
 */

import { z } from "zod"
import { galleryRepository } from "./gallery.repository"
import { CreateGalleryItemDTO, UpdateGalleryItemDTO, GalleryFilters, GalleryListParams } from "./types"

const mediaTypes = ["IMAGE", "VIDEO", "AUDIO", "DOCUMENT"] as const

export const createGalleryItemSchema = z.object({
  title: z.string().max(200).optional(),
  titleKannada: z.string().max(200).optional(),
  description: z.string().optional(),
  descriptionKannada: z.string().optional(),
  src: z.string().min(1),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  type: z.enum(mediaTypes).optional().default("IMAGE"),
  category: z.string().max(50).optional(),
  featured: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
  order: z.number().int().min(0).optional(),
  videoDuration: z.number().int().positive().optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  altText: z.string().max(200).optional(),
  credit: z.string().max(100).optional(),
  eventId: z.string().optional(),
  uploadedBy: z.string().optional(),
})

export const updateGalleryItemSchema = createGalleryItemSchema.partial()

export const galleryFiltersSchema = z.object({
  type: z.enum(mediaTypes).optional(),
  category: z.string().optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  eventId: z.string().optional(),
  search: z.string().optional(),
})

export const galleryListParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(12),
  filters: galleryFiltersSchema.optional(),
  orderBy: z.object({
    field: z.enum(["order", "createdAt", "title"]).default("order"),
    order: z.enum(["asc", "desc"]).default("asc"),
  }).optional(),
})

export type CreateGalleryItemInput = z.infer<typeof createGalleryItemSchema>
export type UpdateGalleryItemInput = z.infer<typeof updateGalleryItemSchema>

export function validateCreateGalleryItem(data: unknown) { return createGalleryItemSchema.safeParse(data) }
export function validateUpdateGalleryItem(data: unknown) { return updateGalleryItemSchema.safeParse(data) }
export function validateGalleryListParams(data: unknown) { return galleryListParamsSchema.safeParse(data) }

export class GalleryService {
  async getItem(id: string) { return galleryRepository.findById(id) }
  async getItems(params: unknown) {
    const v = validateGalleryListParams(params)
    if (!v.success) return { success: false, error: v.error.errors.map(e => e.message).join(", ") }
    return galleryRepository.findAll(v.data as GalleryListParams)
  }
  async getActiveItems() { return galleryRepository.findActive() }
  async getFeaturedItems(limit?: number) { return galleryRepository.findFeatured(limit) }
  async getItemsByCategory(category: string) { return galleryRepository.findByCategory(category) }
  async getItemsByEvent(eventId: string) { return galleryRepository.findByEvent(eventId) }
  async getCategories() { return galleryRepository.getCategories() }

  async createItem(data: unknown) {
    const v = validateCreateGalleryItem(data)
    if (!v.success) return { success: false, error: v.error.errors.map(e => e.message).join(", ") }
    return galleryRepository.create(v.data as CreateGalleryItemDTO)
  }

  async updateItem(id: string, data: unknown) {
    const v = validateUpdateGalleryItem(data)
    if (!v.success) return { success: false, error: v.error.errors.map(e => e.message).join(", ") }
    return galleryRepository.update(id, v.data as UpdateGalleryItemDTO)
  }

  async deleteItem(id: string) { return galleryRepository.delete(id) }
  async toggleActive(id: string) { return galleryRepository.toggleActive(id) }
  async reorderItems(orderedIds: string[]) { return galleryRepository.reorder(orderedIds) }
}

export const galleryService = new GalleryService()
