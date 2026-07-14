/**
 * Announcement Repository
 * 
 * Data access layer for announcements.
 * Uses mapper to convert Prisma objects to domain objects.
 * 
 * Features:
 * - CRUD operations
 * - Soft delete and restore
 * - Cursor pagination
 * - Search functionality
 * - Published announcements filtering
 */

import { prisma } from "@/lib/db";
import { BaseRepository } from "@/repositories/base";
import { announcementMapper } from "@/mappers/announcement";
import { logger } from "@/lib/logger";
import { NotFoundError, ConflictError, DatabaseError } from "@/errors";
import type { AnnouncementDomain, IAnnouncementRepository } from "@/types/interfaces";
import type { Prisma } from "@prisma/client";

type AnnouncementDelegate = Prisma.AnnouncementDelegate<never>;

// ============================================================================
// Repository Implementation
// ============================================================================

export class AnnouncementRepository
  extends BaseRepository<AnnouncementDomain>
  implements IAnnouncementRepository
{
  private announcementModel: AnnouncementDelegate;

  constructor() {
    super(prisma.announcement);
    this.announcementModel = prisma.announcement;
  }

  protected getModelName(): string {
    return "Announcement";
  }

  // ==========================================================================
  // Domain Methods
  // ==========================================================================

  /**
   * Find all active announcements (for public display)
   */
  async findActive(): Promise<AnnouncementDomain[]> {
    const records = await this.announcementModel.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      orderBy: [
        { isPinned: "desc" },
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    return announcementMapper.toDomainList(records);
  }

  /**
   * Find announcements by type
   */
  async findByType(type: string): Promise<AnnouncementDomain[]> {
    const records = await this.announcementModel.findMany({
      where: {
        type,
        deletedAt: null,
      },
      orderBy: [
        { isPinned: "desc" },
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    return announcementMapper.toDomainList(records);
  }

  /**
   * Find published announcements (active and within publish window)
   * For public display - respects publishAt and expiresAt
   */
  async findPublished(): Promise<AnnouncementDomain[]> {
    const now = new Date();
    
    const records = await this.announcementModel.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        OR: [
          { publishAt: null },
          { publishAt: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: now } },
            ],
          },
        ],
      },
      orderBy: [
        { isPinned: "desc" },
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    return announcementMapper.toDomainList(records);
  }

  /**
   * Find all announcements with pagination
   */
  async findAll(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    includeDeleted?: boolean;
  }): Promise<{ data: AnnouncementDomain[]; total: number }> {
    const page = Math.max(1, params?.page || 1);
    const limit = Math.min(100, Math.max(1, params?.limit || 20));
    const offset = (page - 1) * limit;
    const sortBy = params?.sortBy || "createdAt";
    const sortOrder = params?.sortOrder || "desc";
    const includeDeleted = params?.includeDeleted || false;

    const where = includeDeleted ? {} : { deletedAt: null };

    const [records, total] = await Promise.all([
      this.announcementModel.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: offset,
        take: limit,
      }),
      this.announcementModel.count({ where }),
    ]);

    return {
      data: announcementMapper.toDomainList(records),
      total,
    };
  }

  /**
   * Search announcements by query
   */
  async search(params: {
    query: string;
    type?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<AnnouncementDomain[]> {
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const offset = params.offset || 0;

    const where: Prisma.AnnouncementWhereInput = {
      deletedAt: null,
      AND: [
        {
          OR: [
            { title: { contains: params.query, mode: "insensitive" } },
            { content: { contains: params.query, mode: "insensitive" } },
            { excerpt: { contains: params.query, mode: "insensitive" } },
          ],
        },
      ],
    };

    if (params.type) {
      where.type = params.type;
    }

    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    const records = await this.announcementModel.findMany({
      where,
      orderBy: [
        { isPinned: "desc" },
        { priority: "desc" },
        { createdAt: "desc" },
      ],
      skip: offset,
      take: limit,
    });

    return announcementMapper.toDomainList(records);
  }

  /**
   * Cursor-based pagination for announcements
   */
  async paginate(params: {
    cursor?: string;
    limit?: number;
    type?: string;
    isActive?: boolean;
    includeDeleted?: boolean;
  }): Promise<{ data: AnnouncementDomain[]; nextCursor: string | null }> {
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const includeDeleted = params.includeDeleted || false;

    const where: Prisma.AnnouncementWhereInput = {};

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (params.type) {
      where.type = params.type;
    }

    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    // Handle cursor pagination
    if (params.cursor) {
      const decodedCursor = Buffer.from(params.cursor, "base64").toString("utf-8");
      where.id = { lt: decodedCursor };
    }

    const records = await this.announcementModel.findMany({
      where,
      orderBy: [
        { isPinned: "desc" },
        { priority: "desc" },
        { createdAt: "desc" },
      ],
      take: limit + 1, // Fetch one extra to determine if there are more
    });

    const hasMore = records.length > limit;
    const data = hasMore ? records.slice(0, -1) : records;
    const nextCursor = hasMore && data.length > 0
      ? Buffer.from(data[data.length - 1].id).toString("base64")
      : null;

    return {
      data: announcementMapper.toDomainList(data),
      nextCursor,
    };
  }

  /**
   * Soft delete an announcement (set deletedAt)
   */
  async softDelete(id: string): Promise<AnnouncementDomain> {
    try {
      const record = await this.announcementModel.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      logger.info("Soft deleted announcement", { id });
      return announcementMapper.toDomain(record);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        throw new NotFoundError(this.getModelName(), id);
      }
      logger.error("Failed to soft delete announcement", error as Error, { id });
      throw new DatabaseError(`Failed to delete ${this.getModelName()}`);
    }
  }

  /**
   * Restore a soft-deleted announcement
   */
  async restore(id: string): Promise<AnnouncementDomain> {
    try {
      // First check if the announcement exists and is deleted
      const existing = await this.announcementModel.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundError(this.getModelName(), id);
      }

      if (!existing.deletedAt) {
        throw new ConflictError("Announcement is not deleted");
      }

      const record = await this.announcementModel.update({
        where: { id },
        data: { deletedAt: null },
      });

      logger.info("Restored announcement", { id });
      return announcementMapper.toDomain(record);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      logger.error("Failed to restore announcement", error as Error, { id });
      throw new DatabaseError(`Failed to restore ${this.getModelName()}`);
    }
  }

  // ==========================================================================
  // Override base methods to return domain objects
  // ==========================================================================

  async findById(id: string): Promise<AnnouncementDomain> {
    const prismaRecord = await this.announcementModel.findUnique({
      where: { id },
    });

    if (!prismaRecord) {
      throw new NotFoundError(this.getModelName(), id);
    }

    return announcementMapper.toDomain(prismaRecord);
  }

  async create(data: Partial<AnnouncementDomain>): Promise<AnnouncementDomain> {
    const input = announcementMapper.toCreateInput(data);
    try {
      const prismaRecord = await this.announcementModel.create({ data: input });
      logger.info("Created announcement", { id: prismaRecord.id });
      return announcementMapper.toDomain(prismaRecord);
    } catch (error) {
      logger.error("Failed to create announcement", error as Error);
      throw new DatabaseError(`Failed to create ${this.getModelName()}`);
    }
  }

  async update(id: string, data: Partial<AnnouncementDomain>): Promise<AnnouncementDomain> {
    const input = announcementMapper.toUpdateInput(data);
    try {
      const prismaRecord = await this.announcementModel.update({
        where: { id },
        data: input,
      });
      logger.info("Updated announcement", { id });
      return announcementMapper.toDomain(prismaRecord);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        throw new NotFoundError(this.getModelName(), id);
      }
      logger.error("Failed to update announcement", error as Error, { id });
      throw new DatabaseError(`Failed to update ${this.getModelName()}`);
    }
  }

  /**
   * Hard delete (for admin use only)
   */
  async hardDelete(id: string): Promise<AnnouncementDomain> {
    try {
      const record = await this.announcementModel.delete({
        where: { id },
      });
      logger.info("Hard deleted announcement", { id });
      return announcementMapper.toDomain(record);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        throw new NotFoundError(this.getModelName(), id);
      }
      logger.error("Failed to hard delete announcement", error as Error, { id });
      throw new DatabaseError(`Failed to delete ${this.getModelName()}`);
    }
  }
}

// Singleton instance
export const announcementRepository = new AnnouncementRepository();
