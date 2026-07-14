/**
 * Repository Layer
 * 
 * All database access MUST go through repositories per ADR-001.
 * This module exports all repositories for the application.
 * 
 * Usage:
 * ```typescript
 * import { AnnouncementRepository, ProfileRepository } from "@/repositories";
 * 
 * const announcementRepo = new AnnouncementRepository();
 * const announcements = await announcementRepo.findAll();
 * ```
 */

// Re-export BaseRepository
export { BaseRepository } from "./base.repository";

// Individual repositories should be created as needed:
// 
// Example:
// 
// import { BaseRepository } from "./base.repository";
// import { prisma } from "@/lib/db";
// 
// export class AnnouncementRepository extends BaseRepository<Announcement> {
//   constructor() {
//     super(prisma.announcement);
//   }
// 
//   protected getModelName(): string {
//     return "Announcement";
//   }
// 
//   // Custom methods specific to announcements
//   async findActiveAnnouncements() {
//     return this.findAll({
//       filters: [{ field: "isActive", operator: "eq", value: true }]
//     });
//   }
// }
