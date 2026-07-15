import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Type for accessing Prisma model operations
// Used by BaseRepository to access any model
export type BasePrismaClient = {
  [K in keyof Prisma]: Prisma[K] extends { findMany: (...args: any[]) => any } ? Prisma[K] : never;
}[keyof Prisma];
