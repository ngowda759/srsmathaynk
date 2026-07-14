/**
 * Application Constants
 * 
 * Centralized constants for the application.
 */

// ============================================================================
// Pagination
// ============================================================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ============================================================================
// File Upload
// ============================================================================

export const FILE_UPLOAD = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  ALLOWED_VIDEO_TYPES: ["video/mp4", "video/webm"],
  ALLOWED_DOCUMENT_TYPES: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
} as const;

// ============================================================================
// User Roles
// ============================================================================

export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  PRIEST: "PRIEST",
  STAFF: "STAFF",
  VOLUNTEER: "VOLUNTEER",
  DEVOTEE: "DEVOTEE",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// ============================================================================
// Permissions
// ============================================================================

export const PERMISSIONS = {
  // Users
  USERS_VIEW: "users:view",
  USERS_CREATE: "users:create",
  USERS_UPDATE: "users:update",
  USERS_DELETE: "users:delete",
  
  // Announcements
  ANNOUNCEMENTS_VIEW: "announcements:view",
  ANNOUNCEMENTS_CREATE: "announcements:create",
  ANNOUNCEMENTS_UPDATE: "announcements:update",
  ANNOUNCEMENTS_DELETE: "announcements:delete",
  
  // Sevas
  SEVAS_VIEW: "sevas:view",
  SEVAS_CREATE: "sevas:create",
  SEVAS_UPDATE: "sevas:update",
  SEVAS_DELETE: "sevas:delete",
  
  // Bookings
  BOOKINGS_VIEW: "bookings:view",
  BOOKINGS_CREATE: "bookings:create",
  BOOKINGS_UPDATE: "bookings:update",
  BOOKINGS_CANCEL: "bookings:cancel",
  
  // Donations
  DONATIONS_VIEW: "donations:view",
  DONATIONS_CREATE: "donations:create",
  DONATIONS_PROCESS: "donations:process",
  DONATIONS_REFUND: "donations:refund",
  
  // Events
  EVENTS_VIEW: "events:view",
  EVENTS_CREATE: "events:create",
  EVENTS_UPDATE: "events:update",
  EVENTS_DELETE: "events:delete",
  
  // Gallery
  GALLERY_VIEW: "gallery:view",
  GALLERY_UPLOAD: "gallery:upload",
  GALLERY_DELETE: "gallery:delete",
  
  // Settings
  SETTINGS_VIEW: "settings:view",
  SETTINGS_UPDATE: "settings:update",
  
  // Reports
  REPORTS_VIEW: "reports:view",
  REPORTS_EXPORT: "reports:export",
} as const;

// ============================================================================
// Role Permissions Mapping
// ============================================================================

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [USER_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.ANNOUNCEMENTS_VIEW,
    PERMISSIONS.ANNOUNCEMENTS_CREATE,
    PERMISSIONS.ANNOUNCEMENTS_UPDATE,
    PERMISSIONS.ANNOUNCEMENTS_DELETE,
    PERMISSIONS.SEVAS_VIEW,
    PERMISSIONS.SEVAS_CREATE,
    PERMISSIONS.SEVAS_UPDATE,
    PERMISSIONS.SEVAS_DELETE,
    PERMISSIONS.BOOKINGS_VIEW,
    PERMISSIONS.BOOKINGS_UPDATE,
    PERMISSIONS.DONATIONS_VIEW,
    PERMISSIONS.DONATIONS_PROCESS,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.EVENTS_CREATE,
    PERMISSIONS.EVENTS_UPDATE,
    PERMISSIONS.EVENTS_DELETE,
    PERMISSIONS.GALLERY_VIEW,
    PERMISSIONS.GALLERY_UPLOAD,
    PERMISSIONS.GALLERY_DELETE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
  ],
  [USER_ROLES.PRIEST]: [
    PERMISSIONS.SEVAS_VIEW,
    PERMISSIONS.BOOKINGS_VIEW,
    PERMISSIONS.BOOKINGS_UPDATE,
    PERMISSIONS.EVENTS_VIEW,
  ],
  [USER_ROLES.STAFF]: [
    PERMISSIONS.SEVAS_VIEW,
    PERMISSIONS.BOOKINGS_VIEW,
    PERMISSIONS.BOOKINGS_UPDATE,
    PERMISSIONS.DONATIONS_VIEW,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.GALLERY_VIEW,
  ],
  [USER_ROLES.VOLUNTEER]: [
    PERMISSIONS.SEVAS_VIEW,
    PERMISSIONS.BOOKINGS_VIEW,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.GALLERY_VIEW,
  ],
  [USER_ROLES.DEVOTEE]: [
    PERMISSIONS.SEVAS_VIEW,
    PERMISSIONS.BOOKINGS_VIEW,
    PERMISSIONS.BOOKINGS_CREATE,
    PERMISSIONS.DONATIONS_VIEW,
    PERMISSIONS.DONATIONS_CREATE,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.GALLERY_VIEW,
  ],
};

// ============================================================================
// Media
// ============================================================================

export const MEDIA_BUCKETS = {
  MEDIA: "media",
  GALLERY: "gallery",
  DOCUMENTS: "documents",
  AVATARS: "avatars",
} as const;

// ============================================================================
// Booking Status
// ============================================================================

export const BOOKING_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;

// ============================================================================
// Payment Status
// ============================================================================

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

// ============================================================================
// Event Status
// ============================================================================

export const EVENT_STATUS = {
  UPCOMING: "UPCOMING",
  ONGOING: "ONGOING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

// ============================================================================
// Enquiry Status
// ============================================================================

export const ENQUIRY_STATUS = {
  NEW: "NEW",
  IN_PROGRESS: "IN_PROGRESS",
  RESPONDED: "RESPONDED",
  CLOSED: "CLOSED",
  SPAM: "SPAM",
} as const;

// ============================================================================
// API Routes
// ============================================================================

export const API_ROUTES = {
  ANNOUNCEMENTS: "/api/announcements",
  SEVAS: "/api/sevas",
  BOOKINGS: "/api/bookings",
  DONATIONS: "/api/donations",
  EVENTS: "/api/events",
  GALLERY: "/api/gallery",
  PROFILE: "/api/profile",
  SETTINGS: "/api/settings",
} as const;

// ============================================================================
// Error Codes
// ============================================================================

export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const;

// ============================================================================
// Cache Keys
// ============================================================================

export const CACHE_KEYS = {
  TEMPLE_INFO: "temple:info",
  SITE_SETTINGS: "site:settings",
  ANNOUNCEMENTS: "announcements:",
  SEVAS: "sevas:",
  EVENTS: "events:",
  FESTIVALS: "festivals:",
  PANCHANGA: "panchanga:",
} as const;

// ============================================================================
// Cache TTL (in seconds)
// ============================================================================

export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const;
