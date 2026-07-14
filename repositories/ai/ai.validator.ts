/**
 * AI Validator & Service
 */

import { z } from "zod"
import { aiRepository } from "./ai.repository"
import { CreateCategoryDTO, UpdateCategoryDTO, CreateArticleDTO, UpdateArticleDTO, CreateFeedbackDTO } from "./types"

export const createCategorySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  order: z.number().int().min(0).optional(),
  active: z.boolean().optional().default(true),
})

export const updateCategorySchema = createCategorySchema.partial()

export const createArticleSchema = z.object({
  categoryId: z.string().min(1),
  question: z.string().min(1).max(500),
  questionKannada: z.string().max(500).optional(),
  answer: z.string().min(1),
  answerKannada: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  priority: z.number().int().min(0).optional().default(0),
  active: z.boolean().optional().default(true),
})

export const updateArticleSchema = createArticleSchema.partial()

export const createFeedbackSchema = z.object({
  articleId: z.string().optional(),
  userId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  isHelpful: z.boolean(),
  comment: z.string().optional(),
  userQuery: z.string().optional(),
  aiResponse: z.string().optional(),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CreateArticleInput = z.infer<typeof createArticleSchema>
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>
export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>

export function validateCreateCategory(data: unknown) { return createCategorySchema.safeParse(data) }
export function validateUpdateCategory(data: unknown) { return updateCategorySchema.safeParse(data) }
export function validateCreateArticle(data: unknown) { return createArticleSchema.safeParse(data) }
export function validateUpdateArticle(data: unknown) { return updateArticleSchema.safeParse(data) }
export function validateCreateFeedback(data: unknown) { return createFeedbackSchema.safeParse(data) }

export class AIService {
  async getCategory(id: string) { return aiRepository.findCategoryById(id) }
  async getCategories(activeOnly = true) { return aiRepository.findCategories(activeOnly) }

  async createCategory(data: unknown) {
    const v = validateCreateCategory(data)
    if (!v.success) return { success: false, error: v.error.errors.map(e => e.message).join(", ") }
    return aiRepository.createCategory(v.data as CreateCategoryDTO)
  }

  async updateCategory(id: string, data: unknown) {
    const v = validateUpdateCategory(data)
    if (!v.success) return { success: false, error: v.error.errors.map(e => e.message).join(", ") }
    return aiRepository.updateCategory(id, v.data as UpdateCategoryDTO)
  }

  async deleteCategory(id: string) { return aiRepository.deleteCategory(id) }

  async getArticle(id: string) { return aiRepository.findArticleById(id) }
  async getArticles(params?: { categoryId?: string; active?: boolean; page?: number; limit?: number }) { return aiRepository.findArticles(params) }
  async searchArticles(query: string, limit?: number) { return aiRepository.searchArticles(query, limit) }

  async createArticle(data: unknown) {
    const v = validateCreateArticle(data)
    if (!v.success) return { success: false, error: v.error.errors.map(e => e.message).join(", ") }
    return aiRepository.createArticle(v.data as CreateArticleDTO)
  }

  async updateArticle(id: string, data: unknown) {
    const v = validateUpdateArticle(data)
    if (!v.success) return { success: false, error: v.error.errors.map(e => e.message).join(", ") }
    return aiRepository.updateArticle(id, v.data as UpdateArticleDTO)
  }

  async deleteArticle(id: string) { return aiRepository.deleteArticle(id) }
  async incrementViewCount(id: string) { return aiRepository.incrementViewCount(id) }

  async submitFeedback(data: unknown) {
    const v = validateCreateFeedback(data)
    if (!v.success) return { success: false, error: v.error.errors.map(e => e.message).join(", ") }
    return aiRepository.createFeedback(v.data as CreateFeedbackDTO)
  }

  async getArticleFeedback(articleId: string) { return aiRepository.findFeedbackByArticle(articleId) }
}

export const aiService = new AIService()
