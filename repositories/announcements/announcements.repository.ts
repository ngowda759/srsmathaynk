/**
 * Announcements Repository
 */

import { prisma } from "@/lib/db"
import { CreateAnnouncementDTO, UpdateAnnouncementDTO, AnnouncementFilters, AnnouncementListParams } from "./types"

export class AnnouncementsRepository {
  async findById(id: string) {
    try {
      const item = await prisma.announcement.findUnique({ where: { id }, include: { author: true } })
      return { success: true, data: item }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findAll(params: AnnouncementListParams) {
    const { page = 1, limit = 10, filters = {}, orderBy = { field: "createdAt", order: "desc" } } = params
    const where: any = {}

    if (filters.type) where.type = filters.type
    if (filters.priority) where.priority = filters.priority
    if (filters.isPinned !== undefined) where.isPinned = filters.isPinned
    if (filters.active !== undefined) where.active = filters.active
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { content: { contains: filters.search, mode: "insensitive" } },
      ]
    }

    // Filter out expired announcements
    where.OR = where.OR || []
    where.OR.push({ expiresAt: null }, { expiresAt: { gt: new Date() } })

    try {
      const [data, total] = await Promise.all([
        prisma.announcement.findMany({
          where,
          orderBy: [{ isPinned: "desc" }, { priority: "desc" }, { [orderBy.field]: orderBy.order }],
          skip: (page - 1) * limit,
          take: limit,
          include: { author: true },
        }),
        prisma.announcement.count({ where }),
      ])
      return { success: true, data: { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total } } }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findActive() {
    try {
      const items = await prisma.announcement.findMany({
        where: { active: true, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
        orderBy: [{ isPinned: "desc" }, { priority: "desc" }, { createdAt: "desc" }],
        include: { author: true },
      })
      return { success: true, data: items }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findPinned() {
    try {
      const items = await prisma.announcement.findMany({
        where: { isPinned: true, active: true, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
        orderBy: { createdAt: "desc" },
      })
      return { success: true, data: items }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findByType(type: string) {
    try {
      const items = await prisma.announcement.findMany({
        where: { type, active: true, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      })
      return { success: true, data: items }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async create(data: CreateAnnouncementDTO) {
    try {
      const result = await prisma.announcement.create({ data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async update(id: string, data: UpdateAnnouncementDTO) {
    try {
      const result = await prisma.announcement.update({ where: { id }, data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async delete(id: string) {
    try {
      const result = await prisma.announcement.delete({ where: { id } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async togglePin(id: string) {
    try {
      const item = await prisma.announcement.findUnique({ where: { id } })
      if (!item) return { success: false, error: "Announcement not found" }
      const result = await prisma.announcement.update({ where: { id }, data: { isPinned: !item.isPinned } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async toggleActive(id: string) {
    try {
      const item = await prisma.announcement.findUnique({ where: { id } })
      if (!item) return { success: false, error: "Announcement not found" }
      const result = await prisma.announcement.update({ where: { id }, data: { active: !item.active } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }
}

export const announcementsRepository = new AnnouncementsRepository()
