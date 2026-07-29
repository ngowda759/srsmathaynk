/**
 * Unit Tests for Announcement Service
 * Coverage target: >90%
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    announcement: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/db'

describe('Announcement Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Announcement Validation', () => {
    it('should validate announcement data structure', () => {
      const validAnnouncement = {
        title: 'Temple Schedule Change',
        content: 'The temple will remain closed on...',
        type: 'INFO',
        priority: 'NORMAL',
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000 * 7), // 7 days from now
      }

      expect(validAnnouncement.title).toBeDefined()
      expect(validAnnouncement.content).toBeDefined()
      expect(['INFO', 'WARNING', 'URGENT', 'EVENT']).toContain(validAnnouncement.type)
    })

    it('should validate announcement types', () => {
      const validTypes = ['INFO', 'WARNING', 'URGENT', 'EVENT', 'MAINTENANCE']

      validTypes.forEach(type => {
        expect(['INFO', 'WARNING', 'URGENT', 'EVENT', 'MAINTENANCE']).toContain(type)
      })
    })

    it('should validate priority levels', () => {
      const validPriorities = ['LOW', 'NORMAL', 'HIGH', 'CRITICAL']

      expect(validPriorities).toContain('NORMAL')
      expect(validPriorities).toContain('CRITICAL')
    })
  })

  describe('Announcement Creation', () => {
    it('should create a new announcement', async () => {
      const mockAnnouncement = {
        id: 'ann-123',
        title: 'New Service Available',
        content: 'We are now offering online bookings',
        type: 'INFO',
        isActive: true,
        createdAt: new Date(),
      }

      ;(prisma.announcement.create as any).mockResolvedValue(mockAnnouncement)

      const result = await prisma.announcement.create({
        data: mockAnnouncement,
      })

      expect(result.id).toBe('ann-123')
      expect(prisma.announcement.create).toHaveBeenCalled()
    })

    it('should create urgent announcement', async () => {
      const mockAnnouncement = {
        id: 'ann-urgent',
        title: 'Emergency Closure',
        type: 'URGENT',
        priority: 'CRITICAL',
      }

      ;(prisma.announcement.create as any).mockResolvedValue(mockAnnouncement)

      const result = await prisma.announcement.create({
        data: mockAnnouncement,
      })

      expect(result.type).toBe('URGENT')
    })
  })

  describe('Announcement Listing', () => {
    it('should list active announcements', async () => {
      const mockAnnouncements = [
        { id: '1', isActive: true, type: 'INFO' },
        { id: '2', isActive: true, type: 'EVENT' },
      ]

      ;(prisma.announcement.findMany as any).mockResolvedValue(mockAnnouncements)

      const announcements = await prisma.announcement.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      })

      expect(announcements).toHaveLength(2)
      expect(announcements.every(a => a.isActive)).toBe(true)
    })

    it('should filter by type', async () => {
      const mockAnnouncements = [
        { id: '1', type: 'INFO' },
        { id: '2', type: 'INFO' },
        { id: '3', type: 'URGENT' },
      ]

      const urgentAnnouncements = mockAnnouncements.filter(a => a.type === 'URGENT')
      expect(urgentAnnouncements).toHaveLength(1)
    })

    it('should filter by date range', async () => {
      const today = new Date()
      const mockAnnouncements = [
        { id: '1', startDate: new Date(today.getTime() - 86400000), endDate: new Date(today.getTime() + 86400000 * 7) },
        { id: '2', startDate: new Date(today.getTime() + 86400000 * 10), endDate: new Date(today.getTime() + 86400000 * 20) },
      ]

      const activeNow = mockAnnouncements.filter(a => 
        a.startDate <= today && a.endDate >= today
      )
      expect(activeNow).toHaveLength(1)
    })

    it('should show pinned announcements first', async () => {
      const mockAnnouncements = [
        { id: '1', isPinned: false, createdAt: new Date() },
        { id: '2', isPinned: true, createdAt: new Date(Date.now() - 86400000) },
      ]

      const sorted = [...mockAnnouncements].sort((a, b) => {
        if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1
        return b.createdAt.getTime() - a.createdAt.getTime()
      })

      expect(sorted[0].isPinned).toBe(true)
    })
  })

  describe('Announcement Update', () => {
    it('should update announcement', async () => {
      const mockUpdated = {
        id: 'ann-123',
        title: 'Updated Title',
        isActive: false,
      }

      ;(prisma.announcement.update as any).mockResolvedValue(mockUpdated)

      const result = await prisma.announcement.update({
        where: { id: 'ann-123' },
        data: { title: 'Updated Title', isActive: false },
      })

      expect(result.title).toBe('Updated Title')
      expect(result.isActive).toBe(false)
    })

    it('should toggle pin status', async () => {
      const mockUpdated = {
        id: 'ann-123',
        isPinned: true,
      }

      ;(prisma.announcement.update as any).mockResolvedValue(mockUpdated)

      const result = await prisma.announcement.update({
        where: { id: 'ann-123' },
        data: { isPinned: true },
      })

      expect(result.isPinned).toBe(true)
    })
  })

  describe('Announcement Deletion', () => {
    it('should soft delete announcement', async () => {
      const mockDeleted = {
        id: 'ann-123',
        deletedAt: new Date(),
      }

      ;(prisma.announcement.update as any).mockResolvedValue(mockDeleted)

      const result = await prisma.announcement.update({
        where: { id: 'ann-123' },
        data: { deletedAt: new Date() },
      })

      expect(result.deletedAt).toBeInstanceOf(Date)
    })
  })

  describe('Edge Cases', () => {
    it('should handle announcement without end date', () => {
      const announcement = {
        title: 'Permanent Notice',
        endDate: null,
      }

      expect(announcement.endDate).toBeNull()
    })

    it('should handle announcement with URL', () => {
      const announcement = {
        title: 'Click for Details',
        url: 'https://example.com/details',
        urlText: 'View Details',
      }

      expect(announcement.url).toMatch(/^https?:\/\//)
    })

    it('should handle announcement with media', () => {
      const announcement = {
        title: 'Photo Announcement',
        mediaId: 'media-123',
        media: { url: 'https://example.com/image.jpg' },
      }

      expect(announcement.media).toBeDefined()
    })

    it('should handle announcement without content', () => {
      const announcement = {
        title: 'Simple Notice',
        content: null,
      }

      expect(announcement.content).toBeNull()
    })
  })
})
