/**
 * Booking Mapper
 * 
 * Maps between Prisma Booking model and BookingDomain.
 */

import { BaseMapper } from "../base.mapper";
import type { Booking, Prisma } from "@prisma/client";
import type { BookingDomain } from "@/types/interfaces";

// ============================================================================
// Booking Mapper
// ============================================================================

export class BookingMapper extends BaseMapper<Booking, BookingDomain> {
  /**
   * Map Prisma Booking to BookingDomain
   */
  toDomain(prisma: Booking): BookingDomain {
    return {
      id: prisma.id,
      type: prisma.type as BookingDomain["type"],
      status: prisma.status as BookingDomain["status"],
      profileId: prisma.profileId,
      totalAmount: prisma.totalAmount,
      notes: prisma.notes,
      createdAt: new Date(prisma.createdAt),
      updatedAt: new Date(prisma.updatedAt),
      deletedAt: prisma.deletedAt ? new Date(prisma.deletedAt) : null,
    };
  }

  /**
   * Map domain input to Prisma create input
   */
  toCreateInput(domain: Partial<BookingDomain>): Prisma.BookingCreateInput {
    return {
      type: domain.type,
      status: domain.status ?? "PENDING",
      profileId: domain.profileId!,
      totalAmount: domain.totalAmount,
      notes: domain.notes,
    };
  }

  /**
   * Map domain input to Prisma update input
   */
  toUpdateInput(domain: Partial<BookingDomain>): Prisma.BookingUpdateInput {
    const input: Prisma.BookingUpdateInput = {};

    if (domain.type !== undefined) input.type = domain.type;
    if (domain.status !== undefined) input.status = domain.status;
    if (domain.totalAmount !== undefined) input.totalAmount = domain.totalAmount;
    if (domain.notes !== undefined) input.notes = domain.notes;

    return input;
  }
}

// Singleton instance
export const bookingMapper = new BookingMapper();
