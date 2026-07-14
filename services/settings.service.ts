/**
 * Settings Service - Firebase has been removed
 * This service now returns null/throws errors as no backend is available
 */

import { SiteSettings, SiteSettingsPayload } from "@/types/settings";

const COLLECTION = "settings";

class SettingsService {
  async getSettings(): Promise<SiteSettings | null> {
    console.log("[SettingsService] Firebase removed - returning null");
    return null;
  }

  async createSettings(data: SiteSettingsPayload): Promise<string> {
    throw new Error("Settings creation is not available - backend services have been removed");
  }

  async updateSettings(id: string, data: Partial<SiteSettingsPayload>) {
    throw new Error("Settings update is not available - backend services have been removed");
  }
}

export const settingsService = new SettingsService();
