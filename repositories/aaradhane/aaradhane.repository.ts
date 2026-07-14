/**
 * Aaradhane Repository
 */

import { prisma } from "@/lib/db"
import { CreateAaradhaneDTO, UpdateAaradhaneDTO, CreateAaradhaneSevaDTO, UpdateAaradhaneSevaDTO } from "./types"

export class AaradhaneRepository {
  // Aaradhane CRUD
  async findById(id: string) {
    try {
      const aaradhane = await prisma.aaradhane.findUnique({
        where: { id },
        include: { sevas: { where: { isActive: true }, orderBy: { order: "asc" } } },
      })
      return { success: true, data: aaradhane }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findAll(activeOnly = true) {
    try {
      const items = await prisma.aaradhane.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: [{ isFeatured: "desc" }, { order: "asc" }],
        include: { sevas: { where: { isActive: true }, orderBy: { order: "asc" } } },
      })
      return { success: true, data: items }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findFeatured(limit = 5) {
    try {
      const items = await prisma.aaradhane.findMany({
        where: { isFeatured: true, isActive: true },
        orderBy: { order: "asc" },
        take: limit,
        include: { sevas: { where: { isActive: true }, orderBy: { order: "asc" } } },
      })
      return { success: true, data: items }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async create(data: CreateAaradhaneDTO) {
    try {
      const result = await prisma.aaradhane.create({ data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async update(id: string, data: UpdateAaradhaneDTO) {
    try {
      const result = await prisma.aaradhane.update({ where: { id }, data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async delete(id: string) {
    try {
      const result = await prisma.aaradhane.delete({ where: { id } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async toggleFeatured(id: string) {
    try {
      const item = await prisma.aaradhane.findUnique({ where: { id } })
      if (!item) return { success: false, error: "Aaradhane not found" }
      const result = await prisma.aaradhane.update({
        where: { id },
        data: { isFeatured: !item.isFeatured },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async toggleActive(id: string) {
    try {
      const item = await prisma.aaradhane.findUnique({ where: { id } })
      if (!item) return { success: false, error: "Aaradhane not found" }
      const result = await prisma.aaradhane.update({
        where: { id },
        data: { isActive: !item.isActive },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async reorder(orderedIds: string[]) {
    try {
      await prisma.$transaction(
        orderedIds.map((id, index) =>
          prisma.aaradhane.update({
            where: { id },
            data: { order: index },
          })
        )
      )
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  // Sevas CRUD
  async createSeva(data: CreateAaradhaneSevaDTO) {
    try {
      const result = await prisma.aaradhaneSeva.create({ data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async updateSeva(id: string, data: UpdateAaradhaneSevaDTO) {
    try {
      const result = await prisma.aaradhaneSeva.update({ where: { id }, data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async deleteSeva(id: string) {
    try {
      const result = await prisma.aaradhaneSeva.delete({ where: { id } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async getSevasByAaradhane(aaradhaneId: string) {
    try {
      const sevas = await prisma.aaradhaneSeva.findMany({
        where: { aaradhaneId, isActive: true },
        orderBy: { order: "asc" },
      })
      return { success: true, data: sevas }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }
}

export const aaradhaneRepository = new AaradhaneRepository()
