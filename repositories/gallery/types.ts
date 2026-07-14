/**
 * Gallery Repository Types
 */

import { GalleryItem } from "@prisma/client"
export type { GalleryItem }

export interface CreateGalleryItemDTO {
  title?: string
  titleKannada?: string
  description?: string
  descriptionKannada?: string
  src: string
  thumbnailUrl?: string
  type?: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT"
  category?: string
  featured?: boolean
  active?: boolean
  order?: number
  videoDuration?: number
  videoUrl?: string
  altText?: string
  credit?: string
  eventId?: string
  uploadedBy?: string
}

export interface UpdateGalleryItemDTO extends Partial<CreateGalleryItemDTO> {}

export interface GalleryFilters {
  type?: string
  category?: string
  featured?: boolean
  active?: boolean
  eventId?: string
  search?: string
}

export interface GalleryListParams {
  page?: number
  limit?: number
  filters?: GalleryFilters
  orderBy?: { field: string; order?: "asc" | "desc" }
}
