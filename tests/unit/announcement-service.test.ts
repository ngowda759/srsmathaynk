/**
 * Announcement Service Tests
 * 
 * Tests for the AnnouncementService business logic layer.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { IAnnouncementRepository } from "@/types/interfaces";

// Mock repository
const mockRepository: Partial<IAnnouncementRepository> = {
  findById: vi.fn(),
  findActive: vi.fn(),
  findPublished: vi.fn(),
  findByType: vi.fn(),
  findAll: vi.fn(),
  search: vi.fn(),
  paginate: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
  restore: vi.fn(),
};

// Mock logger
const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  generateRequestId: vi.fn(() => "test-request-id"),
};

vi.mock("@/lib/logger", () => ({
  logger: mockLogger,
}));

// Mock errors
vi.mock("@/errors", () => ({
  ErrorCodes: {
    ANN_NOT_FOUND: "ANN_NOT_FOUND",
    VAL_INVALID_INPUT: "VAL_INVALID_INPUT",
    ANN_ALREADY_PUBLISHED: "ANN_ALREADY_PUBLISHED",
    ANN_PUBLISH_FAILED: "ANN_PUBLISH_FAILED",
    APP_INTERNAL: "APP_INTERNAL",
  },
  NotFoundError: class NotFoundError extends Error {
    constructor(entity: string, id: string) {
      super(`${entity} with id ${id} not found`);
      this.name = "NotFoundError";
    }
  },
  ConflictError: class ConflictError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "ConflictError";
    }
  },
  ValidationError: class ValidationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "ValidationError";
    }
  },
}));

// Import after mocks
import { AnnouncementService } from "@/services/announcement.service";

describe("AnnouncementService", () => {
  let service: AnnouncementService;

  const mockAnnouncement = {
    id: "test-id",
    title: "Test Announcement",
    content: "Test content",
    excerpt: null,
    type: "GENERAL" as const,
    priority: "NORMAL" as const,
    isPinned: false,
    isActive: true,
    status: "PUBLISHED" as const,
    publishAt: null,
    expiresAt: null,
    authorId: "author-id",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AnnouncementService(mockRepository as IAnnouncementRepository);
  });

  // ==========================================================================
  // createAnnouncement Tests
  // ==========================================================================

  describe("createAnnouncement", () => {
    it("should create announcement successfully", async () => {
      mockRepository.create.mockResolvedValue(mockAnnouncement);

      const result = await service.createAnnouncement({
        title: "Test Announcement",
        content: "Test content",
      });

      expect(result.status).toBe("success");
      expect(result.data).toMatchObject({
        title: "Test Announcement",
      });
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Announcement",
          content: "Test content",
        })
      );
    });

    it("should reject empty title", async () => {
      const result = await service.createAnnouncement({
        title: "   ",
        content: "Test content",
      });

      expect(result.status).toBe("error");
      expect(result.code).toBe("VAL_INVALID_INPUT");
    });

    it("should reject empty content", async () => {
      const result = await service.createAnnouncement({
        title: "Test Title",
        content: "",
      });

      expect(result.status).toBe("error");
      expect(result.code).toBe("VAL_INVALID_INPUT");
    });

    it("should reject invalid date range", async () => {
      const result = await service.createAnnouncement({
        title: "Test",
        content: "Content",
        publishAt: new Date("2024-12-31"),
        expiresAt: new Date("2024-01-01"),
      });

      expect(result.status).toBe("error");
      expect(result.code).toBe("VAL_INVALID_INPUT");
    });
  });

  // ==========================================================================
  // updateAnnouncement Tests
  // ==========================================================================

  describe("updateAnnouncement", () => {
    it("should update announcement successfully", async () => {
      mockRepository.findById.mockResolvedValue(mockAnnouncement);
      mockRepository.update.mockResolvedValue({
        ...mockAnnouncement,
        title: "Updated Title",
      });

      const result = await service.updateAnnouncement("test-id", {
        title: "Updated Title",
      });

      expect(result.status).toBe("success");
      expect(result.data?.title).toBe("Updated Title");
    });

    it("should return error when announcement not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.updateAnnouncement("non-existent-id", {
        title: "Updated",
      });

      expect(result.status).toBe("error");
      expect(result.code).toBe("ANN_NOT_FOUND");
    });

    it("should reject invalid date range on update", async () => {
      mockRepository.findById.mockResolvedValue({
        ...mockAnnouncement,
        publishAt: new Date("2024-01-01"),
        expiresAt: new Date("2024-12-31"),
      });

      const result = await service.updateAnnouncement("test-id", {
        publishAt: new Date("2024-12-31"),
        expiresAt: new Date("2024-01-01"),
      });

      expect(result.status).toBe("error");
      expect(result.code).toBe("VAL_INVALID_INPUT");
    });
  });

  // ==========================================================================
  // deleteAnnouncement Tests
  // ==========================================================================

  describe("deleteAnnouncement", () => {
    it("should soft delete announcement successfully", async () => {
      mockRepository.findById.mockResolvedValue(mockAnnouncement);
      mockRepository.softDelete.mockResolvedValue({
        ...mockAnnouncement,
        deletedAt: new Date(),
      });

      const result = await service.deleteAnnouncement("test-id");

      expect(result.status).toBe("success");
      expect(mockRepository.softDelete).toHaveBeenCalledWith("test-id");
    });

    it("should return error when announcement not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.deleteAnnouncement("non-existent-id");

      expect(result.status).toBe("error");
      expect(result.code).toBe("ANN_NOT_FOUND");
    });
  });

  // ==========================================================================
  // restoreAnnouncement Tests
  // ==========================================================================

  describe("restoreAnnouncement", () => {
    it("should restore announcement successfully", async () => {
      mockRepository.restore.mockResolvedValue({
        ...mockAnnouncement,
        deletedAt: null,
      });

      const result = await service.restoreAnnouncement("test-id");

      expect(result.status).toBe("success");
      expect(result.data?.deletedAt).toBeNull();
    });

    it("should return error when announcement not found", async () => {
      mockRepository.restore.mockRejectedValue(
        new (class extends Error {
          name = "NotFoundError";
        })("Not found")
      );

      const result = await service.restoreAnnouncement("non-existent-id");

      expect(result.status).toBe("error");
      expect(result.code).toBe("ANN_NOT_FOUND");
    });
  });

  // ==========================================================================
  // publishAnnouncement Tests
  // ==========================================================================

  describe("publishAnnouncement", () => {
    it("should publish announcement successfully", async () => {
      mockRepository.findById.mockResolvedValue({
        ...mockAnnouncement,
        isActive: false,
      });
      mockRepository.update.mockResolvedValue({
        ...mockAnnouncement,
        isActive: true,
      });

      const result = await service.publishAnnouncement("test-id");

      expect(result.status).toBe("success");
      expect(result.data?.isActive).toBe(true);
    });

    it("should return error when announcement already published", async () => {
      mockRepository.findById.mockResolvedValue({
        ...mockAnnouncement,
        isActive: true,
      });

      const result = await service.publishAnnouncement("test-id");

      expect(result.status).toBe("error");
      expect(result.code).toBe("ANN_ALREADY_PUBLISHED");
    });

    it("should return error when announcement is expired", async () => {
      mockRepository.findById.mockResolvedValue({
        ...mockAnnouncement,
        isActive: false,
        expiresAt: new Date("2020-01-01"),
      });

      const result = await service.publishAnnouncement("test-id");

      expect(result.status).toBe("error");
      expect(result.code).toBe("ANN_PUBLISH_FAILED");
    });
  });

  // ==========================================================================
  // unpublishAnnouncement Tests
  // ==========================================================================

  describe("unpublishAnnouncement", () => {
    it("should unpublish announcement successfully", async () => {
      mockRepository.findById.mockResolvedValue({
        ...mockAnnouncement,
        isActive: true,
      });
      mockRepository.update.mockResolvedValue({
        ...mockAnnouncement,
        isActive: false,
      });

      const result = await service.unpublishAnnouncement("test-id");

      expect(result.status).toBe("success");
      expect(result.data?.isActive).toBe(false);
    });

    it("should return error when announcement already unpublished", async () => {
      mockRepository.findById.mockResolvedValue({
        ...mockAnnouncement,
        isActive: false,
      });

      const result = await service.unpublishAnnouncement("test-id");

      expect(result.status).toBe("error");
      expect(result.code).toBe("ANN_PUBLISH_FAILED");
    });
  });

  // ==========================================================================
  // getAnnouncement Tests
  // ==========================================================================

  describe("getAnnouncement", () => {
    it("should return announcement successfully", async () => {
      mockRepository.findById.mockResolvedValue(mockAnnouncement);

      const result = await service.getAnnouncement("test-id");

      expect(result.status).toBe("success");
      expect(result.data).toMatchObject({
        id: "test-id",
      });
    });

    it("should return error when not found", async () => {
      mockRepository.findById.mockRejectedValue(
        new (class extends Error {
          name = "NotFoundError";
        })("Not found")
      );

      const result = await service.getAnnouncement("non-existent-id");

      expect(result.status).toBe("error");
      expect(result.code).toBe("ANN_NOT_FOUND");
    });
  });

  // ==========================================================================
  // getPublicAnnouncements Tests
  // ==========================================================================

  describe("getPublicAnnouncements", () => {
    it("should return published announcements", async () => {
      mockRepository.findPublished.mockResolvedValue([mockAnnouncement]);

      const result = await service.getPublicAnnouncements();

      expect(result.status).toBe("success");
      expect(result.data).toHaveLength(1);
    });

    it("should filter by type when provided", async () => {
      mockRepository.findByType.mockResolvedValue([mockAnnouncement]);

      const result = await service.getPublicAnnouncements({ type: "EVENT" });

      expect(result.status).toBe("success");
      expect(mockRepository.findByType).toHaveBeenCalledWith("EVENT");
    });

    it("should apply limit when specified", async () => {
      const manyAnnouncements = Array(10)
        .fill(null)
        .map((_, i) => ({ ...mockAnnouncement, id: `id-${i}` }));
      mockRepository.findPublished.mockResolvedValue(manyAnnouncements);

      const result = await service.getPublicAnnouncements({ limit: 5 });

      expect(result.status).toBe("success");
      expect(result.data).toHaveLength(5);
    });
  });

  // ==========================================================================
  // getAdminAnnouncements Tests
  // ==========================================================================

  describe("getAdminAnnouncements", () => {
    it("should return paginated announcements", async () => {
      mockRepository.findAll.mockResolvedValue({
        data: [mockAnnouncement],
        total: 1,
      });

      const result = await service.getAdminAnnouncements({
        page: 1,
        limit: 10,
      });

      expect(result.status).toBe("success");
      expect(result.data?.meta.total).toBe(1);
      expect(result.data?.meta.page).toBe(1);
    });

    it("should filter by type", async () => {
      mockRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
      });

      await service.getAdminAnnouncements({ type: "EVENT" });

      expect(mockRepository.findAll).toHaveBeenCalled();
    });

    it("should limit maximum page size to 100", async () => {
      mockRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
      });

      await service.getAdminAnnouncements({ limit: 200 });

      expect(mockRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 100 })
      );
    });
  });

  // ==========================================================================
  // searchAnnouncements Tests
  // ==========================================================================

  describe("searchAnnouncements", () => {
    it("should search and return results", async () => {
      mockRepository.search.mockResolvedValue([mockAnnouncement]);

      const result = await service.searchAnnouncements({
        query: "test",
      });

      expect(result.status).toBe("success");
      expect(result.data?.data).toHaveLength(1);
    });

    it("should limit maximum page size to 100", async () => {
      mockRepository.search.mockResolvedValue([]);

      await service.searchAnnouncements({ limit: 200 });

      expect(mockRepository.search).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 100 })
      );
    });
  });

  // ==========================================================================
  // Audit Logging Tests
  // ==========================================================================

  describe("Audit Logging", () => {
    it("should log every operation with requestId, userId, action, entityId, duration, status", async () => {
      mockRepository.create.mockResolvedValue(mockAnnouncement);

      await service.createAnnouncement(
        { title: "Test", content: "Content" },
        "user-123"
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        "Announcement audit",
        expect.objectContaining({
          requestId: "test-request-id",
          userId: "user-123",
          action: "CREATE",
          entityId: mockAnnouncement.id,
          status: "success",
        })
      );
    });

    it("should log errors with status: error", async () => {
      mockRepository.findById.mockRejectedValue(new Error("Database error"));

      await service.getAnnouncement("test-id");

      expect(mockLogger.info).toHaveBeenCalledWith(
        "Announcement audit",
        expect.objectContaining({
          status: "error",
          error: expect.any(String),
        })
      );
    });
  });
});
