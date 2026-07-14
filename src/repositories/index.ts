/**
 * Repository Layer
 * 
 * Feature-oriented repository structure per ADR-001.
 * All database access MUST go through repositories.
 * 
 * Pattern:
 * Prisma Model → Repository → Mapper → Domain Object
 * 
 * Folder Structure:
 * repositories/
 * ├── base/
 * │   ├── base.repository.ts   # Generic CRUD
 * │   └── index.ts
 * ├── announcement/
 * │   └── index.ts             # AnnouncementRepository
 * ├── booking/
 * ├── donation/
 * ├── event/
 * ├── media/
 * ├── profile/
 * ├── seva/
 * └── index.ts                 # Exports all repositories
 * 
 * Usage:
 * ```typescript
 * import { AnnouncementRepository, profileRepository } from "@/repositories";
 * 
 * const announcementRepo = new AnnouncementRepository();
 * const announcements = await announcementRepo.findActive();
 * ```
 */

// Base repository
export { BaseRepository } from "./base";
export type { BasePrismaClient } from "./base";

// Announcement repository
export { AnnouncementRepository, announcementRepository } from "./announcement";

// Booking repository
export { BookingRepository, bookingRepository } from "./booking";

// Donation repository
export { DonationRepository, donationRepository } from "./donation";

// Event repository
export { EventRepository, eventRepository } from "./event";

// Media repository
export { MediaRepository, mediaRepository } from "./media";

// Profile repository
export { ProfileRepository, profileRepository } from "./profile";

// Seva repository
export { SevaRepository, sevaRepository } from "./seva";
