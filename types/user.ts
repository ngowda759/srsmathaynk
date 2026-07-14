/**
 * User types - Supabase compatible
 */

// User roles matching Prisma schema
export type UserRole = "DEVOTEE" | "VOLUNTEER" | "PRIEST" | "STAFF" | "ADMIN" | "SUPER_ADMIN"

// Legacy role mapping for backwards compatibility
export const LegacyRoleMap: Record<string, UserRole> = {
  "SUPER_ADMIN": "SUPER_ADMIN",
  "super_admin": "SUPER_ADMIN",
  "Super Admin": "SUPER_ADMIN",
  "ADMIN": "ADMIN",
  "admin": "ADMIN",
  "Temple Admin": "ADMIN",
  "temple_admin": "ADMIN",
  "PRIEST": "PRIEST",
  "priest": "PRIEST",
  "STAFF": "STAFF",
  "staff": "STAFF",
  "Office Staff": "STAFF",
  "office_staff": "STAFF",
  "VOLUNTEER": "VOLUNTEER",
  "volunteer": "VOLUNTEER",
  "Volunteer": "VOLUNTEER",
  "DEVOTEE": "DEVOTEE",
  "devotee": "DEVOTEE",
  "User": "DEVOTEE",
  "user": "DEVOTEE",
  "BILLING": "ADMIN", // Map billing to admin
  "billing": "ADMIN",
}

// Normalized roles for consistent access control
export type NormalizedRole = "super_admin" | "admin" | "staff" | "priest" | "volunteer" | "devotee"

export function normalizeRole(role: string): NormalizedRole {
  const normalized = LegacyRoleMap[role] || "DEVOTEE"
  
  switch (normalized) {
    case "SUPER_ADMIN":
      return "super_admin"
    case "ADMIN":
      return "admin"
    case "STAFF":
      return "staff"
    case "PRIEST":
      return "priest"
    case "VOLUNTEER":
      return "volunteer"
    case "DEVOTEE":
    default:
      return "devotee"
  }
}

// Permission levels
export type Permission = 
  | "manage_users"
  | "manage_settings"
  | "manage_content"
  | "manage_events"
  | "manage_sevas"
  | "manage_donations"
  | "manage_gallery"
  | "view_reports"
  | "manage_billing"
  | "access_admin"
  | "access_dashboard"

// Role to permissions mapping
export const RolePermissions: Record<NormalizedRole, Permission[]> = {
  super_admin: [
    "manage_users", "manage_settings", "manage_content", "manage_events",
    "manage_sevas", "manage_donations", "manage_gallery", "view_reports",
    "manage_billing", "access_admin", "access_dashboard"
  ],
  admin: [
    "manage_content", "manage_events", "manage_sevas", "manage_donations",
    "manage_gallery", "view_reports", "access_admin", "access_dashboard"
  ],
  staff: [
    "manage_events", "manage_sevas", "manage_gallery", "access_dashboard"
  ],
  priest: [
    "manage_events", "manage_sevas", "access_dashboard"
  ],
  volunteer: [
    "access_dashboard"
  ],
  devotee: []
}

export function hasPermission(role: NormalizedRole, permission: Permission): boolean {
  return RolePermissions[role]?.includes(permission) ?? false
}

export function hasAnyPermission(role: NormalizedRole, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p))
}

export function hasAllPermissions(role: NormalizedRole, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p))
}

export interface UserProfile {
  id: string
  userId: string
  name: string | null
  email: string
  phone: string | null
  role: UserRole
  avatarUrl: string | null
  address: string | null
  emailVerified: boolean
  isActive: boolean
  lastLoginAt: Date | string | null
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
