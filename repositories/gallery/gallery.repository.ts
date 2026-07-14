/**
 * Gallery Repository
 */

import { prisma } from "@/lib/db"
import { CreateGalleryItemDTO, UpdateGalleryItemDTO, GalleryFilters, GalleryListParams } from "./types"

export class GalleryRepository {
  async findById(id: string) {
    try {
      const item = await prisma.galleryItem.findUnique({ where: { id }, include: { event: true } })
      return { success: true, data: item }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findAll(params: GalleryListParams) {
    const { page = 1, limit = 12, filters = {}, orderBy = { field: "order", order: "asc" } } = params
    const where: any = {}

    if (filters.type) where.type = filters.type
    if (filters.category) where.category = filters.category
    if (filters.featured !== undefined) where.featured = filters.featured
    if (filters.active !== undefined) where.active = filters.active
    if (filters.eventId) where.eventId = filters.eventId
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ]
    }

    try {
      const [data, total] = await Promise.all([
        prisma.galleryItem.findMany({ where, orderBy: { [orderBy.field]: orderBy.order }, skip: (page - 1) * limit, take: limit }),
        prisma.galleryItem.count({ where }),
      ])
      return { success: true, data: { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total } } }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findActive(activeOnly = true) {
    try {
      const items = await prisma.galleryItem.findMany({
        where: activeOnly ? { active: true } : undefined,
        orderBy: [{ featured: "desc" }, { order: "asc" }],
      })
      return { success: true, data: items }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findFeatured(limit = 8) {
    try {
      const items = await prisma.galleryItem.findMany({
        where: { featured: true, active: true },
        orderBy: { order: "asc" },
        take: limit,
      })
      return { success: true, data: items }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findByCategory(category: string) {
    try {
      const items = await prisma.galleryItem.findMany({
        where: { category, active: true },
        orderBy: { order: "asc" },
      })
      return { success: true, data: items }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findByEvent(eventId: string) {
    try {
      const items = await prisma.galleryItem.findMany({
        where: { eventId, active: true },
        orderBy: { order: "asc" },
      })
      return { success: true, data: items }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async getCategories() {
    try {
      const items = await prisma.galleryItem.groupBy({ by: ["category"], where: { active: true }, _count: { category: true } })
      return { success: true, data: items.filter(i => i.category) }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async create(data: CreateGalleryItemDTO) {
    try {
      const result = await prisma.galleryItem.create({ data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async update(id: string, data: UpdateGalleryItemDTO) {
    try {
      const result = await prisma.galleryItem.update({ where: { id }, data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async delete(id: string) {
    try {
      const result = await prisma.galleryItem.delete({ where: { id } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async toggleActive(id: string) {
    try {
      const item = await prisma.galleryItem.findUnique({ where: { id } })
      if (!item) return { success: false, error: "Item not found" }
      const result = await prisma.galleryItem.update({ where: { id }, data: { active: !item.active } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async reorder(orderedIds: string[]) {
    try {
      await prisma.$transaction(orderedIds.map((id, index) => prisma.galleryItem.update({ where: { id }, data: { order: index } })))
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }
}

export const galleryRepository = new GalleryRepository()
