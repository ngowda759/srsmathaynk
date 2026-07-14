/**
 * Announcements Repository Types
 */

import { Announcement } from "@prisma/client"
export type { Announcement }

export interface CreateAnnouncementDTO {
  title: string
  content: string
  excerpt?: string
  type?: "GENERAL" | "EVENT" | "DONATION" | "FESTIVAL" | "MAINTENANCE" | "URGENT"
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT"
  isPinned?: boolean
  active?: boolean
  expiresAt?: Date
  authorId?: string
}

export interface UpdateAnnouncementDTO extends Partial<CreateAnnouncementDTO> {}

export interface AnnouncementFilters {
  type?: string
  priority?: string
  isPinned?: boolean
  active?: boolean
  search?: string
}

export interface AnnouncementListParams {
  page?: number
  limit?: number
  filters?: AnnouncementFilters
  orderBy?: { field: string; order?: "asc" | "desc" }
}
