/**
 * Testimonials Repository
 */

import { prisma } from "@/lib/db"
import { CreateTestimonialDTO, UpdateTestimonialDTO } from "./types"

export class TestimonialsRepository {
  async findById(id: string) {
    try {
      const testimonial = await prisma.testimonial.findUnique({
        where: { id },
        include: { profile: true },
      })
      return { success: true, data: testimonial }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findAll(params?: { approved?: boolean; published?: boolean; featured?: boolean; page?: number; limit?: number }) {
    const { approved, published = true, featured, page = 1, limit = 10 } = params || {}
    const where: any = {}

    if (approved !== undefined) where.isApproved = approved
    if (published !== undefined) where.isPublished = published
    if (featured !== undefined) where.isFeatured = featured

    try {
      const [data, total] = await Promise.all([
        prisma.testimonial.findMany({
          where,
          orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
          skip: (page - 1) * limit,
          take: limit,
          include: { profile: true },
        }),
        prisma.testimonial.count({ where }),
      ])
      return { success: true, data: { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total } } }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findPublished() {
    try {
      const testimonials = await prisma.testimonial.findMany({
        where: { isApproved: true, isPublished: true },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        include: { profile: true },
      })
      return { success: true, data: testimonials }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findFeatured(limit = 5) {
    try {
      const testimonials = await prisma.testimonial.findMany({
        where: { isFeatured: true, isApproved: true, isPublished: true },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: { profile: true },
      })
      return { success: true, data: testimonials }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findByUser(userId: string) {
    try {
      const testimonial = await prisma.testimonial.findFirst({
        where: { userId },
        include: { profile: true },
      })
      return { success: true, data: testimonial }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async create(data: CreateTestimonialDTO) {
    try {
      const result = await prisma.testimonial.create({ data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async update(id: string, data: UpdateTestimonialDTO) {
    try {
      const result = await prisma.testimonial.update({ where: { id }, data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async delete(id: string) {
    try {
      const result = await prisma.testimonial.delete({ where: { id } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async approve(id: string, approvedBy: string) {
    try {
      const result = await prisma.testimonial.update({
        where: { id },
        data: { isApproved: true, approvedBy, approvedAt: new Date() },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async publish(id: string) {
    try {
      const result = await prisma.testimonial.update({
        where: { id },
        data: { isPublished: true },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async toggleFeatured(id: string) {
    try {
      const testimonial = await prisma.testimonial.findUnique({ where: { id } })
      if (!testimonial) return { success: false, error: "Testimonial not found" }
      const result = await prisma.testimonial.update({
        where: { id },
        data: { isFeatured: !testimonial.isFeatured },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async getPendingApprovals() {
    try {
      const testimonials = await prisma.testimonial.findMany({
        where: { isApproved: false },
        orderBy: { createdAt: "desc" },
        include: { profile: true },
      })
      return { success: true, data: testimonials }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }
}

export const testimonialsRepository = new TestimonialsRepository()
