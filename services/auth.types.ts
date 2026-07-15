/**
 * Auth Types
 * Shared types for authentication - safe to import in both client and server code
 */

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

export interface LoginResult {
  success: boolean
  error?: string
}
