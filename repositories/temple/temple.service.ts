/**
 * Temple Service
 * Business logic for temple settings and configurations
 */

import { templeRepository } from "./temple.repository"
import {
  validateTempleSettings,
  validateHomepageSettings,
  validateTempleTimings,
  validateCreateFacility,
  validateUpdateFacility,
  validateReorderFacilities,
  validateCreateAmenity,
  validateUpdateAmenity,
  validateCreateFuturePlan,
  validateUpdateFuturePlan,
} from "./temple.validator"
import { logger } from "@/lib/logger"

export class TempleService {
  // ============================================
  // TEMPLE SETTINGS
  // ============================================

  async getTempleSettings() {
    return templeRepository.getSettings()
  }

  async updateTempleSettings(data: unknown) {
    const validation = validateTempleSettings(data)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors.map(e => e.message).join(", "),
      }
    }

    logger.info("Updating temple settings", { fields: Object.keys(validation.data) })
    return templeRepository.updateSettings(validation.data)
  }

  // ============================================
  // HOMEPAGE SETTINGS
  // ============================================

  async getHomepageSettings() {
    return templeRepository.getHomepageSettings()
  }

  async updateHomepageSettings(data: unknown) {
    const validation = validateHomepageSettings(data)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors.map(e => e.message).join(", "),
      }
    }

    logger.info("Updating homepage settings", { fields: Object.keys(validation.data) })
    return templeRepository.updateHomepageSettings(validation.data)
  }

  // ============================================
  // TEMPLE TIMINGS
  // ============================================

  async getTempleTimings() {
    return templeRepository.getTimings()
  }

  async getTodayTimings() {
    const dayOfWeek = new Date().getDay()
    return templeRepository.getTimingForDay(dayOfWeek)
  }

  async updateTiming(dayOfWeek: number, data: unknown) {
    const validation = validateTempleTimings({ dayOfWeek, ...data as object })
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors.map(e => e.message).join(", "),
      }
    }

    logger.info("Updating temple timing", { dayOfWeek })
    return templeRepository.updateTiming(dayOfWeek, validation.data)
  }

  async setTimings(data: unknown) {
    const validation = validateTempleTimings(data)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors.map(e => e.message).join(", "),
      }
    }

    logger.info("Setting all temple timings")
    return templeRepository.setTimings(validation.data)
  }

  // ============================================
  // FACILITIES
  // ============================================

  async getFacilities(activeOnly = true) {
    return templeRepository.getFacilities(activeOnly)
  }

  async getFacilityById(id: string) {
    return templeRepository.getFacilityById(id)
  }

  async createFacility(data: unknown) {
    const validation = validateCreateFacility(data)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors.map(e => e.message).join(", "),
      }
    }

    logger.info("Creating facility", { name: validation.data.name })
    return templeRepository.createFacility(validation.data)
  }

  async updateFacility(id: string, data: unknown) {
    const validation = validateUpdateFacility(data)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors.map(e => e.message).join(", "),
      }
    }

    logger.info("Updating facility", { id })
    return templeRepository.updateFacility(id, validation.data)
  }

  async deleteFacility(id: string) {
    logger.info("Deleting facility", { id })
    return templeRepository.deleteFacility(id)
  }

  async reorderFacilities(data: unknown) {
    const validation = validateReorderFacilities(data)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors.map(e => e.message).join(", "),
      }
    }

    logger.info("Reordering facilities")
    return templeRepository.reorderFacilities(validation.data.orderedIds)
  }

  // ============================================
  // AMENITIES
  // ============================================

  async getAmenities(activeOnly = true) {
    return templeRepository.getAmenities(activeOnly)
  }

  async createAmenity(data: unknown) {
    const validation = validateCreateAmenity(data)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors.map(e => e.message).join(", "),
      }
    }

    logger.info("Creating amenity", { name: validation.data.name })
    return templeRepository.createAmenity(validation.data)
  }

  async updateAmenity(id: string, data: unknown) {
    const validation = validateUpdateAmenity(data)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors.map(e => e.message).join(", "),
      }
    }

    logger.info("Updating amenity", { id })
    return templeRepository.updateAmenity(id, validation.data)
  }

  async deleteAmenity(id: string) {
    logger.info("Deleting amenity", { id })
    return templeRepository.deleteAmenity(id)
  }

  // ============================================
  // FUTURE PLANS
  // ============================================

  async getFuturePlans(activeOnly = true) {
    return templeRepository.getFuturePlans(activeOnly)
  }

  async getFeaturedPlans() {
    return templeRepository.getFeaturedPlans()
  }

  async getFuturePlanById(id: string) {
    return templeRepository.getFuturePlanById(id)
  }

  async createFuturePlan(data: unknown) {
    const validation = validateCreateFuturePlan(data)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors.map(e => e.message).join(", "),
      }
    }

    logger.info("Creating future plan", { title: validation.data.title })
    return templeRepository.createFuturePlan(validation.data)
  }

  async updateFuturePlan(id: string, data: unknown) {
    const validation = validateUpdateFuturePlan(data)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors.map(e => e.message).join(", "),
      }
    }

    logger.info("Updating future plan", { id })
    return templeRepository.updateFuturePlan(id, validation.data)
  }

  async deleteFuturePlan(id: string) {
    logger.info("Deleting future plan", { id })
    return templeRepository.deleteFuturePlan(id)
  }

  async updatePlanProgress(id: string, raisedAmount: number) {
    logger.info("Updating plan progress", { id, raisedAmount })
    return templeRepository.updatePlanProgress(id, raisedAmount)
  }

  // ============================================
  // PUBLIC GETTERS
  // ============================================

  async getPublicTempleInfo() {
    const [temple, homepage, timings, facilities] = await Promise.all([
      templeRepository.getSettings(),
      templeRepository.getHomepageSettings(),
      templeRepository.getTimings(),
      templeRepository.getFacilities(true),
    ])

    return {
      success: temple.success && homepage.success && timings.success && facilities.success,
      data: {
        temple: temple.data,
        homepage: homepage.data,
        timings: timings.data,
        facilities: facilities.data,
      },
      error: temple.error || homepage.error || timings.error || facilities.error,
    }
  }
}

export const templeService = new TempleService()
