/**
 * Trust Validator & Service
 */

import { z } from "zod"
import { trustRepository } from "./trust.repository"
import { CreateTrustMemberDTO, UpdateTrustMemberDTO, CreateStaffDTO, UpdateStaffDTO } from "./types"

const memberTypes = ["PONTIFF", "TRUSTEE", "MEMBER", "SECRETARY", "STAFF", "PRIEST"] as const

export const createTrustMemberSchema = z.object({
  name: z.string().min(1).max(200),
  nameKannada: z.string().max(200).optional(),
  designation: z.string().min(1).max(200),
  designationKannada: z.string().max(200).optional(),
  bio: z.string().optional(),
  bioKannada: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().regex(/^[+]?[\d\s-]{10,}$/).optional().or(z.literal("")),
  type: z.enum(memberTypes).optional().default("MEMBER"),
  order: z.number().int().min(0).optional(),
  active: z.boolean().optional().default(true),
  isPontiff: z.boolean().optional().default(false),
  isResident: z.boolean().optional().default(false),
})

export const updateTrustMemberSchema = createTrustMemberSchema.partial()

export const createStaffSchema = z.object({
  name: z.string().min(1).max(200),
  designation: z.string().min(1).max(200),
  department: z.string().max(100).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  bio: z.string().optional(),
  phone: z.string().regex(/^[+]?[\d\s-]{10,}$/).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  active: z.boolean().optional().default(true),
  order: z.number().int().min(0).optional(),
})

export const updateStaffSchema = createStaffSchema.partial()

export type CreateTrustMemberInput = z.infer<typeof createTrustMemberSchema>
export type UpdateTrustMemberInput = z.infer<typeof updateTrustMemberSchema>
export type CreateStaffInput = z.infer<typeof createStaffSchema>
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>

export function validateCreateTrustMember(data: unknown) { return createTrustMemberSchema.safeParse(data) }
export function validateUpdateTrustMember(data: unknown) { return updateTrustMemberSchema.safeParse(data) }
export function validateCreateStaff(data: unknown) { return createStaffSchema.safeParse(data) }
export function validateUpdateStaff(data: unknown) { return updateStaffSchema.safeParse(data) }

export class TrustService {
  // Trust Members
  async getTrustMember(id: string) { return trustRepository.findTrustMemberById(id) }
  async getTrustMembers(activeOnly = true) { return trustRepository.findTrustMembers(activeOnly) }
  async getPontiff() { return trustRepository.findPontiff() }
  async getTrustMembersByType(type: string) { return trustRepository.findByType(type) }

  async createTrustMember(data: unknown) {
    const v = validateCreateTrustMember(data)
    if (!v.success) return { success: false, error: v.error.errors.map(e => e.message).join(", ") }
    return trustRepository.createTrustMember(v.data as CreateTrustMemberDTO)
  }

  async updateTrustMember(id: string, data: unknown) {
    const v = validateUpdateTrustMember(data)
    if (!v.success) return { success: false, error: v.error.errors.map(e => e.message).join(", ") }
    return trustRepository.updateTrustMember(id, v.data as UpdateTrustMemberDTO)
  }

  async deleteTrustMember(id: string) { return trustRepository.deleteTrustMember(id) }

  // Staff
  async getStaffMember(id: string) { return trustRepository.findStaffMemberById(id) }
  async getStaffMembers(activeOnly = true) { return trustRepository.findStaffMembers(activeOnly) }
  async getStaffByDepartment(department: string) { return trustRepository.findByDepartment(department) }

  async createStaffMember(data: unknown) {
    const v = validateCreateStaff(data)
    if (!v.success) return { success: false, error: v.error.errors.map(e => e.message).join(", ") }
    return trustRepository.createStaffMember(v.data as CreateStaffDTO)
  }

  async updateStaffMember(id: string, data: unknown) {
    const v = validateUpdateStaff(data)
    if (!v.success) return { success: false, error: v.error.errors.map(e => e.message).join(", ") }
    return trustRepository.updateStaffMember(id, v.data as UpdateStaffDTO)
  }

  async deleteStaffMember(id: string) { return trustRepository.deleteStaffMember(id) }
}

export const trustService = new TrustService()
