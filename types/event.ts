/**
 * Event Types - Aligns with Prisma schema
 * Replaces Firebase-based types
 */

// Event classification types
export type EventType =
  | "GENERAL"
  | "FESTIVAL"
  | "WORKSHOP"
  | "SPIRITUAL"
  | "CULTURAL"
  | "MAINTENANCE";

// Event status types
export type EventStatus =
  | "UPCOMING"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED";

// Event interface matching Prisma schema
export interface TempleEvent {
  id: string;
  title: string;
  titleKn?: string | null;

  description?: string | null;
  descriptionKn?: string | null;

  // Event Dates
  startDate: Date;
  endDate: Date;
  startTime?: string | null;
  endTime?: string | null;

  // Location
  location?: string | null;
  isOnline: boolean;
  onlineLink?: string | null;

  // Classification
  type: EventType;
  status: EventStatus;

  // Homepage
  featured: boolean;
  published: boolean;

  // Media
  imageId?: string | null;
  bannerId?: string | null;
  imageUrl?: string | null;
  bannerUrl?: string | null;

  // Capacity
  maxAttendees?: number | null;
  currentAttendees: number;

  // Contact
  organizer?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;

  // Audit fields
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  createdById?: string | null;
  updatedById?: string | null;
}

// Request types for creating/updating events
export interface EventRequest {
  title: string;
  titleKn?: string;
  description?: string;
  descriptionKn?: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  isOnline?: boolean;
  onlineLink?: string;
  type?: EventType;
  status?: EventStatus;
  featured?: boolean;
  published?: boolean;
  imageId?: string;
  bannerId?: string;
  maxAttendees?: number;
  organizer?: string;
  contactPhone?: string;
  contactEmail?: string;
}

// Query parameters for filtering events
export interface EventQuery {
  status?: EventStatus;
  type?: EventType;
  featured?: boolean;
  published?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

// Helper to compute event status from dates
export function computeEventStatus(
  startDate: Date,
  endDate: Date
): EventStatus {
  const now = new Date();
  if (now < startDate) return "UPCOMING";
  if (now > endDate) return "COMPLETED";
  return "ONGOING";
}

// Event type labels for UI
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  GENERAL: "General",
  FESTIVAL: "Festival",
  WORKSHOP: "Workshop",
  SPIRITUAL: "Spiritual",
  CULTURAL: "Cultural",
  MAINTENANCE: "Maintenance",
};

// Event status labels for UI
export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  UPCOMING: "Upcoming",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// TODO: Future - Event Recurrence (Phase 5+)
// Currently events are one-off. For recurring events, consider:
// 
// enum RecurrenceRule {
//   DAILY
//   WEEKLY
//   BIWEEKLY
//   MONTHLY
//   ANNUALLY
//   EKADASHI      // Every Ekadashi (11th lunar day)
//   THURSDAY      // Every Thursday
//   MADHWA_NAVAMI // Madhwa Navami (农历9月)
//   PANCHAKA      // Panchaka period
// }
//
// model Event {
//   ...
//   // Recurrence
//   isRecurring    Boolean          @default(false)
//   recurrenceRule RecurrenceRule?
//   recurrenceEnd  DateTime?        // End date for recurrence
//   parentEventId  String?          // For recurring event instances
//   parentEvent    Event?           @relation("EventInstances", fields: [parentEventId], references: [id])
//   instances      Event[]          @relation("EventInstances")
// }
