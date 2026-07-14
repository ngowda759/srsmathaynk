/**
 * Contact Validator & Service
 */

import { z } from "zod"
import { contactRepository } from "./contact.repository"
import { CreateContactEnquiryDTO, UpdateContactEnquiryDTO } from "./types"

const enquiryCategories = ["GENERAL", "SEVA", "DONATION", "EVENT", "VISIT", "COMPLAINT", "FEEDBACK"] as const
const enquiryStatuses = ["NEW", "IN_PROGRESS", "RESPONDED", "CLOSED", "SPAM"] as const

export const createContactEnquirySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().regex(/^[+]?[\d\s-]{10,}$/).optional().or(z.literal("")),
  subject: z.string().max(300).optional(),
  message: z.string().min(10),
  category: z.enum(enquiryCategories).optional().default("GENERAL"),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
})

export const updateContactEnquirySchema = z.object({
  status: z.enum(enquiryStatuses).optional(),
  assignedTo: z.string().optional(),
  response: z.string().optional(),
  respondedAt: z.string().datetime().optional(),
})

export type CreateContactEnquiryInput = z.infer<typeof createContactEnquirySchema>
export type UpdateContactEnquiryInput = z.infer<typeof updateContactEnquirySchema>

export function validateCreateContactEnquiry(data: unknown) { return createContactEnquirySchema.safeParse(data) }
export function validateUpdateContactEnquiry(data: unknown) { return updateContactEnquirySchema.safeParse(data) }

export class ContactService {
  async getEnquiry(id: string) { return contactRepository.findById(id) }
  async getEnquiries(params?: { status?: string; category?: string; page?: number; limit?: number }) {
    return contactRepository.findAll(params)
  }
  async getNewEnquiries() { return contactRepository.findNew() }
  async getEnquiriesByEmail(email: string) { return contactRepository.findByEmail(email) }
  async getStats() { return contactRepository.getStats() }

  async createEnquiry(data: unknown) {
    const v = validateCreateContactEnquiry(data)
    if (!v.success) return { success: false, error: v.error.errors.map(e => e.message).join(", ") }
    return contactRepository.create(v.data as CreateContactEnquiryDTO)
  }

  async updateEnquiry(id: string, data: unknown) {
    const v = validateUpdateContactEnquiry(data)
    if (!v.success) return { success: false, error: v.error.errors.map(e => e.message).join(", ") }
    return contactRepository.update(id, v.data as UpdateContactEnquiryDTO)
  }

  async deleteEnquiry(id: string) { return contactRepository.delete(id) }
  async markAsResponded(id: string, response: string) { return contactRepository.markAsResponded(id, response) }
  async markAsSpam(id: string) { return contactRepository.markAsSpam(id) }
  async closeEnquiry(id: string) { return contactRepository.close(id) }
  async assignEnquiry(id: string, assignedTo: string) { return contactRepository.assignTo(id, assignedTo) }
}

export const contactService = new ContactService()
