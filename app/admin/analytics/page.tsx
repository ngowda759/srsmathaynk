/**
 * Analytics Dashboard
 * Admin dashboard for viewing metrics
 */
'use client'

import { useEffect, useState, useCallback } from 'react'

interface DonationData {
  totalDonations: number
  totalAmount: number
  averageDonation: number
  donationCount: number
  byPaymentMethod: Record<string, number>
  byStatus: Record<string, number>
  trends: { date: string; amount: number; count: number }[]
}

interface BookingData {
  totalBookings: number
  confirmedBookings: number
  pendingBookings: number
  cancelledBookings: number
  totalRevenue: number
}

interface UserData {
  total: number
  active: number
}

interface AnalyticsData {
  donations?: DonationData
  bookings?: BookingData
  topDonors?: Array<{
    donorName: string
    donorEmail: string
    totalAmount: number
    donationCount: number
  }>
  users?: UserData
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analytics')
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Donations Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Donations</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {formatCurrency(data?.donations?.totalAmount || 0)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {data?.donations?.donationCount || 0} donations
          </p>
        </div>

        {/* Bookings Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {data?.bookings?.totalBookings || 0}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {formatCurrency(data?.bookings?.totalRevenue || 0)} revenue
          </p>
        </div>

        {/* Users Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {data?.users?.total || 0}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {data?.users?.active || 0} active
          </p>
        </div>

        {/* Avg Donation Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Avg Donation</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {formatCurrency(data?.donations?.averageDonation || 0)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Per transaction
          </p>
        </div>
      </div>

      {/* Donation Trends */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Donation Trends (Last 30 Days)</h2>
        {data?.donations?.trends && data.donations.trends.length > 0 ? (
          <div className="space-y-2">
            {data.donations.trends.slice(-7).map((day) => (
              <div key={day.date} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm text-gray-600">{day.date}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">{formatCurrency(day.amount)}</span>
                  <span className="text-xs text-gray-500">{day.count} donations</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No donation data available</p>
        )}
      </div>

      {/* Booking Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Confirmed Bookings</h3>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {data?.bookings?.confirmedBookings || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Pending Bookings</h3>
          <p className="mt-2 text-2xl font-bold text-yellow-600">
            {data?.bookings?.pendingBookings || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Cancelled Bookings</h3>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {data?.bookings?.cancelledBookings || 0}
          </p>
        </div>
      </div>

      {/* Top Donors */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Donors</h2>
        {data?.topDonors && data.topDonors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Total Amount</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Donations</th>
                </tr>
              </thead>
              <tbody>
                {data.topDonors.map((donor, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 px-4 text-sm text-gray-900">{donor.donorName}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{donor.donorEmail}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(donor.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 text-right">{donor.donationCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No donor data available</p>
        )}
      </div>
    </div>
  )
}
