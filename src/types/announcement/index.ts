/**
 * Announcement Domain Types
 * 
 * Domain objects for the Announcement module.
 * These types are returned by repositories and used throughout the application.
 */

// ============================================================================
// Enums
// ============================================================================

export type AnnouncementType =
  | "GENERAL"
  | "EVENT"
  | "DONATION"
  | "FESTIVAL"
  | "MAINTENANCE"
  | "URGENT";

export type AnnouncementPriority =
  | "LOW"
  | "NORMAL"
  | "HIGH"
  | "URGENT";

export type AnnouncementStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SCHEDULED";

// ============================================================================
// Domain Object
// ============================================================================

export interface AnnouncementDomain {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  isPinned: boolean;
  isActive: boolean;
  status: AnnouncementStatus;
  expiresAt: Date | null;
  publishAt: Date | null;
  authorId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// ============================================================================
// Create Input
// ============================================================================

export interface CreateAnnouncementInput {
  title: string;
  content: string;
  excerpt?: string;
  type: AnnouncementType;
  priority?: AnnouncementPriority;
  isPinned?: boolean;
  isActive?: boolean;
  publishAt?: Date | null;
  expiresAt?: Date | null;
  authorId?: string | null;
}

// ============================================================================
// Update Input
// ============================================================================

export interface UpdateAnnouncementInput {
  id: string;
  title?: string;
  content?: string;
  excerpt?: string;
  type?: AnnouncementType;
  priority?: AnnouncementPriority;
  isPinned?: boolean;
  isActive?: boolean;
  publishAt?: Date | null;
  expiresAt?: Date | null;
}

// ============================================================================
// Search & Filter
// ============================================================================

export interface AnnouncementSearchParams {
  query?: string;
  type?: AnnouncementType;
  priority?: AnnouncementPriority;
  status?: AnnouncementStatus;
  isPinned?: boolean;
  isActive?: boolean;
  authorId?: string;
  publishedAfter?: Date;
  publishedBefore?: Date;
  expiresAfter?: Date;
  expiresBefore?: Date;
}

export interface AnnouncementCursorParams {
  cursor?: string;
  limit?: number;
}

export interface AnnouncementSortParams {
  sortBy?: "createdAt" | "updatedAt" | "publishAt" | "priority" | "title";
  sortOrder?: "asc" | "desc";
}

// ============================================================================
// Paginated Results
// ============================================================================

export interface AnnouncementListResult {
  data: AnnouncementDomain[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AnnouncementCursorResult {
  data: AnnouncementDomain[];
  meta: {
    cursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}

// ============================================================================
// Audit Log Context
// ============================================================================

export interface AnnouncementAuditContext {
  requestId: string;
  userId?: string;
  entityId?: string;
  action: string;
  duration?: number;
  status?: "success" | "error";
}
