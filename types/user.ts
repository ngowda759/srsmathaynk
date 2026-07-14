/**
 * User types - Supabase compatible
 */

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "PRIEST"
  | "USER"
  | "super_admin"
  | "temple_admin"
  | "priest"
  | "staff"
  | "volunteer"
  | "devotee"
  | "billing"
  | "Billing"
  | "Super Admin"
  | "Temple Admin"
  | "Priest"
  | "Office Staff"
  | "Volunteer"

// Normalized roles for consistent access control
export type NormalizedRole = "super_admin" | "admin" | "billing" | "volunteer" | "devotee"

export function normalizeRole(role: string): NormalizedRole {
  const roleLower = role.toLowerCase().replace(/\s+/g, "_")
  
  switch (roleLower) {
    case "super_admin":
    case "super admin":
      return "super_admin"
    case "billing":
      return "billing"
    case "admin":
    case "temple_admin":
    case "temple admin":
    case "priest":
    case "staff":
    case "office_staff":
    case "office staff":
      return "admin"
    case "volunteer":
      return "volunteer"
    case "user":
    case "devotee":
    default:
      return "devotee"
  }
}

export interface UserProfile {
  id: string
  userId: string
  name: string | null
  email: string
  phone: string | null
  role: string
  avatarUrl: string | null
  address: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export interface TempleUser {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  active: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

export type TempleUserCreate = Pick<TempleUser, "name" | "email" | "phone" | "role" | "active">
export type TempleUserUpdate = Partial<TempleUserCreate>
