import { createBrowserClient, isBrowser } from '@supabase/ssr'

/**
 * Create Supabase browser client for client-side usage
 * Uses @supabase/ssr for proper cookie-based session management
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Get current session from the client
 * Returns null if not in browser or no session
 */
export async function getSession() {
  if (!isBrowser()) {
    return null
  }
  
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * Get current user from the client
 * Returns null if not authenticated
 */
export async function getUser() {
  if (!isBrowser()) {
    return null
  }
  
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const user = await getUser()
  return user !== null
}
