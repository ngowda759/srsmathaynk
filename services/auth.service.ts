/**
 * Auth Service - Firebase has been removed
 * This service now provides stub functions as no backend is available
 */

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface UserCredential {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    emailVerified: boolean;
  };
}

class AuthService {
  async register({
    name,
    email,
    phone,
    password,
  }: RegisterData): Promise<UserCredential> {
    throw new Error("Registration is not available - backend services have been removed");
  }

  async login(
    email: string,
    password: string
  ): Promise<UserCredential> {
    throw new Error("Login is not available - backend services have been removed");
  }

  async logout(): Promise<void> {
    // No-op since Firebase auth is removed
  }

  async forgotPassword(email: string): Promise<void> {
    throw new Error("Password reset is not available - backend services have been removed");
  }

  async getUserProfile(uid: string) {
    return null;
  }

  currentUser() {
    return null;
  }
}

export const authService = new AuthService();
