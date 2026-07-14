/**
 * Donation Receipts API
 * GET - Get receipt for a donation
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { donationsRepository } from "@/repositories/donations"
import { templeRepository } from "@/repositories/temple"
import { prisma } from "@/lib/db"

async function getUserProfile() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return prisma.profile.findUnique({ where: { userId: user.id } })
}

async function checkAdmin() {
  const profile = await getUserProfile()
  return profile?.role === "SUPER_ADMIN" || profile?.role === "ADMIN" || profile?.role === "STAFF"
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const donationId = searchParams.get("donationId")
    const isAdmin = await checkAdmin()
    const profile = await getUserProfile()

    if (!donationId) {
      return NextResponse.json({ error: "Donation ID is required" }, { status: 400 })
    }

    // Get donation
    const donationResult = await donationsRepository.findById(donationId)
    if (!donationResult.success || !donationResult.data) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 })
    }

    const donation = donationResult.data

    // Check access
    if (!isAdmin && profile?.id !== donation.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only completed donations get receipts
    if (donation.status !== "COMPLETED") {
      return NextResponse.json({ error: "Receipt only available for completed donations" }, { status: 400 })
    }

    // Get temple settings for receipt
    const settingsResult = await templeRepository.getSettings()
    const settings = settingsResult.data

    // Generate receipt number
    const receiptNumber = `SRS${new Date().getFullYear()}${String(donation.id).slice(-8).toUpperCase()}`

    const receipt = {
      receiptNumber,
      donationId: donation.id,
      templeName: settings?.templeName || "Sri Raghavendra Swamy Temple",
      templeAddress: settings?.address || "",
      templePhone: settings?.phone || "",
      templeEmail: settings?.email || "",
      donorName: donation.anonymous ? "Anonymous" : donation.donorName,
      donorEmail: donation.donorEmail,
      donorPhone: donation.donorPhone,
      amount: donation.amount,
      amountInWords: numberToWords(donation.amount),
      currency: donation.currency || "INR",
      purpose: donation.purpose || "General Donation",
      paymentMethod: donation.paymentMethod,
      paymentId: donation.razorpayPaymentId || donation.id,
      donationDate: donation.createdAt,
      issuedDate: new Date().toISOString(),
      bankDetails: settings ? {
        bankName: settings.bankName,
        accountName: settings.bankAccountName,
        accountNumber: settings.bankAccountNumber,
        ifscCode: settings.bankIFSCCode,
        upiId: settings.bankUPIId,
      } : null,
    }

    return NextResponse.json(receipt)
  } catch (error) {
    console.error("Error generating receipt:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to convert number to words
function numberToWords(num: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
                "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
                "Seventeen", "Eighteen", "Nineteen"]
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

  if (num === 0) return "Zero"
  if (num < 20) return ones[num]
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "")
  if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + numberToWords(num % 100) : "")
  if (num < 100000) return numberToWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + numberToWords(num % 1000) : "")
  if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + numberToWords(num % 100000) : "")
  return numberToWords(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + numberToWords(num % 10000000) : "")
}
