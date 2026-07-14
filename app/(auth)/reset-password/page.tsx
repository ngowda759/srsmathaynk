"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

import Button from "@/components/ui/button"
import Card from "@/components/ui/card"
import Input from "@/components/ui/input"

const schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetPasswordValues = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isValidToken, setIsValidToken] = useState(false)
  const [tokenError, setTokenError] = useState("")

  const supabase = createClient()

  useEffect(() => {
    const verifyToken = async () => {
      // Check for OAuth reset or session-based reset
      const { error } = await supabase.auth.getSession()
      
      // If we have a session from the reset link, we're good
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsValidToken(true)
        setIsLoading(false)
        return
      }

      // Check URL for error (e.g., token expired)
      const errorParam = searchParams.get("error")
      const errorDescription = searchParams.get("error_description")
      
      if (errorParam) {
        setTokenError(errorDescription || "Invalid or expired reset link")
        setIsLoading(false)
        return
      }

      // Check for code in URL (Supabase auth code)
      const code = searchParams.get("code")
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          setTokenError(exchangeError.message)
          setIsLoading(false)
          return
        }
        setIsValidToken(true)
      }
      
      setIsLoading(false)
    }

    verifyToken()
  }, [searchParams, supabase])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: ResetPasswordValues) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Password updated successfully!")
      router.push("/login")
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-stone-50">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-4" />
            <p className="text-stone-600">Verifying reset link...</p>
          </div>
        </Card>
      </div>
    )
  }

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-stone-50">
        <Card className="w-full max-w-md p-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-red-600">Invalid Reset Link</h2>
            <p className="text-stone-600">{tokenError}</p>
            <p className="text-stone-500 text-sm">
              Please request a new password reset link.
            </p>
            <Button onClick={() => router.push("/forgot-password")}>
              Request New Link
            </Button>
            <p className="pt-4">
              <Link href="/login" className="text-orange-600 hover:underline">
                Back to Sign In
              </Link>
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-stone-50">
      <Card className="w-full max-w-md">
        <div className="p-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold font-heading">Set New Password</h2>
            <p className="text-stone-600">
              Enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div className="relative">
              <Input
                label="New Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                error={errors.password?.message}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-11 text-stone-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-11 text-stone-500"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <Button type="submit" loading={isSubmitting}>
              Update Password
            </Button>

            <p className="text-center text-sm text-stone-600">
              Remembered your password?{" "}
              <Link href="/login" className="font-medium text-orange-600 hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </Card>
    </div>
  )
}
