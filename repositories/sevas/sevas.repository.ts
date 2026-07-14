/**
 * Sevas Repository
 * Database access for sevas and bookings
 */

import { prisma } from "@/lib/db"
import {
  CreateSevaDTO,
  UpdateSevaDTO,
  SevaFilters,
  SevaListParams,
  CreateSevaBookingDTO,
  UpdateSevaBookingDTO,
} from "./types"

export class SevasRepository {
  // ============================================
  // SEVAS
  // ============================================

  async findSevaById(id: string) {
    try {
      const seva = await prisma.seva.findUnique({
        where: { id },
        include: { _count: { select: { bookings: true } } },
      })
      return { success: true, data: seva }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findSevas(params: SevaListParams) {
    const { page = 1, limit = 10, filters = {}, orderBy = { field: "order", order: "asc" } } = params
    const where: any = {}

    if (filters.category) where.category = filters.category
    if (filters.active !== undefined) where.active = filters.active
    if (filters.featured !== undefined) where.featured = filters.featured
    if (filters.priceMin) where.price = { ...where.price, gte: filters.priceMin }
    if (filters.priceMax) where.price = { ...where.price, lte: filters.priceMax }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ]
    }

    try {
      const [data, total] = await Promise.all([
        prisma.seva.findMany({
          where,
          orderBy: { [orderBy.field]: orderBy.order },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.seva.count({ where }),
      ])
      return {
        success: true,
        data: { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total } },
      }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findActiveSevas() {
    try {
      const sevas = await prisma.seva.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      })
      return { success: true, data: sevas }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findFeaturedSevas(limit = 8) {
    try {
      const sevas = await prisma.seva.findMany({
        where: { featured: true, active: true },
        orderBy: { order: "asc" },
        take: limit,
      })
      return { success: true, data: sevas }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findSevasByCategory(category: string) {
    try {
      const sevas = await prisma.seva.findMany({
        where: { category, active: true },
        orderBy: { order: "asc" },
      })
      return { success: true, data: sevas }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async createSeva(data: CreateSevaDTO) {
    try {
      const result = await prisma.seva.create({ data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async updateSeva(id: string, data: UpdateSevaDTO) {
    try {
      const result = await prisma.seva.update({ where: { id }, data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async deleteSeva(id: string) {
    try {
      const result = await prisma.seva.delete({ where: { id } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async toggleSevaActive(id: string) {
    try {
      const seva = await prisma.seva.findUnique({ where: { id } })
      if (!seva) return { success: false, error: "Seva not found" }
      const result = await prisma.seva.update({ where: { id }, data: { active: !seva.active } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  // ============================================
  // SEVA BOOKINGS
  // ============================================

  async findBookingById(id: string) {
    try {
      const booking = await prisma.sevaBooking.findUnique({
        where: { id },
        include: { seva: true, profile: true },
      })
      return { success: true, data: booking }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findBookingsByUser(userId: string, params?: { status?: string; page?: number; limit?: number }) {
    const { page = 1, limit = 10, status } = params || {}
    const where: any = { userId }
    if (status) where.status = status

    try {
      const [data, total] = await Promise.all([
        prisma.sevaBooking.findMany({
          where,
          include: { seva: true },
          orderBy: { bookingDate: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.sevaBooking.count({ where }),
      ])
      return {
        success: true,
        data: { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total } },
      }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findBookingsBySeva(sevaId: string, date?: Date) {
    const where: any = { sevaId }
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      where.bookingDate = { gte: startOfDay, lte: endOfDay }
    }

    try {
      const bookings = await prisma.sevaBooking.findMany({
        where,
        include: { profile: true },
        orderBy: { createdAt: "desc" },
      })
      return { success: true, data: bookings }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async getBookingsForDate(sevaId: string, date: Date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    try {
      const count = await prisma.sevaBooking.count({
        where: {
          sevaId,
          bookingDate: { gte: startOfDay, lte: endOfDay },
          status: { not: "CANCELLED" },
        },
      })
      return { success: true, data: { count } }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async createBooking(data: CreateSevaBookingDTO) {
    try {
      const result = await prisma.sevaBooking.create({ data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async updateBooking(id: string, data: UpdateSevaBookingDTO) {
    try {
      const result = await prisma.sevaBooking.update({ where: { id }, data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async deleteBooking(id: string) {
    try {
      const result = await prisma.sevaBooking.delete({ where: { id } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async cancelBooking(id: string) {
    try {
      const result = await prisma.sevaBooking.update({
        where: { id },
        data: { status: "CANCELLED" },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async completeBooking(id: string) {
    try {
      const result = await prisma.sevaBooking.update({
        where: { id },
        data: { status: "COMPLETED" },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async updatePaymentStatus(id: string, paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED") {
    try {
      const result = await prisma.sevaBooking.update({
        where: { id },
        data: { paymentStatus },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async addReceipt(id: string, receiptNumber: string, receiptUrl: string) {
    try {
      const result = await prisma.sevaBooking.update({
        where: { id },
        data: { receiptNumber, receiptUrl, paymentStatus: "PAID" },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  // Stats
  async getSevaStats(sevaId: string) {
    try {
      const [total, completed, cancelled, revenue] = await Promise.all([
        prisma.sevaBooking.count({ where: { sevaId } }),
        prisma.sevaBooking.count({ where: { sevaId, status: "COMPLETED" } }),
        prisma.sevaBooking.count({ where: { sevaId, status: "CANCELLED" } }),
        prisma.sevaBooking.aggregate({
          where: { sevaId, paymentStatus: "PAID" },
          _sum: { amount: true },
        }),
      ])
      return { success: true, data: { total, completed, cancelled, revenue: revenue._sum.amount || 0 } }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }
}

export const sevasRepository = new SevasRepository()
