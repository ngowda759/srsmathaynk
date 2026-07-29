/**
 * Notifications API Route
 * Get user's notifications
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { prisma } from '@/lib/db'
import { notificationService } from '@/services/notification.service'

export const dynamic = 'force-dynamic'

/**
 * GET /api/notifications
 * Get user's notifications
 */
export async function GET(request: NextRequest) {
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

    // Parse query params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    // Get notifications
    const result = await notificationService.getUserNotifications(profile.id, {
      limit,
      offset,
      unreadOnly,
    })

    // Get unread count
    const unreadCount = await notificationService.getUnreadCount(profile.id)

    return NextResponse.json({
      notifications: result.notifications,
      total: result.total,
      unreadCount,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
