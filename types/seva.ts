import type {
  Seva as PrismaSeva,
  Aaradhane as PrismaAaradhane,
  Booking,
  BookingItem,
  BookingStatus,
  BookingType,
} from "@prisma/client";

export { BookingStatus, BookingType };
export type { Booking, BookingItem };

// Re-export Prisma types
export type { PrismaSeva as Seva, PrismaAaradhane as Aaradhane };

// Seva record for frontend
export interface SevaRecord {
  id: string;
  name: string;
  nameKn: string | null;
  description: string | null;
  descriptionKn: string | null;
  price: number;
  currency: string;
  duration: string | null;
  category: string | null;
  imageId: string | null;
  iconName: string | null;
  active: boolean;
  featured: boolean;
  maxPerDay: number | null;
  minAdvanceBooking: number | null;
  maxAdvanceBooking: number | null;
  instructions: string | null;
  benefits: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// Aaradhane record for frontend
export interface AaradhaneRecord {
  id: string;
  title: string;
  titleKn: string | null;
  deityName: string | null;
  guruName: string | null;
  description: string | null;
  significance: string | null;
  startDate: Date | null;
  endDate: Date | null;
  imageId: string | null;
  thumbnailId: string | null;
  rituals: string[];
  offerings: string[];
  featured: boolean;
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// Booking record for frontend
export interface BookingRecord {
  id: string;
  profileId: string | null;
  bookingType: BookingType;
  bookingDate: Date;
  status: BookingStatus;
  totalAmount: number;
  currency: string;
  paymentStatus: string | null;
  paymentReference: string | null;
  notes: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  specialRequests: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: BookingItemRecord[];
  profile?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

// Booking item record
export interface BookingItemRecord {
  id: string;
  bookingId: string;
  sevaId: string | null;
  aaradhaneId: string | null;
  eventId: string | null;
  itemName: string;
  itemNameKn: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  requestedDate: Date | null;
  requestedTime: string | null;
  status: BookingStatus;
  notes: string | null;
  createdAt: Date;
  // Relations
  seva?: SevaRecord | null;
  aaradhane?: AaradhaneRecord | null;
}

// Seva request
export interface SevaRequest {
  name: string;
  nameKn?: string;
  description?: string;
  descriptionKn?: string;
  price?: number;
  duration?: string;
  category?: string;
  imageId?: string;
  iconName?: string;
  active?: boolean;
  featured?: boolean;
  maxPerDay?: number;
  minAdvanceBooking?: number;
  maxAdvanceBooking?: number;
  instructions?: string;
  benefits?: string;
  order?: number;
}

// Aaradhane request
export interface AaradhaneRequest {
  title: string;
  titleKn?: string;
  deityName?: string;
  guruName?: string;
  description?: string;
  significance?: string;
  startDate?: Date;
  endDate?: Date;
  imageId?: string;
  thumbnailId?: string;
  rituals?: string[];
  offerings?: string[];
  featured?: boolean;
  active?: boolean;
  order?: number;
}

// Booking request
export interface BookingRequest {
  profileId?: string;
  bookingType: BookingType;
  bookingDate: Date;
  notes?: string;
  contactPhone?: string;
  contactEmail?: string;
  specialRequests?: string;
  items: {
    sevaId?: string;
    aaradhaneId?: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    requestedDate?: Date;
    requestedTime?: string;
    notes?: string;
  }[];
}

// Seva Availability
export interface SevaAvailability {
  date: Date;
  available: boolean;
  bookedCount: number;
  maxPerDay: number | null;
  remaining: number | null;
}

// Seva Statistics
export interface SevaStats {
  totalBookings: number;
  todayBookings: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  topSevas: { sevaId: string; name: string; count: number }[];
}

// Options
export const sevaCategoryOptions = [
  { label: "Daily", value: "Daily" },
  { label: "Special", value: "Special" },
  { label: "Premium", value: "Premium" },
  { label: "Festival", value: "Festival" },
  { label: "Anniversary", value: "Anniversary" },
  { label: "Memorial", value: "Memorial" },
];

export const bookingStatusOptions = [
  { label: "Pending", value: "PENDING", color: "bg-yellow-100 text-yellow-800" },
  { label: "Confirmed", value: "CONFIRMED", color: "bg-green-100 text-green-800" },
  { label: "Completed", value: "COMPLETED", color: "bg-blue-100 text-blue-800" },
  { label: "Cancelled", value: "CANCELLED", color: "bg-red-100 text-red-800" },
  { label: "Refunded", value: "REFUNDED", color: "bg-gray-100 text-gray-800" },
];

// Sankalpa options (common reasons for sevas)
export const sankalpaOptions = [
  "Health and Well-being",
  "Academic Success",
  "Career Growth",
  "Family Prosperity",
  "Marriage/Betrothal",
  "Child Birth",
  "Grah Shanti",
  "House Warming",
  "Deed Transfer",
  "Land Purchase",
  "Festival Celebration",
  "Anniversary",
  "Memorial (Shraddha)",
  "Other",
];

// Gothra options
export const gothraOptions = [
  "Kashyapa",
  "Vishwamitra",
  "Vashista",
  "Atri",
  "Gautama",
  "Bharadwaja",
  "Jamadagni",
  "Gowtama",
  "Sage",
  "Other",
];

// Nakshatra options
export const nakshatraOptions = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira",
  "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
  "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
  "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
  "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha", "Purva Bhadrapada",
  "Uttara Bhadrapada", "Revati"
];
