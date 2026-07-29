/**
 * Razorpay Payment Service
 * Handles payment processing for donations and sevA bookings
 */
import { createHmac } from 'crypto'
import { prisma } from '@/lib/db'
import type { PaymentStatus } from '@prisma/client'

// Razorpay types
interface RazorpayOrder {
  id: string
  entity: string
  amount: number
  amount_paid: number
  amount_due: number
  currency: string
  receipt: string | null
  offer_id: string | null
  status: string
  attempts: number
  notes: Record<string, string>
  created_at: number
}

interface RazorpayPayment {
  id: string
  entity: string
  amount: number
  currency: string
  status: string
  order_id: string
  invoice_id: string | null
  international: boolean
  method: string | null
  amount_refunded: number
  refund_status: string | null
  captured: boolean
  description: string | null
  card_id: string | null
  bank: string | null
  wallet: string | null
  vpa: string | null
  email: string
  contact: string
  notes: Record<string, string>
  fee: number
  tax: number
  error_code: string | null
  error_description: string | null
  created_at: number
}

interface RazorpayRefund {
  id: string
  entity: string
  amount: number
  receipt: string | null
  notes: Record<string, string>
  status: string
  speed: string
  created_at: number
  acquirer_data: Record<string, string>
}

export interface CreateOrderParams {
  amount: number // in paise (INR * 100)
  currency?: string
  receiptId: string
  donationId?: string
  bookingId?: string
  customerEmail?: string
  customerPhone?: string
  notes?: Record<string, string>
}

export interface VerifyPaymentParams {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

export interface RefundParams {
  paymentId: string
  amount?: number // Partial refund amount in paise, omit for full refund
  speed?: 'normal' | 'optimum'
  notes?: Record<string, string>
}

export interface PaymentResult {
  success: boolean
  paymentId?: string
  orderId?: string
  error?: string
}

class RazorpayService {
  private apiKey: string
  private apiSecret: string
  private webhookSecret: string
  private baseUrl = 'https://api.razorpay.com/v1'

  constructor() {
    this.apiKey = process.env.RAZORPAY_KEY_ID || ''
    this.apiSecret = process.env.RAZORPAY_KEY_SECRET || ''
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || ''
  }

  /**
   * Get authentication headers for Razorpay API
   */
  private getAuthHeaders(): HeadersInit {
    const auth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')
    return {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    }
  }

  /**
   * Create a new payment order
   */
  async createOrder(params: CreateOrderParams): Promise<{
    success: boolean
    orderId?: string
    error?: string
  }> {
    if (!this.apiKey || !this.apiSecret) {
      return { success: false, error: 'Razorpay not configured' }
    }

    try {
      const orderData = {
        amount: params.amount,
        currency: params.currency || 'INR',
        receipt: params.receiptId,
        notes: {
          donationId: params.donationId || '',
          bookingId: params.bookingId || '',
          customerEmail: params.customerEmail || '',
          customerPhone: params.customerPhone || '',
          ...params.notes,
        },
      }

      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('Razorpay order creation failed:', error)
        return { success: false, error: 'Failed to create order' }
      }

      const order: RazorpayOrder = await response.json()

      // Create payment record in database
      await prisma.payment.create({
        data: {
          razorpayId: order.id,
          orderId: order.id,
          amount: order.amount / 100, // Convert from paise
          currency: order.currency,
          status: 'CREATED',
          donationId: params.donationId,
          bookingId: params.bookingId,
        },
      })

      return { success: true, orderId: order.id }

    } catch (error) {
      console.error('Razorpay order creation error:', error)
      return { success: false, error: 'Internal error creating order' }
    }
  }

  /**
   * Get payment details
   */
  async getPayment(paymentId: string): Promise<RazorpayPayment | null> {
    if (!this.apiKey || !this.apiSecret) {
      return null
    }

    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        return null
      }

