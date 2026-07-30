"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/hooks/useAuth";
import { signInWithGoogle } from "@/services/auth.client";

import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";

import LoginHeader from "./LoginHeader";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof schema>;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, login } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    // Use setTimeout to avoid synchronous state update during effect
    const timer = setTimeout(() => {
      setIsClient(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // If user is already logged in, redirect to home (middleware will handle admin redirect)
  useEffect(() => {
    if (!loading && isClient && user) {
      // User is logged in - redirect to home page
      // The middleware will handle protecting /admin routes
      router.replace("/");
    }
  }, [loading, user, isClient, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: LoginFormValues) {
    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        toast.success("Welcome back!");
        // Use setTimeout to defer window.location modification
        setTimeout(() => {
          window.location.href = "/admin";
        }, 0);
      } else {
        // Handle Supabase-specific error messages
        const errorMessage = result.error?.toLowerCase() || "";
        
        if (errorMessage.includes("invalid login credentials") || 
            errorMessage.includes("invalid email or password") ||
            errorMessage.includes("wrong password")) {
          toast.error("Invalid email or password.");
        } else if (errorMessage.includes("user not found")) {
          toast.error("No account found with this email.");
        } else if (errorMessage.includes("email not confirmed") ||
                   errorMessage.includes("not confirmed")) {
          toast.error("Please verify your email address first.");
        } else if (errorMessage.includes("too many requests")) {
          toast.error("Too many login attempts. Please try again later.");
        } else {
          toast.error(result.error || "Login failed. Please try again.");
        }
      }
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      toast.error(err.message || "An unexpected error occurred.");
    }
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result.success) {
        toast.error(result.error || "Google sign-in failed.");
        setIsGoogleLoading(false);
      }
      // If successful, Supabase will redirect to the callback URL
    } catch (error) {
      toast.error("An unexpected error occurred.");
      setIsGoogleLoading(false);
    }
  }

  // Show loading spinner while checking auth
  if (loading || !isClient) {
    return (
      <Card className="w-full max-w-md rounded-b-3xl shadow-xl shadow-amber-500/10">
        <div className="p-12 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-4" />
          <p className="text-stone-600 font-medium">Loading...</p>
        </div>
      </Card>
    );
  }

  // Don't show form if user is logged in (will redirect)
  if (user) {
    return (
      <Card className="w-full max-w-md rounded-b-3xl shadow-xl shadow-amber-500/10">
        <div className="p-12 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-4" />
          <p className="text-stone-600 font-medium">Redirecting...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md rounded-b-3xl shadow-xl shadow-amber-500/10">
      <div className="p-8">
        <LoginHeader />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-5"
        >
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            {...register("email")}
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register("password")}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="absolute right-4 top-11 text-stone-500"
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Remember me
            </label>

            <Link
              href="/forgot-password"
              className="text-orange-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            loading={isSubmitting}
          >
            Sign In
          </Button>

          {/* Google OAuth */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-stone-500">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            loading={isGoogleLoading}
            className="flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <p className="text-center text-sm text-stone-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-orange-600 hover:underline"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </Card>
  );
}
