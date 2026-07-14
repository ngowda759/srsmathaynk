/**
 * Aaradhane Service - Firebase has been removed
 * This service now returns empty arrays as no backend is available
 */

import { Aaradhane, AaradhaneStats } from "@/types/aaradhane";

const COLLECTION_NAME = "aaradhane";

function isAaradhaneUpcoming(dates: string[]): boolean {
  if (!dates || dates.length === 0) return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  return dates.some(dateStr => {
    const eventDate = new Date(dateStr);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= now;
  });
}

export const aaradhaneService = {
  async getAaradhanes(): Promise<Aaradhane[]> {
    console.log("[AaradhaneService] Firebase removed - returning empty array");
    return [];
  },

  async getAaradhaneById(id: string): Promise<Aaradhane | null> {
    return null;
  },

  async createAaradhane(
    data: Omit<Aaradhane, "id" | "createdAt" | "createdBy">,
    userEmail: string
  ): Promise<string> {
    throw new Error("Aaradhane creation is not available - backend services have been removed");
  },

  async updateAaradhane(
    id: string,
    data: Partial<Omit<Aaradhane, "id" | "createdAt" | "createdBy">>
  ): Promise<void> {
    throw new Error("Aaradhane update is not available - backend services have been removed");
  },

  async deleteAaradhane(id: string): Promise<void> {
    throw new Error("Aaradhane deletion is not available - backend services have been removed");
  },

  async getStats(): Promise<AaradhaneStats> {
    return {
      total: 0,
      upcoming: 0,
      past: 0,
    };
  },
};
