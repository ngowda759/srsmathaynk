/**
 * Gallery Types - Aligns with Prisma schema (Sprint 4.2)
 * Complete rewrite for Prisma-based backend
 */

// =============================================================================
// ENUMS
// =============================================================================

export type AlbumStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type AlbumVisibility = "PRIVATE" | "PUBLIC" | "UNLISTED";
export type GalleryItemType = "PHOTO" | "VIDEO";

// Legacy types for backward compatibility
export type LegacyGalleryCategory =
  | "Rathotsava"
  | "Madhva Navami"
  | "Aaradhane"
  | "Daily Pooja"
  | "Special Sevas"
  | "Utsava"
  | "Pravachana"
  | "Temple Infrastructure"
  | "Annadanam"
  | "Hanuman Jayanti"
  | "Guru Aaradhane"
  | "Other";

// =============================================================================
// MEDIA URL UTILITY
// =============================================================================

export interface MediaUrl {
  id: string;
  url: string;
  thumbnailUrl?: string;
}

// =============================================================================
// GALLERY CATEGORY
// =============================================================================

export interface GalleryCategoryType {
  id: string;
  name: string;
  nameKn?: string | null;
  description?: string | null;
  slug: string;
  icon?: string | null;
  color?: string | null;
  order: number;
  active: boolean;
  year?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GalleryCategoryRequest {
  name: string;
  nameKn?: string;
  description?: string;
  slug?: string;
  icon?: string;
  color?: string;
  order?: number;
  active?: boolean;
  year?: number;
}

// =============================================================================
// GALLERY ALBUM
// =============================================================================

export interface GalleryAlbumType {
  id: string;
  title: string;
  titleKn?: string | null;
  slug: string;
  description?: string | null;
  descriptionKn?: string | null;

  // Cover image
  coverImageId?: string | null;
  coverImage?: MediaUrl | null;

  // Category
  categoryId?: string | null;
  category?: Pick<GalleryCategoryType, "id" | "name" | "slug"> | null;

  // Festival
  festivalId?: string | null;
  festival?: {
    id: string;
    title: string;
    startDate: Date;
  } | null;

  // Status
  status: AlbumStatus;
  visibility: AlbumVisibility;
  featured: boolean;
  published: boolean;

  // Counts
  photoCount: number;
  videoCount: number;

  // Display
  displayOrder: number;

  // Metadata
  location?: string | null;
  eventDate?: Date | null;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  createdById?: string | null;
  updatedById?: string | null;

  // Relations (optional, populated on demand)
  items?: GalleryItemType[];
  itemCount?: number;
}

export interface GalleryAlbumRequest {
  title: string;
  titleKn?: string;
  slug?: string;
  description?: string;
  descriptionKn?: string;
  coverImageId?: string;
  categoryId?: string;
  festivalId?: string;
  status?: AlbumStatus;
  visibility?: AlbumVisibility;
  featured?: boolean;
  published?: boolean;
  displayOrder?: number;
  location?: string;
  eventDate?: string;
}

export interface GalleryAlbumQuery {
  status?: AlbumStatus;
  categoryId?: string;
  festivalId?: string;
  featured?: boolean;
  published?: boolean;
  search?: string;
  year?: number;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "eventDate" | "displayOrder";
  sortOrder?: "asc" | "desc";
}

// =============================================================================
// GALLERY ITEM
// =============================================================================

export interface GalleryItemType {
  id: string;
  title?: string | null;
  titleKn?: string | null;
  description?: string | null;
  descriptionKn?: string | null;

  // Media
  mediaId: string;
  media?: MediaUrl & {
    filename: string;
    mimeType?: string;
    fileSize?: number;
    width?: number;
    height?: number;
    duration?: number;
  };

  type: GalleryItemType;

  // Display
  altText?: string | null;
  caption?: string | null;
  captionKn?: string | null;

  // Features
  featured: boolean;
  showOnHome: boolean;
  displayOrder: number;

  // Metadata
  width?: number | null;
  height?: number | null;
  fileSize?: number | null;
  duration?: number | null;
  tags: string[];

  // Stats
  viewCount: number;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  uploadedById?: string | null;

  // Album association
  albumIds?: string[];
}

export interface GalleryItemRequest {
  title?: string;
  titleKn?: string;
  description?: string;
  descriptionKn?: string;
  mediaId: string;
  type?: GalleryItemType;
  altText?: string;
  caption?: string;
  captionKn?: string;
  featured?: boolean;
  showOnHome?: boolean;
  displayOrder?: number;
  tags?: string[];
}

export interface GalleryItemQuery {
  type?: GalleryItemType;
  featured?: boolean;
  showOnHome?: boolean;
  albumId?: string;
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

// =============================================================================
// ALBUM ITEM (Junction)
// =============================================================================

export interface AlbumItemType {
  id: string;
  albumId: string;
  itemId: string;
  displayOrder: number;
  createdAt: Date;
}

// =============================================================================
// GALLERY TAG
// =============================================================================

export interface GalleryTagType {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GalleryTagRequest {
  name: string;
}

// =============================================================================
// STATS & AGGREGATIONS
// =============================================================================

export interface GalleryStats {
  total: number;
  featured: number;
  albums: number;
  photos: number;
  videos: number;
  byCategory?: Record<string, number>;
  byYear?: Record<string, number>;
}

export interface AlbumStats {
  totalItems: number;
  photos: number;
  videos: number;
}

// =============================================================================
// UI HELPERS
// =============================================================================

export const ALBUM_STATUS_LABELS: Record<AlbumStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export const ALBUM_VISIBILITY_LABELS: Record<AlbumVisibility, string> = {
  PRIVATE: "Private",
  PUBLIC: "Public",
  UNLISTED: "Unlisted",
};

export const ITEM_TYPE_LABELS: Record<GalleryItemType, string> = {
  PHOTO: "Photo",
  VIDEO: "Video",
};

// Legacy exports for backward compatibility
export type GalleryAlbum = GalleryAlbumType;
export type GalleryMedia = GalleryItemType;
export type GalleryMediaRequest = GalleryItemRequest;
export type GalleryImage = GalleryMedia;
export type GalleryImageRequest = GalleryMediaRequest;

export const GALLERY_CATEGORIES: string[] = [
  "Rathotsava",
  "Madhva Navami",
  "Aaradhane",
  "Daily Pooja",
  "Special Sevas",
  "Utsava",
  "Pravachana",
  "Temple Infrastructure",
  "Annadanam",
  "Hanuman Jayanti",
  "Guru Aaradhane",
  "Other",
];
