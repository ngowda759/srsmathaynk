/**
 * Contact Enquiries Repository
 */

import { prisma } from "@/lib/db"
import { CreateContactEnquiryDTO, UpdateContactEnquiryDTO } from "./types"

export class ContactRepository {
  async findById(id: string) {
    try {
      const enquiry = await prisma.contactEnquiry.findUnique({ where: { id } })
      return { success: true, data: enquiry }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findAll(params?: { status?: string; category?: string; page?: number; limit?: number }) {
    const { status, category, page = 1, limit = 20 } = params || {}
    const where: any = {}
    if (status) where.status = status
    if (category) where.category = category

    try {
      const [data, total] = await Promise.all([
        prisma.contactEnquiry.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.contactEnquiry.count({ where }),
      ])
      return { success: true, data: { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total } } }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findNew() {
    try {
      const enquiries = await prisma.contactEnquiry.findMany({
        where: { status: "NEW" },
        orderBy: { createdAt: "desc" },
      })
      return { success: true, data: enquiries }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findByEmail(email: string) {
    try {
      const enquiries = await prisma.contactEnquiry.findMany({
        where: { email },
        orderBy: { createdAt: "desc" },
      })
      return { success: true, data: enquiries }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async create(data: CreateContactEnquiryDTO) {
    try {
      const result = await prisma.contactEnquiry.create({ data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async update(id: string, data: UpdateContactEnquiryDTO) {
    try {
      const result = await prisma.contactEnquiry.update({ where: { id }, data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async delete(id: string) {
    try {
      const result = await prisma.contactEnquiry.delete({ where: { id } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async markAsResponded(id: string, response: string) {
    try {
      const result = await prisma.contactEnquiry.update({
        where: { id },
        data: { status: "RESPONDED", response, respondedAt: new Date() },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async markAsSpam(id: string) {
    try {
      const result = await prisma.contactEnquiry.update({
        where: { id },
        data: { status: "SPAM" },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async close(id: string) {
    try {
      const result = await prisma.contactEnquiry.update({
        where: { id },
        data: { status: "CLOSED" },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async assignTo(id: string, assignedTo: string) {
    try {
      const result = await prisma.contactEnquiry.update({
        where: { id },
        data: { assignedTo, status: "IN_PROGRESS" },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async getStats() {
    try {
      const [total, byStatus] = await Promise.all([
        prisma.contactEnquiry.count(),
        prisma.contactEnquiry.groupBy({ by: ["status"], _count: { status: true } }),
      ])
      const stats = byStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status
        return acc
      }, {} as Record<string, number>)
      return { success: true, data: { total, ...stats } }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }
}

export const contactRepository = new ContactRepository()
