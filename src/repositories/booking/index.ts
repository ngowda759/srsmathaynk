/**
 * Booking Repository
 * 
 * Data access layer for bookings.
 * Uses mapper to convert Prisma objects to domain objects.
 */

import { prisma } from "@/lib/db";
import { BaseRepository } from "@/repositories/base";
import { bookingMapper } from "@/mappers/booking";
import type { BookingDomain, IBookingRepository } from "@/types/interfaces";

// ============================================================================
// Repository Implementation
// ============================================================================

export class BookingRepository
  extends BaseRepository<BookingDomain>
  implements IBookingRepository
{
  constructor() {
    super(prisma.booking);
  }

  protected getModelName(): string {
    return "Booking";
  }

  // ==========================================================================
  // Domain Methods
  // ==========================================================================

  /**
   * Find bookings by profile
   */
  async findByProfile(profileId: string): Promise<BookingDomain[]> {
    const records = await (this.model as any).findMany({
      where: {
        profileId,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    return bookingMapper.toDomainList(records);
  }

  /**
   * Find bookings by status
   */
  async findByStatus(status: string): Promise<BookingDomain[]> {
    const records = await (this.model as any).findMany({
      where: {
        status,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    return bookingMapper.toDomainList(records);
  }

  /**
   * Find upcoming bookings for a profile
   */
  async findUpcoming(profileId: string): Promise<BookingDomain[]> {
    const records = await (this.model as any).findMany({
      where: {
        profileId,
        status: { in: ["PENDING", "CONFIRMED"] },
        deletedAt: null,
      },
      orderBy: { createdAt: "asc" },
    });

    return bookingMapper.toDomainList(records);
  }

  // ==========================================================================
  // Override base methods to return domain objects
  // ==========================================================================

  async findById(id: string): Promise<BookingDomain> {
    const prismaRecord = await (this.model as any).findUnique({
      where: { id },
    });

    if (!prismaRecord) {
      throw new Error(`${this.getModelName()} not found: ${id}`);
    }

    return bookingMapper.toDomain(prismaRecord);
  }

  async create(data: Partial<BookingDomain>): Promise<BookingDomain> {
    const input = bookingMapper.toCreateInput(data);
    const prismaRecord = await (this.model as any).create({ data: input });
    return bookingMapper.toDomain(prismaRecord);
  }

  async update(id: string, data: Partial<BookingDomain>): Promise<BookingDomain> {
    const input = bookingMapper.toUpdateInput(data);
    const prismaRecord = await (this.model as any).update({
      where: { id },
      data: input,
    });
    return bookingMapper.toDomain(prismaRecord);
  }
}

// Singleton instance
export const bookingRepository = new BookingRepository();
