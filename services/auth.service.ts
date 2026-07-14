/**
 * Auth Service using Supabase Auth
 */
import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import type { User } from '@supabase/supabase-js'

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
  role: string
  phone: string | null
  avatarUrl: string | null
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
            role: 'USER',
          },
        })

        return {
          success: true,
          user: {
            id: data.user.id,
            email: data.user.email!,
            name,
            role: 'USER',
            phone,
            avatarUrl: null,
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

        return {
          success: true,
          user: {
            id: data.user.id,
            email: data.user.email!,
            name: profile?.name || data.user.user_metadata?.name || null,
            role: profile?.role || 'USER',
            phone: profile?.phone || data.user.user_metadata?.phone || null,
            avatarUrl: profile?.avatarUrl || null,
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
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
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
        role: profile.role,
        phone: profile.phone,
        avatarUrl: profile.avatarUrl,
      }
    } catch {
      return null
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<AuthResult> {
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
          role: profile.role,
          phone: profile.phone,
          avatarUrl: profile.avatarUrl,
        },
      }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Check if user has required role
   */
  async hasRole(userId: string, requiredRoles: string[]): Promise<boolean> {
    try {
      const profile = await prisma.profile.findUnique({
        where: { userId },
      })

      if (!profile) return false

      return requiredRoles.includes(profile.role)
    } catch {
      return false
    }
  }
}

export const authService = new AuthService()
