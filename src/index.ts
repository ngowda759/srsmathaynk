/**
 * Sri Raghavendra Swamy Matha Portal - Core Infrastructure
 * 
 * Phase 3.1 - Core Infrastructure (Enhanced)
 * 
 * Architecture (per ADR-001):
 * 
 * UI → Server Actions / Route Handlers → Service Layer → Repository Layer → Mapper → Prisma ORM
 * 
 * This module exports all core infrastructure components.
 * 
 * Infrastructure sprint scope only - no feature implementations.
 */

// Re-export all modules for convenient imports
export * from "./types";
export * from "./errors";
export * from "./lib/logger";
export * from "./lib/constants";

// Utilities
export * from "./lib/pagination";
export * from "./lib/filter";
export * from "./lib/sorting";
export * from "./lib/response";
export * from "./lib/transaction";
export * from "./lib/search";

// Layers (per ADR-001)
// - UI never communicates directly with Prisma
// - Business logic exists only inside Services
// - Database access exists only inside Repositories
// - Mappers convert Prisma objects to domain objects
export { BaseRepository } from "./repositories";
export { BaseService, compose, chain, mapResults, withErrorHandling } from "./services";

// Mappers (Domain objects)
export * from "./mappers";

// Validation (per ADR-017)
export * from "./validators";

// Middleware (includes rate limiting placeholder)
export * from "./middleware";

// Example usage:
//
// In a route handler:
//
// import { withAuth, withAuthz, withErrorHandler, withApiRateLimit } from "@/middleware";
// import { BaseService } from "@/services";
// import { AnnouncementRepository, announcementMapper } from "@/repositories";
// import { logger } from "@/lib/logger";
// import { SearchBuilder } from "@/lib/search";
// import { executeWithRetry } from "@/lib/transaction";
// import { ErrorCodes } from "@/errors";
//
// class AnnouncementService extends BaseService {
//   constructor(private repo: AnnouncementRepository) {
//     super("Announcement");
//   }
//
//   async getAll(params: QueryParams) {
//     this.logInfo("Fetching announcements", params);
//     
//     const builder = new SearchBuilder()
//       .contains("title", params.search || "")
//       .equals("isActive", true);
//     
//     const prismaRecords = await this.repo.findAll({
//       where: builder.build(),
//       pagination: { page: params.page, limit: params.limit }
//     });
//     
//     // Convert to domain objects via mapper
//     const announcements = announcementMapper.toDomainList(prismaRecords);
//     
//     return this.success(announcements);
//   }
// }
//
// export const GET = withErrorHandler(
//   withApiRateLimit(
//     withAuth(
//       withAuthz({ roles: ["ADMIN", "SUPER_ADMIN"] })(
//         async (req, { user }) => {
//           const params = parseQueryParams(req);
//           const service = new AnnouncementService(new AnnouncementRepository());
//           return service.getAll(params);
//         }
//       )
//     )
//   )
// );
//
// Transaction with retry (for bookings, donations):
//
// const result = await executeWithRetry(async (tx) => {
//   // Create booking
//   const booking = await tx.booking.create({ data: bookingData });
//   // Update availability
//   await tx.seva.update({ where: { id: sevaId }, data: { ... } });
//   return booking;
// }, { maxRetries: 3 });
