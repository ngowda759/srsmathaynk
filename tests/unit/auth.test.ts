/**
 * Auth Service Unit Tests
 * Tests for authentication services using Supabase
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the Supabase client
const mockSupabaseAuth = {
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  getSession: vi.fn(),
  getUser: vi.fn(),
  exchangeCodeForSession: vi.fn(),
  verifyOtp: vi.fn(),
  signInWithOAuth: vi.fn(),
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: mockSupabaseAuth,
  })),
}))

// Mock the database
vi.mock('@/lib/db', () => ({
  prisma: {
    profile: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    role: {
      findUnique: vi.fn(),
    },
    userRole: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('login', () => {
    it('should return success when login is successful', async () => {
      const { login } = await import('@/services/auth.client')
      
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'test-user-id', email: 'test@example.com' },
          session: { access_token: 'test-token' },
        },
        error: null,
      })

      const result = await login('test@example.com', 'password123')

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('should return error when login fails', async () => {
      const { login } = await import('@/services/auth.client')
      
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' },
      })

      const result = await login('test@example.com', 'wrongpassword')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid login credentials')
    })

    it('should handle network errors gracefully', async () => {
      const { login } = await import('@/services/auth.client')
      
      mockSupabaseAuth.signInWithPassword.mockRejectedValue(new Error('Network error'))

      const result = await login('test@example.com', 'password123')

      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })
  })

  describe('register', () => {
    it('should return success when registration is successful', async () => {
      const { register } = await import('@/services/auth.client')
      
      mockSupabaseAuth.signUp.mockResolvedValue({
        data: {
          user: { id: 'new-user-id', email: 'new@example.com' },
        },
        error: null,
      })

      const result = await register({
        name: 'Test User',
        email: 'new@example.com',
        phone: '1234567890',
        password: 'password123',
      })

      expect(result.success).toBe(true)
      expect(mockSupabaseAuth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: {
          data: {
            name: 'Test User',
            phone: '1234567890',
          },
        },
      })
    })

    it('should return error when email already exists', async () => {
      const { register } = await import('@/services/auth.client')
      
      mockSupabaseAuth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'User already registered' },
      })

      const result = await register({
        name: 'Test User',
        email: 'existing@example.com',
        phone: '1234567890',
        password: 'password123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('User already registered')
    })
  })

  describe('logout', () => {
    it('should call signOut', async () => {
      const { logout } = await import('@/services/auth.client')
      
      mockSupabaseAuth.signOut.mockResolvedValue({
        error: null,
      })

      await logout()

      expect(mockSupabaseAuth.signOut).toHaveBeenCalled()
    })
  })

  describe('forgotPassword', () => {
    it('should return success when email is sent', async () => {
      const { forgotPassword } = await import('@/services/auth.client')
      
      mockSupabaseAuth.resetPasswordForEmail.mockResolvedValue({
        error: null,
      })

      const result = await forgotPassword('test@example.com')

      expect(result.success).toBe(true)
      expect(mockSupabaseAuth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/api/auth/callback'),
        })
      )
    })

    it('should return error when email fails to send', async () => {
      const { forgotPassword } = await import('@/services/auth.client')
      
      mockSupabaseAuth.resetPasswordForEmail.mockResolvedValue({
        error: { message: 'Failed to send reset email' },
      })

      const result = await forgotPassword('test@example.com')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to send reset email')
    })
  })

  describe('signInWithGoogle', () => {
    it('should return success when Google OAuth is initiated', async () => {
      const { signInWithGoogle } = await import('@/services/auth.client')
      
      mockSupabaseAuth.signInWithOAuth.mockResolvedValue({
        data: { provider: 'google', url: 'https://supabase.co/callback' },
        error: null,
      })

      const result = await signInWithGoogle()

      expect(result.success).toBe(true)
      expect(mockSupabaseAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: expect.objectContaining({
          redirectTo: expect.stringContaining('/api/auth/callback'),
        }),
      })
    })

    it('should return error when Google OAuth fails', async () => {
      const { signInWithGoogle } = await import('@/services/auth.client')
      
      mockSupabaseAuth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: { message: 'OAuth failed' },
      })

      const result = await signInWithGoogle()

      expect(result.success).toBe(false)
      expect(result.error).toBe('OAuth failed')
    })
  })

  describe('updatePassword', () => {
    it('should return success when password is updated', async () => {
      const { updatePassword } = await import('@/services/auth.client')
      
      // Mock getUser first since that's called first
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: { email: 'test@example.com' } },
        error: null,
      })
      // Then mock signInWithPassword
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: { email: 'test@example.com' } },
        error: null,
      })
      // Finally mock updateUser
      mockSupabaseAuth.updateUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      })

      const result = await updatePassword('currentPassword', 'newPassword')

      expect(result.success).toBe(true)
      expect(mockSupabaseAuth.updateUser).toHaveBeenCalledWith({
        password: 'newPassword',
      })
    })

    it('should return error when current password is incorrect', async () => {
      const { updatePassword } = await import('@/services/auth.client')
      
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: { email: 'test@example.com' } },
        error: null,
      })
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' },
      })

      const result = await updatePassword('wrongPassword', 'newPassword')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Current password is incorrect')
    })
  })
})

describe('Auth Types', () => {
  it('should export UserRole type', async () => {
    const { UserRole } = await import('@/services/auth.types')
    
    const validRoles: UserRole[] = [
      'DEVOTEE',
      'VOLUNTEER',
      'PRIEST',
      'STAFF',
      'ADMIN',
      'SUPER_ADMIN',
    ]

    validRoles.forEach(role => {
      expect(typeof role).toBe('string')
    })
  })

  it('should export UserProfile type', async () => {
    const { UserProfile } = await import('@/services/auth.types')
    
    const mockProfile: UserProfile = {
      id: 'test-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'DEVOTEE',
      phone: '1234567890',
      emailVerified: false,
      isActive: true,
    }

    expect(mockProfile.id).toBe('test-id')
    expect(mockProfile.email).toBe('test@example.com')
    expect(mockProfile.role).toBe('DEVOTEE')
  })

  it('should export AuthResult type', async () => {
    const { AuthResult } = await import('@/services/auth.types')
    
    const successResult: AuthResult = {
      success: true,
      user: {
        id: 'test-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'DEVOTEE',
        phone: null,
        emailVerified: false,
        isActive: true,
      },
    }

    const errorResult: AuthResult = {
      success: false,
      error: 'Test error',
    }

    expect(successResult.success).toBe(true)
    expect(errorResult.success).toBe(false)
    expect(errorResult.error).toBe('Test error')
  })
})

describe('RBAC', () => {
  it('should export role normalization functions', async () => {
    const { normalizeRole, NormalizedRole } = await import('@/types/user')
    
    expect(normalizeRole('SUPER_ADMIN')).toBe('super_admin')
    expect(normalizeRole('ADMIN')).toBe('admin')
    expect(normalizeRole('STAFF')).toBe('staff')
    expect(normalizeRole('PRIEST')).toBe('priest')
    expect(normalizeRole('VOLUNTEER')).toBe('volunteer')
    expect(normalizeRole('DEVOTEE')).toBe('devotee')
    expect(normalizeRole('unknown')).toBe('devotee') // Default fallback
  })

  it('should export permission functions', async () => {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = await import('@/types/user')
    
    // Super admin should have all permissions
    expect(hasPermission('super_admin', 'manage_users')).toBe(true)
    expect(hasPermission('super_admin', 'manage_settings')).toBe(true)
    expect(hasPermission('super_admin', 'access_admin')).toBe(true)

    // Devotee should have no special permissions
    expect(hasPermission('devotee', 'manage_users')).toBe(false)
    expect(hasPermission('devotee', 'access_dashboard')).toBe(false)

    // Admin should have manage_content but not manage_users or manage_settings
    expect(hasPermission('admin', 'manage_content')).toBe(true)
    expect(hasPermission('admin', 'manage_users')).toBe(false)
    expect(hasPermission('admin', 'manage_settings')).toBe(false)

    // Test hasAnyPermission - admin has manage_content
    expect(hasAnyPermission('admin', ['manage_content', 'manage_settings'])).toBe(true)
    expect(hasAnyPermission('admin', ['manage_users', 'manage_settings'])).toBe(false)
    expect(hasAnyPermission('volunteer', ['manage_users', 'manage_settings'])).toBe(false)

    // Test hasAllPermissions
    expect(hasAllPermissions('admin', ['manage_content', 'manage_events'])).toBe(true)
    expect(hasAllPermissions('admin', ['manage_users', 'manage_content'])).toBe(false)
  })
})
