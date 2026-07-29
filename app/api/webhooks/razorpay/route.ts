/**
 * Razorpay Webhook Handler
 * Handles payment events from Razorpay
 */
import { NextRequest, NextResponse } from 'next/server'
import { razorpayService } from '@/services/razorpay.service'
import { prisma } from '@/lib/db'
import { auditLogService } from '@/services/audit-log.service'

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

  const { id: paymentId, order_id: orderId, amount, currency, method, email } = paymentEntity

  console.log(`Payment success: ${paymentId}, Order: ${orderId}`)

  try {
    // Find and update our payment record
    const dbPayment = await prisma.payment.findFirst({
      where: {
        OR: [
          { razorpayId: paymentId },
          { orderId: orderId },
        ],
      },
    })

    if (dbPayment) {
      await prisma.payment.update({
        where: { id: dbPayment.id },
        data: {
          status: 'SUCCESS',
          verified: true,
          method,
        },
      })

      // Update donation if exists
      if (dbPayment.donationId) {
        const donation = await prisma.donation.update({
          where: { id: dbPayment.donationId },
          data: {
            status: 'COMPLETED',
            paymentMethod: method,
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
          },
          metadata: {
            razorpayPaymentId: paymentId,
            source: 'razorpay_webhook',
          },
        })
      }

      // Update booking if exists
      if (dbPayment.bookingId) {
        const booking = await prisma.booking.update({
          where: { id: dbPayment.bookingId },
          data: {
            status: 'CONFIRMED',
          },
        })

        await auditLogService.log({
          action: 'UPDATE',
          entityType: 'Booking',
          entityId: booking.id,
          newData: {
            status: 'CONFIRMED',
          },
          metadata: {
            razorpayPaymentId: paymentId,
            source: 'razorpay_webhook',
          },
        })
      }

      // Generate receipt
      if (dbPayment.status !== 'SUCCESS' || !dbPayment.receiptNumber) {
        await razorpayService.generateReceipt(dbPayment.id)
      }

    } else {
      console.error(`Payment record not found for: ${paymentId}`)
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

  const { id: paymentId, order_id: orderId, error_code, error_description } = paymentEntity

  console.log(`Payment failed: ${paymentId}, Order: ${orderId}`)

  try {
    const dbPayment = await prisma.payment.findFirst({
      where: {
        OR: [
          { razorpayId: paymentId },
          { orderId: orderId },
        ],
      },
    })

    if (dbPayment) {
      await prisma.payment.update({
        where: { id: dbPayment.id },
        data: {
          status: 'FAILED',
        },
      })

      // Update donation if exists
      if (dbPayment.donationId) {
        await prisma.donation.update({
          where: { id: dbPayment.donationId },
          data: {
            status: 'FAILED',
            failureReason: error_description,
          },
        })
      }

      // Update booking if exists
      if (dbPayment.bookingId) {
        await prisma.booking.update({
          where: { id: dbPayment.bookingId },
          data: {
            status: 'PAYMENT_FAILED',
            failureReason: error_description,
          },
        })
      }

      // Log the failure
      await auditLogService.log({
        action: 'UPDATE',
        entityType: 'Payment',
        entityId: dbPayment.id,
        newData: {
          status: 'FAILED',
          errorCode: error_code,
          errorDescription: error_description,
        },
        metadata: {
          razorpayPaymentId: paymentId,
          source: 'razorpay_webhook',
        },
      })

    } else {
      console.error(`Payment record not found for: ${paymentId}`)
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

  const { id: refundId, payment_id: paymentId, amount, status } = refundEntity

  console.log(`Refund created: ${refundId}, Payment: ${paymentId}`)

  try {
    await prisma.payment.update({
      where: { razorpayId: paymentId },
      data: {
        refunded: true,
        refundId,
        refundAmount: amount / 100,
      },
    })

    // Log the refund
    await auditLogService.log({
      action: 'UPDATE',
      entityType: 'Payment',
      entityId: paymentId,
      newData: {
        refunded: true,
        refundId,
        refundAmount: amount / 100,
        refundStatus: status,
      },
      metadata: {
        razorpayRefundId: refundId,
        source: 'razorpay_webhook',
      },
    })

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
    // Update payment refund status
    await prisma.payment.update({
      where: { razorpayId: paymentId },
      data: {
        status: status === 'processed' ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      },
    })

    // Log the refund completion
    await auditLogService.log({
      action: 'UPDATE',
      entityType: 'Payment',
      entityId: paymentId,
      newData: {
        status: status === 'processed' ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        refundStatus: status,
      },
      metadata: {
        razorpayRefundId: refundId,
        source: 'razorpay_webhook',
      },
    })

  } catch (error) {
    console.error('Error processing refund processed webhook:', error)
  }
}
