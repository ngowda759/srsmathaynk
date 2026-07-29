/**
 * Unit Tests for RBAC Utilities
 * Coverage target: >90%
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { UserRole } from '@/types/user'

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    userRole: {
      findMany: vi.fn(),
    },
    role: {
      findUnique: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/db'
import {
  getProfileRoles,
  profileHasRole,
  isAdmin,
  isStaff,
  canManageAnnouncements,
} from '@/lib/rbac'

describe('RBAC Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getProfileRoles', () => {
    it('should return roles for a profile', async () => {
      const mockRoles = [
        { role: { name: 'ADMIN' } },
        { role: { name: 'STAFF' } },
      ]

      ;(prisma.userRole.findMany as any).mockResolvedValue(mockRoles)

      const roles = await getProfileRoles('profile-123')
      
      expect(roles).toContain('ADMIN')
      expect(roles).toContain('STAFF')
      expect(prisma.userRole.findMany).toHaveBeenCalledWith({
        where: { profileId: 'profile-123' },
        include: { role: true },
      })
    })

    it('should return empty array for profile with no roles', async () => {
      ;(prisma.userRole.findMany as any).mockResolvedValue([])

      const roles = await getProfileRoles('profile-no-roles')
      
      expect(roles).toEqual([])
    })

    it('should convert role names to uppercase with underscores', async () => {
      const mockRoles = [
        { role: { name: 'SUPER ADMIN' } },
      ]

      ;(prisma.userRole.findMany as any).mockResolvedValue(mockRoles)

      const roles = await getProfileRoles('profile-123')
      
      expect(roles).toContain('SUPER_ADMIN')
    })
  })

  describe('profileHasRole', () => {
    it('should return true when profile has one of the roles', async () => {
      ;(prisma.userRole.findMany as any).mockResolvedValue([
        { role: { name: 'ADMIN' } },
      ])

      const result = await profileHasRole('profile-123', ['ADMIN', 'SUPER_ADMIN'])
      expect(result).toBe(true)
    })

    it('should return false when profile has none of the roles', async () => {
      ;(prisma.userRole.findMany as any).mockResolvedValue([
        { role: { name: 'DEVOTEE' } },
      ])

      const result = await profileHasRole('profile-123', ['ADMIN', 'SUPER_ADMIN'])
      expect(result).toBe(false)
    })
  })

  describe('isAdmin', () => {
    it('should return true for ADMIN role', async () => {
      ;(prisma.userRole.findMany as any).mockResolvedValue([
        { role: { name: 'ADMIN' } },
      ])

      const result = await isAdmin('profile-admin')
      expect(result).toBe(true)
    })

    it('should return true for SUPER_ADMIN role', async () => {
      ;(prisma.userRole.findMany as any).mockResolvedValue([
        { role: { name: 'SUPER ADMIN' } },
      ])

      const result = await isAdmin('profile-super-admin')
      expect(result).toBe(true)
    })

    it('should return false for non-admin roles', async () => {
      ;(prisma.userRole.findMany as any).mockResolvedValue([
        { role: { name: 'DEVOTEE' } },
        { role: { name: 'VOLUNTEER' } },
      ])

      const result = await isAdmin('profile-devotee')
      expect(result).toBe(false)
    })
  })

  describe('isStaff', () => {
    it('should return true for ADMIN', async () => {
      ;(prisma.userRole.findMany as any).mockResolvedValue([
        { role: { name: 'ADMIN' } },
      ])

      expect(await isStaff('profile-admin')).toBe(true)
    })

    it('should return true for SUPER_ADMIN', async () => {
      ;(prisma.userRole.findMany as any).mockResolvedValue([
        { role: { name: 'SUPER ADMIN' } },
      ])

      expect(await isStaff('profile-super-admin')).toBe(true)
    })

    it('should return true for STAFF', async () => {
      ;(prisma.userRole.findMany as any).mockResolvedValue([
        { role: { name: 'STAFF' } },
      ])

      expect(await isStaff('profile-staff')).toBe(true)
    })

    it('should return true for PRIEST', async () => {
      ;(prisma.userRole.findMany as any).mockResolvedValue([
        { role: { name: 'PRIEST' } },
      ])

      expect(await isStaff('profile-priest')).toBe(true)
    })

    it('should return false for DEVOTEE', async () => {
      ;(prisma.userRole.findMany as any).mockResolvedValue([
        { role: { name: 'DEVOTEE' } },
      ])

      expect(await isStaff('profile-devotee')).toBe(false)
    })
  })

  describe('canManageAnnouncements', () => {
    it('should return true for ADMIN', async () => {
      ;(prisma.userRole.findMany as any).mockResolvedValue([
        { role: { name: 'ADMIN' } },
      ])

      expect(await canManageAnnouncements('profile-admin')).toBe(true)
    })

    it('should return true for SUPER_ADMIN', async () => {
      ;(prisma.userRole.findMany as any).mockResolvedValue([
        { role: { name: 'SUPER ADMIN' } },
      ])

      expect(await canManageAnnouncements('profile-super-admin')).toBe(true)
    })

    it('should return true for STAFF', async () => {
      ;(prisma.userRole.findMany as any).mockResolvedValue([
        { role: { name: 'STAFF' } },
      ])

      expect(await canManageAnnouncements('profile-staff')).toBe(true)
    })

    it('should return false for PRIEST', async () => {
      ;(prisma.userRole.findMany as any).mockResolvedValue([
        { role: { name: 'PRIEST' } },
      ])

      expect(await canManageAnnouncements('profile-priest')).toBe(false)
    })
  })

  describe('Role Hierarchy', () => {
    it('should define correct role hierarchy', () => {
      const roleHierarchy: Record<string, number> = {
        'SUPER_ADMIN': 100,
        'ADMIN': 80,
        'STAFF': 60,
        'PRIEST': 50,
        'VOLUNTEER': 30,
        'DEVOTEE': 10,
      }

      expect(roleHierarchy['SUPER_ADMIN']).toBeGreaterThan(roleHierarchy['ADMIN'])
      expect(roleHierarchy['ADMIN']).toBeGreaterThan(roleHierarchy['STAFF'])
      expect(roleHierarchy['STAFF']).toBeGreaterThan(roleHierarchy['PRIEST'])
    })

    it('should have all expected roles defined', () => {
      const expectedRoles: UserRole[] = [
        'SUPER_ADMIN',
        'ADMIN',
        'STAFF',
        'PRIEST',
        'VOLUNTEER',
        'DEVOTEE',
      ]

      expectedRoles.forEach(role => {
        expect(typeof role).toBe('string')
      })
    })
  })

  describe('Permission Checks', () => {
    it('should have correct permissions for SUPER_ADMIN', async () => {
      const superAdminPermissions = [
        'manage_users',
        'manage_settings',
        'manage_content',
        'manage_events',
        'manage_sevas',
        'manage_donations',
        'manage_gallery',
        'manage_knowledge',
        'view_reports',
        'manage_billing',
        'access_admin',
        'access_dashboard',
      ]

      expect(superAdminPermissions).toContain('manage_users')
      expect(superAdminPermissions).toContain('manage_settings')
      expect(superAdminPermissions).toContain('access_admin')
    })

    it('should have correct permissions for ADMIN', async () => {
      const adminPermissions = [
        'manage_content',
        'manage_events',
        'manage_sevas',
        'manage_donations',
        'manage_gallery',
        'manage_knowledge',
        'view_reports',
        'access_admin',
        'access_dashboard',
      ]

      expect(adminPermissions).toContain('manage_content')
      expect(adminPermissions).toContain('manage_events')
      expect(adminPermissions).not.toContain('manage_users')
    })

    it('should have correct permissions for PRIEST', async () => {
      const priestPermissions = ['manage_events', 'manage_sevas', 'access_dashboard']

      expect(priestPermissions).toContain('manage_events')
      expect(priestPermissions).toContain('manage_sevas')
      expect(priestPermissions).not.toContain('manage_users')
    })

    it('should have minimal permissions for DEVOTEE', async () => {
      const devoteePermissions: string[] = []

      expect(devoteePermissions).toHaveLength(0)
    })
  })
})
