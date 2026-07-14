/**
 * AI Knowledge Base Repository
 */

import { prisma } from "@/lib/db"
import { CreateCategoryDTO, UpdateCategoryDTO, CreateArticleDTO, UpdateArticleDTO, CreateFeedbackDTO } from "./types"

export class AIRepository {
  // Categories
  async findCategoryById(id: string) {
    try {
      const category = await prisma.aIKnowledgeCategory.findUnique({
        where: { id },
        include: { _count: { select: { articles: true } } },
      })
      return { success: true, data: category }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findCategories(activeOnly = true) {
    try {
      const categories = await prisma.aIKnowledgeCategory.findMany({
        where: activeOnly ? { active: true } : undefined,
        orderBy: { order: "asc" },
        include: { _count: { select: { articles: { where: { active: true } } } } },
      })
      return { success: true, data: categories }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async createCategory(data: CreateCategoryDTO) {
    try {
      const result = await prisma.aIKnowledgeCategory.create({ data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async updateCategory(id: string, data: UpdateCategoryDTO) {
    try {
      const result = await prisma.aIKnowledgeCategory.update({ where: { id }, data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async deleteCategory(id: string) {
    try {
      const result = await prisma.aIKnowledgeCategory.delete({ where: { id } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  // Articles
  async findArticleById(id: string) {
    try {
      const article = await prisma.aIKnowledgeArticle.findUnique({
        where: { id },
        include: { category: true },
      })
      return { success: true, data: article }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findArticles(params?: { categoryId?: string; active?: boolean; page?: number; limit?: number }) {
    const { categoryId, active = true, page = 1, limit = 20 } = params || {}
    const where: any = {}
    if (categoryId) where.categoryId = categoryId
    if (active !== undefined) where.active = active

    try {
      const [data, total] = await Promise.all([
        prisma.aIKnowledgeArticle.findMany({
          where,
          orderBy: { priority: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          include: { category: true },
        }),
        prisma.aIKnowledgeArticle.count({ where }),
      ])
      return { success: true, data: { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total } } }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async searchArticles(query: string, limit = 5) {
    try {
      const articles = await prisma.aIKnowledgeArticle.findMany({
        where: {
          active: true,
          OR: [
            { question: { contains: query, mode: "insensitive" } },
            { answer: { contains: query, mode: "insensitive" } },
            { keywords: { has: query.toLowerCase() } },
          ],
        },
        orderBy: { priority: "desc" },
        take: limit,
        include: { category: true },
      })
      return { success: true, data: articles }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async createArticle(data: CreateArticleDTO) {
    try {
      const result = await prisma.aIKnowledgeArticle.create({ data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async updateArticle(id: string, data: UpdateArticleDTO) {
    try {
      const result = await prisma.aIKnowledgeArticle.update({ where: { id }, data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async deleteArticle(id: string) {
    try {
      const result = await prisma.aIKnowledgeArticle.delete({ where: { id } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async incrementViewCount(id: string) {
    try {
      const result = await prisma.aIKnowledgeArticle.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  // Feedback
  async createFeedback(data: CreateFeedbackDTO) {
    try {
      const result = await prisma.aiChatFeedback.create({ data })

      // Update helpful counts
      if (data.articleId) {
        if (data.isHelpful) {
          await prisma.aIKnowledgeArticle.update({
            where: { id: data.articleId },
            data: { helpfulCount: { increment: 1 } },
          })
        } else {
          await prisma.aIKnowledgeArticle.update({
            where: { id: data.articleId },
            data: { notHelpfulCount: { increment: 1 } },
          })
        }
      }

      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findFeedbackByArticle(articleId: string) {
    try {
      const feedback = await prisma.aiChatFeedback.findMany({
        where: { articleId },
        orderBy: { createdAt: "desc" },
      })
      return { success: true, data: feedback }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }
}

export const aiRepository = new AIRepository()
