/**
 * Razorpay Payment Service
 * Handles payment processing for donations
 */
import { createHmac } from 'crypto'
import { PaymentMethod } from '@prisma/client'

interface CreateOrderParams {
  amount: number
  currency?: string
  receipt?: string
  notes?: Record<string, string>
}

interface VerifyPaymentParams {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

interface RefundParams {
  paymentId: string
  amount?: number
  speed?: 'normal' | 'optimum'
}

interface Refund {
  id: string
  entity: string
  amount: number
  currency: string
  payment_id: string
  status: string
  speed: string
  created_at: number
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
   * Create a Razorpay order for a donation
   */
  async createOrder(params: CreateOrderParams): Promise<{
    id: string
    amount: number
    currency: string
    status: string
  } | null> {
    if (!this.apiKey || !this.apiSecret) {
      console.error('Razorpay credentials not configured')
      return null
    }

    try {
      const auth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')
      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(params.amount * 100), // Convert to paise
          currency: params.currency || 'INR',
          receipt: params.receipt,
          notes: params.notes,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('Razorpay create order error:', error)
        return null
      }

      return await response.json()
    } catch (error) {
      console.error('Razorpay create order error:', error)
      return null
    }
  }

  /**
   * Get payment details
   */
  async getPayment(paymentId: string): Promise<{
    id: string
    amount: number
    currency: string
    status: string
    method: string
    email: string
    contact: string
  } | null> {
    if (!this.apiKey || !this.apiSecret) {
      console.error('Razorpay credentials not configured')
      return null
    }

    try {
      const auth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      })

      if (!response.ok) {
        console.error('Razorpay get payment error:', response.statusText)
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
   * Create a refund
   */
  async createRefund(params: RefundParams): Promise<Refund | null> {
    if (!this.apiKey || !this.apiSecret) {
      console.error('Razorpay credentials not configured')
      return null
    }

    try {
      const auth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')
      const response = await fetch(`${this.baseUrl}/payments/${params.paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: params.amount ? Math.round(params.amount * 100) : undefined,
          speed: params.speed || 'normal',
        }),
      })

      if (!response.ok) {
        console.error('Razorpay create refund error:', await response.text())
        return null
      }

      return await response.json()
    } catch (error) {
      console.error('Razorpay create refund error:', error)
      return null
    }
  }

  /**
   * Get refund details
   */
  async getRefund(refundId: string): Promise<Refund | null> {
    if (!this.apiKey || !this.apiSecret) {
      console.error('Razorpay credentials not configured')
      return null
    }

    try {
      const auth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')
      const response = await fetch(`${this.baseUrl}/refunds/${refundId}`, {
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      })

      if (!response.ok) {
        console.error('Razorpay get refund error:', await response.text())
        return null
      }

      return await response.json()
    } catch (error) {
      console.error('Razorpay get refund error:', error)
      return null
    }
  }

  /**
   * Map Razorpay method to our PaymentMethod enum
   */
  mapPaymentMethod(method: string): PaymentMethod {
    const methodMap: Record<string, PaymentMethod> = {
      'card': 'CARD',
      'upi': 'UPI',
      'netbanking': 'NET_BANKING',
      'wallet': 'WALLET',
      'bank_transfer': 'BANK_TRANSFER',
    }
    return methodMap[method.toLowerCase()] || 'BANK_TRANSFER'
  }
}

export const razorpayService = new RazorpayService()
