/**
 * Service Interfaces
 * 
 * Defines interfaces for all services to enable:
 * - Dependency injection
 * - Easy testing with mocks
 * - Clear contract between API routes and services
 */

import type { ServiceResult, PaginatedResult } from "@/types";
import type {
  AnnouncementDomain,
  SevaDomain,
  BookingDomain,
  DonationDomain,
  EventDomain,
  ProfileDomain,
  ContactEnquiryDomain,
} from "@/types/interfaces";

// ============================================================================
// Base Service Interface
// ============================================================================

/**
 * Generic service interface
 * All services must implement this interface
 */
export interface IService<T = unknown> {
  /**
   * Get a single record by ID
   */
  getById(id: string): Promise<ServiceResult<T>>;

  /**
   * Get all records with pagination
   */
  getAll(params?: GetAllParams): Promise<ServiceResult<PaginatedResult<T>>>;

  /**
   * Get a single record or throw
   */
  getOne(params?: GetOneParams): Promise<ServiceResult<T>>;

  /**
   * Create a new record
   */
  create(data: CreateInput): Promise<ServiceResult<T>>;

  /**
   * Update a record
   */
  update(id: string, data: UpdateInput): Promise<ServiceResult<T>>;

  /**
   * Delete a record (soft delete)
   */
  delete(id: string): Promise<ServiceResult<T>>;
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface GetAllParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
  filters?: Record<string, unknown>;
}

export interface GetOneParams {
  filters?: Record<string, unknown>;
}

export interface CreateInput {
  [key: string]: unknown;
}

export interface UpdateInput {
  [key: string]: unknown;
}

// ============================================================================
// Announcement Service Interface
// ============================================================================

export interface IAnnouncementService extends IService<AnnouncementDomain> {
  getActive(): Promise<ServiceResult<AnnouncementDomain[]>>;
  getPublished(): Promise<ServiceResult<AnnouncementDomain[]>>;
  getByType(type: string): Promise<ServiceResult<AnnouncementDomain[]>>;
  publish(id: string): Promise<ServiceResult<AnnouncementDomain>>;
  unpublish(id: string): Promise<ServiceResult<AnnouncementDomain>>;
}

// ============================================================================
// Seva Service Interface
// ============================================================================

export interface ISevaService extends IService<SevaDomain> {
  getActive(): Promise<ServiceResult<SevaDomain[]>>;
  getByCategory(categoryId: string): Promise<ServiceResult<SevaDomain[]>>;
  getAvailable(): Promise<ServiceResult<SevaDomain[]>>;
  checkAvailability(id: string, date: Date, quantity: number): Promise<ServiceResult<boolean>>;
}

// ============================================================================
// Booking Service Interface
// ============================================================================

export interface IBookingService extends IService<BookingDomain> {
  getByProfile(profileId: string): Promise<ServiceResult<BookingDomain[]>>;
  getByStatus(status: string): Promise<ServiceResult<BookingDomain[]>>;
  getUpcoming(profileId: string): Promise<ServiceResult<BookingDomain[]>>;
  confirm(id: string): Promise<ServiceResult<BookingDomain>>;
  cancel(id: string, reason?: string): Promise<ServiceResult<BookingDomain>>;
  complete(id: string): Promise<ServiceResult<BookingDomain>>;
  createWithPayment(data: CreateBookingInput): Promise<ServiceResult<BookingDomain>>;
}

export interface CreateBookingInput {
  type: "SEVA" | "EVENT" | "DONATION" | "OTHER";
  profileId: string;
  items: Array<{
    referenceId: string;
    referenceType: "SEVA" | "EVENT" | "DONATION";
    quantity: number;
    date?: Date;
    notes?: string;
  }>;
  paymentMethod?: string;
  notes?: string;
}

// ============================================================================
// Donation Service Interface
// ============================================================================

export interface IDonationService extends IService<DonationDomain> {
  getByProfile(profileId: string): Promise<ServiceResult<DonationDomain[]>>;
  getByCampaign(campaignId: string): Promise<ServiceResult<DonationDomain[]>>;
  getByStatus(status: string): Promise<ServiceResult<DonationDomain[]>>;
  processPayment(id: string, transactionId: string): Promise<ServiceResult<DonationDomain>>;
  refund(id: string, reason?: string): Promise<ServiceResult<DonationDomain>>;
  getTotalForCampaign(campaignId: string): Promise<ServiceResult<number>>;
}

// ============================================================================
// Event Service Interface
// ============================================================================

export interface IEventService extends IService<EventDomain> {
  getUpcoming(): Promise<ServiceResult<EventDomain[]>>;
  getByDateRange(start: Date, end: Date): Promise<ServiceResult<EventDomain[]>>;
  getFeatured(): Promise<ServiceResult<EventDomain[]>>;
  publish(id: string): Promise<ServiceResult<EventDomain>>;
  cancel(id: string, reason?: string): Promise<ServiceResult<EventDomain>>;
}

// ============================================================================
// Profile Service Interface
// ============================================================================

export interface IProfileService extends IService<ProfileDomain> {
  getByUserId(userId: string): Promise<ServiceResult<ProfileDomain | null>>;
  getByEmail(email: string): Promise<ServiceResult<ProfileDomain | null>>;
  updateProfile(id: string, data: UpdateProfileInput): Promise<ServiceResult<ProfileDomain>>;
  deactivate(id: string): Promise<ServiceResult<ProfileDomain>>;
  activate(id: string): Promise<ServiceResult<ProfileDomain>>;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  address?: string;
  avatarId?: string;
}

// ============================================================================
// Contact Enquiry Service Interface
// ============================================================================

export interface IContactEnquiryService extends IService<ContactEnquiryDomain> {
  submit(data: CreateEnquiryInput): Promise<ServiceResult<ContactEnquiryDomain>>;
  getByStatus(status: string): Promise<ServiceResult<ContactEnquiryDomain[]>>;
  getByCategory(category: string): Promise<ServiceResult<ContactEnquiryDomain[]>>;
  respond(id: string, response: string): Promise<ServiceResult<ContactEnquiryDomain>>;
  close(id: string): Promise<ServiceResult<ContactEnquiryDomain>>;
}

export interface CreateEnquiryInput {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category?: string;
}
