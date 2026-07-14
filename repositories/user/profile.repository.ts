/**
 * Profile Repository
 * Database access for user profiles
 */

import { prisma } from "@/lib/db"
import { BaseRepository } from "../common/base.repository"
import {
  CreateProfileDTO,
  UpdateProfileDTO,
  ProfileFilters,
  ProfileListParams,
  ProfileWithStats,
} from "./types"

export class ProfileRepository extends BaseRepository<any, CreateProfileDTO, UpdateProfileDTO> {
  constructor() {
    super("profile")
  }

  /**
   * Find profile by user ID (Supabase auth ID)
   */
  async findByUserId(userId: string) {
    try {
      const result = await prisma.profile.findUnique({
        where: { userId },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Find profile by email
   */
  async findByEmail(email: string) {
    try {
      const result = await prisma.profile.findUnique({
        where: { email },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Find profiles with filters and pagination
   */
  async findAll(params: ProfileListParams) {
    const { page = 1, limit = 10, filters = {}, orderBy = { field: "createdAt", order: "desc" as const } } = params

    const where: any = {}

    if (filters.role) {
      where.role = filters.role
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { phone: { contains: filters.search, mode: "insensitive" } },
      ]
    }

    try {
      const [data, total] = await Promise.all([
        prisma.profile.findMany({
          where,
          orderBy: { [orderBy.field]: orderBy.order },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.profile.count({ where }),
      ])

      return {
        success: true,
        data: {
          data,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: page * limit < total,
          },
        },
      }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Find profile with stats
   */
  async findWithStats(id: string): Promise<{ success: boolean; data?: ProfileWithStats; error?: string }> {
    try {
      const profile = await prisma.profile.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              donations: true,
              sevaBookings: true,
            },
          },
        },
      })

      if (!profile) {
        return { success: false, error: "Profile not found" }
      }

      const result: ProfileWithStats = {
        ...profile,
        donationCount: profile._count.donations,
        bookingCount: profile._count.sevaBookings,
      }

      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Create profile
   */
  async createProfile(data: CreateProfileDTO) {
    try {
      const result = await prisma.profile.create({
        data,
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Update profile
   */
  async updateProfile(id: string, data: UpdateProfileDTO) {
    try {
      const result = await prisma.profile.update({
        where: { id },
        data,
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Update profile by user ID
   */
  async updateByUserId(userId: string, data: UpdateProfileDTO) {
    try {
      const result = await prisma.profile.update({
        where: { userId },
        data,
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Update last login
   */
  async updateLastLogin(userId: string) {
    try {
      const result = await prisma.profile.update({
        where: { userId },
        data: { lastLoginAt: new Date() },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Count by role
   */
  async countByRole() {
    try {
      const result = await prisma.profile.groupBy({
        by: ["role"],
        _count: { role: true },
      })

      const roleCounts = result.reduce((acc, item) => {
        acc[item.role] = item._count.role
        return acc
      }, {} as Record<string, number>)

      return { success: true, data: roleCounts }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Deactivate profile
   */
  async deactivate(id: string) {
    try {
      const result = await prisma.profile.update({
        where: { id },
        data: { isActive: false },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Activate profile
   */
  async activate(id: string) {
    try {
      const result = await prisma.profile.update({
        where: { id },
        data: { isActive: true },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Delete profile and related data
   */
  async deleteProfile(id: string) {
    try {
      // First get the profile to find userId
      const profile = await prisma.profile.findUnique({
        where: { id },
      })

      if (!profile) {
        return { success: false, error: "Profile not found" }
      }

      // Delete related records first
      await prisma.$transaction([
        prisma.profile.delete({ where: { id } }),
      ])

      return { success: true, data: profile }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string, excludeId?: string) {
    try {
      const where: any = { email }
      if (excludeId) {
        where.id = { not: excludeId }
      }
      const count = await prisma.profile.count({ where })
      return { success: true, data: { exists: count > 0 } }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }
}

export const profileRepository = new ProfileRepository()
