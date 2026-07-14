/**
 * Sevas Service
 * Business logic for sevas and bookings
 */

import { sevasRepository } from "./sevas.repository"
import {
  validateCreateSeva,
  validateUpdateSeva,
  validateSevaListParams,
  validateCreateSevaBooking,
  validateUpdateSevaBooking,
} from "./sevas.validator"
import { logger } from "@/lib/logger"

export class SevasService {
  // ============================================
  // SEVAS
  // ============================================

  async getSeva(id: string) {
    return sevasRepository.findSevaById(id)
  }

  async getSevas(params: unknown) {
    const validation = validateSevaListParams(params)
    if (!validation.success) {
      return { success: false, error: validation.error.errors.map(e => e.message).join(", ") }
    }
    return sevasRepository.findSevas(validation.data)
  }

  async getActiveSevas() {
    return sevasRepository.findActiveSevas()
  }

  async getFeaturedSevas(limit?: number) {
    return sevasRepository.findFeaturedSevas(limit)
  }

  async getSevasByCategory(category: string) {
    return sevasRepository.findSevasByCategory(category)
  }

  async createSeva(data: unknown) {
    const validation = validateCreateSeva(data)
    if (!validation.success) {
      return { success: false, error: validation.error.errors.map(e => e.message).join(", ") }
    }
    logger.info("Creating seva", { name: validation.data.name })
    return sevasRepository.createSeva(validation.data)
  }

  async updateSeva(id: string, data: unknown) {
    const validation = validateUpdateSeva(data)
    if (!validation.success) {
      return { success: false, error: validation.error.errors.map(e => e.message).join(", ") }
    }
    logger.info("Updating seva", { id })
    return sevasRepository.updateSeva(id, validation.data)
  }

  async deleteSeva(id: string) {
    logger.info("Deleting seva", { id })
    return sevasRepository.deleteSeva(id)
  }

  async toggleSevaActive(id: string) {
    logger.info("Toggling seva active status", { id })
    return sevasRepository.toggleSevaActive(id)
  }

  async getSevaStats(id: string) {
    return sevasRepository.getSevaStats(id)
  }

  // ============================================
  // SEVA BOOKINGS
  // ============================================

  async getBooking(id: string) {
    return sevasRepository.findBookingById(id)
  }

  async getUserBookings(userId: string, params?: { status?: string; page?: number; limit?: number }) {
    return sevasRepository.findBookingsByUser(userId, params)
  }

  async getBookingsBySeva(sevaId: string, date?: Date) {
    return sevasRepository.findBookingsBySeva(sevaId, date)
  }

  async getBookingsForDate(sevaId: string, date: Date) {
    return sevasRepository.getBookingsForDate(sevaId, date)
  }

  async createBooking(data: unknown) {
    const validation = validateCreateSevaBooking(data)
    if (!validation.success) {
      return { success: false, error: validation.error.errors.map(e => e.message).join(", ") }
    }

    // Validate seva exists and is active
    const seva = await sevasRepository.findSevaById(validation.data.sevaId)
    if (!seva.success || !seva.data) {
      return { success: false, error: "Seva not found" }
    }
    if (!seva.data.active) {
      return { success: false, error: "This seva is not currently available" }
    }

    // Check maxPerDay limit
    if (seva.data.maxPerDay) {
      const bookings = await sevasRepository.getBookingsForDate(seva.data.id, new Date(validation.data.bookingDate))
      if (bookings.success && bookings.data && bookings.data.count >= seva.data.maxPerDay) {
        return { success: false, error: "No more bookings available for this date" }
      }
    }

    // Validate advance booking requirements
    const bookingDate = new Date(validation.data.bookingDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const daysInAdvance = Math.ceil((bookingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (seva.data.minAdvanceBooking && daysInAdvance < seva.data.minAdvanceBooking) {
      return { success: false, error: `Booking must be made at least ${seva.data.minAdvanceBooking} days in advance` }
    }
    if (seva.data.maxAdvanceBooking && daysInAdvance > seva.data.maxAdvanceBooking) {
      return { success: false, error: `Booking cannot be made more than ${seva.data.maxAdvanceBooking} days in advance` }
    }

    logger.info("Creating seva booking", { userId: validation.data.userId, sevaId: validation.data.sevaId })

    return sevasRepository.createBooking({
      ...validation.data,
      bookingDate: new Date(validation.data.bookingDate),
    } as any)
  }

  async updateBooking(id: string, data: unknown) {
    const validation = validateUpdateSevaBooking(data)
    if (!validation.success) {
      return { success: false, error: validation.error.errors.map(e => e.message).join(", ") }
    }

    const updateData: any = { ...validation.data }
    if (validation.data.bookingDate) {
      updateData.bookingDate = new Date(validation.data.bookingDate)
    }

    logger.info("Updating seva booking", { id })
    return sevasRepository.updateBooking(id, updateData)
  }

  async cancelBooking(id: string) {
    logger.info("Cancelling seva booking", { id })
    return sevasRepository.cancelBooking(id)
  }

  async completeBooking(id: string) {
    logger.info("Completing seva booking", { id })
    return sevasRepository.completeBooking(id)
  }

  async deleteBooking(id: string) {
    logger.info("Deleting seva booking", { id })
    return sevasRepository.deleteBooking(id)
  }

  async updatePaymentStatus(id: string, paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED") {
    logger.info("Updating payment status", { id, paymentStatus })
    return sevasRepository.updatePaymentStatus(id, paymentStatus)
  }

  async addReceipt(id: string, receiptNumber: string, receiptUrl: string) {
    logger.info("Adding receipt", { id, receiptNumber })
    return sevasRepository.addReceipt(id, receiptNumber, receiptUrl)
  }
}

export const sevasService = new SevasService()
