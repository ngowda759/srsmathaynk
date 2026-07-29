/**
 * Login History Service
 * Tracks user login attempts for security and audit purposes
 */
import { prisma } from '@/lib/db'

export interface LoginHistoryEntry {
  id: string
  profileId: string
  ipAddress: string | null
  userAgent: string | null
  success: boolean
  failureReason?: string
  createdAt: Date
}

export interface LoginHistoryFilter {
  profileId?: string
  success?: boolean
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

class LoginHistoryService {
  /**
   * Record a login attempt
   */
  async recordLogin(params: {
    profileId: string
    ipAddress?: string
    userAgent?: string
    success: boolean
    failureReason?: string
  }): Promise<LoginHistoryEntry> {
    const entry = await prisma.loginHistory.create({
      data: {
        profileId: params.profileId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        success: params.success,
        failureReason: params.failureReason,
      },
    })

    return entry
  }

  /**
   * Get login history for a profile
   */
  async getLoginHistory(filter: LoginHistoryFilter): Promise<{
    entries: LoginHistoryEntry[]
    total: number
  }> {
    const where: Record<string, unknown> = {}

    if (filter.profileId) {
      where.profileId = filter.profileId
    }

    if (filter.success !== undefined) {
      where.success = filter.success
    }

    if (filter.startDate || filter.endDate) {
      where.createdAt = {}
      if (filter.startDate) {
        (where.createdAt as Record<string, Date>).gte = filter.startDate
      }
      if (filter.endDate) {
        (where.createdAt as Record<string, Date>).lte = filter.endDate
      }
    }

    const [entries, total] = await Promise.all([
      prisma.loginHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filter.limit || 20,
        skip: filter.offset || 0,
      }),
      prisma.loginHistory.count({ where }),
    ])

    return { entries, total }
  }

  /**
   * Get recent failed login attempts (for security monitoring)
   */
  async getRecentFailedLogins(profileId: string, hours: number = 24): Promise<LoginHistoryEntry[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    return prisma.loginHistory.findMany({
      where: {
        profileId,
        success: false,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Check for suspicious login activity
   */
  async checkSuspiciousActivity(profileId: string): Promise<{
    suspicious: boolean
    reasons: string[]
  }> {
    const reasons: string[] = []
    const recentFailed = await this.getRecentFailedLogins(profileId, 1)

    // More than 5 failed attempts in 1 hour is suspicious
    if (recentFailed.length > 5) {
      reasons.push(`Multiple failed login attempts: ${recentFailed.length} in the last hour`)
    }

    // Check for logins from different IPs in short succession
    const recentAny = await this.getLoginHistory({
      profileId,
      startDate: new Date(Date.now() - 60 * 60 * 1000),
      limit: 10,
    })

    const uniqueIPs = new Set(
      recentAny.entries.filter(e => e.success).map(e => e.ipAddress).filter(Boolean)
    )

    if (uniqueIPs.size > 3) {
      reasons.push(`Logins from multiple IPs: ${uniqueIPs.size} different IPs in the last hour`)
    }

    return {
      suspicious: reasons.length > 0,
      reasons,
    }
  }

  /**
   * Get login statistics for a profile
   */
  async getLoginStats(profileId: string): Promise<{
    totalLogins: number
    failedAttempts: number
    lastLogin: Date | null
    lastFailedLogin: Date | null
  }> {
    const [totalLogins, failedAttempts, lastLogin, lastFailedLogin] = await Promise.all([
      prisma.loginHistory.count({
        where: { profileId, success: true },
      }),
      prisma.loginHistory.count({
        where: { profileId, success: false },
      }),
      prisma.loginHistory.findFirst({
        where: { profileId, success: true },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      prisma.loginHistory.findFirst({
        where: { profileId, success: false },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ])

    return {
      totalLogins,
      failedAttempts,
      lastLogin: lastLogin?.createdAt || null,
      lastFailedLogin: lastFailedLogin?.createdAt || null,
    }
  }
}

export const loginHistoryService = new LoginHistoryService()
