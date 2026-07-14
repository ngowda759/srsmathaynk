/**
 * User/Profile Repository Types
 */

import { UserRole, Profile } from "@prisma/client"
import { CreateInput, UpdateInput, PaginationParams } from "../common/types"

// Profile types
export type { Profile }

export interface ProfileWithStats extends Profile {
  donationCount?: number
  bookingCount?: number
}

export interface CreateProfileDTO {
  userId: string
  email: string
  name?: string
  role?: UserRole
  phone?: string
  address?: string
  avatarUrl?: string
}

export interface UpdateProfileDTO {
  name?: string
  role?: UserRole
  phone?: string
  address?: string
  avatarUrl?: string
  emailVerified?: boolean
  isActive?: boolean
}

export interface ProfileFilters {
  role?: UserRole
  isActive?: boolean
  search?: string
}

export interface ProfileListParams extends PaginationParams {
  filters?: ProfileFilters
  orderBy?: {
    field: "createdAt" | "name" | "role"
    order?: "asc" | "desc"
  }
}

// User session types
export interface CreateSessionDTO {
  profileId: string
  sessionToken: string
  deviceInfo?: string
  ipAddress?: string
  expiresAt: Date
}

export interface SessionWithProfile {
  id: string
  profileId: string
  sessionToken: string
  deviceInfo?: string
  ipAddress?: string
  expiresAt: Date
  createdAt: Date
  profile?: {
    id: string
    name?: string
    email: string
    role: UserRole
  }
}
