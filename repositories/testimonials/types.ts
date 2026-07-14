/**
 * Testimonials Repository Types
 */

import { Testimonial } from "@prisma/client"
export type { Testimonial }

export interface CreateTestimonialDTO {
  userId?: string
  name: string
  location?: string
  title?: string
  content: string
  contentKannada?: string
  rating?: number
  imageUrl?: string
  isApproved?: boolean
  isFeatured?: boolean
  isPublished?: boolean
  approvedBy?: string
  approvedAt?: Date
}

export interface UpdateTestimonialDTO extends Partial<CreateTestimonialDTO> {}
