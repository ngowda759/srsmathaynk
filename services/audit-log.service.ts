/**
 * Audit Log Service
 * Tracks all admin actions for security and compliance
 */
import { prisma } from '@/lib/db'

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
  profileId: string | null
  action: AuditAction
  entityType: EntityType | null
  entityId: string | null
  oldData: Record<string, unknown> | null
  newData: Record<string, unknown> | null
  ipAddress: string | null
  userAgent: string | null
  metadata: Record<string, unknown> | null
  createdAt: Date
}

export interface AuditLogFilter {
  profileId?: string
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
  actionsByType: Record<AuditAction, number>
  actionsByEntity: Record<EntityType, number>
  recentActivity: AuditLogEntry[]
}

class AuditLogService {
  /**
   * Create an audit log entry
   */
  async log(params: {
    profileId?: string
    action: AuditAction
    entityType?: EntityType
    entityId?: string
    oldData?: Record<string, unknown>
    newData?: Record<string, unknown>
    ipAddress?: string
    userAgent?: string
    metadata?: Record<string, unknown>
  }): Promise<AuditLogEntry> {
    const entry = await prisma.auditLog.create({
      data: {
        profileId: params.profileId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        oldData: params.oldData,
        newData: params.newData,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        metadata: params.metadata,
      },
    })

    return entry
  }

  /**
   * Log a login attempt
   */
  async logLogin(params: {
    profileId: string
    success: boolean
    ipAddress?: string
    userAgent?: string
    failureReason?: string
  }): Promise<AuditLogEntry> {
    return this.log({
      profileId: params.profileId,
      action: params.success ? 'LOGIN' : 'LOGIN_FAILED',
      metadata: params.success ? undefined : { failureReason: params.failureReason },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    })
  }

  /**
   * Log a profile update
   */
  async logProfileUpdate(params: {
    profileId: string
    oldData: Record<string, unknown>
    newData: Record<string, unknown>
    ipAddress?: string
    userAgent?: string
  }): Promise<AuditLogEntry> {
    return this.log({
      profileId: params.profileId,
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
    profileId: string
    targetProfileId: string
    oldRole: string
    newRole: string
    changedBy: string
    ipAddress?: string
    userAgent?: string
  }): Promise<AuditLogEntry> {
    return this.log({
      profileId: params.changedBy,
      action: 'ROLE_CHANGED',
      entityType: 'UserRole',
      entityId: params.targetProfileId,
      oldData: { role: params.oldRole },
      newData: { role: params.newRole },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: { targetProfileId: params.targetProfileId },
    })
  }

  /**
   * Log an access denied event
   */
  async logAccessDenied(params: {
    profileId: string
    resource: string
    requiredPermission?: string
    ipAddress?: string
    userAgent?: string
  }): Promise<AuditLogEntry> {
    return this.log({
      profileId: params.profileId,
      action: 'PERMISSION_DENIED',
      metadata: {
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

    if (filter.profileId) {
      where.profileId = filter.profileId
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

    return { entries, total }
  }

  /**
   * Get audit logs for a specific entity
   */
  async getEntityHistory(entityType: EntityType, entityId: string): Promise<AuditLogEntry[]> {
    return prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
    })
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

    // Group by action type
    const actionsByType: Record<AuditAction, number> = {
      CREATE: 0,
      UPDATE: 0,
      DELETE: 0,
      LOGIN: 0,
      LOGOUT: 0,
      LOGIN_FAILED: 0,
      PASSWORD_RESET: 0,
      EMAIL_VERIFIED: 0,
      ROLE_CHANGED: 0,
      PERMISSION_DENIED: 0,
      ACCESS: 0,
    }

    const actionsByEntity: Record<EntityType, number> = {
      Profile: 0,
      UserRole: 0,
      Role: 0,
      Event: 0,
      Seva: 0,
      Donation: 0,
      Booking: 0,
      Gallery: 0,
      GalleryItem: 0,
      Album: 0,
      Announcement: 0,
      Document: 0,
      KnowledgeArticle: 0,
      ChatSession: 0,
      ChatMessage: 0,
      Settings: 0,
      Payment: 0,
      Receipt: 0,
    }

    for (const entry of allActions) {
      if (entry.action in actionsByType) {
        actionsByType[entry.action as AuditAction]++
      }
      if (entry.entityType && entry.entityType in actionsByEntity) {
        actionsByEntity[entry.entityType as EntityType]++
      }
    }

    return {
      totalActions,
      actionsByType,
      actionsByEntity,
      recentActivity: allActions.slice(0, 10),
    }
  }

  /**
   * Search audit logs by metadata
   */
  async searchByMetadata(
    key: string,
    value: unknown,
    limit: number = 50
  ): Promise<AuditLogEntry[]> {
    const entries = await prisma.auditLog.findMany({
      where: {
        metadata: {
          path: [key],
          equals: value,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return entries
  }

  /**
   * Get failed login attempts in a time window
   */
  async getFailedLoginAttempts(
    hours: number = 24,
    limit: number = 100
  ): Promise<AuditLogEntry[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    return prisma.auditLog.findMany({
      where: {
        action: 'LOGIN_FAILED',
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }
}

export const auditLogService = new AuditLogService()
