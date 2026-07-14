/**
 * Pooja Service - Firebase has been removed
 * This service now returns empty arrays as no backend is available
 */

import { DailyPooja, PoojaStats } from "@/types/pooja";

const COLLECTION_NAME = "dailyPoojas";

export const poojaService = {
  async getPoojas(): Promise<DailyPooja[]> {
    console.log("[PoojaService] Firebase removed - returning empty array");
    return [];
  },

  async getPoojaById(id: string): Promise<DailyPooja | null> {
    return null;
  },

  async createPooja(
    data: Omit<DailyPooja, "id" | "createdAt" | "createdBy">,
    userEmail: string
  ): Promise<string> {
    throw new Error("Pooja creation is not available - backend services have been removed");
  },

  async updatePooja(
    id: string,
    data: Partial<Omit<DailyPooja, "id" | "createdAt" | "createdBy">>
  ): Promise<void> {
    throw new Error("Pooja update is not available - backend services have been removed");
  },

  async deletePooja(id: string): Promise<void> {
    throw new Error("Pooja deletion is not available - backend services have been removed");
  },

  async getStats(): Promise<PoojaStats> {
    return {
      total: 0,
      active: 0,
      byCategory: {},
      withSeva: 0,
    };
  },
};
