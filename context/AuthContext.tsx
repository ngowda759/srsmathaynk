"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { createClient, User } from "@supabase/supabase-js"
import { login, register, logout, forgotPassword, updatePassword, getSupabaseClient } from "@/services/auth.client"
import type { UserProfile, UserRole } from "@/services/auth.types"
import { normalizeRole, NormalizedRole, Permission, hasPermission } from "@/types/user"

// Create a Supabase client for client-side use
const supabase = getSupabaseClient()

export type { UserProfile, UserRole }

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  normalizedRole: NormalizedRole
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  refreshProfile: () => Promise<void>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  // Legacy permission checks
  canAccessAdmin: boolean
  canAccessSettings: boolean
  canAccessFinance: boolean
  canManageUsers: boolean
  canAccessBilling: boolean
  canAccessAdministration: boolean
  // New granular permissions
  can: (permission: Permission) => boolean
  canAny: (permissions: Permission[]) => boolean
  canAll: (permissions: Permission[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile() {
    try {
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.error("Failed to load user profile:", error)
      setProfile(null)
    }
  }

  async function refreshProfile() {
    setLoading(true)
    await loadProfile()
    setLoading(false)
  }

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          await loadProfile()
        }
      } catch (error) {
        console.error("Failed to get session:", error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await loadProfile()
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function handleLogin(email: string, password: string) {
    const result = await login(email, password)
    if (result.success) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await loadProfile()
      }
    }
    return result
  }

  async function handleRegister(data: { name: string; email: string; phone: string; password: string }) {
    const result = await register(data)
    if (result.success) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await loadProfile()
      }
    }
    return result
  }

  async function handleLogout() {
    await logout()
    setUser(null)
    setProfile(null)
  }

  // Role-based permissions
  const normalizedRole = profile?.role ? normalizeRole(profile.role) : "devotee"
  
  // Legacy permission checks (for backwards compatibility)
  const canAccessAdmin = normalizedRole !== "devotee" && normalizedRole !== "volunteer"
  const canAccessSettings = normalizedRole === "super_admin" || normalizedRole === "admin"
  const canAccessFinance = normalizedRole === "super_admin" || normalizedRole === "admin"
  const canManageUsers = normalizedRole === "super_admin"
  const canAccessBilling = normalizedRole === "super_admin" || normalizedRole === "admin"
  const canAccessAdministration = normalizedRole === "super_admin"

  // New granular permissions
  const can = (permission: Permission) => hasPermission(normalizedRole, permission)
  const canAny = (permissions: Permission[]) => permissions.some(p => hasPermission(normalizedRole, p))
  const canAll = (permissions: Permission[]) => permissions.every(p => hasPermission(normalizedRole, p))

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        normalizedRole,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        forgotPassword,
        refreshProfile,
        updatePassword,
        canAccessAdmin,
        canAccessSettings,
        canAccessFinance,
        canManageUsers,
        canAccessBilling,
        canAccessAdministration,
        can,
        canAny,
        canAll,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider")
  }
  return context
}

