/**
 * Razorpay Webhook Handler
 * Handles payment events from Razorpay for donations
 */
import { NextRequest, NextResponse } from 'next/server'
import { razorpayService } from '@/services/razorpay.service'
import { prisma } from '@/lib/db'
import { auditLogService } from '@/services/audit-log.service'
import { PaymentMethod } from '@prisma/client'

export const dynamic = 'force-dynamic'

// Webhook event types we handle
type WebhookEvent = 
  | 'payment.authorized'
  | 'payment.captured'
  | 'payment.failed'
  | 'refund.created'
  | 'refund.processed'

interface WebhookPayload {
  entity: string
  account_id: string
  event: WebhookEvent
  contains: string[]
  payload: {
    payment?: {
      entity: {
        id: string
        order_id: string
        amount: number
        currency: string
        status: string
        method: string
        email: string
        contact: string
        error_code?: string
        error_description?: string
      }
    }
    refund?: {
      entity: {
        id: string
        payment_id: string
        amount: number
        status: string
        speed: string
      }
    }
  }
  created_at: number
}

// Map Razorpay methods to our PaymentMethod enum
function mapPaymentMethod(method: string): PaymentMethod {
  const methodMap: Record<string, PaymentMethod> = {
    'card': 'CARD',
    'upi': 'UPI',
    'netbanking': 'NET_BANKING',
    'wallet': 'WALLET',
    'bank_transfer': 'BANK_TRANSFER',
  }
  return methodMap[method.toLowerCase()] || 'BANK_TRANSFER'
}

/**
 * POST /api/webhooks/razorpay
 * Handles incoming Razorpay webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      console.error('Missing webhook signature')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    if (!razorpayService.verifyWebhookSignature(rawBody, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Parse payload
    const payload: WebhookPayload = JSON.parse(rawBody)
    const event = payload.event

    console.log(`Razorpay webhook received: ${event}`)

    // Handle different event types
    switch (event) {
      case 'payment.authorized':
      case 'payment.captured':
        await handlePaymentSuccess(payload)
        break

      case 'payment.failed':
        await handlePaymentFailed(payload)
        break

      case 'refund.created':
        await handleRefundCreated(payload)
        break

      case 'refund.processed':
        await handleRefundProcessed(payload)
        break

      default:
        console.log(`Unhandled webhook event: ${event}`)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    // Return 200 to acknowledge receipt (Razorpay retries otherwise)
    return NextResponse.json({ success: true })

  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(payload: WebhookPayload): Promise<void> {
  const paymentEntity = payload.payload.payment?.entity

  if (!paymentEntity) {
    console.error('Missing payment entity in payload')
    return
  }

  const { id: razorpayPaymentId, order_id: orderId, amount, currency, method } = paymentEntity

  console.log(`Payment success: ${razorpayPaymentId}, Order: ${orderId}`)

  try {
    // Find the donation by order ID (stored as razorpayId)
    const donation = await prisma.donation.findFirst({
      where: {
        paymentId: orderId,
      },
    })

    if (donation) {
      // Create a payment attempt record
      await prisma.donationPayment.create({
        data: {
          donationId: donation.id,
          amount: amount / 100,
          currency,
          paymentMethod: mapPaymentMethod(method),
          paymentId: razorpayPaymentId,
          status: 'SUCCESS',
          completedAt: new Date(),
        },
      })

      // Update donation status
      await prisma.donation.update({
        where: { id: donation.id },
        data: {
          status: 'COMPLETED',
          paymentMethod: mapPaymentMethod(method),
          paymentId: razorpayPaymentId,
        },
      })

      // Log the donation
      await auditLogService.log({
        action: 'UPDATE',
        entityType: 'Donation',
        entityId: donation.id,
        newData: {
          status: 'COMPLETED',
          amount: amount / 100,
          paymentMethod: method,
          razorpayPaymentId,
          razorpayOrderId: orderId,
        },
      })
    } else {
      console.error(`Donation not found for order: ${orderId}`)
    }
  } catch (error) {
    console.error('Error processing payment success webhook:', error)
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(payload: WebhookPayload): Promise<void> {
  const paymentEntity = payload.payload.payment?.entity

  if (!paymentEntity) {
    console.error('Missing payment entity in payload')
    return
  }

  const { id: razorpayPaymentId, order_id: orderId, error_code, error_description } = paymentEntity

  console.log(`Payment failed: ${razorpayPaymentId}, Order: ${orderId}`)

  try {
    // Find the donation
    const donation = await prisma.donation.findFirst({
      where: {
        paymentId: orderId,
      },
    })

    if (donation) {
      // Create a failed payment attempt record
      await prisma.donationPayment.create({
        data: {
          donationId: donation.id,
          amount: 0,
          currency: 'INR',
          paymentMethod: 'BANK_TRANSFER',
          status: 'FAILED',
          errorMessage: error_description || error_code,
        },
      })

      // Update donation status
      await prisma.donation.update({
        where: { id: donation.id },
        data: {
          status: 'FAILED',
        },
      })

      // Log the failure
      await auditLogService.log({
        action: 'UPDATE',
        entityType: 'Donation',
        entityId: donation.id,
        newData: {
          status: 'FAILED',
          errorCode: error_code,
          errorDescription: error_description,
          razorpayPaymentId,
          razorpayOrderId: orderId,
        },
      })
    } else {
      console.error(`Donation not found for order: ${orderId}`)
    }
  } catch (error) {
    console.error('Error processing payment failure webhook:', error)
  }
}

/**
 * Handle refund created
 */
async function handleRefundCreated(payload: WebhookPayload): Promise<void> {
  const refundEntity = payload.payload.refund?.entity

  if (!refundEntity) {
    console.error('Missing refund entity in payload')
    return
  }

  const { id: refundId, payment_id: paymentId, amount } = refundEntity

  console.log(`Refund created: ${refundId}, Payment: ${paymentId}`)

  try {
    // Find the donation by payment ID
    const donation = await prisma.donation.findFirst({
      where: {
        paymentId: paymentId,
      },
    })

    if (donation) {
      // Update donation status to REFUNDED
      await prisma.donation.update({
        where: { id: donation.id },
        data: {
          status: 'REFUNDED',
        },
      })

      // Log the refund
      await auditLogService.log({
        action: 'UPDATE',
        entityType: 'Donation',
        entityId: donation.id,
        newData: {
          status: 'REFUNDED',
          refundAmount: amount / 100,
          razorpayRefundId: refundId,
          razorpayPaymentId: paymentId,
        },
      })
    }
  } catch (error) {
    console.error('Error processing refund created webhook:', error)
  }
}

/**
 * Handle refund processed
 */
async function handleRefundProcessed(payload: WebhookPayload): Promise<void> {
  const refundEntity = payload.payload.refund?.entity

  if (!refundEntity) {
    console.error('Missing refund entity in payload')
    return
  }

  const { id: refundId, payment_id: paymentId, status } = refundEntity

  console.log(`Refund processed: ${refundId}, Payment: ${paymentId}`)

  try {
    // Find the donation
    const donation = await prisma.donation.findFirst({
      where: {
        paymentId: paymentId,
      },
    })

    if (donation) {
      // Log the refund completion
      await auditLogService.log({
        action: 'UPDATE',
        entityType: 'Donation',
        entityId: donation.id,
        newData: {
          refundStatus: status,
          razorpayRefundId: refundId,
          razorpayPaymentId: paymentId,
        },
      })
    }
  } catch (error) {
    console.error('Error processing refund processed webhook:', error)
  }
}