      return await response.json()

    } catch (error) {
      console.error('Razorpay get payment error:', error)
      return null
    }
  }

  /**
   * Verify payment signature
   */
  verifyPaymentSignature(params: VerifyPaymentParams): boolean {
    const payload = `${params.razorpayOrderId}|${params.razorpayPaymentId}`
    const expectedSignature = createHmac('sha256', this.apiSecret)
      .update(payload)
      .digest('hex')

    return expectedSignature === params.razorpaySignature
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const expectedSignature = createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex')

    return expectedSignature === signature
  }

  /**
   * Update payment status in database
   */
  async updatePaymentStatus(
    razorpayId: string,
    status: PaymentStatus,
    paymentMethod?: string
  ): Promise<void> {
    await prisma.payment.update({
      where: { razorpayId },
      data: {
        status,
        method: paymentMethod,
      },
    })
  }

  /**
   * Process a successful payment
   */
  async processPaymentSuccess(
    razorpayId: string,
    paymentId: string,
    signature: string
  ): Promise<PaymentResult> {
    try {
      // Verify signature
      if (!this.verifyPaymentSignature({
        razorpayOrderId: razorpayId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
      })) {
        return { success: false, error: 'Invalid payment signature' }
      }

      // Get payment details from Razorpay
      const payment = await this.getPayment(paymentId)
      if (!payment) {
        return { success: false, error: 'Payment not found' }
      }

      // Update payment record
      await prisma.payment.update({
        where: { razorpayId },
        data: {
          status: 'SUCCESS',
          verified: true,
          signature,
          method: payment.method,
        },
      })

      // Get our payment record to update related entities
      const dbPayment = await prisma.payment.findUnique({
        where: { razorpayId },
      })

      if (dbPayment) {
        // Update donation if exists
        if (dbPayment.donationId) {
          await prisma.donation.update({
            where: { id: dbPayment.donationId },
            data: {
              status: 'COMPLETED',
              paymentId: dbPayment.id,
              paymentMethod: payment.method || undefined,
            },
          })
        }

        // Update booking if exists
        if (dbPayment.bookingId) {
          await prisma.booking.update({
            where: { id: dbPayment.bookingId },
            data: {
              status: 'CONFIRMED',
              paymentId: dbPayment.id,
            },
          })
        }
      }

      return { success: true, paymentId, orderId: razorpayId }

    } catch (error) {
      console.error('Process payment error:', error)
      return { success: false, error: 'Error processing payment' }
    }
  }

  /**
   * Process a failed payment
   */
  async processPaymentFailure(razorpayId: string, errorCode: string, errorDescription: string): Promise<void> {
    await prisma.payment.update({
      where: { razorpayId },
      data: {
        status: 'FAILED',
      },
    })
  }

  /**
   * Create a refund
   */
  async createRefund(params: RefundParams): Promise<{
    success: boolean
    refundId?: string
    error?: string
  }> {
    if (!this.apiKey || !this.apiSecret) {
      return { success: false, error: 'Razorpay not configured' }
    }

    try {
      const refundData: Record<string, unknown> = {
        speed: params.speed || 'normal',
      }

      if (params.amount) {
        refundData.amount = params.amount
      }

      if (params.notes) {
        refundData.notes = params.notes
      }

      const response = await fetch(`${this.baseUrl}/payments/${params.paymentId}/refund`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(refundData),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('Razorpay refund failed:', error)
        return { success: false, error: 'Failed to create refund' }
      }

      const refund: RazorpayRefund = await response.json()

      // Update payment record
      await prisma.payment.update({
        where: { razorpayId: params.paymentId },
        data: {
          refunded: true,
          refundId: refund.id,
          refundAmount: refund.amount / 100,
        },
      })

      return { success: true, refundId: refund.id }

    } catch (error) {
      console.error('Razorpay refund error:', error)
      return { success: false, error: 'Internal error creating refund' }
    }
  }

  /**
   * Get refund details
   */
  async getRefund(refundId: string): Promise<RazorpayRefund | null> {
    if (!this.apiKey || !this.apiSecret) {
      return null
    }

    try {
      const response = await fetch(`${this.baseUrl}/refunds/${refundId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        return null
      }

      return await response.json()

    } catch (error) {
      console.error('Razorpay get refund error:', error)
      return null
    }
  }

  /**
   * Generate receipt number
   */
  private async generateReceiptNumber(): Promise<string> {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    
    // Get count of receipts this month
    const startOfMonth = new Date(year, month - 1, 1)
    const count = await prisma.payment.count({
      where: {
        receiptNumber: {
          startsWith: `SRM/${year}/${month}/`,
        },
      },
    })

    const sequence = String(count + 1).padStart(4, '0')
    return `SRM/${year}/${month}/${sequence}`
  }

  /**
   * Generate receipt for a payment
   */
  async generateReceipt(paymentId: string): Promise<{
    success: boolean
    receiptNumber?: string
    receiptUrl?: string
    error?: string
  }> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          donation: true,
          booking: {
            include: { seva: true },
          },
        },
      })

      if (!payment) {
        return { success: false, error: 'Payment not found' }
      }

      if (payment.status !== 'SUCCESS') {
        return { success: false, error: 'Payment not completed' }
      }

      // Generate receipt number
      const receiptNumber = await this.generateReceiptNumber()

      // Update payment with receipt number
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          receiptNumber,
        },
      })

      // TODO: Generate actual PDF receipt and upload to storage
      // For now, just return the receipt number
      const receiptUrl = `/api/receipts/${receiptNumber}`

      return { success: true, receiptNumber, receiptUrl }

    } catch (error) {
      console.error('Generate receipt error:', error)
      return { success: false, error: 'Error generating receipt' }
    }
  }
}

export const razorpayService = new RazorpayService()
