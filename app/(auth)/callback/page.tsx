"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import toast from "react-hot-toast"

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  const supabase = createClient()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code")
        const next = searchParams.get("next") || "/"
        const type = searchParams.get("type") // email_verification, recovery, etc.

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)

          if (error) {
            setStatus("error")
            setMessage(error.message)
            toast.error("Authentication failed")
            setTimeout(() => router.push("/login"), 2000)
            return
          }

          if (data.user) {
            setStatus("success")

            // Different messages based on callback type
            if (type === "email_verification") {
              setMessage("Email verified successfully!")
              toast.success("Email verified!")
            } else if (type === "recovery") {
              setMessage("Password reset link accepted!")
              toast.success("Password reset!")
              setTimeout(() => router.push("/reset-password"), 1000)
              return
            } else {
              setMessage("Authentication successful!")
              toast.success("Welcome!")
            }

            setTimeout(() => router.push(next), 1000)
          }
        } else {
          // No code, check for existing session
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            setStatus("success")
            setMessage("Already signed in!")
            setTimeout(() => router.push(next), 1000)
          } else {
            setStatus("error")
            setMessage("No authentication code found")
            setTimeout(() => router.push("/login"), 2000)
          }
        }
      } catch (error) {
        console.error("Callback error:", error)
        setStatus("error")
        setMessage("An unexpected error occurred")
        setTimeout(() => router.push("/login"), 2000)
      }
    }

    handleCallback()
  }, [searchParams, router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-stone-50">
      <div className="text-center">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium text-stone-700">Authenticating...</p>
            <p className="text-sm text-stone-500">Please wait</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-medium text-stone-700">{message}</p>
            <p className="text-sm text-stone-500">Redirecting...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-lg font-medium text-red-600">{message}</p>
            <p className="text-sm text-stone-500">Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-stone-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg font-medium text-stone-700">Loading...</p>
        <p className="text-sm text-stone-500">Please wait</p>
      </div>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CallbackContent />
    </Suspense>
  )
}
