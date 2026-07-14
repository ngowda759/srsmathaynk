/**
 * Events Repository
 * Database access for events, festivals, panchangas, and pooja schedules
 */

import { prisma } from "@/lib/db"
import {
  CreateEventDTO,
  UpdateEventDTO,
  EventFilters,
  EventListParams,
  CreateEventBookingDTO,
  UpdateEventBookingDTO,
  CreateFestivalDTO,
  UpdateFestivalDTO,
  CreatePoojaScheduleDTO,
  UpdatePoojaScheduleDTO,
} from "./types"

export class EventsRepository {
  // ============================================
  // EVENTS
  // ============================================

  async findEventById(id: string) {
    try {
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          _count: { select: { bookings: true } },
        },
      })
      return { success: true, data: event }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findEvents(params: EventListParams) {
    const { page = 1, limit = 10, filters = {}, orderBy = { field: "startDate", order: "desc" } } = params

    const where: any = {}

    if (filters.type) where.type = filters.type
    if (filters.status) where.status = filters.status
    if (filters.featured !== undefined) where.featured = filters.featured
    if (filters.published !== undefined) where.published = filters.published
    if (filters.startDate) where.startDate = { gte: filters.startDate }
    if (filters.endDate) where.endDate = { lte: filters.endDate }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ]
    }

    try {
      const [data, total] = await Promise.all([
        prisma.event.findMany({
          where,
          orderBy: { [orderBy.field]: orderBy.order },
          skip: (page - 1) * limit,
          take: limit,
          include: { _count: { select: { bookings: true } } },
        }),
        prisma.event.count({ where }),
      ])

      return {
        success: true,
        data: {
          data,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total },
        },
      }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findPublishedEvents(limit = 10) {
    try {
      const events = await prisma.event.findMany({
        where: { published: true, status: { in: ["UPCOMING", "ONGOING"] } },
        orderBy: { startDate: "asc" },
        take: limit,
      })
      return { success: true, data: events }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findFeaturedEvents(limit = 6) {
    try {
      const events = await prisma.event.findMany({
        where: { featured: true, published: true },
        orderBy: { startDate: "asc" },
        take: limit,
      })
      return { success: true, data: events }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findUpcomingEvents(startDate: Date = new Date(), limit = 10) {
    try {
      const events = await prisma.event.findMany({
        where: { published: true, startDate: { gte: startDate } },
        orderBy: { startDate: "asc" },
        take: limit,
      })
      return { success: true, data: events }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async createEvent(data: CreateEventDTO) {
    try {
      const result = await prisma.event.create({ data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async updateEvent(id: string, data: UpdateEventDTO) {
    try {
      const result = await prisma.event.update({ where: { id }, data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async deleteEvent(id: string) {
    try {
      const result = await prisma.event.delete({ where: { id } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async incrementAttendees(id: string, count = 1) {
    try {
      const result = await prisma.event.update({
        where: { id },
        data: { currentAttendees: { increment: count } },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async updateEventStatuses() {
    const now = new Date()
    try {
      // Update ongoing events
      await prisma.event.updateMany({
        where: { startDate: { lte: now }, endDate: { gte: now }, status: "UPCOMING" },
        data: { status: "ONGOING" },
      })
      // Update completed events
      await prisma.event.updateMany({
        where: { endDate: { lt: now }, status: { in: ["UPCOMING", "ONGOING"] } },
        data: { status: "COMPLETED" },
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  // ============================================
  // EVENT BOOKINGS
  // ============================================

  async findBookingById(id: string) {
    try {
      const booking = await prisma.eventBooking.findUnique({ where: { id } })
      return { success: true, data: booking }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findBookingsByEvent(eventId: string) {
    try {
      const bookings = await prisma.eventBooking.findMany({
        where: { eventId },
        orderBy: { createdAt: "desc" },
      })
      return { success: true, data: bookings }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findBookingsByUser(userId: string) {
    try {
      const bookings = await prisma.eventBooking.findMany({
        where: { userId },
        include: { event: true },
        orderBy: { createdAt: "desc" },
      })
      return { success: true, data: bookings }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async createBooking(data: CreateEventBookingDTO) {
    try {
      const result = await prisma.eventBooking.create({ data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async updateBooking(id: string, data: UpdateEventBookingDTO) {
    try {
      const result = await prisma.eventBooking.update({ where: { id }, data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async deleteBooking(id: string) {
    try {
      const result = await prisma.eventBooking.delete({ where: { id } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async cancelBooking(id: string) {
    try {
      const result = await prisma.eventBooking.update({
        where: { id },
        data: { status: "CANCELLED" },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  // ============================================
  // FESTIVALS
  // ============================================

  async findFestivals(year?: number) {
    try {
      const where: any = {}
      if (year) {
        const startOfYear = new Date(year, 0, 1)
        const endOfYear = new Date(year, 11, 31)
        where.date = { gte: startOfYear, lte: endOfYear }
      }
      const festivals = await prisma.festival.findMany({
        where,
        orderBy: { date: "asc" },
      })
      return { success: true, data: festivals }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findFestivalById(id: string) {
    try {
      const festival = await prisma.festival.findUnique({ where: { id } })
      return { success: true, data: festival }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findUpcomingFestivals(limit = 10) {
    try {
      const festivals = await prisma.festival.findMany({
        where: { date: { gte: new Date() } },
        orderBy: { date: "asc" },
        take: limit,
      })
      return { success: true, data: festivals }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findMajorFestivals() {
    try {
      const festivals = await prisma.festival.findMany({
        where: { isMajorFestival: true },
        orderBy: { date: "asc" },
      })
      return { success: true, data: festivals }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async createFestival(data: CreateFestivalDTO) {
    try {
      const result = await prisma.festival.create({ data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async updateFestival(id: string, data: UpdateFestivalDTO) {
    try {
      const result = await prisma.festival.update({ where: { id }, data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async deleteFestival(id: string) {
    try {
      const result = await prisma.festival.delete({ where: { id } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  // ============================================
  // PANCHANGA
  // ============================================

  async findPanchangaByDate(date: Date) {
    try {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      const panchanga = await prisma.panchanga.findFirst({
        where: { date: { gte: startOfDay, lte: endOfDay } },
      })
      return { success: true, data: panchanga }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findPanchangas(startDate: Date, endDate: Date) {
    try {
      const panchangas = await prisma.panchanga.findMany({
        where: { date: { gte: startDate, lte: endDate } },
        orderBy: { date: "asc" },
      })
      return { success: true, data: panchangas }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async upsertPanchanga(date: Date, data: Partial<Omit<any, "id" | "date" | "createdAt" | "updatedAt">>) {
    try {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)

      const result = await prisma.panchanga.upsert({
        where: { date: startOfDay },
        create: { date: startOfDay, ...data },
        update: data,
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  // ============================================
  // POOJA SCHEDULE
  // ============================================

  async findPoojaSchedules(activeOnly = true) {
    try {
      const schedules = await prisma.poojaSchedule.findMany({
        where: activeOnly ? { active: true } : undefined,
        orderBy: [{ category: "asc" }, { order: "asc" }],
      })
      return { success: true, data: schedules }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findPoojaScheduleById(id: string) {
    try {
      const schedule = await prisma.poojaSchedule.findUnique({ where: { id } })
      return { success: true, data: schedule }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async createPoojaSchedule(data: CreatePoojaScheduleDTO) {
    try {
      const result = await prisma.poojaSchedule.create({ data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async updatePoojaSchedule(id: string, data: UpdatePoojaScheduleDTO) {
    try {
      const result = await prisma.poojaSchedule.update({ where: { id }, data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async deletePoojaSchedule(id: string) {
    try {
      const result = await prisma.poojaSchedule.delete({ where: { id } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }
}

export const eventsRepository = new EventsRepository()
