/**
 * Notification Actions API Route
 * Mark as read, delete, etc.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { prisma } from '@/lib/db'
import { notificationService } from '@/services/notification.service'

export const dynamic = 'force-dynamic'

/**
 * POST /api/notifications/actions
 * Perform an action on notifications
 */
export async function POST(request: NextRequest) {
  try {
    // Get user from auth
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const { action, notificationId } = body

    switch (action) {
      case 'markRead':
        if (!notificationId) {
          return NextResponse.json({ error: 'Notification ID required' }, { status: 400 })
        }
        await notificationService.markAsRead(notificationId, profile.id)
        return NextResponse.json({ success: true })

      case 'markAllRead':
        await notificationService.markAllAsRead(profile.id)
        return NextResponse.json({ success: true })

      case 'delete':
        if (!notificationId) {
          return NextResponse.json({ error: 'Notification ID required' }, { status: 400 })
        }
        await notificationService.delete(notificationId, profile.id)
        return NextResponse.json({ success: true })

      case 'getUnreadCount':
        const count = await notificationService.getUnreadCount(profile.id)
        return NextResponse.json({ unreadCount: count })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error performing notification action:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
