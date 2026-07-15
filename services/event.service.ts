/**
 * Event Service - Prisma-based implementation
 * Provides CRUD operations for temple events
 */

import { prisma } from "@/lib/db";
import {
  TempleEvent,
  EventRequest,
  EventQuery,
  EventStatus,
  computeEventStatus,
} from "@/types/event";
import type { Prisma } from "@prisma/client";

// Calendar event format for calendar views
export interface CalendarEvent {
  id: string;
  date: string;       // YYYY-MM-DD
  title: string;
  titleKn?: string | null;
  type: string;
  featured: boolean;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
}

// Helper to transform Prisma Event to TempleEvent
function transformEvent(prismaEvent: any): TempleEvent {
  return {
    id: prismaEvent.id,
    title: prismaEvent.title,
    titleKn: prismaEvent.titleKn,
    description: prismaEvent.description,
    descriptionKn: prismaEvent.descriptionKn,
    startDate: prismaEvent.startDate,
    endDate: prismaEvent.endDate,
    startTime: prismaEvent.startTime,
    endTime: prismaEvent.endTime,
    location: prismaEvent.location,
    isOnline: prismaEvent.isOnline,
    onlineLink: prismaEvent.onlineLink,
    type: prismaEvent.type,
    status: prismaEvent.status,
    featured: prismaEvent.featured,
    published: prismaEvent.published,
    imageId: prismaEvent.imageId,
    bannerId: prismaEvent.bannerId,
    imageUrl: prismaEvent.image?.url || null,
    bannerUrl: prismaEvent.banner?.url || null,
    maxAttendees: prismaEvent.maxAttendees,
    currentAttendees: prismaEvent.currentAttendees,
    organizer: prismaEvent.organizer,
    contactPhone: prismaEvent.contactPhone,
    contactEmail: prismaEvent.contactEmail,
    createdAt: prismaEvent.createdAt,
    updatedAt: prismaEvent.updatedAt,
    deletedAt: prismaEvent.deletedAt,
    createdById: prismaEvent.createdById,
    updatedById: prismaEvent.updatedById,
  };
}

// Transform to calendar event format
function toCalendarEvent(event: TempleEvent): CalendarEvent {
  return {
    id: event.id,
    date: new Date(event.startDate).toISOString().split("T")[0],
    title: event.title,
    titleKn: event.titleKn,
    type: event.type,
    featured: event.featured,
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location,
  };
}

// Check if string contains Kannada characters
function containsKannada(text: string): boolean {
  return /[\u0C80-\u0CFF]/.test(text);
}

// Check if string contains English/Roman characters
function containsEnglish(text: string): boolean {
  return /[a-zA-Z]/.test(text);
}

class EventService {
  /**
   * Get all events with optional filtering
   * Supports mixed-language (English/Kannada) search
   */
  async getEvents(query?: EventQuery): Promise<TempleEvent[]> {
    const where: Prisma.EventWhereInput = {
      deletedAt: null,
    };

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.type) {
      where.type = query.type;
    }

    if (query?.featured !== undefined) {
      where.featured = query.featured;
    }

    if (query?.published !== undefined) {
      where.published = query.published;
    }

    if (query?.search) {
      const searchTerm = query.search.trim();
      
      if (!searchTerm) {
        // Empty search - no filter
      } else if (containsKannada(searchTerm)) {
        // Kannada search - use default mode (case-sensitive for Kannada)
        where.OR = [
          { titleKn: { contains: searchTerm } },
          { descriptionKn: { contains: searchTerm } },
          { title: { contains: searchTerm } }, // Also check English fallback
        ];
      } else if (containsEnglish(searchTerm)) {
        // English search - use insensitive mode
        where.OR = [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
          { location: { contains: searchTerm, mode: "insensitive" } },
          { titleKn: { contains: searchTerm } }, // Also check Kannada
        ];
      } else {
        // Numbers or symbols - search all fields
        where.OR = [
          { title: { contains: searchTerm } },
          { titleKn: { contains: searchTerm } },
          { description: { contains: searchTerm } },
          { descriptionKn: { contains: searchTerm } },
          { location: { contains: searchTerm } },
        ];
      }
    }

