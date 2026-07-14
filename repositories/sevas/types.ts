/**
 * Sevas Repository Types
 */

import { Seva, SevaBooking } from "@prisma/client"

export type { Seva, SevaBooking }

// Seva Types
export interface CreateSevaDTO {
  name: string
  nameKannada?: string
  description?: string
  descriptionKannada?: string
  price?: number
  priceKannada?: number
  currency?: string
  duration?: string
  category?: string
  imageUrl?: string
  iconName?: string
  active?: boolean
  featured?: boolean
  maxPerDay?: number
  minAdvanceBooking?: number
  maxAdvanceBooking?: number
  instructions?: string
  benefits?: string
  order?: number
}

export interface UpdateSevaDTO extends Partial<CreateSevaDTO> {}

export interface SevaFilters {
  category?: string
  active?: boolean
  featured?: boolean
  priceMin?: number
  priceMax?: number
  search?: string
}

export interface SevaListParams {
  page?: number
  limit?: number
  filters?: SevaFilters
  orderBy?: { field: string; order?: "asc" | "desc" }
}

// Seva Booking Types
export interface CreateSevaBookingDTO {
  userId: string
  sevaId: string
  bookingDate: Date
  preferredTime?: string
  notes?: string
  amount: number
  currency?: string
  devoteeName?: string
  gothra?: string
  nakshatra?: string
}

export interface UpdateSevaBookingDTO {
  bookingDate?: Date
  preferredTime?: string
  status?: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
  notes?: string
  paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED"
  receiptNumber?: string
  receiptUrl?: string
}

export interface SevaBookingFilters {
  status?: string
  paymentStatus?: string
  startDate?: Date
  endDate?: Date
}
