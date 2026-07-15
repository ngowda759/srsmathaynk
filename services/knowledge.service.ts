/**
 * Knowledge Service - Sprint 4.7
 * Temple Knowledge Base - Foundation for Raya AI
 */

import { prisma } from "@/lib/db";
import {
  KnowledgeArticleRecord,
  KnowledgeArticleRequest,
  KnowledgeCategoryRecord,
  KnowledgeCategoryRequest,
  KnowledgeTagRecord,
  KnowledgeSearchResult,
  KnowledgeStats,
} from "@/types/knowledge";

// Helper to generate slug
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const knowledgeService = {
  // ============ ARTICLES ============

  async createArticle(data: KnowledgeArticleRequest): Promise<string> {
    const article = await prisma.knowledgeArticle.create({
      data: {
        title: data.title,
        titleKn: data.titleKn,
        slug: data.slug || generateSlug(data.title),
        content: data.content,
        contentKn: data.contentKn,
        excerpt: data.excerpt,
        excerptKn: data.excerptKn,
        categoryId: data.categoryId,
        authorId: data.authorId,
        featured: data.featured ?? false,
        published: data.published ?? false,
        viewCount: 0,
      },
    });

    // Add tags
    if (data.tagIds && data.tagIds.length > 0) {
      await prisma.articleTag.createMany({
        data: data.tagIds.map((tagId) => ({
          articleId: article.id,
          tagId,
        })),
      });
    }

    return article.id;
  },

  async getArticles(options?: {
    categoryId?: string;
    published?: boolean;
    featured?: boolean;
    search?: string;
    limit?: number;
  }): Promise<{ articles: KnowledgeArticleRecord[]; total: number }> {
    const where: Record<string, unknown> = {};

    if (options?.categoryId) {
      where.categoryId = options.categoryId;
    }
    if (options?.published !== undefined) {
      where.published = options.published;
    }
    if (options?.featured !== undefined) {
      where.featured = options.featured;
    }
    if (options?.search) {
      where.OR = [
        { title: { contains: options.search, mode: "insensitive" } },
        { content: { contains: options.search, mode: "insensitive" } },
        { excerpt: { contains: options.search, mode: "insensitive" } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.knowledgeArticle.findMany({
        where,
        include: {
          category: true,
          author: { select: { id: true, name: true } },
          tags: { include: { tag: true } },
        },
        orderBy: [{ featured: "desc" }, { viewCount: "desc" }, { createdAt: "desc" }],
        take: options?.limit,
      }),
      prisma.knowledgeArticle.count({ where }),
    ]);

    return {
      articles: articles.map((a) => ({
        ...a,
        tags: a.tags.map((t) => t.tag),
      })) as unknown as KnowledgeArticleRecord[],
      total,
    };
  },

  async getArticleById(id: string): Promise<KnowledgeArticleRecord | null> {
    const article = await prisma.knowledgeArticle.findUnique({
      where: { id },
      include: {
        category: true,
        author: { select: { id: true, name: true } },
        tags: { include: { tag: true } },
        attachments: true,
      },
    });

    if (!article) return null;

    return {
      ...article,
      tags: article.tags.map((t) => t.tag),
    } as unknown as KnowledgeArticleRecord;
  },

  async getArticleBySlug(slug: string): Promise<KnowledgeArticleRecord | null> {
    const article = await prisma.knowledgeArticle.findUnique({
      where: { slug },
      include: {
        category: true,
        author: { select: { id: true, name: true } },
        tags: { include: { tag: true } },
        attachments: true,
      },
    });

    if (!article) return null;

    // Increment view count
    await prisma.knowledgeArticle.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });

    return {
      ...article,
      tags: article.tags.map((t) => t.tag),
    } as unknown as KnowledgeArticleRecord;
  },

  async updateArticle(id: string, data: Partial<KnowledgeArticleRequest>): Promise<void> {
    await prisma.knowledgeArticle.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.titleKn !== undefined && { titleKn: data.titleKn }),
        ...(data.slug && { slug: data.slug }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.contentKn !== undefined && { contentKn: data.contentKn }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.excerptKn !== undefined && { excerptKn: data.excerptKn }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.published !== undefined && { published: data.published }),
      },
    });

    // Update tags if provided
    if (data.tagIds !== undefined) {
      await prisma.articleTag.deleteMany({ where: { articleId: id } });
      if (data.tagIds.length > 0) {
        await prisma.articleTag.createMany({
          data: data.tagIds.map((tagId) => ({ articleId: id, tagId })),
        });
      }
    }
  },

  async deleteArticle(id: string): Promise<void> {
    await prisma.knowledgeArticle.delete({ where: { id } });
  },

  async toggleFeatured(id: string): Promise<boolean> {
    const article = await prisma.knowledgeArticle.findUnique({ where: { id } });
    if (!article) throw new Error("Article not found");
    await prisma.knowledgeArticle.update({
      where: { id },
      data: { featured: !article.featured },
    });
    return !article.featured;
  },

  async togglePublished(id: string): Promise<boolean> {
    const article = await prisma.knowledgeArticle.findUnique({ where: { id } });
    if (!article) throw new Error("Article not found");
    await prisma.knowledgeArticle.update({
      where: { id },
      data: { published: !article.published },
    });
    return !article.published;
  },

  // ============ CATEGORIES ============

  async createCategory(data: KnowledgeCategoryRequest): Promise<string> {
    const category = await prisma.knowledgeCategory.create({
      data: {
        name: data.name,
        nameKn: data.nameKn,
        slug: data.slug || generateSlug(data.name),
        description: data.description,
        icon: data.icon,
        color: data.color,
        order: data.order ?? 0,
        active: data.active ?? true,
      },
    });
    return category.id;
  },

  async getCategories(options?: {
    active?: boolean;
  }): Promise<{ categories: KnowledgeCategoryRecord[]; total: number }> {
    const where: Record<string, unknown> = {};

    if (options?.active !== undefined) {
      where.active = options.active;
    }

    const [categories, total] = await Promise.all([
      prisma.knowledgeCategory.findMany({
        where,
        include: {
          _count: { select: { articles: true } },
        },
        orderBy: { order: "asc" },
      }),
      prisma.knowledgeCategory.count({ where }),
    ]);

    return {
      categories: categories.map((c) => ({
        ...c,
        articleCount: c._count.articles,
      })) as unknown as KnowledgeCategoryRecord[],
      total,
    };
  },

  async getCategoryById(id: string): Promise<KnowledgeCategoryRecord | null> {
    const category = await prisma.knowledgeCategory.findUnique({
      where: { id },
      include: { _count: { select: { articles: true } } },
    });

    if (!category) return null;

    return {
      ...category,
      articleCount: category._count.articles,
    } as unknown as KnowledgeCategoryRecord;
  },

  async getCategoryBySlug(slug: string): Promise<KnowledgeCategoryRecord | null> {
    const category = await prisma.knowledgeCategory.findUnique({
      where: { slug },
      include: { _count: { select: { articles: true } } },
    });

    if (!category) return null;

    return {
      ...category,
      articleCount: category._count.articles,
    } as unknown as KnowledgeCategoryRecord;
  },

  async updateCategory(id: string, data: Partial<KnowledgeCategoryRequest>): Promise<void> {
    await prisma.knowledgeCategory.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.nameKn !== undefined && { nameKn: data.nameKn }),
        ...(data.slug && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.active !== undefined && { active: data.active }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });
  },

  async deleteCategory(id: string): Promise<void> {
    await prisma.knowledgeCategory.delete({ where: { id } });
  },

  // ============ TAGS ============

  async createTag(name: string, slug?: string): Promise<string> {
    const tag = await prisma.knowledgeTag.create({
      data: {
        name,
        slug: slug || generateSlug(name),
      },
    });
    return tag.id;
  },

  async getTags(): Promise<KnowledgeTagRecord[]> {
    const tags = await prisma.knowledgeTag.findMany({
      orderBy: { name: "asc" },
    });
    return tags as unknown as KnowledgeTagRecord[];
  },

  async getOrCreateTag(name: string): Promise<string> {
    const slug = generateSlug(name);
    const existing = await prisma.knowledgeTag.findUnique({ where: { slug } });
    if (existing) return existing.id;
    return this.createTag(name, slug);
  },

  // ============ SEARCH ============

  async search(query: string, limit = 20): Promise<KnowledgeSearchResult> {
    const articles = await prisma.knowledgeArticle.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { titleKn: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
          { excerpt: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
      orderBy: [{ featured: "desc" }, { viewCount: "desc" }],
      take: limit,
    });

    return {
      articles: articles.map((a) => ({
        ...a,
        tags: a.tags.map((t) => t.tag),
      })) as unknown as KnowledgeArticleRecord[],
      total: articles.length,
      query,
    };
  },

  // ============ STATISTICS ============

  async getStatistics(): Promise<KnowledgeStats> {
    const [totalArticles, publishedArticles, totalCategories, totalTags, topArticles] = await Promise.all([
      prisma.knowledgeArticle.count(),
      prisma.knowledgeArticle.count({ where: { published: true } }),
      prisma.knowledgeCategory.count(),
      prisma.knowledgeTag.count(),
      prisma.knowledgeArticle.findMany({
        where: { published: true },
        select: { id: true, title: true, viewCount: true },
        orderBy: { viewCount: "desc" },
        take: 10,
      }),
    ]);

    const totalViews = topArticles.reduce((sum, a) => sum + a.viewCount, 0);

    return {
      totalArticles,
      publishedArticles,
      totalCategories,
      totalTags,
      totalViews,
      topArticles: topArticles.map((a) => ({
        id: a.id,
        title: a.title,
        viewCount: a.viewCount,
      })),
    };
  },
};
