/**
 * RBAC Middleware
 * Role-Based Access Control for API routes
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/db'
import type { UserRole } from '@/services/auth.service'

// Permission definitions
export type Permission =
  | 'manage_users'
  | 'manage_settings'
  | 'manage_content'
  | 'manage_events'
  | 'manage_sevas'
  | 'manage_donations'
  | 'manage_gallery'
  | 'view_reports'
  | 'manage_billing'
  | 'access_admin'
  | 'access_dashboard'

// Role hierarchy with permissions
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'manage_users',
    'manage_settings',
    'manage_content',
    'manage_events',
    'manage_sevas',
    'manage_donations',
    'manage_gallery',
    'view_reports',
    'manage_billing',
    'access_admin',
    'access_dashboard',
  ],
  ADMIN: [
    'manage_content',
    'manage_events',
    'manage_sevas',
    'manage_gallery',
    'view_reports',
    'access_admin',
    'access_dashboard',
  ],
  STAFF: [
    'manage_events',
    'manage_sevas',
    'manage_gallery',
    'access_admin',
    'access_dashboard',
  ],
  PRIEST: [
    'manage_sevas',
    'access_admin',
    'access_dashboard',
  ],
  VOLUNTEER: [
    'access_dashboard',
  ],
  DEVOTEE: [
    'access_dashboard',
  ],
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p))
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p))
}

// Route to permissions mapping
const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/api/admin/users': ['manage_users'],
  '/api/admin/settings': ['manage_settings'],
  '/api/admin/content': ['manage_content'],
  '/api/admin/events': ['manage_events'],
  '/api/admin/sevas': ['manage_sevas'],
  '/api/admin/donations': ['manage_donations'],
  '/api/admin/gallery': ['manage_gallery'],
  '/api/admin/reports': ['view_reports'],
  '/api/admin/billing': ['manage_billing'],
}

export interface AuthenticatedUser {
  id: string
  profileId: string
  email: string
  role: UserRole
}

/**
 * Get authenticated user from request
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value)
            })
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Get profile and roles from database
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    })

    if (!profile) {
      return null
    }

    // Get primary role (highest privilege)
    const roleHierarchy: UserRole[] = ['DEVOTEE', 'VOLUNTEER', 'PRIEST', 'STAFF', 'ADMIN', 'SUPER_ADMIN']
    let primaryRole: UserRole = 'DEVOTEE'

    for (const roleName of roleHierarchy) {
      if (profile.userRoles.some(ur => ur.role.name.replace(' ', '_').toUpperCase() === roleName)) {
        primaryRole = roleName
        break
      }
    }

    return {
      id: user.id,
      profileId: profile.id,
      email: profile.email,
      role: primaryRole,
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return null
  }
}

/**
 * Require authentication - returns 401 if not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<
  NextResponse | AuthenticatedUser
> {
  const user = await getAuthenticatedUser(request)

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized - Authentication required' },
      { status: 401 }
    )
  }

  return user
}

/**
 * Require specific permissions - returns 403 if insufficient
 */
export async function requirePermissions(
  request: NextRequest,
  permissions: Permission[]
): Promise<NextResponse | AuthenticatedUser> {
  const user = await requireAuth(request)

  if (user instanceof NextResponse) {
    return user // Already a 401 response
  }

  const hasRequired = hasAnyPermission(user.role, permissions)

  if (!hasRequired) {
    return NextResponse.json(
      { error: 'Forbidden - Insufficient permissions' },
      { status: 403 }
    )
  }

  return user
}

/**
 * Create RBAC middleware handler for a specific set of permissions
 */
export function withRBAC(requiredPermissions: Permission[]) {
  return async function rbacHandler(
    request: NextRequest
  ): Promise<NextResponse | AuthenticatedUser> {
    return requirePermissions(request, requiredPermissions)
  }
}

/**
 * Check if user can access admin routes
 */
export async function canAccessAdmin(request: NextRequest): Promise<boolean> {
  const user = await getAuthenticatedUser(request)

  if (!user) {
    return false
  }

  return hasPermission(user.role, 'access_admin')
}

/**
 * Check if user can access dashboard
 */
export async function canAccessDashboard(request: NextRequest): Promise<boolean> {
  const user = await getAuthenticatedUser(request)

  if (!user) {
    return false
  }

  return hasPermission(user.role, 'access_dashboard')
}
