/**
 * Environment validation utility
 * Ensures required environment variables are set
 */

export interface EnvSchema {
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  DATABASE_URL: string
}

export interface EnvValidationResult {
  valid: boolean
  missing: string[]
  invalid: string[]
}

const requiredVars: (keyof EnvSchema)[] = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
]

const urlVars: (keyof EnvSchema)[] = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "DATABASE_URL",
]

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function isValidNonEmpty(value: string | undefined): boolean {
  return typeof value === "string" && value.length > 0 && value !== "your-anon-key" && value !== "your-service-role-key"
}

export function validateEnv(): EnvValidationResult {
  const missing: string[] = []
  const invalid: string[] = []

  for (const key of requiredVars) {
    const value = process.env[key]

    if (!value) {
      missing.push(key)
      continue
    }

    if (!isValidNonEmpty(value)) {
      invalid.push(key)
      continue
    }

    if (urlVars.includes(key) && !isValidUrl(value)) {
      invalid.push(key)
    }
  }

  return {
    valid: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
  }
}

export function getEnvVar(key: keyof EnvSchema): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

// Check if we're running in development
export const isDevelopment = process.env.NODE_ENV === "development"
export const isProduction = process.env.NODE_ENV === "production"
export const isTest = process.env.NODE_ENV === "test"

// Log environment status on startup (server-side only)
export function logEnvStatus(): void {
  if (typeof window === "undefined") {
    const result = validateEnv()
    
    if (!result.valid) {
      console.warn("⚠️  Environment validation issues:")
      if (result.missing.length > 0) {
        console.warn("  Missing variables:", result.missing.join(", "))
      }
      if (result.invalid.length > 0) {
        console.warn("  Invalid variables:", result.invalid.join(", "))
      }
    } else {
      console.log("✅ All required environment variables are configured")
    }
  }
}
