/**
 * Auth Service using Supabase Auth
 */
import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import type { User } from '@supabase/supabase-js'
import { UserRole } from '@/types/user'

export interface RegisterData {
  name: string
  email: string
  phone: string
  password: string
}

export interface UserProfile {
  id: string
  email: string
  name: string | null
  role: UserRole
  phone: string | null
  avatarUrl: string | null
  emailVerified: boolean
  isActive: boolean
}

export interface AuthResult {
  success: boolean
  user?: UserProfile
  error?: string
}

class AuthService {
  /**
   * Register a new user
   */
  async register({ name, email, phone, password }: RegisterData): Promise<AuthResult> {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
          },
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Create profile in database
        await prisma.profile.create({
          data: {
            userId: data.user.id,
            email: data.user.email!,
            name,
            phone,
            role: 'DEVOTEE',
          },
        })

        return {
          success: true,
          user: {
            id: data.user.id,
            email: data.user.email!,
            name,
            role: 'DEVOTEE' as UserRole,
            phone,
            avatarUrl: null,
            emailVerified: false,
            isActive: true,
          },
        }
      }

      return { success: false, error: 'Registration failed' }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Login a user
   */
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Get user profile from database
        const profile = await prisma.profile.findUnique({
          where: { userId: data.user.id },
        })

        // Update last login
        if (profile) {
          await prisma.profile.update({
            where: { userId: data.user.id },
            data: { lastLoginAt: new Date() },
          })
        }

        return {
          success: true,
          user: {
            id: data.user.id,
            email: data.user.email!,
            name: profile?.name || data.user.user_metadata?.name || null,
            role: (profile?.role as UserRole) || 'DEVOTEE',
            phone: profile?.phone || data.user.user_metadata?.phone || null,
            avatarUrl: profile?.avatarUrl || null,
            emailVerified: profile?.emailVerified || false,
            isActive: profile?.isActive !== false,
          },
        }
      }

      return { success: false, error: 'Login failed' }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  /**
   * Send password reset email
   */
  async forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback?next=/reset-password&type=recovery`,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Update password (for logged in users)
   */
  async updatePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()
      
      // First verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || '',
        password: currentPassword,
      })

      if (signInError) {
        return { success: false, error: 'Current password is incorrect' }
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Get current session (server-side)
   */
  async getSession(): Promise<User | null> {
    try {
      const supabase = await createServerClient()
      const { data: { user } } = await supabase.auth.getUser()
      return user
    } catch {
      return null
    }
  }

  /**
   * Get user profile from database
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const profile = await prisma.profile.findUnique({
        where: { userId },
      })

      if (!profile) return null

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as UserRole,
        phone: profile.phone,
        avatarUrl: profile.avatarUrl,
        emailVerified: profile.emailVerified,
        isActive: profile.isActive,
      }
    } catch {
      return null
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: { name?: string; phone?: string; avatarUrl?: string }): Promise<AuthResult> {
    try {
      const profile = await prisma.profile.update({
        where: { userId },
        data,
      })

      return {
        success: true,
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role as UserRole,
          phone: profile.phone,
          avatarUrl: profile.avatarUrl,
          emailVerified: profile.emailVerified,
          isActive: profile.isActive,
        },
      }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Check if user has required role
   */
  async hasRole(userId: string, requiredRoles: UserRole[]): Promise<boolean> {
    try {
      const profile = await prisma.profile.findUnique({
        where: { userId },
      })

      if (!profile) return false

      return requiredRoles.includes(profile.role as UserRole)
    } catch {
      return false
    }
  }

  /**
   * Create or update profile on login (auto-provisioning)
   */
  async syncProfile(user: User): Promise<UserProfile | null> {
    try {
      const existingProfile = await prisma.profile.findUnique({
        where: { userId: user.id },
      })

      if (existingProfile) {
        // Update last login
        await prisma.profile.update({
          where: { userId: user.id },
          data: { lastLoginAt: new Date() },
        })
        return {
          id: existingProfile.id,
          email: existingProfile.email,
          name: existingProfile.name,
          role: existingProfile.role as UserRole,
          phone: existingProfile.phone,
          avatarUrl: existingProfile.avatarUrl,
          emailVerified: existingProfile.emailVerified,
          isActive: existingProfile.isActive,
        }
      }

      // Create new profile
      const newProfile = await prisma.profile.create({
        data: {
          userId: user.id,
          email: user.email!,
          name: user.user_metadata?.name || null,
          phone: user.user_metadata?.phone || null,
          role: 'DEVOTEE',
        },
      })

      return {
        id: newProfile.id,
        email: newProfile.email,
        name: newProfile.name,
        role: newProfile.role as UserRole,
        phone: newProfile.phone,
        avatarUrl: newProfile.avatarUrl,
        emailVerified: newProfile.emailVerified,
        isActive: newProfile.isActive,
      }
    } catch {
      return null
    }
  }
}

export const authService = new AuthService()
