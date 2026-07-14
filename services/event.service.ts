/**
 * Event Service - Firebase has been removed
 * This service now returns empty arrays as no backend is available
 */

import { TempleEvent } from "@/types/event";

// Helper function to convert date to timestamp for sorting
function toTimestamp(date: any): number {
  if (!date) return 0;
  if (typeof date === 'string') {
    return new Date(date).getTime();
  }
  if (typeof date === 'number') {
    return date;
  }
  if (date.toDate && typeof date.toDate === 'function') {
    return date.toDate().getTime();
  }
  return 0;
}

class EventService {
  async getEvents(): Promise<TempleEvent[]> {
    console.log("[EventService] Firebase removed - returning empty array");
    return [];
  }

  async getEvent(id: string): Promise<TempleEvent | null> {
    return null;
  }

  async addEvent(event: TempleEvent) {
    throw new Error("Event creation is not available - backend services have been removed");
  }

  async updateEvent(id: string, event: Partial<TempleEvent>) {
    throw new Error("Event update is not available - backend services have been removed");
  }

  async deleteEvent(id: string) {
    throw new Error("Event deletion is not available - backend services have been removed");
  }

  async getPublishedEvents(): Promise<TempleEvent[]> {
    return [];
  }

  async getUpcomingEvents(max = 3): Promise<TempleEvent[]> {
    return [];
  }

  async getPastEvents(): Promise<TempleEvent[]> {
    return [];
  }

  async getFeaturedEvent(): Promise<TempleEvent | null> {
    return null;
  }
}

export const eventService = new EventService();