    if (query?.startDate) {
      where.startDate = { gte: new Date(query.startDate) };
    }

    if (query?.endDate) {
      where.endDate = { lte: new Date(query.endDate) };
    }

    const page = query?.page || 1;
    const limit = query?.limit || 50;
    const skip = (page - 1) * limit;

    const events = await prisma.event.findMany({
      where,
      include: {
        image: true,
        banner: true,
      },
      orderBy: { startDate: "asc" },
      skip,
      take: limit,
    });

    return events.map(transformEvent);
  }

  /**
   * Get events for calendar view
   * Returns simplified event objects optimized for calendar rendering
   */
  async getCalendarEvents(
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]> {
    const events = await prisma.event.findMany({
      where: {
        published: true,
        deletedAt: null,
        AND: [
          {
            OR: [
              { startDate: { gte: startDate, lte: endDate } },
              { endDate: { gte: startDate, lte: endDate } },
              {
                AND: [
                  { startDate: { lte: startDate } },
                  { endDate: { gte: endDate } },
                ],
              },
            ],
          },
        ],
      },
      orderBy: { startDate: "asc" },
    });

    return events.map((e) =>
      toCalendarEvent(transformEvent(e))
    );
  }

  /**
   * Get a single event by ID
   */
  async getEvent(id: string): Promise<TempleEvent | null> {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        image: true,
        banner: true,
      },
    });

    if (!event || event.deletedAt) {
      return null;
    }

    return transformEvent(event);
  }

  /**
   * Create a new event
   */
  async createEvent(data: EventRequest, userId?: string): Promise<TempleEvent> {
    const event = await prisma.event.create({
      data: {
        title: data.title,
        titleKn: data.titleKn,
        description: data.description,
        descriptionKn: data.descriptionKn,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        isOnline: data.isOnline || false,
        onlineLink: data.onlineLink,
        type: data.type || "GENERAL",
        status: data.status || "UPCOMING",
        featured: data.featured || false,
        published: data.published || false,
        imageId: data.imageId,
        bannerId: data.bannerId,
        maxAttendees: data.maxAttendees,
        organizer: data.organizer,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        createdById: userId,
      },
      include: {
        image: true,
        banner: true,
      },
    });

    return transformEvent(event);
  }

  /**
   * Update an existing event
   */
  async updateEvent(
    id: string,
    data: Partial<EventRequest>,
    userId?: string
  ): Promise<TempleEvent> {
    const updateData: Prisma.EventUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.titleKn !== undefined) updateData.titleKn = data.titleKn;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.descriptionKn !== undefined) updateData.descriptionKn = data.descriptionKn;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.startTime !== undefined) updateData.startTime = data.startTime;
    if (data.endTime !== undefined) updateData.endTime = data.endTime;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.isOnline !== undefined) updateData.isOnline = data.isOnline;
    if (data.onlineLink !== undefined) updateData.onlineLink = data.onlineLink;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.published !== undefined) updateData.published = data.published;
    if (data.maxAttendees !== undefined) updateData.maxAttendees = data.maxAttendees;
    if (data.organizer !== undefined) updateData.organizer = data.organizer;
    if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone;
    if (data.contactEmail !== undefined) updateData.contactEmail = data.contactEmail;
    if (userId !== undefined) updateData.updatedById = userId;

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        image: true,
        banner: true,
      },
    });

    return transformEvent(event);
  }

  /**
   * Soft delete an event
   */
  async deleteEvent(id: string): Promise<void> {
    await prisma.event.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Hard delete an event (use with caution)
   */
  async hardDeleteEvent(id: string): Promise<void> {
    await prisma.event.delete({
      where: { id },
    });
  }

  /**
   * Get published events (public-facing)
   */
  async getPublishedEvents(query?: EventQuery): Promise<TempleEvent[]> {
    const events = await this.getEvents({
      ...query,
      published: true,
    });
    return events;
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(max = 3): Promise<TempleEvent[]> {
    const now = new Date();
    const events = await prisma.event.findMany({
      where: {
        published: true,
        deletedAt: null,
        startDate: { gte: now },
      },
      include: {
        image: true,
        banner: true,
      },
      orderBy: { startDate: "asc" },
      take: max,
    });

    return events.map(transformEvent);
  }

  /**
   * Get featured events
   */
  async getFeaturedEvents(max = 6): Promise<TempleEvent[]> {
    const events = await prisma.event.findMany({
      where: {
        published: true,
        featured: true,
        deletedAt: null,
      },
      include: {
        image: true,
        banner: true,
      },
      orderBy: { startDate: "asc" },
      take: max,
    });

    return events.map(transformEvent);
  }

  /**
   * Get events by type
   */
  async getEventsByType(type: string, limit = 10): Promise<TempleEvent[]> {
    const events = await prisma.event.findMany({
      where: {
        type: type as any,
        published: true,
        deletedAt: null,
      },
      include: {
        image: true,
        banner: true,
      },
      orderBy: { startDate: "asc" },
      take: limit,
    });

    return events.map(transformEvent);
  }

  /**
   * Get past events
   */
  async getPastEvents(max = 10): Promise<TempleEvent[]> {
    const now = new Date();
    const events = await prisma.event.findMany({
      where: {
        published: true,
        deletedAt: null,
        endDate: { lt: now },
      },
      include: {
        image: true,
        banner: true,
      },
      orderBy: { endDate: "desc" },
      take: max,
    });

    return events.map(transformEvent);
  }

  /**
   * Get event statistics
   */
  async getStats(): Promise<{
    total: number;
    upcoming: number;
    ongoing: number;
    completed: number;
    featured: number;
  }> {
    const now = new Date();

    const [total, upcoming, ongoing, completed, featured] = await Promise.all([
      prisma.event.count({ where: { deletedAt: null } }),
      prisma.event.count({
        where: { published: true, deletedAt: null, startDate: { gt: now } },
      }),
      prisma.event.count({
        where: {
          published: true,
          deletedAt: null,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      }),
      prisma.event.count({
        where: { published: true, deletedAt: null, endDate: { lt: now } },
      }),
      prisma.event.count({
        where: { published: true, featured: true, deletedAt: null },
      }),
    ]);

    return { total, upcoming, ongoing, completed, featured };
  }

  /**
   * Toggle featured status
   */
  async toggleFeatured(id: string): Promise<TempleEvent> {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new Error("Event not found");
    }

    const updated = await prisma.event.update({
      where: { id },
      data: { featured: !event.featured },
      include: {
        image: true,
        banner: true,
      },
    });

    return transformEvent(updated);
  }

  /**
   * Toggle published status
   */
  async togglePublished(id: string): Promise<TempleEvent> {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new Error("Event not found");
    }

    const updated = await prisma.event.update({
      where: { id },
      data: { published: !event.published },
      include: {
        image: true,
        banner: true,
      },
    });

    return transformEvent(updated);
  }

  /**
   * Update event attendee count
   */
  async updateAttendeeCount(id: string, increment: boolean): Promise<void> {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new Error("Event not found");
    }

    if (increment) {
      if (
        event.maxAttendees &&
        event.currentAttendees >= event.maxAttendees
      ) {
        throw new Error("Event is at full capacity");
      }
      await prisma.event.update({
        where: { id },
        data: { currentAttendees: { increment: 1 } },
      });
    } else {
      if (event.currentAttendees <= 0) {
        throw new Error("No attendees to remove");
      }
      await prisma.event.update({
        where: { id },
        data: { currentAttendees: { decrement: 1 } },
      });
    }
  }

  /**
   * Get events for calendar view
   */
  async getEventsForCalendar(
    startDate: Date,
    endDate: Date
  ): Promise<TempleEvent[]> {
    const events = await prisma.event.findMany({
      where: {
        published: true,
        deletedAt: null,
        OR: [
          {
            startDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            endDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: endDate } },
            ],
          },
        ],
      },
      include: {
        image: true,
        banner: true,
      },
      orderBy: { startDate: "asc" },
    });

    return events.map(transformEvent);
  }
}

export const eventService = new EventService();
