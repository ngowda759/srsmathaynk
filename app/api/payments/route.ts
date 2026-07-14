/**
 * Payments API - Razorpay Integration
 * POST /api/payments - Create order
 * POST /api/payments/webhook - Razorpay webhook
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { donationsRepository } from "@/repositories/donations"
import { prisma } from "@/lib/db"
import crypto from "crypto"

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET

async function getUserProfile() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return prisma.profile.findUnique({ where: { userId: user.id } })
}

// Create Razorpay order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency = "INR", donorName, donorEmail, donorPhone, purpose, remark } = body

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 })
    }

    // Get or create user profile
    const profile = await getUserProfile()

    // Create pending donation record
    const donation = await donationsRepository.create({
      amount,
      currency,
      paymentMethod: "ONLINE",
      donorName: donorName || profile?.name || "Anonymous",
      donorEmail: donorEmail || profile?.email,
      donorPhone: donorPhone || profile?.phone,
      purpose: purpose || "General Donation",
      remark,
      userId: profile?.id,
      status: "PENDING",
    })

    if (!donation.success || !donation.data) {
      return NextResponse.json({ error: "Failed to create donation" }, { status: 500 })
    }

    // If Razorpay is not configured, return mock response
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json({
        success: true,
        donationId: donation.data.id,
        amount,
        currency,
        message: "Razorpay not configured - mock payment"
      })
    }

    // Create Razorpay order
    const razorpay = await import("razorpay").then(m => new m.default({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    }))

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: `donation_${donation.data.id}`,
      notes: {
        donationId: donation.data.id,
        purpose: purpose || "General Donation",
      },
    })

    // Update donation with order ID
    await donationsRepository.update(donation.data.id, {
      razorpayOrderId: order.id,
    })

    return NextResponse.json({
      success: true,
      donationId: donation.data.id,
      orderId: order.id,
      amount,
      currency,
      key: RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "Payment creation failed" }, { status: 500 })
  }
}

// Verify payment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { donationId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = body

    if (!donationId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 })
    }

    // Verify signature
    if (RAZORPAY_KEY_SECRET) {
      const generatedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex")

      if (generatedSignature !== razorpaySignature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
      }
    }

    // Update donation status
    const result = await donationsRepository.update(donationId, {
      razorpayPaymentId,
      razorpayOrderId,
      status: "COMPLETED",
      paidAt: new Date(),
    })

    if (!result.success) {
      return NextResponse.json({ error: "Failed to update donation" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
  }
}
