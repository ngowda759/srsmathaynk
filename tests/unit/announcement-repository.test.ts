/**
 * Announcement Repository Tests
 * 
 * Tests for the AnnouncementRepository data access layer.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock Prisma
const mockPrismaAnnouncement = {
  findMany: vi.fn(),
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
};

vi.mock("@/lib/db", () => ({
  prisma: {
    announcement: mockPrismaAnnouncement,
  },
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    generateRequestId: vi.fn(() => "test-request-id"),
  },
}));

// Import after mocks
import { AnnouncementRepository } from "@/repositories/announcement";
import { NotFoundError, ConflictError } from "@/errors";

describe("AnnouncementRepository", () => {
  let repository: AnnouncementRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new AnnouncementRepository();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // findById Tests
  // ==========================================================================

  describe("findById", () => {
    it("should return announcement when found", async () => {
      const mockAnnouncement = {
        id: "test-id",
        title: "Test Announcement",
        content: "Test content",
        excerpt: null,
        type: "GENERAL",
        priority: "NORMAL",
        isPinned: false,
        isActive: true,
        publishAt: null,
        expiresAt: null,
        authorId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockPrismaAnnouncement.findUnique.mockResolvedValue(mockAnnouncement);

      const result = await repository.findById("test-id");

      expect(mockPrismaAnnouncement.findUnique).toHaveBeenCalledWith({
        where: { id: "test-id" },
      });
      expect(result).toMatchObject({
        id: "test-id",
        title: "Test Announcement",
      });
    });

    it("should throw NotFoundError when announcement not found", async () => {
      mockPrismaAnnouncement.findUnique.mockResolvedValue(null);

      await expect(repository.findById("non-existent-id")).rejects.toThrow(
        NotFoundError
      );
    });
  });

  // ==========================================================================
  // findActive Tests
  // ==========================================================================

  describe("findActive", () => {
    it("should return only active non-deleted announcements", async () => {
      const mockAnnouncements = [
        {
          id: "id-1",
          title: "Announcement 1",
          content: "Content 1",
          excerpt: null,
          type: "GENERAL",
          priority: "NORMAL",
          isPinned: false,
          isActive: true,
          publishAt: null,
          expiresAt: null,
          authorId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      mockPrismaAnnouncement.findMany.mockResolvedValue(mockAnnouncements);

      const result = await repository.findActive();

      expect(mockPrismaAnnouncement.findMany).toHaveBeenCalledWith({
        where: { isActive: true, deletedAt: null },
        orderBy: [{ isPinned: "desc" }, { priority: "desc" }, { createdAt: "desc" }],
      });
      expect(result).toHaveLength(1);
    });
  });

  // ==========================================================================
  // findPublished Tests
  // ==========================================================================

  describe("findPublished", () => {
    it("should return only published announcements within date range", async () => {
      const mockAnnouncements = [
        {
          id: "id-1",
          title: "Published Announcement",
          content: "Content",
          excerpt: null,
          type: "GENERAL",
          priority: "NORMAL",
          isPinned: false,
          isActive: true,
          publishAt: null,
          expiresAt: null,
          authorId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      mockPrismaAnnouncement.findMany.mockResolvedValue(mockAnnouncements);

      const result = await repository.findPublished();

      const callArgs = mockPrismaAnnouncement.findMany.mock.calls[0][0];
      expect(callArgs.where.isActive).toBe(true);
      expect(callArgs.where.deletedAt).toBeNull();
      expect(result).toHaveLength(1);
    });
  });

  // ==========================================================================
  // create Tests
  // ==========================================================================

  describe("create", () => {
    it("should create announcement and return domain object", async () => {
      const input = {
        title: "New Announcement",
        content: "New content",
        type: "GENERAL" as const,
        priority: "NORMAL" as const,
      };

      const mockCreated = {
        id: "new-id",
        title: "New Announcement",
        content: "New content",
        excerpt: null,
        type: "GENERAL",
        priority: "NORMAL",
        isPinned: false,
        isActive: true,
        publishAt: null,
        expiresAt: null,
        authorId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockPrismaAnnouncement.create.mockResolvedValue(mockCreated);

      const result = await repository.create(input);

      expect(mockPrismaAnnouncement.create).toHaveBeenCalled();
      expect(result).toMatchObject({
        id: "new-id",
        title: "New Announcement",
      });
    });
  });

  // ==========================================================================
  // update Tests
  // ==========================================================================

  describe("update", () => {
    it("should update announcement and return domain object", async () => {
      const input = { title: "Updated Title" };

      const mockUpdated = {
        id: "test-id",
        title: "Updated Title",
        content: "Content",
        excerpt: null,
        type: "GENERAL",
        priority: "NORMAL",
        isPinned: false,
        isActive: true,
        publishAt: null,
        expiresAt: null,
        authorId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockPrismaAnnouncement.update.mockResolvedValue(mockUpdated);

      const result = await repository.update("test-id", input);

      expect(mockPrismaAnnouncement.update).toHaveBeenCalledWith({
        where: { id: "test-id" },
        data: expect.objectContaining({ title: "Updated Title" }),
      });
      expect(result.title).toBe("Updated Title");
    });

    it("should throw NotFoundError when updating non-existent announcement", async () => {
      const error = new Error("Record not found") as Error & { code: string };
      error.code = "P2025";
      mockPrismaAnnouncement.update.mockRejectedValue(error);

      await expect(repository.update("non-existent-id", { title: "Test" })).rejects.toThrow(
        NotFoundError
      );
    });
  });

  // ==========================================================================
  // softDelete Tests
  // ==========================================================================

  describe("softDelete", () => {
    it("should set deletedAt timestamp", async () => {
      const mockDeleted = {
        id: "test-id",
        title: "Test",
        content: "Content",
        excerpt: null,
        type: "GENERAL",
        priority: "NORMAL",
        isPinned: false,
        isActive: true,
        publishAt: null,
        expiresAt: null,
        authorId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      };

      mockPrismaAnnouncement.update.mockResolvedValue(mockDeleted);

      const result = await repository.softDelete("test-id");

      expect(mockPrismaAnnouncement.update).toHaveBeenCalledWith({
        where: { id: "test-id" },
        data: { deletedAt: expect.any(Date) },
      });
      expect(result.deletedAt).toBeInstanceOf(Date);
    });
  });

  // ==========================================================================
  // restore Tests
  // ==========================================================================

  describe("restore", () => {
    it("should clear deletedAt timestamp", async () => {
      const existingAnnouncement = {
        id: "test-id",
        deletedAt: new Date(),
      };

      const mockRestored = {
        id: "test-id",
        title: "Test",
        content: "Content",
        excerpt: null,
        type: "GENERAL",
        priority: "NORMAL",
        isPinned: false,
        isActive: true,
        publishAt: null,
        expiresAt: null,
        authorId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockPrismaAnnouncement.findUnique.mockResolvedValue(existingAnnouncement);
      mockPrismaAnnouncement.update.mockResolvedValue(mockRestored);

      const result = await repository.restore("test-id");

      expect(mockPrismaAnnouncement.update).toHaveBeenCalledWith({
        where: { id: "test-id" },
        data: { deletedAt: null },
      });
      expect(result.deletedAt).toBeNull();
    });

    it("should throw ConflictError when announcement is not deleted", async () => {
      const existingAnnouncement = {
        id: "test-id",
        deletedAt: null,
      };

      mockPrismaAnnouncement.findUnique.mockResolvedValue(existingAnnouncement);

      await expect(repository.restore("test-id")).rejects.toThrow(ConflictError);
    });

    it("should throw NotFoundError when announcement does not exist", async () => {
      mockPrismaAnnouncement.findUnique.mockResolvedValue(null);

      await expect(repository.restore("non-existent-id")).rejects.toThrow(
        NotFoundError
      );
    });
  });

  // ==========================================================================
  // search Tests
  // ==========================================================================

  describe("search", () => {
    it("should search by title, content, and excerpt", async () => {
      mockPrismaAnnouncement.findMany.mockResolvedValue([]);

      await repository.search({ query: "test query" });

      const callArgs = mockPrismaAnnouncement.findMany.mock.calls[0][0];
      expect(callArgs.where.AND[0].OR).toContainEqual(
        expect.objectContaining({ title: { contains: "test query", mode: "insensitive" } })
      );
      expect(callArgs.where.AND[0].OR).toContainEqual(
        expect.objectContaining({ content: { contains: "test query", mode: "insensitive" } })
      );
    });

    it("should filter by type when provided", async () => {
      mockPrismaAnnouncement.findMany.mockResolvedValue([]);

      await repository.search({ query: "test", type: "EVENT" });

      const callArgs = mockPrismaAnnouncement.findMany.mock.calls[0][0];
      expect(callArgs.where.type).toBe("EVENT");
    });

    it("should filter by isActive when provided", async () => {
      mockPrismaAnnouncement.findMany.mockResolvedValue([]);

      await repository.search({ query: "test", isActive: true });

      const callArgs = mockPrismaAnnouncement.findMany.mock.calls[0][0];
      expect(callArgs.where.isActive).toBe(true);
    });
  });

  // ==========================================================================
  // paginate Tests
  // ==========================================================================

  describe("paginate", () => {
    it("should return paginated results with cursor", async () => {
      const mockAnnouncements = [
        { id: "id-1", title: "A", content: "C", excerpt: null, type: "GENERAL", priority: "NORMAL", isPinned: false, isActive: true, publishAt: null, expiresAt: null, authorId: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: "id-2", title: "B", content: "C", excerpt: null, type: "GENERAL", priority: "NORMAL", isPinned: false, isActive: true, publishAt: null, expiresAt: null, authorId: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
      ];

      mockPrismaAnnouncement.findMany.mockResolvedValue(mockAnnouncements);

      const result = await repository.paginate({ limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.nextCursor).toBeNull();
    });

    it("should return nextCursor when there are more results", async () => {
      const mockAnnouncements = [
        { id: "id-1", title: "A", content: "C", excerpt: null, type: "GENERAL", priority: "NORMAL", isPinned: false, isActive: true, publishAt: null, expiresAt: null, authorId: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: "id-2", title: "B", content: "C", excerpt: null, type: "GENERAL", priority: "NORMAL", isPinned: false, isActive: true, publishAt: null, expiresAt: null, authorId: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: "id-3", title: "C", content: "C", excerpt: null, type: "GENERAL", priority: "NORMAL", isPinned: false, isActive: true, publishAt: null, expiresAt: null, authorId: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
      ];

      mockPrismaAnnouncement.findMany.mockResolvedValue(mockAnnouncements);

      const result = await repository.paginate({ limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.nextCursor).toBeTruthy();
    });
  });

  // ==========================================================================
  // findAll Tests
  // ==========================================================================

  describe("findAll", () => {
    it("should return paginated results with total count", async () => {
      const mockAnnouncements = [
        { id: "id-1", title: "A", content: "C", excerpt: null, type: "GENERAL", priority: "NORMAL", isPinned: false, isActive: true, publishAt: null, expiresAt: null, authorId: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
      ];

      mockPrismaAnnouncement.findMany.mockResolvedValue(mockAnnouncements);
      mockPrismaAnnouncement.count.mockResolvedValue(1);

      const result = await repository.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it("should include deleted when includeDeleted is true", async () => {
      mockPrismaAnnouncement.findMany.mockResolvedValue([]);
      mockPrismaAnnouncement.count.mockResolvedValue(0);

      await repository.findAll({ includeDeleted: true });

      const callArgs = mockPrismaAnnouncement.findMany.mock.calls[0][0];
      expect(callArgs.where).toEqual({});
    });
  });
});
