/**
 * Repository Layer
 * Sprint 3 - Database Design Implementation
 * 
 * Architecture:
 * UI → Server Actions → Service → Repository → Prisma → Database
 * 
 * Each module has:
 * - Types: TypeScript types and DTOs
 * - Repository: Database access layer
 * - Validator: Zod schemas for input validation
 * - Service: Business logic layer
 */

// Export all modules
export * from "./common"
export * from "./user"
export * from "./temple"
export * from "./aaradhane"
export * from "./events"
export * from "./sevas"
export * from "./donations"
export * from "./gallery"
export * from "./announcements"
export * from "./trust"
export * from "./ai"
export * from "./testimonials"
export * from "./contact"
