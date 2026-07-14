/**
 * Temple Repository Types
 */

import { TempleSettings, HomepageSettings, TempleTiming, Facility, Amenity, FuturePlan } from "@prisma/client"

// Temple Settings
export type { TempleSettings, HomepageSettings, TempleTiming, Facility, Amenity, FuturePlan }

export interface CreateTempleSettingsDTO {
  templeName?: string
  shortName?: string
  tagline?: string
  description?: string
  address?: string
  city?: string
  district?: string
  state?: string
  country?: string
  pincode?: string
  phone?: string
  alternatePhone?: string
  email?: string
  website?: string
  mapEmbedUrl?: string
  latitude?: number
  longitude?: number
  socialFacebook?: string
  socialTwitter?: string
  socialInstagram?: string
  socialYoutube?: string
  socialWhatsapp?: string
  bankName?: string
  bankAccountName?: string
  bankAccountNumber?: string
  bankIFSCCode?: string
  bankUPIId?: string
  establishedYear?: number
  priestCount?: number
  dailyVisitors?: number
}

export interface UpdateTempleSettingsDTO extends Partial<CreateTempleSettingsDTO> {}

// Homepage Settings
export interface CreateHomepageSettingsDTO {
  heroTitle?: string
  heroSubtitle?: string
  heroImageUrl?: string
  heroVideoUrl?: string
  aboutTitle?: string
  aboutContent?: string
  aboutImageUrl?: string
  showFeaturedEvents?: boolean
  showFeaturedSevas?: boolean
  showDonationSection?: boolean
  showGalleryPreview?: boolean
  showAnnouncements?: boolean
  featuredEventsLimit?: number
  featuredSevasLimit?: number
  galleryPreviewLimit?: number
  donationTitle?: string
  donationSubtitle?: string
  newsTitle?: string
}

export interface UpdateHomepageSettingsDTO extends Partial<CreateHomepageSettingsDTO> {}

// Temple Timing
export interface CreateTempleTimingDTO {
  dayOfWeek: number
  openTime: string
  closeTime: string
  isHoliday?: boolean
  notes?: string
}

export interface UpdateTempleTimingDTO {
  openTime?: string
  closeTime?: string
  isHoliday?: boolean
  notes?: string
}

// Facility
export interface CreateFacilityDTO {
  name: string
  nameKannada?: string
  description?: string
  descriptionKannada?: string
  icon?: string
  imageUrl?: string
  color?: string
  instructions?: string
  isActive?: boolean
  order?: number
}

export interface UpdateFacilityDTO extends Partial<CreateFacilityDTO> {}

// Amenity
export interface CreateAmenityDTO {
  name: string
  description?: string
  icon?: string
  isAvailable?: boolean
  order?: number
}

export interface UpdateAmenityDTO extends Partial<CreateAmenityDTO> {}

// Future Plan
export interface CreateFuturePlanDTO {
  title: string
  titleKannada?: string
  description?: string
  descriptionKannada?: string
  icon?: string
  imageUrl?: string
  targetAmount?: number
  raisedAmount?: number
  status?: "PLANNING" | "APPROVED" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD"
  priority?: number
  isActive?: boolean
  isFeatured?: boolean
  order?: number
  startDate?: Date
  targetDate?: Date
  completedDate?: Date
}

export interface UpdateFuturePlanDTO extends Partial<CreateFuturePlanDTO> {}
