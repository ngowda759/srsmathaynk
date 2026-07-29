/**
 * Audit Log Service
 * Tracks all admin actions for security and compliance
 */
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'PASSWORD_RESET'
  | 'EMAIL_VERIFIED'
  | 'ROLE_CHANGED'
  | 'PERMISSION_DENIED'
  | 'ACCESS'

export type EntityType =
  | 'Profile'
  | 'UserRole'
  | 'Role'
  | 'Event'
  | 'Seva'
  | 'Donation'
  | 'Booking'
  | 'Gallery'
  | 'GalleryItem'
  | 'Album'
  | 'Announcement'
  | 'Document'
  | 'KnowledgeArticle'
  | 'ChatSession'
  | 'ChatMessage'
  | 'Settings'
  | 'Payment'
  | 'Receipt'

export interface AuditLogEntry {
  id: string
  userId: string | null
  action: string
  entityType: string | null
  entityId: string | null
  oldData: Prisma.JsonValue | null
  newData: Prisma.JsonValue | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
}

export interface AuditLogFilter {
  userId?: string
  action?: AuditAction
  entityType?: EntityType
  entityId?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

export interface AuditLogStats {
  totalActions: number
  actionsByType: Record<string, number>
  actionsByEntity: Record<string, number>
  recentActivity: AuditLogEntry[]
}

class AuditLogService {
  /**
   * Create an audit log entry
   */
  async log(params: {
    userId?: string
    action: AuditAction
    entityType?: EntityType
    entityId?: string
    oldData?: Record<string, unknown>
    newData?: Record<string, unknown>
    ipAddress?: string
    userAgent?: string
  }): Promise<AuditLogEntry> {
    const entry = await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        oldData: params.oldData ? params.oldData as Prisma.InputJsonValue : undefined,
        newData: params.newData ? params.newData as Prisma.InputJsonValue : undefined,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    })

    return entry
  }

  /**
   * Log a login attempt
   */
  async logLogin(params: {
    userId: string
    success: boolean
    ipAddress?: string
    userAgent?: string
    failureReason?: string
  }): Promise<AuditLogEntry> {
    return this.log({
      userId: params.userId,
      action: params.success ? 'LOGIN' : 'LOGIN_FAILED',
      newData: params.success ? undefined : { failureReason: params.failureReason },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    })
  }

  /**
   * Log a profile update
   */
  async logProfileUpdate(params: {
    userId: string
    oldData: Record<string, unknown>
    newData: Record<string, unknown>
    ipAddress?: string
    userAgent?: string
  }): Promise<AuditLogEntry> {
    return this.log({
      userId: params.userId,
      action: 'UPDATE',
      entityType: 'Profile',
      oldData: params.oldData,
      newData: params.newData,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    })
  }

  /**
   * Log a role change
   */
  async logRoleChange(params: {
    userId: string
    targetProfileId: string
    oldRole: string
    newRole: string
    changedBy: string
    ipAddress?: string
    userAgent?: string
  }): Promise<AuditLogEntry> {
    return this.log({
      userId: params.changedBy,
      action: 'ROLE_CHANGED',
      entityType: 'UserRole',
      entityId: params.targetProfileId,
      oldData: { role: params.oldRole },
      newData: { role: params.newRole },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    })
  }

  /**
   * Log an access denied event
   */
  async logAccessDenied(params: {
    userId: string
    resource: string
    requiredPermission?: string
    ipAddress?: string
    userAgent?: string
  }): Promise<AuditLogEntry> {
    return this.log({
      userId: params.userId,
      action: 'PERMISSION_DENIED',
      newData: {
        resource: params.resource,
        requiredPermission: params.requiredPermission,
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    })
  }

  /**
   * Get audit logs with filtering
   */
  async getAuditLogs(filter: AuditLogFilter): Promise<{
    entries: AuditLogEntry[]
    total: number
  }> {
    const where: Record<string, unknown> = {}

    if (filter.userId) {
      where.userId = filter.userId
    }

    if (filter.action) {
      where.action = filter.action
    }

    if (filter.entityType) {
      where.entityType = filter.entityType
    }

    if (filter.entityId) {
      where.entityId = filter.entityId
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
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filter.limit || 50,
        skip: filter.offset || 0,
      }),
      prisma.auditLog.count({ where }),
    ])

    return { entries: entries as AuditLogEntry[], total }
  }

  /**
   * Get audit logs for a specific entity
   */
  async getEntityHistory(entityType: EntityType, entityId: string): Promise<AuditLogEntry[]> {
    const entries = await prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
    })
    return entries as AuditLogEntry[]
  }

  /**
   * Get audit log statistics
   */
  async getStats(startDate?: Date, endDate?: Date): Promise<AuditLogStats> {
    const where: Record<string, unknown> = {}

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        (where.createdAt as Record<string, Date>).gte = startDate
      }
      if (endDate) {
        (where.createdAt as Record<string, Date>).lte = endDate
      }
    }

    const [totalActions, allActions] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ])

    const actionsByType: Record<string, number> = {}
    const actionsByEntity: Record<string, number> = {}

    for (const entry of allActions) {
      actionsByType[entry.action] = (actionsByType[entry.action] || 0) + 1
      if (entry.entityType) {
        actionsByEntity[entry.entityType] = (actionsByEntity[entry.entityType] || 0) + 1
      }
    }

    return {
      totalActions,
      actionsByType,
      actionsByEntity,
      recentActivity: (allActions.slice(0, 10)) as AuditLogEntry[],
    }
  }

  /**
   * Get failed login attempts in a time window
   */
  async getFailedLoginAttempts(
    hours: number = 24,
    limit: number = 100
  ): Promise<AuditLogEntry[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    const entries = await prisma.auditLog.findMany({
      where: {
        action: 'LOGIN_FAILED',
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    return entries as AuditLogEntry[]
  }
}

export const auditLogService = new AuditLogService()
