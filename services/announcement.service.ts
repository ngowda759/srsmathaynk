/**
 * Announcement Service - Firebase has been removed
 * This service now returns empty arrays as no backend is available
 */

import { Announcement, AnnouncementRequest } from "@/types/announcement";

const COLLECTION = "announcements";

class AnnouncementService {
  async getAnnouncements(): Promise<Announcement[]> {
    console.log("[AnnouncementService] Firebase removed - returning empty array");
    return [];
  }
  
  async getActiveAnnouncements(): Promise<Announcement[]> {
    return [];
  }

  async addAnnouncement(announcement: AnnouncementRequest) {
    throw new Error("Announcement creation is not available - backend services have been removed");
  }

  async updateAnnouncement(id: string, announcement: Partial<AnnouncementRequest>) {
    throw new Error("Announcement update is not available - backend services have been removed");
  }

  async deleteAnnouncement(id: string) {
    throw new Error("Announcement deletion is not available - backend services have been removed");
  }

  async getAnnouncement(id: string) {
    return null;
  }
}

export const announcementService = new AnnouncementService();
