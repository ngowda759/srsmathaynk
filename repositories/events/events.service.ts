/**
 * Events Service
 * Business logic for events, festivals, panchangas, and pooja schedules
 */

import { eventsRepository } from "./events.repository"
import {
  validateCreateEvent,
  validateUpdateEvent,
  validateEventListParams,
  validateCreateEventBooking,
  validateUpdateEventBooking,
  validateCreateFestival,
  validateUpdateFestival,
  validateCreatePoojaSchedule,
  validateUpdatePoojaSchedule,
} from "./events.validator"
import { logger } from "@/lib/logger"

export class EventsService {
  // ============================================
  // EVENTS
  // ============================================

  async getEvent(id: string) {
    return eventsRepository.findEventById(id)
  }

  async getEvents(params: unknown) {
    const validation = validateEventListParams(params)
    if (!validation.success) {
      return { success: false, error: validation.error.errors.map(e => e.message).join(", ") }
    }
    return eventsRepository.findEvents(validation.data)
  }

  async getPublishedEvents(limit?: number) {
    return eventsRepository.findPublishedEvents(limit)
  }

  async getFeaturedEvents(limit?: number) {
    return eventsRepository.findFeaturedEvents(limit)
  }

  async getUpcomingEvents(startDate?: Date, limit?: number) {
    return eventsRepository.findUpcomingEvents(startDate, limit)
  }

  async createEvent(data: unknown) {
    const validation = validateCreateEvent(data)
    if (!validation.success) {
      return { success: false, error: validation.error.errors.map(e => e.message).join(", ") }
    }

    logger.info("Creating event", { title: validation.data.title })
    return eventsRepository.createEvent({
      ...validation.data,
      startDate: new Date(validation.data.startDate),
      endDate: new Date(validation.data.endDate),
    } as any)
  }

  async updateEvent(id: string, data: unknown) {
    const validation = validateUpdateEvent(data)
    if (!validation.success) {
      return { success: false, error: validation.error.errors.map(e => e.message).join(", ") }
    }

    const updateData: any = { ...validation.data }
    if (validation.data.startDate) updateData.startDate = new Date(validation.data.startDate)
    if (validation.data.endDate) updateData.endDate = new Date(validation.data.endDate)

    logger.info("Updating event", { id })
    return eventsRepository.updateEvent(id, updateData)
  }

  async deleteEvent(id: string) {
    logger.info("Deleting event", { id })
    return eventsRepository.deleteEvent(id)
  }

  async publishEvent(id: string) {
    logger.info("Publishing event", { id })
    return eventsRepository.updateEvent(id, { published: true })
  }

  async unpublishEvent(id: string) {
    logger.info("Unpublishing event", { id })
    return eventsRepository.updateEvent(id, { published: false })
  }

  async cancelEvent(id: string) {
    logger.info("Cancelling event", { id })
    return eventsRepository.updateEvent(id, { status: "CANCELLED" })
  }

  async updateEventStatuses() {
    logger.info("Updating event statuses")
    return eventsRepository.updateEventStatuses()
  }

  // ============================================
  // EVENT BOOKINGS
  // ============================================

  async getBooking(id: string) {
    return eventsRepository.findBookingById(id)
  }

  async getBookingsByEvent(eventId: string) {
    return eventsRepository.findBookingsByEvent(eventId)
  }

  async getBookingsByUser(userId: string) {
    return eventsRepository.findBookingsByUser(userId)
  }

  async createBooking(data: unknown) {
    const validation = validateCreateEventBooking(data)
    if (!validation.success) {
      return { success: false, error: validation.error.errors.map(e => e.message).join(", ") }
    }

    logger.info("Creating event booking", { eventId: validation.data.eventId })

    // Check event availability
    const event = await eventsRepository.findEventById(validation.data.eventId)
    if (!event.success || !event.data) {
      return { success: false, error: "Event not found" }
    }

    if (!event.data.published) {
      return { success: false, error: "Event is not published" }
    }

    if (event.data.maxAttendees) {
      const totalTickets = (event.data.currentAttendees || 0) + validation.data.tickets
      if (totalTickets > event.data.maxAttendees) {
        return { success: false, error: "Not enough spots available" }
      }
    }

    const result = await eventsRepository.createBooking(validation.data)

    if (result.success) {
      // Increment attendee count
      await eventsRepository.incrementAttendees(validation.data.eventId, validation.data.tickets)
    }

    return result
  }

