/**
 * Auth Client Service
 * Client-safe authentication methods
 * This file can be imported in client components (no server-only dependencies)
 */
import { createClient, User } from "@supabase/supabase-js"
import type { UserProfile, UserRole } from "./auth.types"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function register(data: {
  name: string
  email: string
  phone: string
  password: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone,
        },
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut()
}

export async function forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password&type=recovery`,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function updatePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
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

export function getSupabaseClient() {
  return supabase
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser()
  return data.user
}
