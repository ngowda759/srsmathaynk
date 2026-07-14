/**
 * Repository Interfaces
 * 
 * Defines interfaces for all repositories to enable:
 * - Dependency injection
 * - Easy testing with mocks
 * - Swappable implementations (e.g., Prisma → Drizzle)
 */

import type { PaginationOptions, PaginatedResult, FilterOptions, SortOptions, QueryOptions } from "@/types";

// ============================================================================
// Base Repository Interface
// ============================================================================

/**
 * Generic repository interface
 * All repositories must implement this interface
 */
export interface IRepository<T extends { id: string }> {
  /**
   * Find a single record by ID
   */
  findById(id: string): Promise<T>;

  /**
   * Find a single record by field
   */
  findByField<K extends keyof T>(field: K, value: T[K]): Promise<T | null>;

  /**
   * Find all records with optional query options
   */
  findAll(options?: QueryOptions): Promise<PaginatedResult<T>>;

  /**
   * Find a single record or throw
   */
  findOne(options?: QueryOptions): Promise<T>;

  /**
   * Create a new record
   */
  create(data: Partial<T>): Promise<T>;

  /**
   * Create multiple records
   */
  createMany(data: Partial<T>[]): Promise<{ count: number }>;

  /**
   * Update a record by ID
   */
  update(id: string, data: Partial<T>): Promise<T>;

  /**
   * Update multiple records
   */
  updateMany(where: Record<string, unknown>, data: Partial<T>): Promise<{ count: number }>;

  /**
   * Soft delete a record
   */
  delete(id: string): Promise<T>;

  /**
   * Count records
   */
  count(filters?: FilterOptions[]): Promise<number>;

  /**
   * Check if record exists
   */
  exists(id: string): Promise<boolean>;
}

// ============================================================================
// Entity-Specific Repository Interfaces
// ============================================================================

// Announcement Repository
export interface IAnnouncementRepository extends IRepository<AnnouncementDomain> {
  findActive(): Promise<AnnouncementDomain[]>;
  findByType(type: string): Promise<AnnouncementDomain[]>;
  findPublished(): Promise<AnnouncementDomain[]>;
}

// Seva Repository
export interface ISevaRepository extends IRepository<SevaDomain> {
  findActive(): Promise<SevaDomain[]>;
  findByCategory(categoryId: string): Promise<SevaDomain[]>;
  findAvailable(): Promise<SevaDomain[]>;
}

// Booking Repository
export interface IBookingRepository extends IRepository<BookingDomain> {
  findByProfile(profileId: string): Promise<BookingDomain[]>;
  findByStatus(status: string): Promise<BookingDomain[]>;
  findUpcoming(profileId: string): Promise<BookingDomain[]>;
}

// Donation Repository
export interface IDonationRepository extends IRepository<DonationDomain> {
  findByProfile(profileId: string): Promise<DonationDomain[]>;
  findByCampaign(campaignId: string): Promise<DonationDomain[]>;
  findByStatus(status: string): Promise<DonationDomain[]>;
  findTotalByCampaign(campaignId: string): Promise<number>;
}

// Event Repository
export interface IEventRepository extends IRepository<EventDomain> {
  findUpcoming(): Promise<EventDomain[]>;
  findByDateRange(start: Date, end: Date): Promise<EventDomain[]>;
  findFeatured(): Promise<EventDomain[]>;
}

// Profile Repository
export interface IProfileRepository extends IRepository<ProfileDomain> {
  findByUserId(userId: string): Promise<ProfileDomain | null>;
  findByEmail(email: string): Promise<ProfileDomain | null>;
  updateLastLogin(id: string): Promise<void>;
}

// Media Repository
export interface IMediaRepository extends IRepository<MediaDomain> {
  findByType(type: string): Promise<MediaDomain[]>;
  findByBucket(bucket: string): Promise<MediaDomain[]>;
}

// Contact Enquiry Repository
export interface IContactEnquiryRepository extends IRepository<ContactEnquiryDomain> {
  findByStatus(status: string): Promise<ContactEnquiryDomain[]>;
  findByCategory(category: string): Promise<ContactEnquiryDomain[]>;
  markAsRead(id: string): Promise<void>;
}

// ============================================================================
// Domain Objects (returned by repositories - NOT Prisma objects)
// ============================================================================

export interface AnnouncementDomain {
  id: string;
  title: string;
  content: string;
  type: "GENERAL" | "EVENT" | "DONATION" | "FESTIVAL" | "MAINTENANCE" | "URGENT";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  isActive: boolean;
  publishAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface SevaDomain {
  id: string;
  name: string;
  nameKn: string | null;
  description: string | null;
  descriptionKn: string | null;
  duration: number | null;
  price: number | null;
  capacity: number | null;
  isActive: boolean;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface BookingDomain {
  id: string;
  type: "SEVA" | "EVENT" | "DONATION" | "OTHER";
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "REFUNDED";
  profileId: string;
  totalAmount: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface DonationDomain {
  id: string;
  campaignId: string | null;
  profileId: string;
  amount: number;
  paymentMethod: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REFUNDED";
  message: string | null;
  isAnonymous: boolean;
  transactionId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface EventDomain {
  id: string;
  title: string;
  titleKn: string | null;
  description: string | null;
  descriptionKn: string | null;
  type: string;
  status: string;
  startDate: Date;
  endDate: Date;
  location: string | null;
  isFeatured: boolean;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ProfileDomain {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  avatarId: string | null;
  emailVerified: boolean;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface MediaDomain {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT";
  name: string;
  alt: string | null;
  caption: string | null;
  bucket: string | null;
  size: number | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ContactEnquiryDomain {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  category: string;
  status: string;
  response: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
