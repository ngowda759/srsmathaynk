/**
 * Booking Analytics Service
 * Tracks and reports booking metrics
 */
import { prisma } from '@/lib/db'

export interface BookingMetrics {
  totalBookings: number
  confirmedBookings: number
  pendingBookings: number
  cancelledBookings: number
  totalRevenue: number
  byBookingType: Record<string, number>
  byStatus: Record<string, number>
  trends: { date: string; count: number; revenue: number }[]
}

class BookingAnalyticsService {
  /**
   * Get booking metrics
   */
  async getMetrics(): Promise<BookingMetrics> {
    const [bookings, statusByType, statusByStatus] = await Promise.all([
      prisma.booking.findMany({
        select: {
          status: true,
          bookingType: true,
          totalAmount: true,
          createdAt: true,
        },
      }),
      // Group by booking type
      prisma.booking.groupBy({
        by: ['bookingType'],
        _count: true,
      }),
      // Group by status
      prisma.booking.groupBy({
        by: ['status'],
        _count: true,
        _sum: { totalAmount: true },
      }),
    ])

    // Process booking type breakdown
    const byBookingType: Record<string, number> = {}
    for (const item of statusByType) {
      byBookingType[item.bookingType] = item._count
    }

    // Process status breakdown
    const byStatusMap: Record<string, number> = {}
    let confirmedCount = 0
    let pendingCount = 0
    let cancelledCount = 0
    let totalRevenue = 0

    for (const item of statusByStatus) {
      byStatusMap[item.status] = item._count
      totalRevenue += item._sum.totalAmount ? Number(item._sum.totalAmount) : 0
      
      if (item.status === 'CONFIRMED') confirmedCount = item._count
      if (item.status === 'PENDING') pendingCount = item._count
      if (item.status === 'CANCELLED') cancelledCount = item._count
    }

    // Calculate trends
    const trends = await this.getTrends(30)

    return {
      totalBookings: bookings.length,
      confirmedBookings: confirmedCount,
      pendingBookings: pendingCount,
      cancelledBookings: cancelledCount,
      totalRevenue,
      byBookingType,
      byStatus: byStatusMap,
      trends,
    }
  }

  /**
   * Get booking trends
   */
  private async getTrends(days: number): Promise<{ date: string; count: number; revenue: number }[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        totalAmount: true,
        status: true,
      },
    })

    // Group by date
    const dateMap: Record<string, { count: number; revenue: number }> = {}
    
    for (const booking of bookings) {
      if (booking.status !== 'CONFIRMED') continue
      
      const dateKey = booking.createdAt.toISOString().split('T')[0]
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = { count: 0, revenue: 0 }
      }
      dateMap[dateKey].count++
      dateMap[dateKey].revenue += Number(booking.totalAmount)
    }

    return Object.entries(dateMap)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  /**
   * Get popular services
   */
  async getPopularServices(limit: number = 10): Promise<{
    serviceType: string
    bookingCount: number
    revenue: number
  }[]> {
    const bookings = await prisma.booking.findMany({
      where: { status: 'CONFIRMED' },
      select: {
        bookingType: true,
        totalAmount: true,
      },
    })

    const serviceMap: Record<string, { count: number; revenue: number }> = {}
    
    for (const booking of bookings) {
      if (!serviceMap[booking.bookingType]) {
        serviceMap[booking.bookingType] = { count: 0, revenue: 0 }
      }
      serviceMap[booking.bookingType].count++
      serviceMap[booking.bookingType].revenue += Number(booking.totalAmount)
    }

    return Object.entries(serviceMap)
      .map(([serviceType, data]) => ({
        serviceType,
        bookingCount: data.count,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, limit)
  }

  /**
   * Get peak booking times
   */
  async getPeakTimes(): Promise<{
    hour: number
    count: number
  }[]> {
    const bookings = await prisma.booking.findMany({
      select: { bookingDate: true },
    })

    const hourMap: Record<number, number> = {}
    
    for (const booking of bookings) {
      const hour = booking.bookingDate.getHours()
      hourMap[hour] = (hourMap[hour] || 0) + 1
    }

    return Object.entries(hourMap)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        count,
      }))
      .sort((a, b) => b.count - a.count)
  }
}

export const bookingAnalyticsService = new BookingAnalyticsService()
