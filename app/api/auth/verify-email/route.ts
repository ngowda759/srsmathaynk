/**
 * Email Verification API Route
 * Verifies user's email address using the token from the verification email
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/db'
import { auditLogService } from '@/services/audit-log.service'

export const dynamic = 'force-dynamic'

/**
 * GET /api/auth/verify-email?token=xxx
 * Verifies the user's email address
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  try {
    const token = requestUrl.searchParams.get('token')
    const type = requestUrl.searchParams.get('type')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = createClient()

    // Verify the token using Supabase
    const { data, error } = await supabase.auth.verifyOtp({
      type: type === 'signup' ? 'signup' : 'email_change',
      email: '', // The token contains the email
      token,
    })

    if (error) {
      console.error('Email verification error:', error)
      return NextResponse.redirect(
        new URL(`/login?error=verification_failed&message=${encodeURIComponent(error.message)}`, requestUrl.origin)
      )
    }

    // Get the user from the verification
    if (!data.user) {
      return NextResponse.redirect(
        new URL('/login?error=verification_failed', requestUrl.origin)
      )
    }

    const user = data.user
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    const userAgent = request.headers.get('user-agent') || undefined

    // Update profile's emailVerified field
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    })

    if (profile) {
      const oldData = { emailVerified: profile.emailVerified }

      await prisma.profile.update({
        where: { userId: user.id },
        data: { emailVerified: true },
      })

      // Log the verification
      await auditLogService.log({
        userId: user.id,
        action: 'EMAIL_VERIFIED',
        entityType: 'Profile',
        entityId: profile.id,
        oldData,
        newData: { emailVerified: true },
        ipAddress,
        userAgent,
      })
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/login?verified=true', requestUrl.origin)
    )

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.redirect(
      new URL('/login?error=verification_error', requestUrl.origin)
    )
  }
}

/**
 * POST /api/auth/verify-email
 * Manual verification (for admin use or special cases)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Create Supabase server client for admin operations
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

    // Verify the user is authenticated as admin
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const adminProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: { userRoles: { include: { role: true } } },
    })

    if (!adminProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    const isAdmin = adminProfile.userRoles.some(
      ur => ur.role.name === 'ADMIN' || ur.role.name === 'SUPER_ADMIN'
    )

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get the target user's profile
    const targetProfile = await prisma.profile.findUnique({
      where: { id: userId },
    })

    if (!targetProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update email verification status
    await prisma.profile.update({
      where: { id: userId },
      data: { emailVerified: true },
    })

    // Log the manual verification
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    const userAgent = request.headers.get('user-agent') || undefined

    await auditLogService.log({
      userId: user.id,
      action: 'EMAIL_VERIFIED',
      entityType: 'Profile',
      entityId: userId,
      newData: { emailVerified: true, manuallyVerified: true },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Manual email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
