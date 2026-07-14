/**
 * Trust Members Repository
 */

import { prisma } from "@/lib/db"
import { CreateTrustMemberDTO, UpdateTrustMemberDTO, CreateStaffDTO, UpdateStaffDTO } from "./types"

export class TrustRepository {
  // Trust Members
  async findTrustMemberById(id: string) {
    try {
      const member = await prisma.trustMember.findUnique({ where: { id } })
      return { success: true, data: member }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findTrustMembers(activeOnly = true) {
    try {
      const members = await prisma.trustMember.findMany({
        where: activeOnly ? { active: true } : undefined,
        orderBy: [{ isPontiff: "desc" }, { type: "asc" }, { order: "asc" }],
      })
      return { success: true, data: members }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findPontiff() {
    try {
      const member = await prisma.trustMember.findFirst({
        where: { isPontiff: true, active: true },
      })
      return { success: true, data: member }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findByType(type: string) {
    try {
      const members = await prisma.trustMember.findMany({
        where: { type, active: true },
        orderBy: { order: "asc" },
      })
      return { success: true, data: members }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async createTrustMember(data: CreateTrustMemberDTO) {
    try {
      const result = await prisma.trustMember.create({ data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async updateTrustMember(id: string, data: UpdateTrustMemberDTO) {
    try {
      const result = await prisma.trustMember.update({ where: { id }, data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async deleteTrustMember(id: string) {
    try {
      const result = await prisma.trustMember.delete({ where: { id } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  // Staff
  async findStaffMemberById(id: string) {
    try {
      const member = await prisma.staff.findUnique({ where: { id } })
      return { success: true, data: member }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findStaffMembers(activeOnly = true) {
    try {
      const members = await prisma.staff.findMany({
        where: activeOnly ? { active: true } : undefined,
        orderBy: [{ department: "asc" }, { order: "asc" }],
      })
      return { success: true, data: members }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findByDepartment(department: string) {
    try {
      const members = await prisma.staff.findMany({
        where: { department, active: true },
        orderBy: { order: "asc" },
      })
      return { success: true, data: members }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async createStaffMember(data: CreateStaffDTO) {
    try {
      const result = await prisma.staff.create({ data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async updateStaffMember(id: string, data: UpdateStaffDTO) {
    try {
      const result = await prisma.staff.update({ where: { id }, data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async deleteStaffMember(id: string) {
    try {
      const result = await prisma.staff.delete({ where: { id } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }
}

export const trustRepository = new TrustRepository()
