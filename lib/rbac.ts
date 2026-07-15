/**
 * RBAC Helper Functions
 * 
 * Utilities for checking user roles based on the Profile -> UserRole -> Role relationship.
 */

import { prisma } from "@/lib/db"
import type { UserRole } from "@/types/user"

/**
 * Get all roles for a profile
 */
export async function getProfileRoles(profileId: string): Promise<UserRole[]> {
  const userRoles = await prisma.userRole.findMany({
    where: { profileId },
    include: { role: true },
  })
  
  return userRoles.map(ur => ur.role.name.replace(' ', '_').toUpperCase() as UserRole)
}

/**
 * Check if a profile has any of the specified roles
 */
export async function profileHasRole(profileId: string, roles: UserRole[]): Promise<boolean> {
  const profileRoles = await getProfileRoles(profileId)
  return roles.some(role => profileRoles.includes(role))
}

/**
 * Check if profile is admin (ADMIN or SUPER_ADMIN)
 */
export async function isAdmin(profileId: string): Promise<boolean> {
  return profileHasRole(profileId, ["ADMIN", "SUPER_ADMIN"])
}

/**
 * Check if profile is staff (can manage content)
 */
export async function isStaff(profileId: string): Promise<boolean> {
  return profileHasRole(profileId, ["ADMIN", "SUPER_ADMIN", "STAFF", "PRIEST"])
}

/**
 * Check if profile can manage announcements
 */
export async function canManageAnnouncements(profileId: string): Promise<boolean> {
  return profileHasRole(profileId, ["ADMIN", "SUPER_ADMIN", "STAFF"])
}
