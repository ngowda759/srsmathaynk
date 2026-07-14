/**
 * Authentication module - Firebase has been removed
 * This module provides stub functions that indicate auth is not available
 */

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}

export async function registerUser(
  name: string,
  email: string,
  phone: string,
  password: string
) {
  throw new Error("Registration is not available - backend services have been removed");
}

export async function loginUser(
  email: string,
  password: string
) {
  throw new Error("Login is not available - backend services have been removed");
}

export async function logoutUser() {
  // No-op since Firebase auth is removed
}

export async function resetPassword(email: string) {
  throw new Error("Password reset is not available - backend services have been removed");
}

export async function resendVerification(user: User) {
  throw new Error("Email verification is not available - backend services have been removed");
}
