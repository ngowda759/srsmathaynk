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

// Individual services should be created as needed:
//
// Example:
//
// import { BaseService } from "./base.service";
// import { AnnouncementRepository } from "@/repositories";
// import type { ServiceResult, Announcement } from "@/types";
// 
// export class AnnouncementService extends BaseService {
//   constructor(
//     private repository: AnnouncementRepository
//   ) {
//     super("Announcement");
//   }
// 
//   async getAnnouncement(id: string): Promise<ServiceResult<Announcement>> {
//     try {
//       const announcement = await this.repository.findById(id);
//       return this.success(announcement);
//     } catch (error) {
//       return this.handleError(error);
//     }
//   }
// 
//   async getActiveAnnouncements(): Promise<ServiceResult<Announcement[]>> {
//     try {
//       const announcements = await this.repository.findAll({
//         filters: [{ field: "isActive", operator: "eq", value: true }]
//       });
//       return this.success(announcements.data);
//     } catch (error) {
//       return this.handleError(error);
//     }
//   }
// }
