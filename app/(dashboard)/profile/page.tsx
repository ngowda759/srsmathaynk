"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { UserRole } from "@/types/user"
import { Eye, EyeOff, Shield, Mail, Phone, Calendar } from "lucide-react"
import toast from "react-hot-toast"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import Card from "@/components/ui/card"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(/^[+]?[\d\s-]{10,}$/, "Invalid phone number").optional().or(z.literal("")),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ProfileFormValues = z.infer<typeof profileSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

const roleLabels: Record<UserRole, string> = {
  DEVOTEE: "Devotee",
  VOLUNTEER: "Volunteer",
  PRIEST: "Priest",
  STAFF: "Staff",
  ADMIN: "Administrator",
  SUPER_ADMIN: "Super Administrator",
}

export default function ProfilePage() {
  const router = useRouter()
  const { profile, loading, refreshProfile, updatePassword } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
    reset: resetProfile,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
      phone: profile?.phone || "",
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    reset: resetPassword,
  } = useForm<PasswordFormValues>()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    router.push("/login")
    return null
  }

  async function onProfileSubmit(data: ProfileFormValues) {
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      toast.success("Profile updated successfully!")
      await refreshProfile()
      setIsEditing(false)
      resetProfile(data)
    } catch (error) {
      toast.error("Failed to update profile")
    }
  }

  async function onPasswordSubmit(data: PasswordFormValues) {
    const result = await updatePassword(data.currentPassword, data.newPassword)
    
    if (!result.success) {
      toast.error(result.error || "Failed to update password")
      return
    }

    toast.success("Password updated successfully!")
    setShowPasswordForm(false)
    resetPassword()
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-heading">My Profile</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>

      {/* Profile Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Profile Information</h2>
            <p className="text-stone-500 text-sm">Update your personal details</p>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
            <Input
              label="Name"
              {...registerProfile("name")}
              error={profileErrors.name?.message}
            />
            <Input
              label="Phone"
              type="tel"
              {...registerProfile("phone")}
              error={profileErrors.phone?.message}
            />
            <div className="flex gap-4">
              <Button type="submit" loading={isProfileSubmitting}>
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  resetProfile()
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-stone-400" />
              <div>
                <p className="text-sm text-stone-500">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-stone-400" />
              <div>
                <p className="text-sm text-stone-500">Role</p>
                <p className="font-medium">{roleLabels[profile.role] || profile.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-stone-400" />
              <div>
                <p className="text-sm text-stone-500">Phone</p>
                <p className="font-medium">{profile.phone || "Not set"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-stone-400" />
              <div>
                <p className="text-sm text-stone-500">Email Verified</p>
                <p className="font-medium">{profile.emailVerified ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Password Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Change Password</h2>
            <p className="text-stone-500 text-sm">Update your password</p>
          </div>
          {!showPasswordForm && (
            <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
              Change Password
            </Button>
          )}
        </div>

        {showPasswordForm ? (
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="relative">
              <Input
                label="Current Password"
                type={showPasswords.current ? "text" : "password"}
                {...registerPassword("currentPassword")}
                error={passwordErrors.currentPassword?.message}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                className="absolute right-4 top-11 text-stone-500"
              >
                {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative">
              <Input
                label="New Password"
                type={showPasswords.new ? "text" : "password"}
                {...registerPassword("newPassword")}
                error={passwordErrors.newPassword?.message}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-4 top-11 text-stone-500"
              >
                {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative">
              <Input
                label="Confirm New Password"
                type={showPasswords.confirm ? "text" : "password"}
                {...registerPassword("confirmPassword")}
                error={passwordErrors.confirmPassword?.message}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-4 top-11 text-stone-500"
              >
                {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="flex gap-4">
              <Button type="submit" loading={isPasswordSubmitting}>
                Update Password
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPasswordForm(false)
                  resetPassword()
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-stone-500">Click the button above to change your password.</p>
        )}
      </Card>

      {/* Account Info */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="space-y-2 text-sm text-stone-500">
          <p>Account ID: {profile.id}</p>
          <p>Account Status: {profile.isActive ? "Active" : "Inactive"}</p>
        </div>
      </Card>
    </div>
  )
}
