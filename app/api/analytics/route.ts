/**
 * Analytics API Route
 * Provides analytics data for admin dashboard
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { prisma } from '@/lib/db'
import { donationAnalyticsService } from '@/services/analytics/donation-analytics.service'
import { bookingAnalyticsService } from '@/services/analytics/booking-analytics.service'

export const dynamic = 'force-dynamic'

/**
 * GET /api/analytics
 * Get analytics data
 */
export async function GET(request: NextRequest) {
  try {
    // Get user from auth
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: { userRoles: { include: { role: true } } },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const isAdmin = profile.userRoles.some(
      ur => ur.role.name === 'ADMIN' || ur.role.name === 'SUPER_ADMIN'
    )

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const dateRange = startDate && endDate ? {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    } : undefined

    // Get requested analytics
    const response: Record<string, unknown> = {}

    if (type === 'all' || type === 'donations') {
      response.donations = await donationAnalyticsService.getMetrics(dateRange)
      response.topDonors = await donationAnalyticsService.getTopDonors(10)
      response.campaignPerformance = await donationAnalyticsService.getCampaignPerformance()
    }

    if (type === 'all' || type === 'bookings') {
      response.bookings = await bookingAnalyticsService.getMetrics()
      response.popularServices = await bookingAnalyticsService.getPopularServices(10)
      response.peakTimes = await bookingAnalyticsService.getPeakTimes()
    }

    // Get user stats
    const totalUsers = await prisma.profile.count()
    const activeUsers = await prisma.profile.count({ where: { isActive: true } })
    
    response.users = {
      total: totalUsers,
      active: activeUsers,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
