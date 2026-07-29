/**
 * Resend Verification Email API Route
 * Resends the email verification link to the user
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/db'
import { auditLogService } from '@/services/audit-log.service'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/resend-verification
 * Resends the verification email to the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Create Supabase server client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {},
        },
      }
    )

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to resend verification' },
        { status: 401 }
      )
    }

    // Check if email is already verified
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    if (profile.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Send the verification email
    const { error: sendError } = await supabase.auth.resend({
      type: 'signup',
      email: user.email!,
    })

    if (sendError) {
      console.error('Error resending verification:', sendError)
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again later.' },
        { status: 500 }
      )
    }

    // Log the resend request
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    const userAgent = request.headers.get('user-agent') || undefined

    await auditLogService.log({
      userId: user.id,
      action: 'ACCESS',
      newData: {
        action: 'resend_verification_email',
        email: user.email,
      },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully'
    })

  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/resend-verification?email=xxx
 * Alternative endpoint to request verification email without authentication
 * (e.g., if the user didn't receive the original email)
 */
export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const email = requestUrl.searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = createClient()

    // Send the verification email
    const { error: sendError } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    })

    if (sendError) {
      console.error('Error resending verification:', sendError)
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a verification link has been sent'
    })

  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
