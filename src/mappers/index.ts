/**
 * Mappers
 * 
 * Domain mappers that convert Prisma objects to domain objects.
 * 
 * Pattern:
 * Prisma Model → Mapper → Domain Object
 * 
 * This keeps repositories focused on data access and avoids
 * mapping logic being duplicated across services.
 * 
 * Usage:
 * ```typescript
 * import { announcementMapper } from "@/mappers/announcement";
 * 
 * // In repository
 * const prismaAnnouncement = await prisma.announcement.findUnique({ ... });
 * const domain = announcementMapper.toDomain(prismaAnnouncement);
 * ```
 */

// Re-export base mapper
export {
  BaseMapper,
  IMapper,
  extractId,
  extractTimestamps,
  mapInclude,
  mapIncludeList,
} from "./base.mapper";

// Announcement mappers
export { AnnouncementMapper, announcementMapper } from "./announcement";

// Booking mappers
export { BookingMapper, bookingMapper } from "./booking";

// Donation mappers
export { DonationMapper, donationMapper } from "./donation";

// Event mappers
export { EventMapper, eventMapper } from "./event";

// Media mappers
export { MediaMapper, mediaMapper } from "./media";

// Profile mappers
export { ProfileMapper, profileMapper } from "./profile";

// Seva mappers
export { SevaMapper, sevaMapper } from "./seva";
