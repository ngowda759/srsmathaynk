/**
 * Contact Enquiries Repository Types
 */

import { ContactEnquiry } from "@prisma/client"
export type { ContactEnquiry }

export interface CreateContactEnquiryDTO {
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  category?: "GENERAL" | "SEVA" | "DONATION" | "EVENT" | "VISIT" | "COMPLAINT" | "FEEDBACK"
  ipAddress?: string
  userAgent?: string
}

export interface UpdateContactEnquiryDTO {
  status?: "NEW" | "IN_PROGRESS" | "RESPONDED" | "CLOSED" | "SPAM"
  assignedTo?: string
  response?: string
  respondedAt?: Date
}
