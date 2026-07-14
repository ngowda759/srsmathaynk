/**
 * Base Repository Class
 * Provides common CRUD operations for all repositories
 */

import { prisma } from "@/lib/db"
import {
  PaginationParams,
  PaginatedResult,
  RepositoryResult,
  RepositoryListResult,
} from "./types"

export abstract class BaseRepository<T, CreateDTO, UpdateDTO> {
  protected model: typeof prisma[keyof typeof prisma]

  constructor(modelName: keyof typeof prisma) {
    this.model = prisma[modelName]
  }

  /**
   * Find by ID
   */
  async findById(id: string): Promise<RepositoryResult<T>> {
    try {
      const result = await (this.model as any).findUnique({
        where: { id },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Find unique by field
   */
  async findUnique(where: Record<string, any>): Promise<RepositoryResult<T>> {
    try {
      const result = await (this.model as any).findUnique({ where })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Find many with pagination
   */
  async findMany(
    params: {
      where?: Record<string, any>
      orderBy?: Record<string, any>
      include?: Record<string, any>
    } & PaginationParams
  ): Promise<RepositoryListResult<T>> {
    try {
      const { page = 1, limit = 10, where = {}, orderBy = {}, include } = params
      const skip = (page - 1) * limit

      const [data, total] = await Promise.all([
        (this.model as any).findMany({
          where,
          orderBy,
          include,
          skip,
          take: limit,
        }),
        (this.model as any).count({ where }),
      ])

      return {
        success: true,
        data: {
          data,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: page * limit < total,
          },
        },
      }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Find first matching
   */
  async findFirst(
    params: {
      where?: Record<string, any>
      orderBy?: Record<string, any>
      include?: Record<string, any>
    }
  ): Promise<RepositoryResult<T>> {
    try {
      const result = await (this.model as any).findFirst(params)
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Create record
   */
  async create(data: CreateDTO): Promise<RepositoryResult<T>> {
    try {
      const result = await (this.model as any).create({ data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Create many records
   */
  async createMany(data: CreateDTO[]): Promise<RepositoryResult<{ count: number }>> {
    try {
      const result = await (this.model as any).createMany({ data })
      return { success: true, data: { count: result.count } }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Update record
   */
  async update(id: string, data: UpdateDTO): Promise<RepositoryResult<T>> {
    try {
      const result = await (this.model as any).update({
        where: { id },
        data,
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Update many records
   */
  async updateMany(
    where: Record<string, any>,
    data: UpdateDTO
  ): Promise<RepositoryResult<{ count: number }>> {
    try {
      const result = await (this.model as any).updateMany({
        where,
        data,
      })
      return { success: true, data: { count: result.count } }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Delete record
   */
  async delete(id: string): Promise<RepositoryResult<T>> {
    try {
      const result = await (this.model as any).delete({ where: { id } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Delete many records
   */
  async deleteMany(where: Record<string, any>): Promise<RepositoryResult<{ count: number }>> {
    try {
      const result = await (this.model as any).deleteMany({ where })
      return { success: true, data: { count: result.count } }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Count records
   */
  async count(where?: Record<string, any>): Promise<RepositoryResult<{ count: number }>> {
    try {
      const result = await (this.model as any).count({ where })
      return { success: true, data: { count: result } }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Upsert record
   */
  async upsert(
    id: string,
    createData: CreateDTO,
    updateData: UpdateDTO
  ): Promise<RepositoryResult<T>> {
    try {
      const result = await (this.model as any).upsert({
        where: { id },
        create: { id, ...createData } as any,
        update: updateData as any,
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Aggregate
   */
  async aggregate(params: Record<string, any>): Promise<RepositoryResult<any>> {
    try {
      const result = await (this.model as any).aggregate(params)
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Group by
   */
  async groupBy(params: Record<string, any>): Promise<RepositoryResult<any>> {
    try {
      const result = await (this.model as any).groupBy(params)
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }
}
