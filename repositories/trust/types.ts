/**
 * Trust Members Repository Types
 */

import { TrustMember, Staff } from "@prisma/client"
export type { TrustMember, Staff }

export interface CreateTrustMemberDTO {
  name: string
  nameKannada?: string
  designation: string
  designationKannada?: string
  bio?: string
  bioKannada?: string
  imageUrl?: string
  email?: string
  phone?: string
  type?: "PONTIFF" | "TRUSTEE" | "MEMBER" | "SECRETARY" | "STAFF" | "PRIEST"
  order?: number
  active?: boolean
  isPontiff?: boolean
  isResident?: boolean
}

export interface UpdateTrustMemberDTO extends Partial<CreateTrustMemberDTO> {}

export interface CreateStaffDTO {
  name: string
  designation: string
  department?: string
  imageUrl?: string
  bio?: string
  phone?: string
  email?: string
  active?: boolean
  order?: number
}

export interface UpdateStaffDTO extends Partial<CreateStaffDTO> {}
