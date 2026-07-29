/**
 * Notification Service
 * Handles in-app notifications and email routing
 */
import { prisma } from '@/lib/db'
import { emailService } from './email.service'
import { auditLogService } from './audit-log.service'

export type NotificationType =
  | 'DONATION_RECEIVED'
  | 'DONATION_CONFIRMED'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_REMINDER'
  | 'EVENT_REMINDER'
  | 'FESTIVAL_UPCOMING'
  | 'AI_RESPONSE'
  | 'SYSTEM_ANNOUNCEMENT'
  | 'ROLE_ASSIGNED'

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'PUSH'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  read: boolean
  channel: NotificationChannel
  createdAt: Date
}

export interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  channels?: NotificationChannel[]
  sendEmail?: boolean
}

class NotificationService {
  /**
   * Create a notification
   */
  async create(params: CreateNotificationParams): Promise<Notification | null> {
    const channels = params.channels || ['IN_APP']

    try {
      // Create in-app notification if requested
      let notification: Notification | null = null
      
      if (channels.includes('IN_APP')) {
        const created = await prisma.notification.create({
          data: {
            userId: params.userId,
            type: params.type,
            title: params.title,
            message: params.message,
            data: params.data ? JSON.stringify(params.data) : undefined,
            channel: 'IN_APP',
          },
        })
        notification = this.mapNotification(created)
      }

      // Send email if requested
      if (params.sendEmail && channels.includes('EMAIL')) {
        const profile = await prisma.profile.findUnique({
          where: { id: params.userId },
        })
        
        if (profile?.email && profile.emailVerified) {
          // Get user email
          const userEmail = profile.email
          const userName = profile.name || 'Devotee'
          
          // Route to appropriate email template
          switch (params.type) {
            case 'DONATION_CONFIRMED':
              await emailService.sendDonationConfirmation(userEmail, userName, {
                amount: (params.data?.amount as number) || 0,
                currency: (params.data?.currency as string) || 'INR',
                campaign: params.data?.campaign as string,
                transactionId: (params.data?.transactionId as string) || '',
                date: new Date().toLocaleDateString(),
              })
              break
              
            case 'BOOKING_CONFIRMED':
              await emailService.sendBookingConfirmation(userEmail, userName, {
                referenceNumber: (params.data?.referenceNumber as string) || '',
                service: (params.data?.service as string) || 'Seva',
                date: (params.data?.date as string) || new Date().toLocaleDateString(),
                time: params.data?.time as string,
              })
              break
              
            default:
              // Generic notification email
              await emailService.send({
                to: userEmail,
                subject: params.title,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #d97706;">Sri Raghavendra Swamy Matha</h2>
                    <p>Dear ${userName},</p>
                    <p>${params.message}</p>
                  </div>
                `,
              })
          }
        }
      }

      return notification
    } catch (error) {
      console.error('Error creating notification:', error)
      return null
    }
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(
    userId: string,
    options: {
      limit?: number
      offset?: number
      unreadOnly?: boolean
    } = {}
  ): Promise<{ notifications: Notification[]; total: number }> {
    const where: Record<string, unknown> = { userId }
    
    if (options.unreadOnly) {
      where.read = false
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options.limit || 20,
        skip: options.offset || 0,
      }),
      prisma.notification.count({ where }),
    ])

    return {
      notifications: notifications.map(n => this.mapNotification(n)),
      total,
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    })
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    })
  }

  /**
   * Delete a notification
   */
  async delete(notificationId: string, userId: string): Promise<void> {
    await prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    })
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, read: false },
    })
  }

  /**
   * Send booking confirmation notification
   */
  async notifyBookingConfirmed(
    userId: string,
    booking: {
      referenceNumber: string
      service: string
      date: string
      time?: string
    }
  ): Promise<void> {
    await this.create({
      userId,
      type: 'BOOKING_CONFIRMED',
      title: 'Booking Confirmed',
      message: `Your ${booking.service} booking for ${booking.date} has been confirmed. Reference: ${booking.referenceNumber}`,
      data: booking,
      channels: ['IN_APP', 'EMAIL'],
      sendEmail: true,
    })
  }

  /**
   * Send donation confirmation notification
   */
  async notifyDonationReceived(
    userId: string,
    donation: {
      amount: number
      currency: string
      campaign?: string
      transactionId: string
    }
  ): Promise<void> {
    await this.create({
      userId,
      type: 'DONATION_CONFIRMED',
      title: 'Donation Received',
      message: `Thank you! We received your donation of ${donation.currency} ${donation.amount.toLocaleString()}${donation.campaign ? ` for ${donation.campaign}` : ''}.`,
      data: donation,
      channels: ['IN_APP', 'EMAIL'],
      sendEmail: true,
    })
  }

  /**
   * Send booking reminder notification
   */
  async notifyBookingReminder(
    userId: string,
    booking: {
      referenceNumber: string
      service: string
      date: string
      time?: string
    }
  ): Promise<void> {
    const timeMsg = booking.time ? ` at ${booking.time}` : ''
    await this.create({
      userId,
      type: 'BOOKING_REMINDER',
      title: 'Booking Reminder',
      message: `Reminder: Your ${booking.service} is scheduled for ${booking.date}${timeMsg}. Reference: ${booking.referenceNumber}`,
      data: booking,
      channels: ['IN_APP', 'EMAIL'],
      sendEmail: true,
    })
  }

  /**
   * Broadcast announcement to all users
   */
  async broadcastAnnouncement(
    title: string,
    message: string,
    data?: Record<string, unknown>
  ): Promise<number> {
    // Get all active users
    const profiles = await prisma.profile.findMany({
      where: { isActive: true },
      select: { id: true },
    })

    // Create notifications for all users
    const notifications = profiles.map(profile => ({
      userId: profile.id,
      type: 'SYSTEM_ANNOUNCEMENT' as NotificationType,
      title,
      message,
      data: data ? JSON.stringify(data) : undefined,
      channel: 'IN_APP' as const,
    }))

    await prisma.notification.createMany({
      data: notifications,
    })

    // Log the broadcast
    await auditLogService.log({
      action: 'CREATE',
      entityType: 'Profile',
      entityId: 'broadcast',
      newData: { title, message, recipients: profiles.length },
    })

    return profiles.length
  }

  /**
   * Map Prisma notification to our interface
   */
  private mapNotification(prismaNotification: {
    id: string
    userId: string
    type: string
    title: string
    message: string
    data: string | null
    read: boolean
    channel: string
    createdAt: Date
  }): Notification {
    return {
      id: prismaNotification.id,
      userId: prismaNotification.userId,
      type: prismaNotification.type as NotificationType,
      title: prismaNotification.title,
      message: prismaNotification.message,
      data: prismaNotification.data ? JSON.parse(prismaNotification.data) : undefined,
      read: prismaNotification.read,
      channel: prismaNotification.channel as NotificationChannel,
      createdAt: prismaNotification.createdAt,
    }
  }
}

export const notificationService = new NotificationService()
