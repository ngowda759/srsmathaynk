/**
 * Seva Service - Sprint 4.4
 * Full CRUD operations using Prisma
 */

import { prisma } from "@/lib/db";
import {
  SevaRecord,
  SevaRequest,
  AaradhaneRecord,
  AaradhaneRequest,
  BookingRecord,
  BookingRequest,
  SevaAvailability,
  SevaStats,
} from "@/types/seva";
import { Prisma } from "@prisma/client";

function decimalToNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "object" && value !== null && "__value" in value) {
    return Number((value as { __value: string }).__value);
  }
  return Number(value);
}

export const sevaService = {
  // ============ SEVA CRUD ============
  async createSeva(data: SevaRequest): Promise<string> {
    const seva = await prisma.seva.create({
      data: {
        name: data.name,
        nameKn: data.nameKn,
        description: data.description,
        descriptionKn: data.descriptionKn,
        price: new Prisma.Decimal(data.price || 0),
        duration: data.duration,
        category: data.category,
        imageId: data.imageId,
        iconName: data.iconName,
        active: data.active ?? true,
        featured: data.featured ?? false,
        maxPerDay: data.maxPerDay,
        minAdvanceBooking: data.minAdvanceBooking,
        maxAdvanceBooking: data.maxAdvanceBooking,
        instructions: data.instructions,
        benefits: data.benefits,
        order: data.order ?? 0,
      },
    });
    return seva.id;
  },

  async getSevas(options?: {
    active?: boolean;
    featured?: boolean;
    category?: string;
    limit?: number;
  }): Promise<{ sevas: SevaRecord[]; total: number }> {
    const where: Prisma.SevaWhereInput = {
      deletedAt: null,
      ...(options?.active !== undefined && { active: options.active }),
      ...(options?.featured !== undefined && { featured: options.featured }),
      ...(options?.category && { category: options.category }),
    };

    const [sevas, total] = await Promise.all([
      prisma.seva.findMany({
        where,
        orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
        take: options?.limit,
      }),
      prisma.seva.count({ where }),
    ]);

    return {
      sevas: sevas.map((s) => ({
        ...s,
        price: decimalToNumber(s.price),
      })) as unknown as SevaRecord[],
      total,
    };
  },

  async getAllSevas(): Promise<SevaRecord[]> {
    const result = await this.getSevas();
    return result.sevas;
  },

  async getSevaById(id: string): Promise<SevaRecord | null> {
    const seva = await prisma.seva.findUnique({
      where: { id },
    });

    if (!seva) return null;

    return {
      ...seva,
      price: decimalToNumber(seva.price),
    } as unknown as SevaRecord;
  },

  async updateSeva(id: string, data: Partial<SevaRequest>): Promise<void> {
    const updateData: Prisma.SevaUpdateInput = {};

    if (data.name) updateData.name = data.name;
    if (data.nameKn !== undefined) updateData.nameKn = data.nameKn;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.descriptionKn !== undefined) updateData.descriptionKn = data.descriptionKn;
    if (data.price !== undefined) updateData.price = new Prisma.Decimal(data.price);
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.imageId !== undefined) updateData.imageId = data.imageId;
    if (data.iconName !== undefined) updateData.iconName = data.iconName;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.maxPerDay !== undefined) updateData.maxPerDay = data.maxPerDay;
    if (data.minAdvanceBooking !== undefined) updateData.minAdvanceBooking = data.minAdvanceBooking;
    if (data.maxAdvanceBooking !== undefined) updateData.maxAdvanceBooking = data.maxAdvanceBooking;
    if (data.instructions !== undefined) updateData.instructions = data.instructions;
    if (data.benefits !== undefined) updateData.benefits = data.benefits;
    if (data.order !== undefined) updateData.order = data.order;

    await prisma.seva.update({ where: { id }, data: updateData });
  },

  async deleteSeva(id: string): Promise<void> {
    await prisma.seva.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async toggleFeaturedSeva(id: string): Promise<boolean> {
    const seva = await prisma.seva.findUnique({ where: { id } });
    if (!seva) throw new Error("Seva not found");
    const newFeatured = !seva.featured;
    await prisma.seva.update({ where: { id }, data: { featured: newFeatured } });
    return newFeatured;
  },

  async toggleActiveSeva(id: string): Promise<boolean> {
    const seva = await prisma.seva.findUnique({ where: { id } });
    if (!seva) throw new Error("Seva not found");
    const newActive = !seva.active;
    await prisma.seva.update({ where: { id }, data: { active: newActive } });
    return newActive;
  },

  // ============ AARADHANE CRUD ============
  async createAaradhane(data: AaradhaneRequest): Promise<string> {
    const aaradhane = await prisma.aaradhane.create({
      data: {
        title: data.title,
        titleKn: data.titleKn,
        deityName: data.deityName,
        guruName: data.guruName,
        description: data.description,
        significance: data.significance,
        startDate: data.startDate,
        endDate: data.endDate,
        imageId: data.imageId,
        thumbnailId: data.thumbnailId,
        rituals: data.rituals || [],
        offerings: data.offerings || [],
        featured: data.featured ?? false,
        active: data.active ?? true,
        order: data.order ?? 0,
      },
    });
    return aaradhane.id;
  },

  async getAaradhanes(options?: {
    active?: boolean;
    featured?: boolean;
    limit?: number;
  }): Promise<{ aaradhanes: AaradhaneRecord[]; total: number }> {
    const where: Prisma.AaradhaneWhereInput = {
      deletedAt: null,
      ...(options?.active !== undefined && { active: options.active }),
      ...(options?.featured !== undefined && { featured: options.featured }),
    };

    const [aaradhanes, total] = await Promise.all([
      prisma.aaradhane.findMany({
        where,
        orderBy: [{ featured: "desc" }, { order: "asc" }],
        take: options?.limit,
      }),
      prisma.aaradhane.count({ where }),
    ]);

    return {
      aaradhanes: aaradhanes as unknown as AaradhaneRecord[],
      total,
    };
  },

  async getAaradhaneById(id: string): Promise<AaradhaneRecord | null> {
    const aaradhane = await prisma.aaradhane.findUnique({
      where: { id },
      include: { sevas: { include: { seva: true } } },
    });

    if (!aaradhane) return null;

    return aaradhane as unknown as AaradhaneRecord;
  },

  async updateAaradhane(id: string, data: Partial<AaradhaneRequest>): Promise<void> {
    const updateData: Prisma.AaradhaneUpdateInput = {};

    if (data.title) updateData.title = data.title;
    if (data.titleKn !== undefined) updateData.titleKn = data.titleKn;
    if (data.deityName !== undefined) updateData.deityName = data.deityName;
    if (data.guruName !== undefined) updateData.guruName = data.guruName;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.significance !== undefined) updateData.significance = data.significance;
    if (data.startDate !== undefined) updateData.startDate = data.startDate;
    if (data.endDate !== undefined) updateData.endDate = data.endDate;
    if (data.imageId !== undefined) updateData.imageId = data.imageId;
    if (data.thumbnailId !== undefined) updateData.thumbnailId = data.thumbnailId;
    if (data.rituals !== undefined) updateData.rituals = data.rituals;
    if (data.offerings !== undefined) updateData.offerings = data.offerings;
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.order !== undefined) updateData.order = data.order;

    await prisma.aaradhane.update({ where: { id }, data: updateData });
  },

  async deleteAaradhane(id: string): Promise<void> {
    await prisma.aaradhane.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  // ============ BOOKING CRUD ============
  async createBooking(data: BookingRequest): Promise<string> {
    const booking = await prisma.booking.create({
      data: {
        profileId: data.profileId,
        bookingType: data.bookingType,
        bookingDate: data.bookingDate,
        status: "CONFIRMED",
        notes: data.notes,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        specialRequests: data.specialRequests,
        items: {
          create: data.items.map((item) => ({
            sevaId: item.sevaId,
            aaradhaneId: item.aaradhaneId,
            itemName: item.itemName,
            itemNameKn: item.itemNameKn,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            totalPrice: new Prisma.Decimal(item.unitPrice * item.quantity),
            requestedDate: item.requestedDate,
            requestedTime: item.requestedTime,
            notes: item.notes,
          })),
        },
      },
    });
    return booking.id;
  },

  async getBookings(options?: {
    status?: string;
    bookingType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ bookings: BookingRecord[]; total: number }> {
    const where: Prisma.BookingWhereInput = {
      ...(options?.status && { status: options.status as Prisma.EnumBookingStatusFilter["equals"] }),
      ...(options?.bookingType && { bookingType: options.bookingType as Prisma.EnumBookingTypeFilter["equals"] }),
      ...(options?.startDate && { bookingDate: { gte: options.startDate } }),
      ...(options?.endDate && { bookingDate: { lte: options.endDate } }),
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          items: { include: { seva: true, aaradhane: true } },
          profile: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: options?.limit,
        skip: options?.offset,
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      bookings: bookings.map((b) => ({
        ...b,
        totalAmount: b.items.reduce((sum, item) => sum + decimalToNumber(item.totalPrice), 0),
      })) as unknown as BookingRecord[],
      total,
    };
  },

  async getBookingById(id: string): Promise<BookingRecord | null> {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        items: { include: { seva: true, aaradhane: true } },
        profile: { select: { id: true, name: true, email: true } },
      },
    });

    if (!booking) return null;

    return {
      ...booking,
      totalAmount: booking.items.reduce((sum, item) => sum + decimalToNumber(item.totalPrice), 0),
    } as unknown as BookingRecord;
  },

  async updateBookingStatus(id: string, status: string): Promise<void> {
    await prisma.booking.update({
      where: { id },
      data: { status: status as Prisma.EnumBookingStatusFieldUpdateOperationsInput },
    });

    await prisma.bookingItem.updateMany({
      where: { bookingId: id },
      data: { status: status as Prisma.EnumBookingStatusFieldUpdateOperationsInput },
    });
  },

  async cancelBooking(id: string): Promise<void> {
    await this.updateBookingStatus(id, "CANCELLED");
  },

  async completeBooking(id: string): Promise<void> {
    await this.updateBookingStatus(id, "COMPLETED");
  },

  // ============ AVAILABILITY ============
  async getAvailability(sevaId: string, startDate: Date, endDate: Date): Promise<SevaAvailability[]> {
    const seva = await prisma.seva.findUnique({ where: { id: sevaId } });

    if (!seva || !seva.maxPerDay) {
      const dates: SevaAvailability[] = [];
      const current = new Date(startDate);
      while (current <= endDate) {
        dates.push({ date: new Date(current), available: true, bookedCount: 0, maxPerDay: null, remaining: null });
        current.setDate(current.getDate() + 1);
      }
      return dates;
    }

    const bookings = await prisma.bookingItem.groupBy({
      by: ["requestedDate"],
      where: {
        sevaId,
        status: { in: ["PENDING", "CONFIRMED"] },
        requestedDate: { gte: startDate, lte: endDate },
      },
      _count: true,
    });

    const bookingMap = new Map(bookings.map((b) => [b.requestedDate?.toISOString().split("T")[0], b._count]));

    const dates: SevaAvailability[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = current.toISOString().split("T")[0];
      const bookedCount = bookingMap.get(dateStr) || 0;
      dates.push({
        date: new Date(current),
        available: bookedCount < seva.maxPerDay,
        bookedCount,
        maxPerDay: seva.maxPerDay,
        remaining: seva.maxPerDay - bookedCount,
      });
      current.setDate(current.getDate() + 1);
    }
    return dates;
  },

  // ============ STATISTICS ============
  async getStatistics(options?: {
    startDate?: Date;
    endDate?: Date;
    sevaId?: string;
  }): Promise<SevaStats> {
    const where: Prisma.BookingWhereInput = {
      bookingType: "SEVA",
      ...(options?.startDate && { createdAt: { gte: options.startDate } }),
      ...(options?.endDate && { createdAt: { lte: options.endDate } }),
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [bookings, statusCounts, todayCount, topSevasResult] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: { items: { where: options?.sevaId ? { sevaId: options.sevaId } : undefined } },
      }),
      prisma.booking.groupBy({ by: ["status"], where, _count: true }),
      prisma.booking.count({ where: { ...where, bookingDate: { gte: today } } }),
      prisma.bookingItem.findMany({
        where: {
          status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
          sevaId: { not: null },
          ...(options?.startDate && { createdAt: { gte: options.startDate } }),
          ...(options?.endDate && { createdAt: { lte: options.endDate } }),
        },
        include: { seva: { select: { id: true, name: true } } },
      }),
    ]);

    const totalRevenue = bookings.reduce(
      (sum, b) => sum + b.items.reduce((itemSum, item) => itemSum + decimalToNumber(item.totalPrice), 0), 0
    );

    const statusMap = statusCounts.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {} as Record<string, number>);

    const sevaCounts = new Map<string, { name: string; count: number }>();
    topSevasResult.forEach((item) => {
      if (item.sevaId && item.seva) {
        const existing = sevaCounts.get(item.sevaId);
        if (existing) {
          existing.count += 1;
        } else {
          sevaCounts.set(item.sevaId, { name: item.seva.name, count: 1 });
        }
      }
    });

    return {
      totalBookings: bookings.length,
      todayBookings: todayCount,
      pendingBookings: statusMap["PENDING"] || 0,
      completedBookings: statusMap["COMPLETED"] || 0,
      cancelledBookings: statusMap["CANCELLED"] || 0,
      totalRevenue,
      topSevas: Array.from(sevaCounts.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(([sevaId, { name, count }]) => ({ sevaId, name, count })),
    };
  },
};
