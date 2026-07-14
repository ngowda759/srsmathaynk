/**
 * Events Repository Types
 */

import { Event, EventBooking, Festival, Panchanga, PoojaSchedule } from "@prisma/client"

export type { Event, EventBooking, Festival, Panchanga, PoojaSchedule }

// Event Types
export interface EventWithBookings extends Event {
  bookings?: EventBooking[]
  _count?: {
    bookings: number
  }
}

export interface CreateEventDTO {
  title: string
  titleKannada?: string
  description?: string
  descriptionKannada?: string
  startDate: Date
  endDate: Date
  startTime?: string
  endTime?: string
  location?: string
  isOnline?: boolean
  onlineLink?: string
  type?: "GENERAL" | "FESTIVAL" | "WORKSHOP" | "SPIRITUAL" | "CULTURAL" | "MAINTENANCE"
  status?: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED"
  featured?: boolean
  published?: boolean
  imageUrl?: string
  bannerUrl?: string
  maxAttendees?: number
  organizer?: string
  contactPhone?: string
  contactEmail?: string
}

export interface UpdateEventDTO extends Partial<CreateEventDTO> {
  currentAttendees?: number
}

export interface EventFilters {
  type?: string
  status?: string
  featured?: boolean
  published?: boolean
  startDate?: Date
  endDate?: Date
  search?: string
}

export interface EventListParams {
  page?: number
  limit?: number
  filters?: EventFilters
  orderBy?: { field: string; order?: "asc" | "desc" }
}

// Event Booking Types
export interface CreateEventBookingDTO {
  eventId: string
  userId?: string
  attendeeName: string
  attendeeEmail: string
  attendeePhone?: string
  tickets?: number
  notes?: string
}

export interface UpdateEventBookingDTO {
  tickets?: number
  status?: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
  notes?: string
}

// Festival Types
export interface CreateFestivalDTO {
  name: string
  nameKannada?: string
  date: Date
  endDate?: Date
  description?: string
  descriptionKannada?: string
  significance?: string
  imageUrl?: string
  isMajorFestival?: boolean
  isHoliday?: boolean
}

export interface UpdateFestivalDTO extends Partial<CreateFestivalDTO> {}

// Panchanga Types
export interface PanchangaFilters {
  month?: number
  year?: number
  startDate?: Date
  endDate?: Date
}

// Pooja Schedule Types
export interface CreatePoojaScheduleDTO {
  name: string
  nameKannada?: string
  time: string
  description?: string
  descriptionKannada?: string
  category?: string
  isSpecial?: boolean
  active?: boolean
  order?: number
}

export interface UpdatePoojaScheduleDTO extends Partial<CreatePoojaScheduleDTO> {}
