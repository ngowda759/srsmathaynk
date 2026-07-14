/**
 * Announcement Service
 * 
 * Business logic layer for announcements.
 * All business rules MUST go through services per ADR-001.
 * 
 * Features:
 * - CRUD operations
 * - Soft delete and restore
 * - Publish/unpublish workflow
 * - Archive functionality
 * - Featured and priority handling
 * - Audit logging
 */

import { BaseService } from "./base.service";
import { AnnouncementRepository, announcementRepository } from "@/repositories/announcement";
import { logger } from "@/lib/logger";
import { ErrorCodes } from "@/errors";
import type { ServiceResult, PaginatedResult } from "@/types";
import type {
  AnnouncementDomain,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
  AnnouncementSearchParams,
} from "@/types/announcement";

// ============================================================================
// Service Interface
// ============================================================================

export interface IAnnouncementService {
  // CRUD
  createAnnouncement(
    input: CreateAnnouncementInput,
    userId?: string
  ): Promise<ServiceResult<AnnouncementDomain>>;
  updateAnnouncement(
    id: string,
    input: UpdateAnnouncementInput,
    userId?: string
  ): Promise<ServiceResult<AnnouncementDomain>>;
  deleteAnnouncement(
    id: string,
    userId?: string
  ): Promise<ServiceResult<AnnouncementDomain>>;
  restoreAnnouncement(
    id: string,
    userId?: string
  ): Promise<ServiceResult<AnnouncementDomain>>;
  
  // Status management
  publishAnnouncement(
    id: string,
    userId?: string
  ): Promise<ServiceResult<AnnouncementDomain>>;
  unpublishAnnouncement(
    id: string,
    userId?: string
  ): Promise<ServiceResult<AnnouncementDomain>>;
  archiveAnnouncement(
    id: string,
    userId?: string
  ): Promise<ServiceResult<AnnouncementDomain>>;
  
  // Queries
  getAnnouncement(id: string): Promise<ServiceResult<AnnouncementDomain>>;
  getPublicAnnouncements(params?: {
    type?: string;
    limit?: number;
  }): Promise<ServiceResult<AnnouncementDomain[]>>;
  getAdminAnnouncements(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    type?: string;
    isActive?: boolean;
    includeDeleted?: boolean;
  }): Promise<ServiceResult<PaginatedResult<AnnouncementDomain>>>;
  searchAnnouncements(
    params: AnnouncementSearchParams & { page?: number; limit?: number }
  ): Promise<ServiceResult<PaginatedResult<AnnouncementDomain>>>;
}

// ============================================================================
// Audit Log Helper
// ============================================================================

interface AuditLogData {
  requestId: string;
  userId?: string;
  action: string;
  entityId?: string;
  duration?: number;
  status: "success" | "error";
  error?: string;
}

function logAudit(data: AuditLogData): void {
  logger.info("Announcement audit", {
    requestId: data.requestId,
    userId: data.userId,
    action: data.action,
    entityId: data.entityId,
    duration: data.duration,
    status: data.status,
    ...(data.error && { error: data.error }),
  });
}

// ============================================================================
// Service Implementation
// ============================================================================

