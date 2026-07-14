/**
 * Announcement Validator Tests
 * 
 * Tests for Zod schemas in the Announcement module.
 */

import { describe, it, expect } from "vitest";
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  paginationAnnouncementSchema,
  validateAnnouncementDates,
  validateAnnouncementId,
} from "@/validators/announcement";

describe("Announcement Validators", () => {
  describe("createAnnouncementSchema", () => {
    it("should validate a valid create input", () => {
      const input = {
        title: "Test Announcement",
        content: "This is test content",
        type: "GENERAL",
        priority: "NORMAL",
      };

      const result = createAnnouncementSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject empty title", () => {
      const input = {
        title: "",
        content: "This is test content",
      };

      const result = createAnnouncementSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject empty content", () => {
      const input = {
        title: "Test Announcement",
        content: "",
      };

      const result = createAnnouncementSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should accept valid type enum", () => {
      const input = {
        title: "Test",
        content: "Content",
        type: "EVENT",
      };

      const result = createAnnouncementSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject invalid type enum", () => {
      const input = {
        title: "Test",
        content: "Content",
        type: "INVALID",
      };

      const result = createAnnouncementSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should accept optional dates", () => {
      const input = {
        title: "Test",
        content: "Content",
        publishAt: "2024-12-01T00:00:00.000Z",
        expiresAt: "2024-12-31T00:00:00.000Z",
      };

      const result = createAnnouncementSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject invalid date format", () => {
      const input = {
        title: "Test",
        content: "Content",
        publishAt: "not-a-date",
      };

      const result = createAnnouncementSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("updateAnnouncementSchema", () => {
    it("should validate a valid UUID", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "Updated Title",
      };

      const result = updateAnnouncementSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID", () => {
      const input = {
        id: "not-a-uuid",
        title: "Updated Title",
      };

      const result = updateAnnouncementSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should allow partial updates", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "Updated Title",
      };

      const result = updateAnnouncementSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("validateAnnouncementDates", () => {
    it("should return valid for null dates", () => {
      const result = validateAnnouncementDates(null, null);
      expect(result.valid).toBe(true);
    });

    it("should return valid when publishAt is before expiresAt", () => {
      const result = validateAnnouncementDates(
        "2024-01-01T00:00:00.000Z",
        "2024-12-31T00:00:00.000Z"
      );
      expect(result.valid).toBe(true);
    });

    it("should return invalid when publishAt is after expiresAt", () => {
      const result = validateAnnouncementDates(
        "2024-12-31T00:00:00.000Z",
        "2024-01-01T00:00:00.000Z"
      );
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("paginationAnnouncementSchema", () => {
    it("should apply default values", () => {
      const result = paginationAnnouncementSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.sortOrder).toBe("desc");
      }
    });

    it("should coerce string numbers", () => {
      const result = paginationAnnouncementSchema.safeParse({
        page: "5",
        limit: "50",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(5);
        expect(result.data.limit).toBe(50);
      }
    });

    it("should reject limit over 100", () => {
      const result = paginationAnnouncementSchema.safeParse({
        limit: 150,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("validateAnnouncementId", () => {
    it("should validate a valid UUID", () => {
      const result = validateAnnouncementId("550e8400-e29b-41d4-a716-446655440000");
      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID", () => {
      const result = validateAnnouncementId("not-a-uuid");
      expect(result.success).toBe(false);
    });
  });
});
