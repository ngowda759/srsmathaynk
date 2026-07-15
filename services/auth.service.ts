/**
 * Auth Service using Supabase Auth
 * Profile uses RBAC with Role and UserRole tables
 */
import { createClient } from '@/lib/supabase/client'
import { prisma } from '@/lib/db'
import type { User } from '@supabase/supabase-js'

export type UserRole = 'DEVOTEE' | 'VOLUNTEER' | 'PRIEST' | 'STAFF' | 'ADMIN' | 'SUPER_ADMIN'

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
   * Get user's roles from UserRole table
   */
  private async getUserRoles(profileId: string): Promise<UserRole[]> {
    const userRoles = await prisma.userRole.findMany({
      where: { profileId },
      include: { role: true },
    })
    return userRoles.map(ur => ur.role.name.replace(' ', '_').toUpperCase() as UserRole)
  }

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
        const profile = await prisma.profile.create({
          data: {
            userId: data.user.id,
            email: data.user.email!,
            name,
            phone,
          },
        })

        // Assign DEVOTEE role
        const devoteeRole = await prisma.role.findUnique({
          where: { name: 'DEVOTEE' },
        })
        if (devoteeRole) {
          await prisma.userRole.create({
            data: {
              profileId: profile.id,
              roleId: devoteeRole.id,
            },
          })
        }

        return {
          success: true,
          user: {
            id: data.user.id,
            email: data.user.email!,
            name,
            role: 'DEVOTEE',
            phone,
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

        const roles = profile ? await this.getUserRoles(profile.id) : []
        const role = roles.length > 0 ? roles[0] : 'DEVOTEE'

        return {
          success: true,
          user: {
            id: data.user.id,
            email: data.user.email!,
            name: profile?.name || (data.user.user_metadata as Record<string, unknown>)?.name as string || null,
            role,
            phone: profile?.phone || (data.user.user_metadata as Record<string, unknown>)?.phone as string || null,
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
   * Get current session
   */
  async getSession(): Promise<User | null> {
    try {
      const supabase = createClient()
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

      const roles = await this.getUserRoles(profile.id)
      const role = roles.length > 0 ? roles[0] : 'DEVOTEE'

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role,
        phone: profile.phone,
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
  async updateProfile(userId: string, data: { name?: string; phone?: string }): Promise<AuthResult> {
    try {
      const profile = await prisma.profile.update({
        where: { userId },
        data,
      })

      const roles = await this.getUserRoles(profile.id)
      const role = roles.length > 0 ? roles[0] : 'DEVOTEE'

      return {
        success: true,
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role,
          phone: profile.phone,
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

      const roles = await this.getUserRoles(profile.id)
      return requiredRoles.some(role => roles.includes(role))
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
        const roles = await this.getUserRoles(existingProfile.id)
        const role = roles.length > 0 ? roles[0] : 'DEVOTEE'
        return {
          id: existingProfile.id,
          email: existingProfile.email,
          name: existingProfile.name,
          role,
          phone: existingProfile.phone,
          emailVerified: existingProfile.emailVerified,
          isActive: existingProfile.isActive,
        }
      }

      // Create new profile
      const newProfile = await prisma.profile.create({
        data: {
          userId: user.id,
          email: user.email!,
          name: (user.user_metadata as Record<string, unknown>)?.name as string || null,
          phone: (user.user_metadata as Record<string, unknown>)?.phone as string || null,
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

      return {
        id: newProfile.id,
        email: newProfile.email,
        name: newProfile.name,
        role: 'DEVOTEE',
        phone: newProfile.phone,
        emailVerified: newProfile.emailVerified,
        isActive: newProfile.isActive,
      }
    } catch {
      return null
    }
  }
}

export const authService = new AuthService()
