/**
 * Document Service - Sprint 4.6
 * Full CRUD operations using Prisma
 */

import { prisma } from "@/lib/db";
import {
  DocumentRecord,
  DocumentRequest,
  DocumentCategoryRecord,
  DocumentCategoryRequest,
  DocumentStats,
} from "@/types/document";

export const documentService = {
  // ============ DOCUMENTS ============

  async createDocument(data: DocumentRequest): Promise<string> {
    const document = await prisma.document.create({
      data: {
        title: data.title,
        titleKn: data.titleKn,
        description: data.description,
        categoryId: data.categoryId,
        mediaId: data.mediaId,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        featured: data.featured ?? false,
        active: data.active ?? true,
        order: data.order ?? 0,
      },
    });
    return document.id;
  },

  async getDocuments(options?: {
    categoryId?: string;
    active?: boolean;
    featured?: boolean;
    search?: string;
    limit?: number;
  }): Promise<{ documents: DocumentRecord[]; total: number }> {
    const where: Record<string, unknown> = {
      deletedAt: null,
      ...(options?.categoryId && { categoryId: options.categoryId }),
      ...(options?.active !== undefined && { active: options.active }),
      ...(options?.featured !== undefined && { featured: options.featured }),
      ...(options?.search && {
        OR: [
          { title: { contains: options.search, mode: "insensitive" } },
          { description: { contains: options.search, mode: "insensitive" } },
        ],
      }),
    };

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: { category: true, media: true },
        orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
        take: options?.limit,
      }),
      prisma.document.count({ where }),
    ]);

    return {
      documents: documents as unknown as DocumentRecord[],
      total,
    };
  },

  async getDocumentById(id: string): Promise<DocumentRecord | null> {
    const document = await prisma.document.findUnique({
      where: { id },
      include: { category: true, media: true },
    });

    if (!document) return null;

    return document as unknown as DocumentRecord;
  },

  async updateDocument(id: string, data: Partial<DocumentRequest>): Promise<void> {
    await prisma.document.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.titleKn !== undefined && { titleKn: data.titleKn }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.mediaId && { mediaId: data.mediaId }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.active !== undefined && { active: data.active }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });
  },

  async deleteDocument(id: string): Promise<void> {
    await prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async incrementDownloadCount(id: string): Promise<void> {
    await prisma.document.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });
  },

  async toggleFeatured(id: string): Promise<boolean> {
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) throw new Error("Document not found");
    await prisma.document.update({
      where: { id },
      data: { featured: !doc.featured },
    });
    return !doc.featured;
  },

  async toggleActive(id: string): Promise<boolean> {
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) throw new Error("Document not found");
    await prisma.document.update({
      where: { id },
      data: { active: !doc.active },
    });
    return !doc.active;
  },

  // ============ CATEGORIES ============

  async createCategory(data: DocumentCategoryRequest): Promise<string> {
    const category = await prisma.documentCategory.create({
      data: {
        name: data.name,
        nameKn: data.nameKn,
        description: data.description,
        icon: data.icon,
        order: data.order ?? 0,
        active: data.active ?? true,
      },
    });
    return category.id;
  },

  async getCategories(options?: {
    active?: boolean;
  }): Promise<{ categories: DocumentCategoryRecord[]; total: number }> {
    const where: Record<string, unknown> = {
      ...(options?.active !== undefined && { active: options.active }),
    };

    const categories = await prisma.documentCategory.findMany({
      where,
      include: {
        _count: { select: { documents: true } },
      },
      orderBy: { order: "asc" },
    });

    return {
      categories: categories.map((c) => ({
        ...c,
        documentCount: c._count.documents,
      })) as unknown as DocumentCategoryRecord[],
      total: categories.length,
    };
  },

  async getCategoryById(id: string): Promise<DocumentCategoryRecord | null> {
    const category = await prisma.documentCategory.findUnique({
      where: { id },
      include: { _count: { select: { documents: true } } },
    });

    if (!category) return null;

    return {
      ...category,
      documentCount: category._count.documents,
    } as unknown as DocumentCategoryRecord;
  },

  async updateCategory(id: string, data: Partial<DocumentCategoryRequest>): Promise<void> {
    await prisma.documentCategory.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.nameKn !== undefined && { nameKn: data.nameKn }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.active !== undefined && { active: data.active }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });
  },

  async deleteCategory(id: string): Promise<void> {
    await prisma.documentCategory.delete({ where: { id } });
  },

  // ============ STATISTICS ============

  async getStatistics(): Promise<DocumentStats> {
    const [totalDocuments, totalCategories, totalDownloads, popularDocuments] = await Promise.all([
      prisma.document.count({ where: { deletedAt: null } }),
      prisma.documentCategory.count(),
      prisma.document.aggregate({ _sum: { downloadCount: true } }),
      prisma.document.findMany({
        where: { deletedAt: null, active: true },
        select: { id: true, title: true, downloadCount: true },
        orderBy: { downloadCount: "desc" },
        take: 10,
      }),
    ]);

    return {
      totalDocuments,
      totalCategories,
      totalDownloads: totalDownloads._sum.downloadCount || 0,
      popularDocuments: popularDocuments.map((d) => ({
        id: d.id,
        title: d.title,
        downloadCount: d.downloadCount,
      })),
    };
  },

  // ============ SEARCH ============

  async search(query: string, limit = 20): Promise<DocumentRecord[]> {
    const documents = await prisma.document.findMany({
      where: {
        deletedAt: null,
        active: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { titleKn: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      include: { category: true },
      orderBy: [{ featured: "desc" }, { downloadCount: "desc" }],
      take: limit,
    });

    return documents as unknown as DocumentRecord[];
  },
};
