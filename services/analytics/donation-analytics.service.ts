/**
 * Donation Analytics Service
 * Tracks and reports donation metrics
 */
import { prisma } from '@/lib/db'

export interface DonationMetrics {
  totalDonations: number
  totalAmount: number
  averageDonation: number
  donationCount: number
  byPaymentMethod: Record<string, number>
  byStatus: Record<string, number>
  byCampaign: Record<string, { count: number; amount: number }>
  trends: { date: string; amount: number; count: number }[]
}

export interface DateRange {
  startDate: Date
  endDate: Date
}

class DonationAnalyticsService {
  /**
   * Get donation metrics for a date range
   */
  async getMetrics(dateRange?: DateRange): Promise<DonationMetrics> {
    const where: Record<string, unknown> = {}
    
    if (dateRange) {
      where.createdAt = {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      }
    }

    const [donations, statusByMethod, statusByStatus, byCampaignData] = await Promise.all([
      prisma.donation.aggregate({
        where,
        _sum: { amount: true },
        _count: true,
        _avg: { amount: true },
      }),
      // Group by payment method
      prisma.donation.groupBy({
        by: ['paymentMethod'],
        where,
        _count: true,
      }),
      // Group by status
      prisma.donation.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      // Group by campaign
      prisma.donation.findMany({
        where,
        include: {
          campaign: { select: { title: true } },
        },
      }),
    ])

    // Process payment method breakdown
    const byPaymentMethod: Record<string, number> = {}
    for (const item of statusByMethod) {
      if (item.paymentMethod) {
        byPaymentMethod[item.paymentMethod] = item._count
      }
    }

    // Process status breakdown
    const byStatusMap: Record<string, number> = {}
    for (const item of statusByStatus) {
      byStatusMap[item.status] = item._count
    }

    // Process campaign breakdown
    const campaignMap: Record<string, { count: number; amount: number }> = {}
    for (const donation of byCampaignData) {
      const campaignTitle = donation.campaign?.title || 'Direct'
      if (!campaignMap[campaignTitle]) {
        campaignMap[campaignTitle] = { count: 0, amount: 0 }
      }
      campaignMap[campaignTitle].count++
      campaignMap[campaignTitle].amount += Number(donation.amount)
    }

    // Calculate trends (daily for last 30 days)
    const trends = await this.getTrends(30)

    return {
      totalDonations: donations._sum.amount ? Number(donations._sum.amount) : 0,
      totalAmount: donations._sum.amount ? Number(donations._sum.amount) : 0,
      averageDonation: donations._avg.amount ? Number(donations._avg.amount) : 0,
      donationCount: donations._count,
      byPaymentMethod,
      byStatus: byStatusMap,
      byCampaign: campaignMap,
      trends,
    }
  }

  /**
   * Get donation trends for the last N days
   */
  private async getTrends(days: number): Promise<{ date: string; amount: number; count: number }[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const donations = await prisma.donation.findMany({
      where: {
        createdAt: { gte: startDate },
        status: 'COMPLETED',
      },
      select: {
        createdAt: true,
        amount: true,
      },
    })

    // Group by date
    const dateMap: Record<string, { amount: number; count: number }> = {}
    
    for (const donation of donations) {
      const dateKey = donation.createdAt.toISOString().split('T')[0]
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = { amount: 0, count: 0 }
      }
      dateMap[dateKey].amount += Number(donation.amount)
      dateMap[dateKey].count++
    }

    // Convert to array and sort
    return Object.entries(dateMap)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  /**
   * Get top donors
   */
  async getTopDonors(limit: number = 10): Promise<{
    donorName: string
    donorEmail: string
    totalAmount: number
    donationCount: number
  }[]> {
    const donations = await prisma.donation.findMany({
      where: { status: 'COMPLETED' },
      select: {
        donorName: true,
        donorEmail: true,
        amount: true,
      },
    })

    // Group by donor
    const donorMap: Record<string, { amount: number; count: number; name: string; email: string }> = {}
    
    for (const donation of donations) {
      const key = donation.donorEmail || donation.donorName
      if (!donorMap[key]) {
        donorMap[key] = { 
          amount: 0, 
          count: 0, 
          name: donation.donorName, 
          email: donation.donorEmail || '' 
        }
      }
      donorMap[key].amount += Number(donation.amount)
      donorMap[key].count++
    }

    // Sort and return top donors
    return Object.entries(donorMap)
      .map(([, data]) => ({
        donorName: data.name,
        donorEmail: data.email,
        totalAmount: data.amount,
        donationCount: data.count,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, limit)
  }

  /**
   * Get campaign performance
   */
  async getCampaignPerformance(): Promise<{
    campaignId: string
    campaignTitle: string
    targetAmount: number
    raisedAmount: number
    donationCount: number
    completionRate: number
  }[]> {
    const campaigns = await prisma.donationCampaign.findMany({
      where: { active: true },
      include: {
        donations: {
          where: { status: 'COMPLETED' },
          select: { amount: true },
        },
      },
    })

    return campaigns.map(campaign => ({
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      targetAmount: campaign.targetAmount ? Number(campaign.targetAmount) : 0,
      raisedAmount: campaign.donations.reduce((sum, d) => sum + Number(d.amount), 0),
      donationCount: campaign.donations.length,
      completionRate: campaign.targetAmount 
        ? (campaign.donations.reduce((sum, d) => sum + Number(d.amount), 0) / Number(campaign.targetAmount)) * 100 
        : 0,
    }))
  }
}

export const donationAnalyticsService = new DonationAnalyticsService()
