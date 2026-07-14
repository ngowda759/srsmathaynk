/**
 * Testimonials Validator & Service
 */

import { z } from "zod"
import { testimonialsRepository } from "./testimonials.repository"
import { CreateTestimonialDTO, UpdateTestimonialDTO } from "./types"

export const createTestimonialSchema = z.object({
  userId: z.string().optional(),
  name: z.string().min(1).max(200),
  location: z.string().max(200).optional(),
  title: z.string().max(200).optional(),
  content: z.string().min(10),
  contentKannada: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isApproved: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
  isPublished: z.boolean().optional().default(false),
})

export const updateTestimonialSchema = createTestimonialSchema.partial()

export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialSchema>

export function validateCreateTestimonial(data: unknown) { return createTestimonialSchema.safeParse(data) }
export function validateUpdateTestimonial(data: unknown) { return updateTestimonialSchema.safeParse(data) }

export class TestimonialsService {
  async getTestimonial(id: string) { return testimonialsRepository.findById(id) }
  async getTestimonials(params?: { approved?: boolean; published?: boolean; featured?: boolean; page?: number; limit?: number }) {
    return testimonialsRepository.findAll(params)
  }
  async getPublishedTestimonials() { return testimonialsRepository.findPublished() }
  async getFeaturedTestimonials(limit?: number) { return testimonialsRepository.findFeatured(limit) }
  async getUserTestimonial(userId: string) { return testimonialsRepository.findByUser(userId) }
  async getPendingApprovals() { return testimonialsRepository.getPendingApprovals() }

  async createTestimonial(data: unknown) {
    const v = validateCreateTestimonial(data)
    if (!v.success) return { success: false, error: v.error.errors.map(e => e.message).join(", ") }
    return testimonialsRepository.create(v.data as CreateTestimonialDTO)
  }

  async updateTestimonial(id: string, data: unknown) {
    const v = validateUpdateTestimonial(data)
    if (!v.success) return { success: false, error: v.error.errors.map(e => e.message).join(", ") }
    return testimonialsRepository.update(id, v.data as UpdateTestimonialDTO)
  }

  async deleteTestimonial(id: string) { return testimonialsRepository.delete(id) }
  async approveTestimonial(id: string, approvedBy: string) { return testimonialsRepository.approve(id, approvedBy) }
  async publishTestimonial(id: string) { return testimonialsRepository.publish(id) }
  async toggleFeatured(id: string) { return testimonialsRepository.toggleFeatured(id) }
}

export const testimonialsService = new TestimonialsService()
