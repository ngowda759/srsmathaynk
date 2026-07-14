/**
 * Event types - Firebase has been removed
 * Using Date instead of Firebase Timestamp
 */

export type EventStatus =
  | "Upcoming"
  | "Ongoing"
  | "Completed";

export interface TempleEvent {
  id?: string;
  title: string;
  description: string;
  location: string;

  // Event Dates
  startDate: Date | string;
  endDate: Date | string;

  // Event Time
  startTime?: string;
  endTime?: string;

  // Homepage
  featured: boolean;
  published: boolean;

  // Classification
  category?: string;

  // Media
  imageUrl?: string;

  // Legacy (will be removed later)
  status: EventStatus;

  createdAt?: Date | string;
  updatedAt?: Date | string;
}
