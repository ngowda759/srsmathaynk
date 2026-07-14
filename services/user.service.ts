/**
 * User Service - Firebase has been removed
 * This service now returns empty arrays as no backend is available
 */

import { TempleUser, TempleUserCreate, TempleUserUpdate } from "@/types/user";

const COLLECTION = "users";

class UserService {
  async getUsers(): Promise<TempleUser[]> {
    console.log("[UserService] Firebase removed - returning empty array");
    return [];
  }

  async getUser(id: string): Promise<TempleUser | null> {
    return null;
  }

  async addUser(user: TempleUserCreate) {
    throw new Error("User creation is not available - backend services have been removed");
  }

  async updateUser(
    id: string,
    user: TempleUserUpdate
  ) {
    throw new Error("User update is not available - backend services have been removed");
  }

  async deleteUser(id: string) {
    throw new Error("User deletion is not available - backend services have been removed");
  }
}

export const userService = new UserService();
