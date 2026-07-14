/**
 * Documents Repository
 */

import { prisma } from "@/lib/db"

export class DocumentsRepository {
  // Categories
  async getCategories(activeOnly = true) {
    try {
      const categories = await prisma.documentCategory.findMany({
        where: activeOnly ? { active: true } : undefined,
        orderBy: { order: "asc" },
        include: {
          _count: { select: { documents: { where: { active: true } } } }
        }
      })
      return { success: true, data: categories }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async getCategoryById(id: string) {
    try {
      const category = await prisma.documentCategory.findUnique({
        where: { id },
        include: { documents: { where: { active: true }, orderBy: { order: "asc" } } }
      })
      return { success: true, data: category }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async createCategory(data: any) {
    try {
      const result = await prisma.documentCategory.create({ data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async updateCategory(id: string, data: any) {
    try {
      const result = await prisma.documentCategory.update({ where: { id }, data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async deleteCategory(id: string) {
    try {
      const result = await prisma.documentCategory.delete({ where: { id } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  // Documents
  async findAll(options: { page?: number; limit?: number; filters?: any; orderBy?: any } = {}) {
    try {
      const { page = 1, limit = 20, filters = {}, orderBy = { field: "order", order: "asc" } } = options
      
      const where: any = {}
      if (filters.categoryId) where.categoryId = filters.categoryId
      if (filters.isFeatured) where.isFeatured = true
      if (filters.active !== false) where.active = true
      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } }
        ]
      }

      const [items, total] = await Promise.all([
        prisma.document.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [orderBy.field]: orderBy.order },
          include: { category: true }
        }),
        prisma.document.count({ where })
      ])

      return {
        success: true,
        data: { items, total, page, limit, pages: Math.ceil(total / limit) }
      }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findById(id: string) {
    try {
      const document = await prisma.document.findUnique({
        where: { id },
        include: { category: true }
      })
      return { success: true, data: document }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async create(data: any) {
    try {
      const result = await prisma.document.create({ data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async update(id: string, data: any) {
    try {
      const result = await prisma.document.update({ where: { id }, data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async delete(id: string) {
    try {
      const result = await prisma.document.delete({ where: { id } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async incrementDownloadCount(id: string) {
    try {
      const result = await prisma.document.update({
        where: { id },
        data: { downloadCount: { increment: 1 } }
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async toggleFeatured(id: string) {
    try {
      const item = await prisma.document.findUnique({ where: { id } })
      if (!item) return { success: false, error: "Document not found" }
      const result = await prisma.document.update({
        where: { id },
        data: { isFeatured: !item.isFeatured }
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }
}

export const documentsRepository = new DocumentsRepository()
