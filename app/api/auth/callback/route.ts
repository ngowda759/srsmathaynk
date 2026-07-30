/**
 * Auth Callback Route
 * Handles OAuth callbacks and email verification from Supabase
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/db'
import { auditLogService } from '@/services/audit-log.service'

export const dynamic = 'force-dynamic'

/**
 * GET /api/auth/callback
 * Handles various auth callbacks:
 * - OAuth providers (Google, etc.)
 * - Email verification
 * - Password reset
 */
export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url)
  
  try {
    // Create Supabase server client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll() {},
        },
      }
    )

    // Get parameters from URL
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')
    const type = requestUrl.searchParams.get('type')
    const next = requestUrl.searchParams.get('next') || '/dashboard'
    const tokenHash = requestUrl.searchParams.get('token_hash')
    const redirectTo = requestUrl.searchParams.get('redirect_to')

    // Handle error from OAuth provider or auth
    if (error) {
      console.error('Auth callback error:', error)
      const errorDescription = requestUrl.searchParams.get('error_description')
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
      )
    }

    // Handle email verification (signup confirmation)
    if (type === 'signup' && tokenHash) {
      return handleEmailConfirmation(supabase, tokenHash, requestUrl.origin)
    }

    // Handle password reset
    if (type === 'recovery' && tokenHash) {
      return handlePasswordReset(supabase, tokenHash, requestUrl.origin, next)
    }

    // Handle email change
    if (type === 'email_change' && tokenHash) {
      return handleEmailChange(supabase, tokenHash, requestUrl.origin)
    }

    // Handle OAuth code exchange
    if (code) {
      return handleOAuthCallback(supabase, code, requestUrl.origin, next, req)
    }

    // No recognized callback type
    return NextResponse.redirect(
      new URL('/login?error=invalid_callback', requestUrl.origin)
    )

  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(
      new URL('/login?error=server_error', req.url)
    )
  }
}

/**
 * Handle OAuth callback (e.g., Google)
 */
async function handleOAuthCallback(
  supabase: ReturnType<typeof createServerClient>,
  code: string,
  origin: string,
  next: string,
  req: NextRequest
): Promise<NextResponse> {
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    console.error('OAuth code exchange error:', error)
    return NextResponse.redirect(
      new URL('/login?error=auth_error', origin)
    )
  }

  const user = data.user
  const ipAddress = getClientInfo(req).ipAddress
  const userAgent = getClientInfo(req).userAgent

  // Check if profile exists, create if not
  await ensureProfile(user.id, user.email!, user.user_metadata, ipAddress, userAgent)

  // Log successful login
  await auditLogService.logLogin({
    userId: user.id,
    success: true,
    ipAddress,
    userAgent,
  })

  // Redirect to destination
  return NextResponse.redirect(new URL(next, origin))
}

/**
 * Handle email confirmation (signup)
 */
async function handleEmailConfirmation(
  supabase: ReturnType<typeof createServerClient>,
  tokenHash: string,
  origin: string
): Promise<NextResponse> {
  const { data, error } = await supabase.auth.verifyOtp({
    type: 'signup',
    token: tokenHash,
    email: '', // Token contains email
  })

  if (error || !data.user) {
    console.error('Email confirmation error:', error)
    return NextResponse.redirect(
      new URL('/login?error=verification_failed', origin)
    )
  }

  // Update profile's emailVerified field
  const profile = await prisma.profile.findUnique({
    where: { userId: data.user.id },
  })

  if (profile) {
    await prisma.profile.update({
      where: { userId: data.user.id },
      data: { emailVerified: true },
    })

    // Log email verification
    await auditLogService.log({
      userId: data.user.id,
      action: 'EMAIL_VERIFIED',
      entityType: 'Profile',
      entityId: profile.id,
      newData: { emailVerified: true, source: 'signup_confirmation' },
    })
  }

  return NextResponse.redirect(
    new URL('/login?verified=true', origin)
  )
}

/**
 * Handle password reset
 */
async function handlePasswordReset(
  supabase: ReturnType<typeof createServerClient>,
  tokenHash: string,
  origin: string,
  next: string
): Promise<NextResponse> {
  // Verify the token is valid
  const { data, error } = await supabase.auth.verifyOtp({
    type: 'recovery',
    token: tokenHash,
    email: '',
  })

  if (error || !data.user) {
    console.error('Password reset verification error:', error)
    return NextResponse.redirect(
      new URL('/login?error=reset_failed', origin)
    )
  }

  // Redirect to reset password page with the token
  return NextResponse.redirect(
    new URL(`/reset-password?token=${tokenHash}`, origin)
  )
}

/**
 * Handle email change
 */
async function handleEmailChange(
  supabase: ReturnType<typeof createServerClient>,
  tokenHash: string,
  origin: string
): Promise<NextResponse> {
  const { data, error } = await supabase.auth.verifyOtp({
    type: 'email_change',
    token: tokenHash,
    email: '',
  })

  if (error || !data.user) {
    console.error('Email change verification error:', error)
    return NextResponse.redirect(
      new URL('/login?error=email_change_failed', origin)
    )
  }

  // Update profile's email
  const profile = await prisma.profile.findUnique({
    where: { userId: data.user.id },
  })

  if (profile && data.user.email) {
    const oldEmail = profile.email
    await prisma.profile.update({
      where: { userId: data.user.id },
      data: { email: data.user.email },
    })

    // Log email change
    await auditLogService.log({
      userId: data.user.id,
      action: 'UPDATE',
      entityType: 'Profile',
      entityId: profile.id,
      oldData: { email: oldEmail },
      newData: { email: data.user.email, action: 'email_changed' },
    })
  }

  return NextResponse.redirect(
    new URL('/login?email_changed=true', origin)
  )
}

/**
 * Ensure a profile exists for the user, create if not
 */
async function ensureProfile(
  userId: string,
  email: string,
  metadata: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const existingProfile = await prisma.profile.findUnique({
    where: { userId },
  })

  if (existingProfile) {
    // Update last login
    await prisma.profile.update({
      where: { userId },
      data: { lastLoginAt: new Date() },
    })
    return
  }

  // Create new profile
  const fullName = (metadata?.full_name || metadata?.name) as string | undefined
  const phone = metadata?.phone as string | undefined

  const newProfile = await prisma.profile.create({
    data: {
      userId,
      email,
      name: fullName || null,
      phone: phone || null,
      emailVerified: true, // OAuth users are pre-verified
      isActive: true,
    },
  })

  // Assign DEVOTEE role
  const devoteeRole = await prisma.role.findUnique({
    where: { name: 'DEVOTEE' },
  })

  if (devoteeRole) {
    await prisma.userRole.create({
      data: {
        profileId: newProfile.id,
        roleId: devoteeRole.id,
      },
    })
  }

  // Log profile creation
  await auditLogService.log({
    userId,
    action: 'CREATE',
    entityType: 'Profile',
    entityId: newProfile.id,
    newData: {
      email: newProfile.email,
      name: newProfile.name,
      source: 'oauth_callback',
    },
    ipAddress,
    userAgent,
  })
}

/**
 * Get client IP and User Agent from request
 * Note: In a production environment, you might want to use proper headers
 */
function getClientInfo(req: NextRequest): { ipAddress?: string; userAgent?: string } {
  return {
    ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  }
}
