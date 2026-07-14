/**
 * Service Layer
 * 
 * All business logic MUST go through services per ADR-001.
 * Services should NOT access Prisma directly - use repositories instead.
 * 
 * This module exports the base service class and service composition utilities.
 */

export { BaseService } from "./base.service";
export { compose, chain, mapResults, withErrorHandling } from "./base.service";

// Announcement Service
export {
  AnnouncementService,
  announcementService,
} from "./announcement.service";
export type { IAnnouncementService } from "./announcement.service";
