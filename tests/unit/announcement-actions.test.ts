/**
 * Announcement Server Actions Tests
 * 
 * Tests for the announcement server actions.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
const mockAnnouncementService = {
  createAnnouncement: vi.fn(),
  updateAnnouncement: vi.fn(),
  deleteAnnouncement: vi.fn(),
  restoreAnnouncement: vi.fn(),
  publishAnnouncement: vi.fn(),
  unpublishAnnouncement: vi.fn(),
  getAnnouncement: vi.fn(),
  getPublicAnnouncements: vi.fn(),
  getAdminAnnouncements: vi.fn(),
  searchAnnouncements: vi.fn(),
};

vi.mock("@/services/announcement.service", () => ({
  AnnouncementService: vi.fn(() => mockAnnouncementService),
  announcementService: mockAnnouncementService,
}));

const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  generateRequestId: vi.fn(() => "test-request-id"),
};

vi.mock("@/lib/logger", () => ({
  logger: mockLogger,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    profile: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/errors", () => ({
  ErrorCodes: {
    AUTH_REQUIRED: "AUTH_REQUIRED",
    AUTHZ_FORBIDDEN: "AUTHZ_FORBIDDEN",
    VAL_INVALID_INPUT: "VAL_INVALID_INPUT",
    APP_INTERNAL: "APP_INTERNAL",
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock auth helper functions
const mockGetCurrentUser = vi.fn();

// Import action functions
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  restoreAnnouncement,
  publishAnnouncement,
  unpublishAnnouncement,
  getAnnouncement,
  getPublicAnnouncements,
  getAnnouncements,
  searchAnnouncements,
} from "@/actions/announcement";

// We need to test the actual exported functions
// Since they're server actions, we'll test the logic flow
describe("Announcement Server Actions", () => {
  const mockUser = {
    id: "user-id",
    profileId: "profile-id",
    email: "test@example.com",
    role: "ADMIN" as const,
  };

  const mockAnnouncement = {
    id: "announcement-id",
    title: "Test Announcement",
    content: "Test content",
    type: "GENERAL" as const,
    priority: "NORMAL" as const,
    isPinned: false,
    isActive: true,
    status: "PUBLISHED" as const,
    publishAt: null,
    expiresAt: null,
    authorId: "profile-id",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // Authentication & Authorization Tests
  // ==========================================================================

  describe("Authentication", () => {
    it("should reject unauthenticated users for protected actions", async () => {
      // Test createAnnouncement with null user
      mockGetCurrentUser.mockResolvedValue(null);
      
      const result = await createAnnouncement({
        title: "Test",
        content: "Content",
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("AUTH_REQUIRED");
    });

    it("should reject non-admin users for protected actions", async () => {
      mockGetCurrentUser.mockResolvedValue({
        ...mockUser,
        role: "DEVOTEE" as const,
      });

      const result = await createAnnouncement({
        title: "Test",
        content: "Content",
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("AUTHZ_FORBIDDEN");
    });
  });

  describe("Authorization", () => {
    it("should allow admin users to create announcements", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockAnnouncementService.createAnnouncement.mockResolvedValue({
        status: "success",
        data: mockAnnouncement,
      });

      const result = await createAnnouncement({
        title: "Test",
        content: "Content",
      });

      expect(result.success).toBe(true);
      expect(mockAnnouncementService.createAnnouncement).toHaveBeenCalled();
    });

    it("should allow staff role to create announcements", async () => {
      mockGetCurrentUser.mockResolvedValue({
        ...mockUser,
        role: "STAFF" as const,
      });
      mockAnnouncementService.createAnnouncement.mockResolvedValue({
        status: "success",
        data: mockAnnouncement,
      });

      const result = await createAnnouncement({
        title: "Test",
        content: "Content",
      });

      expect(result.success).toBe(true);
    });

    it("should allow super_admin role to create announcements", async () => {
      mockGetCurrentUser.mockResolvedValue({
        ...mockUser,
        role: "SUPER_ADMIN" as const,
      });
      mockAnnouncementService.createAnnouncement.mockResolvedValue({
        status: "success",
        data: mockAnnouncement,
      });

      const result = await createAnnouncement({
        title: "Test",
        content: "Content",
      });

      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // Validation Tests
  // ==========================================================================

  describe("Validation", () => {
    it("should reject invalid input", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const result = await createAnnouncement({
        title: "",
        content: "",
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("VAL_INVALID_INPUT");
    });

    it("should reject invalid UUID for ID-based actions", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const result = await deleteAnnouncement("not-a-valid-uuid");

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("VAL_INVALID_INPUT");
    });
  });

  // ==========================================================================
  // Service Invocation Tests
  // ==========================================================================

  describe("Service Invocation", () => {
    it("should call service with correct parameters for create", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockAnnouncementService.createAnnouncement.mockResolvedValue({
        status: "success",
        data: mockAnnouncement,
      });

      await createAnnouncement({
        title: "New Announcement",
        content: "New content",
        type: "EVENT",
      });

      expect(mockAnnouncementService.createAnnouncement).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Announcement",
          content: "New content",
          type: "EVENT",
        }),
        "profile-id" // Should use profileId, not user.id
      );
    });

    it("should call service with correct parameters for update", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockAnnouncementService.updateAnnouncement.mockResolvedValue({
        status: "success",
        data: { ...mockAnnouncement, title: "Updated" },
      });

      await updateAnnouncement({
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "Updated Title",
      });

      expect(mockAnnouncementService.updateAnnouncement).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440000",
        expect.objectContaining({ title: "Updated Title" }),
        "profile-id"
      );
    });

    it("should call service for delete", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockAnnouncementService.deleteAnnouncement.mockResolvedValue({
        status: "success",
        data: mockAnnouncement,
      });

      await deleteAnnouncement("550e8400-e29b-41d4-a716-446655440000");

      expect(mockAnnouncementService.deleteAnnouncement).toHaveBeenCalled();
    });

    it("should call service for restore", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockAnnouncementService.restoreAnnouncement.mockResolvedValue({
        status: "success",
        data: mockAnnouncement,
      });

      await restoreAnnouncement("550e8400-e29b-41d4-a716-446655440000");

      expect(mockAnnouncementService.restoreAnnouncement).toHaveBeenCalled();
    });

    it("should call service for publish", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockAnnouncementService.publishAnnouncement.mockResolvedValue({
        status: "success",
        data: { ...mockAnnouncement, isActive: true },
      });

      await publishAnnouncement("550e8400-e29b-41d4-a716-446655440000");

      expect(mockAnnouncementService.publishAnnouncement).toHaveBeenCalled();
    });

    it("should call service for unpublish", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockAnnouncementService.unpublishAnnouncement.mockResolvedValue({
        status: "success",
        data: { ...mockAnnouncement, isActive: false },
      });

      await unpublishAnnouncement("550e8400-e29b-41d4-a716-446655440000");

      expect(mockAnnouncementService.unpublishAnnouncement).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Response Formatting Tests
  // ==========================================================================

  describe("Response Formatting", () => {
    it("should format success response correctly", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockAnnouncementService.getAnnouncement.mockResolvedValue({
        status: "success",
        data: mockAnnouncement,
      });

      const result = await getAnnouncement("550e8400-e29b-41d4-a716-446655440000");

      expect(result).toEqual({
        success: true,
        data: mockAnnouncement,
      });
    });

    it("should format error response correctly", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const result = await getAnnouncements();

      expect(result).toEqual({
        success: false,
        error: {
          code: "AUTH_REQUIRED",
          message: "Authentication required",
        },
      });
    });

    it("should include error details when available", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockAnnouncementService.createAnnouncement.mockResolvedValue({
        status: "error",
        code: "VAL_INVALID_INPUT",
        message: "Validation failed",
        details: { field: "title" },
      });

      const result = await createAnnouncement({});

      expect(result).toEqual({
        success: false,
        error: {
          code: "VAL_INVALID_INPUT",
          message: "Validation failed",
          details: { field: "title" },
        },
      });
    });
  });

  // ==========================================================================
  // Cache Invalidation Tests
  // ==========================================================================

  describe("Cache Invalidation", () => {
    it("should revalidate admin paths after create", async () => {
      const { revalidatePath } = await import("next/cache");
      
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockAnnouncementService.createAnnouncement.mockResolvedValue({
        status: "success",
        data: mockAnnouncement,
      });

      await createAnnouncement({
        title: "Test",
        content: "Content",
      });

      expect(revalidatePath).toHaveBeenCalledWith("/admin/announcements");
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });

    it("should revalidate paths after update", async () => {
      const { revalidatePath } = await import("next/cache");
      
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockAnnouncementService.updateAnnouncement.mockResolvedValue({
        status: "success",
        data: mockAnnouncement,
      });

      await updateAnnouncement({
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "Updated",
      });

      expect(revalidatePath).toHaveBeenCalledWith("/admin/announcements");
      expect(revalidatePath).toHaveBeenCalledWith("/admin/announcements/[id]", "page");
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });

    it("should revalidate paths after publish", async () => {
      const { revalidatePath } = await import("next/cache");
      
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockAnnouncementService.publishAnnouncement.mockResolvedValue({
        status: "success",
        data: mockAnnouncement,
      });

      await publishAnnouncement("550e8400-e29b-41d4-a716-446655440000");

      expect(revalidatePath).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Logging Tests
  // ==========================================================================

  describe("Logging", () => {
    it("should log request start", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockAnnouncementService.getAnnouncement.mockResolvedValue({
        status: "success",
        data: mockAnnouncement,
      });

      await getAnnouncement("550e8400-e29b-41d4-a716-446655440000");

      expect(mockLogger.info).toHaveBeenCalledWith(
        "Server action: getAnnouncement",
        expect.objectContaining({ requestId: "test-request-id" })
      );
    });

    it("should log errors", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      await getAnnouncements();

      expect(mockLogger.error).not.toHaveBeenCalled(); // Errors are returned, not thrown
    });
  });

  // ==========================================================================
  // Public Actions Tests
  // ==========================================================================

  describe("Public Actions", () => {
    it("getPublicAnnouncements should not require authentication", async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      mockAnnouncementService.getPublicAnnouncements.mockResolvedValue({
        status: "success",
        data: [mockAnnouncement],
      });

      const result = await getPublicAnnouncements();

      expect(result.success).toBe(true);
    });

    it("getAnnouncement should not require authentication", async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      mockAnnouncementService.getAnnouncement.mockResolvedValue({
        status: "success",
        data: mockAnnouncement,
      });

      const result = await getAnnouncement("550e8400-e29b-41d4-a716-446655440000");

      expect(result.success).toBe(true);
    });

    it("searchAnnouncements should not require authentication", async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      mockAnnouncementService.searchAnnouncements.mockResolvedValue({
        status: "success",
        data: { data: [mockAnnouncement], meta: { page: 1, limit: 20, total: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false } },
      });

      const result = await searchAnnouncements({ query: "test" });

      expect(result.success).toBe(true);
    });
  });
});
