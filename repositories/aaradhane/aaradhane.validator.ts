/**
 * Aaradhane Validator & Service
 */

import { z } from "zod"
import { aaradhaneRepository } from "./aaradhane.repository"
import { CreateAaradhaneDTO, UpdateAaradhaneDTO, CreateAaradhaneSevaDTO, UpdateAaradhaneSevaDTO } from "./types"

export const createAaradhaneSchema = z.object({
  title: z.string().min(1).max(200),
  titleKannada: z.string().max(200).optional(),
  deityName: z.string().max(200).optional(),
  guruName: z.string().max(200).optional(),
  description: z.string().optional(),
  significance: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  rituals: z.array(z.string()).optional(),
  offerings: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  order: z.number().int().min(0).optional(),
})

export const updateAaradhaneSchema = createAaradhaneSchema.partial()

export const createAaradhaneSevaSchema = z.object({
  aaradhaneId: z.string().min(1),
  name: z.string().min(1).max(200),
  nameKannada: z.string().max(200).optional(),
  description: z.string().optional(),
  amount: z.number().min(0).optional().default(0),
  currency: z.string().optional().default("INR"),
  isActive: z.boolean().optional().default(true),
  order: z.number().int().min(0).optional(),
})

export const updateAaradhaneSevaSchema = createAaradhaneSevaSchema.partial()

export type CreateAaradhaneInput = z.infer<typeof createAaradhaneSchema>
export type UpdateAaradhaneInput = z.infer<typeof updateAaradhaneSchema>
export type CreateAaradhaneSevaInput = z.infer<typeof createAaradhaneSevaSchema>
export type UpdateAaradhaneSevaInput = z.infer<typeof updateAaradhaneSevaSchema>

export function validateCreateAaradhane(data: unknown) { return createAaradhaneSchema.safeParse(data) }
export function validateUpdateAaradhane(data: unknown) { return updateAaradhaneSchema.safeParse(data) }
export function validateCreateAaradhaneSeva(data: unknown) { return createAaradhaneSevaSchema.safeParse(data) }
export function validateUpdateAaradhaneSeva(data: unknown) { return updateAaradhaneSevaSchema.safeParse(data) }

export class AaradhaneService {
  async getAaradhane(id: string) { return aaradhaneRepository.findById(id) }
  async getAllAaradhanaes(activeOnly = true) { return aaradhaneRepository.findAll(activeOnly) }
  async getFeaturedAaradhanaes(limit?: number) { return aaradhaneRepository.findFeatured(limit) }

  async createAaradhane(data: unknown) {
    const v = validateCreateAaradhane(data)
    if (!v.success) return { success: false, error: v.error.errors.map(e => e.message).join(", ") }
    const input = { ...v.data } as any
    if (input.startDate) input.startDate = new Date(input.startDate)
    if (input.endDate) input.endDate = new Date(input.endDate)
    return aaradhaneRepository.create(input)
  }

  async updateAaradhane(id: string, data: unknown) {
    const v = validateUpdateAaradhane(data)
    if (!v.success) return { success: false, error: v.error.errors.map(e => e.message).join(", ") }
    const input = { ...v.data } as any
    if (input.startDate) input.startDate = new Date(input.startDate)
    if (input.endDate) input.endDate = new Date(input.endDate)
    return aaradhaneRepository.update(id, input)
  }

  async deleteAaradhane(id: string) { return aaradhaneRepository.delete(id) }
  async toggleFeatured(id: string) { return aaradhaneRepository.toggleFeatured(id) }
  async toggleActive(id: string) { return aaradhaneRepository.toggleActive(id) }
  async reorderAaradhanaes(orderedIds: string[]) { return aaradhaneRepository.reorder(orderedIds) }

  async createSeva(data: unknown) {
    const v = validateCreateAaradhaneSeva(data)
    if (!v.success) return { success: false, error: v.error.errors.map(e => e.message).join(", ") }
    return aaradhaneRepository.createSeva(v.data as CreateAaradhaneSevaDTO)
  }

  async updateSeva(id: string, data: unknown) {
    const v = validateUpdateAaradhaneSeva(data)
    if (!v.success) return { success: false, error: v.error.errors.map(e => e.message).join(", ") }
    return aaradhaneRepository.updateSeva(id, v.data as UpdateAaradhaneSevaDTO)
  }

  async deleteSeva(id: string) { return aaradhaneRepository.deleteSeva(id) }
  async getAaradhaneSevas(aaradhaneId: string) { return aaradhaneRepository.getSevasByAaradhane(aaradhaneId) }
}

export const aaradhaneService = new AaradhaneService()
