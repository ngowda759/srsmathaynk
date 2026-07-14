/**
 * Aaradhane Repository Types
 */

import { Aaradhane, AaradhaneSeva } from "@prisma/client"
export type { Aaradhane, AaradhaneSeva }

export interface CreateAaradhaneDTO {
  title: string
  titleKannada?: string
  deityName?: string
  guruName?: string
  description?: string
  significance?: string
  startDate?: Date
  endDate?: Date
  imageUrl?: string
  thumbnailUrl?: string
  rituals?: string[]
  offerings?: string[]
  isFeatured?: boolean
  isActive?: boolean
  order?: number
}

export interface UpdateAaradhaneDTO extends Partial<CreateAaradhaneDTO> {}

export interface CreateAaradhaneSevaDTO {
  aaradhaneId: string
  name: string
  nameKannada?: string
  description?: string
  amount?: number
  currency?: string
  isActive?: boolean
  order?: number
}

export interface UpdateAaradhaneSevaDTO extends Partial<CreateAaradhaneSevaDTO> {}
