/**
 * Seva Service - Firebase has been removed
 * This service now returns empty arrays as no backend is available
 */

import { Seva, SevaRequest } from "@/types/seva";

const COLLECTION = "sevas";

class SevaService {
  async getAllSevas(): Promise<Seva[]> {
    console.log("[SevaService] Firebase removed - returning empty array");
    return [];
  }

  async getSevaById(id: string): Promise<Seva | null> {
    return null;
  }

  async createSeva(data: SevaRequest) {
    throw new Error("Seva creation is not available - backend services have been removed");
  }

  async updateSeva(id: string, data: Partial<SevaRequest>) {
    throw new Error("Seva update is not available - backend services have been removed");
  }

  async deleteSeva(id: string) {
    throw new Error("Seva deletion is not available - backend services have been removed");
  }
}

export const sevaService = new SevaService();
