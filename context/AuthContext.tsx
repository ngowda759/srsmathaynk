"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { createClient, User } from "@supabase/supabase-js"
import { authService, RegisterData, UserProfile } from "@/services/auth.service"
import { normalizeRole, NormalizedRole, UserRole } from "@/types/user"

// Create a Supabase client for client-side use
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  normalizedRole: NormalizedRole
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  refreshProfile: () => Promise<void>
  canAccessAdmin: boolean
  canAccessSettings: boolean
  canAccessFinance: boolean
  canManageUsers: boolean
  canAccessBilling: boolean
  canAccessAdministration: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId: string) {
    try {
      const data = await authService.getUserProfile(userId)
      setProfile(data)
    } catch (error) {
      console.error("Failed to load user profile:", error)
      setProfile(null)
    }
  }

  async function refreshProfile() {
    if (!user) return
    setLoading(true)
    await loadProfile(user.id)
    setLoading(false)
  }

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          await loadProfile(session.user.id)
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
          await loadProfile(session.user.id)
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

  async function login(email: string, password: string) {
    const result = await authService.login(email, password)
    if (result.success && result.user) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        setProfile(result.user)
      }
    }
    return { success: result.success, error: result.error }
  }

  async function register(data: RegisterData) {
    const result = await authService.register(data)
    if (result.success && result.user) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        setProfile(result.user)
      }
    }
    return { success: result.success, error: result.error }
  }

  async function logout() {
    await authService.logout()
    setUser(null)
    setProfile(null)
  }

  async function forgotPassword(email: string) {
    return authService.forgotPassword(email)
  }

  // Role-based permissions
  const normalizedRole = profile?.role ? normalizeRole(profile.role as UserRole) : "devotee"
  
  const canAccessAdmin = normalizedRole !== "devotee" && normalizedRole !== "volunteer"
  const canAccessSettings = normalizedRole === "super_admin" || normalizedRole === "admin"
  const canAccessFinance = normalizedRole === "super_admin" || normalizedRole === "billing"
  const canManageUsers = normalizedRole === "super_admin"
  const canAccessBilling = normalizedRole === "super_admin" || normalizedRole === "billing"
  const canAccessAdministration = normalizedRole === "super_admin"

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        normalizedRole,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        refreshProfile,
        canAccessAdmin,
        canAccessSettings,
        canAccessFinance,
        canManageUsers,
        canAccessBilling,
        canAccessAdministration,
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
