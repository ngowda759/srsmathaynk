/**
 * Google OAuth Callback API Route
 * Handles the OAuth callback from Supabase Google authentication
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/db'
import { auditLogService } from '@/services/audit-log.service'
import { loginHistoryService } from '@/services/login-history.service'

export const dynamic = 'force-dynamic'

/**
 * GET /api/auth/google
 * Handles the OAuth callback from Supabase
 */
export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')
    const state = requestUrl.searchParams.get('state')

    // Handle error from OAuth provider
    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error)}`, requestUrl.origin)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/login?error=no_code', requestUrl.origin)
      )
    }

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

    // Exchange code for session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError || !data.user) {
      console.error('Code exchange error:', exchangeError)
      return NextResponse.redirect(
        new URL('/login?error=auth_error', requestUrl.origin)
      )
    }

    const user = data.user
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    const userAgent = request.headers.get('user-agent') || undefined

    // Check if profile exists
    let profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: { userRoles: { include: { role: true } } },
    })

    if (!profile) {
      // Create new profile for Google user
      const metadata = user.user_metadata as Record<string, unknown>
      const fullName = (metadata?.full_name || metadata?.name) as string | undefined

      const newProfile = await prisma.profile.create({
        data: {
          userId: user.id,
          email: user.email!,
          name: fullName || null,
          emailVerified: true, // Google accounts are pre-verified
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
        profileId: newProfile.id,
        action: 'CREATE',
        entityType: 'Profile',
        entityId: newProfile.id,
        newData: {
          email: newProfile.email,
          name: newProfile.name,
          source: 'google_oauth',
        },
        ipAddress,
        userAgent,
      })

      // Record successful login
      await loginHistoryService.recordLogin({
        profileId: newProfile.id,
        success: true,
        ipAddress,
        userAgent,
      })

      await auditLogService.logLogin({
        profileId: newProfile.id,
        success: true,
        ipAddress,
        userAgent,
      })

      // Redirect to dashboard or to the page they were trying to access
      const redirectTo = state || '/dashboard'
      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
    }

    // Update last login
    await prisma.profile.update({
      where: { id: profile.id },
      data: { lastLoginAt: new Date() },
    })

    // Record successful login
    await loginHistoryService.recordLogin({
      profileId: profile.id,
      success: true,
      ipAddress,
      userAgent,
    })

    await auditLogService.logLogin({
      profileId: profile.id,
      success: true,
      ipAddress,
      userAgent,
    })

    // Redirect to dashboard or to the page they were trying to access
    const redirectTo = state || '/dashboard'
    return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))

  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/login?error=server_error', request.url)
    )
  }
}
