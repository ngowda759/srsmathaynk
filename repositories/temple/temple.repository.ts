/**
 * Temple Repository
 * Database access for temple settings and configurations
 */

import { prisma } from "@/lib/db"
import {
  CreateTempleSettingsDTO,
  UpdateTempleSettingsDTO,
  CreateHomepageSettingsDTO,
  UpdateHomepageSettingsDTO,
  CreateTempleTimingDTO,
  UpdateTempleTimingDTO,
  CreateFacilityDTO,
  UpdateFacilityDTO,
  CreateAmenityDTO,
  UpdateAmenityDTO,
  CreateFuturePlanDTO,
  UpdateFuturePlanDTO,
} from "./types"

export class TempleRepository {
  // ============================================
  // TEMPLE SETTINGS
  // ============================================

  async getSettings() {
    try {
      const settings = await prisma.templeSettings.findFirst()
      return { success: true, data: settings }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async updateSettings(data: UpdateTempleSettingsDTO) {
    try {
      // Get existing or create new
      const existing = await prisma.templeSettings.findFirst()
      
      let result
      if (existing) {
        result = await prisma.templeSettings.update({
          where: { id: existing.id },
          data,
        })
      } else {
        result = await prisma.templeSettings.create({
          data: {
            templeName: data.templeName || "Sri Raghavendra Swamy Temple",
            ...data,
          },
        })
      }
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  // ============================================
  // HOMEPAGE SETTINGS
  // ============================================

  async getHomepageSettings() {
    try {
      const settings = await prisma.homepageSettings.findFirst()
      return { success: true, data: settings }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async updateHomepageSettings(data: UpdateHomepageSettingsDTO) {
    try {
      const existing = await prisma.homepageSettings.findFirst()
      
      let result
      if (existing) {
        result = await prisma.homepageSettings.update({
          where: { id: existing.id },
          data,
        })
      } else {
        result = await prisma.homepageSettings.create({
          data: {
            heroTitle: "Welcome to Sri Raghavendra Swamy Temple",
            ...data,
          },
        })
      }
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  // ============================================
  // TEMPLE TIMINGS
  // ============================================

  async getTimings() {
    try {
      const timings = await prisma.templeTiming.findMany({
        orderBy: { dayOfWeek: "asc" },
      })
      return { success: true, data: timings }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async getTimingForDay(dayOfWeek: number) {
    try {
      const timing = await prisma.templeTiming.findUnique({
        where: { dayOfWeek },
      })
      return { success: true, data: timing }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async updateTiming(dayOfWeek: number, data: UpdateTempleTimingDTO) {
    try {
      const result = await prisma.templeTiming.upsert({
        where: { dayOfWeek },
        create: { dayOfWeek, ...data } as any,
        update: data,
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async setTimings(timings: CreateTempleTimingDTO[]) {
    try {
      const result = await prisma.$transaction(
        timings.map((timing) =>
          prisma.templeTiming.upsert({
            where: { dayOfWeek: timing.dayOfWeek },
            create: timing as any,
            update: timing as any,
          })
        )
      )
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  // ============================================
  // FACILITIES
  // ============================================

  async getFacilities(activeOnly = true) {
    try {
      const facilities = await prisma.facility.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: { order: "asc" },
      })
      return { success: true, data: facilities }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async getFacilityById(id: string) {
    try {
      const facility = await prisma.facility.findUnique({ where: { id } })
      return { success: true, data: facility }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async createFacility(data: CreateFacilityDTO) {
    try {
      const result = await prisma.facility.create({ data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async updateFacility(id: string, data: UpdateFacilityDTO) {
    try {
      const result = await prisma.facility.update({ where: { id }, data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async deleteFacility(id: string) {
    try {
      const result = await prisma.facility.delete({ where: { id } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async reorderFacilities(orderedIds: string[]) {
    try {
      await prisma.$transaction(
        orderedIds.map((id, index) =>
          prisma.facility.update({
            where: { id },
            data: { order: index },
          })
        )
      )
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  // ============================================
  // AMENITIES
  // ============================================

  async getAmenities(activeOnly = true) {
    try {
      const amenities = await prisma.amenity.findMany({
        where: activeOnly ? { isAvailable: true } : undefined,
        orderBy: { order: "asc" },
      })
      return { success: true, data: amenities }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async createAmenity(data: CreateAmenityDTO) {
    try {
      const result = await prisma.amenity.create({ data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async updateAmenity(id: string, data: UpdateAmenityDTO) {
    try {
      const result = await prisma.amenity.update({ where: { id }, data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async deleteAmenity(id: string) {
    try {
      const result = await prisma.amenity.delete({ where: { id } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  // ============================================
  // FUTURE PLANS
  // ============================================

  async getFuturePlans(activeOnly = true) {
    try {
      const plans = await prisma.futurePlan.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: [{ order: "asc" }, { priority: "desc" }],
      })
      return { success: true, data: plans }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async getFeaturedPlans() {
    try {
      const plans = await prisma.futurePlan.findMany({
        where: { isActive: true, isFeatured: true },
        orderBy: { order: "asc" },
      })
      return { success: true, data: plans }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async getFuturePlanById(id: string) {
    try {
      const plan = await prisma.futurePlan.findUnique({ where: { id } })
      return { success: true, data: plan }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async createFuturePlan(data: CreateFuturePlanDTO) {
    try {
      const result = await prisma.futurePlan.create({ data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async updateFuturePlan(id: string, data: UpdateFuturePlanDTO) {
    try {
      const result = await prisma.futurePlan.update({ where: { id }, data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async deleteFuturePlan(id: string) {
    try {
      const result = await prisma.futurePlan.delete({ where: { id } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async updatePlanProgress(id: string, raisedAmount: number) {
    try {
      const result = await prisma.futurePlan.update({
        where: { id },
        data: { raisedAmount },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }
}

export const templeRepository = new TempleRepository()
