/**
 * Sri Raghavendra Swamy Matha Portal - Core Infrastructure
 * 
 * Phase 3.1 - Core Infrastructure
 * 
 * Architecture (per ADR-001):
 * 
 * UI → Server Actions / Route Handlers → Service Layer → Repository Layer → Prisma ORM
 * 
 * This module exports all core infrastructure components.
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

// Layers (per ADR-001)
// - UI never communicates directly with Prisma
// - Business logic exists only inside Services
// - Database access exists only inside Repositories
export { BaseRepository } from "./repositories";
export { BaseService, compose, chain, mapResults, withErrorHandling } from "./services";

// Validation (per ADR-017)
export * from "./validators";

// Middleware
export * from "./middleware";

// Example usage:
// 
// In a route handler:
//
// import { withAuth, withAuthz, withErrorHandler } from "@/middleware";
// import { validators } from "@/validators";
// import { BaseService, compose } from "@/services";
// import { BaseRepository } from "@/repositories";
// import { logger } from "@/lib/logger";
// import { PaginationError } from "@/errors";
// 
// class AnnouncementService extends BaseService {
//   constructor(private repo: AnnouncementRepository) {
//     super("Announcement");
//   }
// 
//   async getAll(params: QueryParams) {
//     this.logInfo("Fetching announcements", params);
//     const result = await this.repo.findAll(params);
//     return this.success(result);
//   }
// }
// 
// export const GET = withErrorHandler(
//   withAuth(
//     withAuthz({ roles: ["ADMIN", "SUPER_ADMIN"] })(
//       async (req, { user }) => {
//         const params = parseQueryParams(req);
//         const service = new AnnouncementService(new AnnouncementRepository());
//         return service.getAll(params);
//       }
//     )
//   )
// );