  async updateBooking(id: string, data: unknown) {
    const validation = validateUpdateEventBooking(data)
    if (!validation.success) {
      return { success: false, error: validation.error.errors.map(e => e.message).join(", ") }
    }

    logger.info("Updating event booking", { id })
    return eventsRepository.updateBooking(id, validation.data)
  }

  async cancelBooking(id: string) {
    logger.info("Cancelling event booking", { id })

    const booking = await eventsRepository.findBookingById(id)
    if (!booking.success || !booking.data) {
      return { success: false, error: "Booking not found" }
    }

    const result = await eventsRepository.cancelBooking(id)

    if (result.success) {
      // Decrement attendee count
      await eventsRepository.incrementAttendees(booking.data.eventId, -(booking.data.tickets))
    }

    return result
  }

  async deleteBooking(id: string) {
    logger.info("Deleting event booking", { id })
    return eventsRepository.deleteBooking(id)
  }

  // ============================================
  // FESTIVALS
  // ============================================

  async getFestivals(year?: number) {
    return eventsRepository.findFestivals(year)
  }

  async getFestival(id: string) {
    return eventsRepository.findFestivalById(id)
  }

  async getUpcomingFestivals(limit?: number) {
    return eventsRepository.findUpcomingFestivals(limit)
  }

  async getMajorFestivals() {
    return eventsRepository.findMajorFestivals()
  }

  async createFestival(data: unknown) {
    const validation = validateCreateFestival(data)
    if (!validation.success) {
      return { success: false, error: validation.error.errors.map(e => e.message).join(", ") }
    }

    logger.info("Creating festival", { name: validation.data.name })
    return eventsRepository.createFestival({
      ...validation.data,
      date: new Date(validation.data.date),
      endDate: validation.data.endDate ? new Date(validation.data.endDate) : undefined,
    } as any)
  }

  async updateFestival(id: string, data: unknown) {
    const validation = validateUpdateFestival(data)
    if (!validation.success) {
      return { success: false, error: validation.error.errors.map(e => e.message).join(", ") }
    }

    const updateData: any = { ...validation.data }
    if (validation.data.date) updateData.date = new Date(validation.data.date)
    if (validation.data.endDate) updateData.endDate = new Date(validation.data.endDate)

    logger.info("Updating festival", { id })
    return eventsRepository.updateFestival(id, updateData)
  }

  async deleteFestival(id: string) {
    logger.info("Deleting festival", { id })
    return eventsRepository.deleteFestival(id)
  }

  // ============================================
  // PANCHANGA
  // ============================================

  async getTodayPanchanga() {
    return eventsRepository.findPanchangaByDate(new Date())
  }

  async getPanchanga(date: Date) {
    return eventsRepository.findPanchangaByDate(date)
  }

  async getPanchangas(startDate: Date, endDate: Date) {
    return eventsRepository.findPanchangas(startDate, endDate)
  }

  async upsertPanchanga(date: Date, data: unknown) {
    logger.info("Upserting panchanga", { date: date.toISOString() })
    return eventsRepository.upsertPanchanga(date, data as any)
  }

  // ============================================
  // POOJA SCHEDULE
  // ============================================

  async getPoojaSchedules(activeOnly = true) {
    return eventsRepository.findPoojaSchedules(activeOnly)
  }

  async getPoojaSchedule(id: string) {
    return eventsRepository.findPoojaScheduleById(id)
  }

  async createPoojaSchedule(data: unknown) {
    const validation = validateCreatePoojaSchedule(data)
    if (!validation.success) {
      return { success: false, error: validation.error.errors.map(e => e.message).join(", ") }
    }

    logger.info("Creating pooja schedule", { name: validation.data.name })
    return eventsRepository.createPoojaSchedule(validation.data)
  }

  async updatePoojaSchedule(id: string, data: unknown) {
    const validation = validateUpdatePoojaSchedule(data)
    if (!validation.success) {
      return { success: false, error: validation.error.errors.map(e => e.message).join(", ") }
    }

    logger.info("Updating pooja schedule", { id })
    return eventsRepository.updatePoojaSchedule(id, validation.data)
  }

  async deletePoojaSchedule(id: string) {
    logger.info("Deleting pooja schedule", { id })
    return eventsRepository.deletePoojaSchedule(id)
  }
}

export const eventsService = new EventsService()