export class AnnouncementService
  extends BaseService
  implements IAnnouncementService
{
  private repository: AnnouncementRepository;

  constructor(repository?: AnnouncementRepository) {
    super("AnnouncementService");
    this.repository = repository || announcementRepository;
  }

  // ==========================================================================
  // CRUD Operations
  // ==========================================================================

  /**
   * Create a new announcement
   */
  async createAnnouncement(
    input: CreateAnnouncementInput,
    userId?: string
  ): Promise<ServiceResult<AnnouncementDomain>> {
    const requestId = logger.generateRequestId();
    const startTime = Date.now();

    this.logInfo("Creating announcement", { requestId, userId, title: input.title });

    try {
      // Validate input
      if (!input.title || input.title.trim().length === 0) {
        return this.error(
          ErrorCodes.VAL_INVALID_INPUT,
          "Title is required",
          { field: "title" }
        );
      }

      if (!input.content || input.content.trim().length === 0) {
        return this.error(
          ErrorCodes.VAL_INVALID_INPUT,
          "Content is required",
          { field: "content" }
        );
      }

      // Validate dates
      if (input.publishAt && input.expiresAt && input.publishAt >= input.expiresAt) {
        return this.error(
          ErrorCodes.VAL_INVALID_INPUT,
          "Publish date must be before expiration date",
          { field: "dates" }
        );
      }

      // Create the announcement
      const announcement = await this.repository.create({
        ...input,
        authorId: userId || null,
      });

      const duration = Date.now() - startTime;
      logAudit({
        requestId,
        userId,
        action: "CREATE",
        entityId: announcement.id,
        duration,
        status: "success",
      });

      this.logInfo("Announcement created successfully", {
        requestId,
        id: announcement.id,
        duration,
      });

      return this.success(announcement, "Announcement created successfully");
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorResult = this.handleError(error);

      logAudit({
        requestId,
        userId,
        action: "CREATE",
        duration,
        status: "error",
        error: errorResult.message,
      });

      return errorResult;
    }
  }

  /**
   * Update an existing announcement
   */
  async updateAnnouncement(
    id: string,
    input: UpdateAnnouncementInput,
    userId?: string
  ): Promise<ServiceResult<AnnouncementDomain>> {
    const requestId = logger.generateRequestId();
    const startTime = Date.now();

    this.logInfo("Updating announcement", { requestId, userId, id });

    try {
      // Check if announcement exists
      const existing = await this.repository.findById(id);

      if (!existing) {
        return this.error(
          ErrorCodes.ANN_NOT_FOUND,
          "Announcement not found",
          { id }
        );
      }

      // Validate dates if both are provided
      const publishAt = input.publishAt ?? existing.publishAt;
      const expiresAt = input.expiresAt ?? existing.expiresAt;

      if (publishAt && expiresAt && publishAt >= expiresAt) {
        return this.error(
          ErrorCodes.VAL_INVALID_INPUT,
          "Publish date must be before expiration date",
          { field: "dates" }
        );
      }

      // Validate title if being updated
      if (input.title !== undefined && input.title.trim().length === 0) {
        return this.error(
          ErrorCodes.VAL_INVALID_INPUT,
          "Title cannot be empty",
          { field: "title" }
        );
      }

      // Validate content if being updated
      if (input.content !== undefined && input.content.trim().length === 0) {
        return this.error(
          ErrorCodes.VAL_INVALID_INPUT,
          "Content cannot be empty",
          { field: "content" }
        );
      }

      // Update the announcement
      const announcement = await this.repository.update(id, input);

      const duration = Date.now() - startTime;
      logAudit({
        requestId,
        userId,
        action: "UPDATE",
        entityId: id,
        duration,
        status: "success",
      });

      this.logInfo("Announcement updated successfully", {
        requestId,
        id,
        duration,
      });

      return this.success(announcement, "Announcement updated successfully");
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorResult = this.handleError(error);

      logAudit({
        requestId,
        userId,
        action: "UPDATE",
        entityId: id,
        duration,
        status: "error",
        error: errorResult.message,
      });

      return errorResult;
    }
  }

  /**
   * Delete an announcement (soft delete)
   */
  async deleteAnnouncement(
    id: string,
    userId?: string
  ): Promise<ServiceResult<AnnouncementDomain>> {
    const requestId = logger.generateRequestId();
    const startTime = Date.now();

    this.logInfo("Deleting announcement", { requestId, userId, id });

    try {
      // Check if announcement exists
      const existing = await this.repository.findById(id);

      if (!existing) {
        return this.error(
          ErrorCodes.ANN_NOT_FOUND,
          "Announcement not found",
          { id }
        );
      }

      // Soft delete the announcement
      const announcement = await this.repository.softDelete(id);

      const duration = Date.now() - startTime;
      logAudit({
        requestId,
        userId,
        action: "DELETE",
        entityId: id,
        duration,
        status: "success",
      });

      this.logInfo("Announcement deleted successfully", {
        requestId,
        id,
        duration,
      });

      return this.success(announcement, "Announcement deleted successfully");
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorResult = this.handleError(error);

      logAudit({
        requestId,
        userId,
        action: "DELETE",
        entityId: id,
        duration,
        status: "error",
        error: errorResult.message,
      });

      return errorResult;
    }
  }

  /**
   * Restore a soft-deleted announcement
   */
  async restoreAnnouncement(
    id: string,
    userId?: string
  ): Promise<ServiceResult<AnnouncementDomain>> {
    const requestId = logger.generateRequestId();
    const startTime = Date.now();

    this.logInfo("Restoring announcement", { requestId, userId, id });

    try {
      // Restore the announcement
      const announcement = await this.repository.restore(id);

      const duration = Date.now() - startTime;
      logAudit({
        requestId,
        userId,
        action: "RESTORE",
        entityId: id,
        duration,
        status: "success",
      });

      this.logInfo("Announcement restored successfully", {
        requestId,
        id,
        duration,
      });

      return this.success(announcement, "Announcement restored successfully");
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorResult = this.handleError(error);

      logAudit({
        requestId,
        userId,
        action: "RESTORE",
        entityId: id,
        duration,
        status: "error",
        error: errorResult.message,
      });

      return errorResult;
    }
  }

  // ==========================================================================
  // Status Management
  // ==========================================================================

  /**
   * Publish an announcement (set isActive to true)
   */
  async publishAnnouncement(
    id: string,
    userId?: string
  ): Promise<ServiceResult<AnnouncementDomain>> {
    const requestId = logger.generateRequestId();
    const startTime = Date.now();

    this.logInfo("Publishing announcement", { requestId, userId, id });

    try {
      // Check if announcement exists
      const existing = await this.repository.findById(id);

      if (!existing) {
        return this.error(
          ErrorCodes.ANN_NOT_FOUND,
          "Announcement not found",
          { id }
        );
      }

      // Check if already published
      if (existing.isActive) {
        return this.error(
          ErrorCodes.ANN_ALREADY_PUBLISHED,
          "Announcement is already published",
          { id }
        );
      }

      // Check if has expired
      if (existing.expiresAt && existing.expiresAt < new Date()) {
        return this.error(
          ErrorCodes.ANN_PUBLISH_FAILED,
          "Cannot publish an expired announcement",
          { id }
        );
      }

      // Publish the announcement
      const announcement = await this.repository.update(id, {
        isActive: true,
      });

      const duration = Date.now() - startTime;
      logAudit({
        requestId,
        userId,
        action: "PUBLISH",
        entityId: id,
        duration,
        status: "success",
      });

      this.logInfo("Announcement published successfully", {
        requestId,
        id,
        duration,
      });

      return this.success(announcement, "Announcement published successfully");
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorResult = this.handleError(error);

      logAudit({
        requestId,
        userId,
        action: "PUBLISH",
        entityId: id,
        duration,
        status: "error",
        error: errorResult.message,
      });

      return errorResult;
    }
  }

  /**
   * Unpublish an announcement (set isActive to false)
   */
  async unpublishAnnouncement(
    id: string,
    userId?: string
  ): Promise<ServiceResult<AnnouncementDomain>> {
    const requestId = logger.generateRequestId();
    const startTime = Date.now();

    this.logInfo("Unpublishing announcement", { requestId, userId, id });

    try {
      // Check if announcement exists
      const existing = await this.repository.findById(id);

      if (!existing) {
        return this.error(
          ErrorCodes.ANN_NOT_FOUND,
          "Announcement not found",
          { id }
        );
      }

      // Check if already unpublished
      if (!existing.isActive) {
        return this.error(
          ErrorCodes.ANN_PUBLISH_FAILED,
          "Announcement is already unpublished",
          { id }
        );
      }

      // Unpublish the announcement
      const announcement = await this.repository.update(id, {
        isActive: false,
      });

      const duration = Date.now() - startTime;
      logAudit({
        requestId,
        userId,
        action: "UNPUBLISH",
        entityId: id,
        duration,
        status: "success",
      });

      this.logInfo("Announcement unpublished successfully", {
        requestId,
        id,
        duration,
      });

      return this.success(announcement, "Announcement unpublished successfully");
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorResult = this.handleError(error);

      logAudit({
        requestId,
        userId,
        action: "UNPUBLISH",
        entityId: id,
        duration,
        status: "error",
        error: errorResult.message,
      });

      return errorResult;
    }
  }

  /**
   * Archive an announcement
   */
  async archiveAnnouncement(
    id: string,
    userId?: string
  ): Promise<ServiceResult<AnnouncementDomain>> {
    const requestId = logger.generateRequestId();
    const startTime = Date.now();

    this.logInfo("Archiving announcement", { requestId, userId, id });

    try {
      // Check if announcement exists
      const existing = await this.repository.findById(id);

      if (!existing) {
        return this.error(
          ErrorCodes.ANN_NOT_FOUND,
          "Announcement not found",
          { id }
        );
      }

      // Archive by setting isActive to false
      const announcement = await this.repository.update(id, {
        isActive: false,
      });

      const duration = Date.now() - startTime;
      logAudit({
        requestId,
        userId,
        action: "ARCHIVE",
        entityId: id,
        duration,
        status: "success",
      });

      this.logInfo("Announcement archived successfully", {
        requestId,
        id,
        duration,
      });

      return this.success(announcement, "Announcement archived successfully");
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorResult = this.handleError(error);

      logAudit({
        requestId,
        userId,
        action: "ARCHIVE",
        entityId: id,
        duration,
        status: "error",
        error: errorResult.message,
      });

      return errorResult;
    }
  }

  // ==========================================================================
  // Query Operations
  // ==========================================================================

  /**
   * Get a single announcement by ID
   */
  async getAnnouncement(id: string): Promise<ServiceResult<AnnouncementDomain>> {
    const requestId = logger.generateRequestId();
    const startTime = Date.now();

    this.logInfo("Getting announcement", { requestId, id });

    try {
      const announcement = await this.repository.findById(id);

      const duration = Date.now() - startTime;
      logAudit({
        requestId,
        action: "GET",
        entityId: id,
        duration,
        status: "success",
      });

      return this.success(announcement);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorResult = this.handleError(error);

      logAudit({
        requestId,
        action: "GET",
        entityId: id,
        duration,
        status: "error",
        error: errorResult.message,
      });

      return errorResult;
    }
  }

  /**
   * Get public announcements (published only)
   */
  async getPublicAnnouncements(params?: {
    type?: string;
    limit?: number;
  }): Promise<ServiceResult<AnnouncementDomain[]>> {
    const requestId = logger.generateRequestId();
    const startTime = Date.now();

    this.logInfo("Getting public announcements", { requestId, params });

    try {
      let announcements: AnnouncementDomain[];

      if (params?.type) {
        announcements = await this.repository.findByType(params.type);
      } else {
        announcements = await this.repository.findPublished();
      }

      // Apply limit if specified
      if (params?.limit && params.limit > 0) {
        announcements = announcements.slice(0, params.limit);
      }

      const duration = Date.now() - startTime;
      logAudit({
        requestId,
        action: "GET_PUBLIC",
        duration,
        status: "success",
      });

      return this.success(announcements);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorResult = this.handleError(error);

      logAudit({
        requestId,
        action: "GET_PUBLIC",
        duration,
        status: "error",
        error: errorResult.message,
      });

      return errorResult;
    }
  }

  /**
   * Get all announcements for admin (with pagination)
   */
  async getAdminAnnouncements(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    type?: string;
    isActive?: boolean;
    includeDeleted?: boolean;
  }): Promise<ServiceResult<PaginatedResult<AnnouncementDomain>>> {
    const requestId = logger.generateRequestId();
    const startTime = Date.now();

    this.logInfo("Getting admin announcements", { requestId, params });

    try {
      const page = params?.page || 1;
      const limit = Math.min(params?.limit || 20, 100);

      const { data, total } = await this.repository.findAll({
        page,
        limit,
        sortBy: params?.sortBy || "createdAt",
        sortOrder: params?.sortOrder || "desc",
        includeDeleted: params?.includeDeleted || false,
      });

      // Filter by type if specified
      let filteredData = data;
      if (params?.type) {
        filteredData = data.filter((a) => a.type === params.type);
      }

      // Filter by isActive if specified
      if (params?.isActive !== undefined) {
        filteredData = data.filter((a) => a.isActive === params.isActive);
      }

      const totalPages = Math.ceil(total / limit);
      const paginatedResult: PaginatedResult<AnnouncementDomain> = {
        data: filteredData,
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };

      const duration = Date.now() - startTime;
      logAudit({
        requestId,
        action: "GET_ADMIN",
        duration,
        status: "success",
      });

      return this.success(paginatedResult);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorResult = this.handleError(error);

      logAudit({
        requestId,
        action: "GET_ADMIN",
        duration,
        status: "error",
        error: errorResult.message,
      });

      return errorResult;
    }
  }

  /**
   * Search announcements
   */
  async searchAnnouncements(
    params: AnnouncementSearchParams & { page?: number; limit?: number }
  ): Promise<ServiceResult<PaginatedResult<AnnouncementDomain>>> {
    const requestId = logger.generateRequestId();
    const startTime = Date.now();

    this.logInfo("Searching announcements", { requestId, params });

    try {
      const page = params.page || 1;
      const limit = Math.min(params.limit || 20, 100);
      const offset = (page - 1) * limit;

      const announcements = await this.repository.search({
        query: params.query || "",
        type: params.type,
        isActive: params.isActive,
        limit,
        offset,
      });

      const total = announcements.length;
      const totalPages = Math.ceil(total / limit);

      const paginatedResult: PaginatedResult<AnnouncementDomain> = {
        data: announcements,
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };

      const duration = Date.now() - startTime;
      logAudit({
        requestId,
        action: "SEARCH",
        duration,
        status: "success",
      });

      return this.success(paginatedResult);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorResult = this.handleError(error);

      logAudit({
        requestId,
        action: "SEARCH",
        duration,
        status: "error",
        error: errorResult.message,
      });

      return errorResult;
    }
  }
}

// Singleton instance
export const announcementService = new AnnouncementService();
