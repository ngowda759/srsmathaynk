/**
 * Profile Service
 * Business logic for user profiles
 */

import { profileRepository } from "./profile.repository"
import {
  validateCreateProfile,
  validateUpdateProfile,
  validateProfileListParams,
  validateChangeRole,
} from "./user.validator"
import { CreateProfileDTO, UpdateProfileDTO, ProfileListParams } from "./types"
import { logger } from "@/lib/logger"

export class ProfileService {
  /**
   * Create a new profile
   */
  async createProfile(data: unknown) {
    const validation = validateCreateProfile(data)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors.map(e => e.message).join(", "),
      }
    }

    const input = validation.data as CreateProfileDTO

    // Check if email already exists
    const emailCheck = await profileRepository.emailExists(input.email)
    if (emailCheck.success && emailCheck.data?.exists) {
      return { success: false, error: "Email already registered" }
    }

    // Check if user ID already has a profile
    const existingProfile = await profileRepository.findByUserId(input.userId)
    if (existingProfile.success && existingProfile.data) {
      return { success: false, error: "Profile already exists for this user" }
    }

    logger.info("Creating profile", { email: input.email })
    return profileRepository.createProfile(input)
  }

  /**
   * Get profile by ID
   */
  async getProfile(id: string) {
    return profileRepository.findById(id)
  }

  /**
   * Get profile by user ID
   */
  async getProfileByUserId(userId: string) {
    return profileRepository.findByUserId(userId)
  }

  /**
   * Get profile by email
   */
  async getProfileByEmail(email: string) {
    return profileRepository.findByEmail(email)
  }

  /**
   * Get profile with stats
   */
  async getProfileWithStats(id: string) {
    return profileRepository.findWithStats(id)
  }

  /**
   * Get profiles with pagination
   */
  async getProfiles(params: unknown) {
    const validation = validateProfileListParams(params)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors.map(e => e.message).join(", "),
      }
    }

    return profileRepository.findAll(validation.data as ProfileListParams)
  }

  /**
   * Update profile
   */
  async updateProfile(id: string, data: unknown) {
    const validation = validateUpdateProfile(data)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors.map(e => e.message).join(", "),
      }
    }

    const input = validation.data as UpdateProfileDTO

    // Check if profile exists
    const existing = await profileRepository.findById(id)
    if (!existing.success || !existing.data) {
      return { success: false, error: "Profile not found" }
    }

    logger.info("Updating profile", { id, fields: Object.keys(input) })
    return profileRepository.updateProfile(id, input)
  }

  /**
   * Update profile by user ID
   */
  async updateProfileByUserId(userId: string, data: unknown) {
    const validation = validateUpdateProfile(data)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors.map(e => e.message).join(", "),
      }
    }

    const input = validation.data as UpdateProfileDTO
    logger.info("Updating profile by user ID", { userId, fields: Object.keys(input) })
    return profileRepository.updateByUserId(userId, input)
  }

  /**
   * Update last login
   */
  async recordLogin(userId: string) {
    return profileRepository.updateLastLogin(userId)
  }

  /**
   * Change user role
   */
  async changeRole(id: string, data: unknown) {
    const validation = validateChangeRole(data)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors.map(e => e.message).join(", "),
      }
    }

    logger.info("Changing profile role", { id, role: validation.data.role })
    return profileRepository.updateProfile(id, { role: validation.data.role as any })
  }

  /**
   * Deactivate profile
   */
  async deactivateProfile(id: string) {
    logger.info("Deactivating profile", { id })
    return profileRepository.deactivate(id)
  }

  /**
   * Activate profile
   */
  async activateProfile(id: string) {
    logger.info("Activating profile", { id })
    return profileRepository.activate(id)
  }

  /**
   * Delete profile
   */
  async deleteProfile(id: string) {
    logger.info("Deleting profile", { id })
    return profileRepository.deleteProfile(id)
  }

  /**
   * Get role statistics
   */
  async getRoleStats() {
    return profileRepository.countByRole()
  }

  /**
   * Get or create profile for user
   */
  async getOrCreateProfile(userId: string, email: string, metadata?: { name?: string; phone?: string }) {
    // Try to find existing profile
    const existing = await profileRepository.findByUserId(userId)
    if (existing.success && existing.data) {
      return { success: true, data: existing.data, created: false }
    }

    // Create new profile
    const result = await this.createProfile({
      userId,
      email,
      name: metadata?.name,
      phone: metadata?.phone,
    })

    if (result.success) {
      return { ...result, created: true }
    }
    return result
  }
}

export const profileService = new ProfileService()
