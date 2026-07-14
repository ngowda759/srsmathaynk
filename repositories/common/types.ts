/**
 * Common types used across repositories
 */

import { Prisma } from "@prisma/client"

// Pagination
export interface PaginationParams {
  page?: number
  limit?: number
  skip?: number
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

// Filters
export interface BaseFilters {
  search?: string
  active?: boolean
  isPublished?: boolean
  startDate?: Date
  endDate?: Date
}

export interface DateRangeFilter {
  gte?: Date
  lte?: Date
}

// Sort
export interface SortParams {
  field: string
  order?: "asc" | "desc"
}

// Repository result wrapper
export interface RepositoryResult<T> {
  success: boolean
  data?: T
  error?: string
}

export interface RepositoryListResult<T> {
  success: boolean
  data?: PaginatedResult<T>
  error?: string
}

// Create/Update DTOs
export type CreateInput<T> = Omit<T, "id" | "createdAt" | "updatedAt">
export type UpdateInput<T> = Partial<CreateInput<T>>

// Prisma helpers
export type PrismaWhereInput = Prisma.SelectTupleRecord | Prisma.SelectInclude

// Count result
export interface CountResult {
  count: number
}
