/**
 * Knowledge Service - Sprint 4.7
 * Temple Knowledge Base - Foundation for Raya AI
 * 
 * Maps to KnowledgeArticle (FAQ model) with question/answer fields
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

// Map internal model to API format
function mapArticle(article: {
  id: string;
  question: string;
  questionKn: string | null;
  answer: string;
  answerKn: string | null;
  keywords: string[];
  priority: number;
  active: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  category?: { id: string; name: string; slug: string } | null;
  articleTags?: { tag: { id: string; name: string; slug: string; createdAt: Date } }[];
}): KnowledgeArticleRecord {
  return {
    id: article.id,
    title: article.question,
    titleKn: article.questionKn,
    slug: article.id,
    content: article.answer,
    contentKn: article.answerKn,
    excerpt: article.keywords.join(", "),
    excerptKn: null,
    categoryId: article.category?.id || "",
    authorId: null,
    featured: article.priority > 0,
    published: article.active,
    viewCount: article.viewCount,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    category: article.category ? {
      id: article.category.id,
      name: article.category.name,
      nameKn: null,
      slug: article.category.slug,
      description: null,
      icon: null,
      color: null,
      order: 0,
      active: true,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    } : null,
    tags: article.articleTags?.map((t) => ({
      id: t.tag.id,
      name: t.tag.name,
      slug: t.tag.slug,
      createdAt: t.tag.createdAt,
    })) || [],
  } as unknown as KnowledgeArticleRecord;
}

export const knowledgeService = {
  // ============ ARTICLES (FAQs) ============

  async createArticle(data: KnowledgeArticleRequest): Promise<string> {
    const article = await prisma.knowledgeArticle.create({
      data: {
        question: data.title,
        questionKn: data.titleKn,
        answer: data.content,
        answerKn: data.contentKn,
        keywords: data.excerpt ? [data.excerpt] : [],
        categoryId: data.categoryId,
        priority: data.featured ? 1 : 0,
        active: data.published ?? true,
      },
    });

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
    active?: boolean;
    search?: string;
    limit?: number;
  }): Promise<{ articles: KnowledgeArticleRecord[]; total: number }> {
    const where: Record<string, unknown> = {};

    if (options?.categoryId) {
      where.categoryId = options.categoryId;
    }
    if (options?.active !== undefined) {
      where.active = options.active;
    }
    if (options?.search) {
      where.OR = [
        { question: { contains: options.search, mode: "insensitive" } },
        { questionKn: { contains: options.search, mode: "insensitive" } },
        { answer: { contains: options.search, mode: "insensitive" } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.knowledgeArticle.findMany({
        where,
        include: {
          category: true,
          articleTags: { include: { tag: true } },
        },
        orderBy: [{ priority: "desc" }, { viewCount: "desc" }, { createdAt: "desc" }],
        take: options?.limit,
      }),
      prisma.knowledgeArticle.count({ where }),
    ]);

    return {
      articles: articles.map(mapArticle),
      total,
    };
  },

  async getArticleById(id: string): Promise<KnowledgeArticleRecord | null> {
    const article = await prisma.knowledgeArticle.findUnique({
      where: { id },
      include: {
        category: true,
        articleTags: { include: { tag: true } },
        attachments: true,
      },
    });

    if (!article) return null;

    await prisma.knowledgeArticle.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });

    return mapArticle(article);
  },

  async updateArticle(id: string, data: Partial<KnowledgeArticleRequest>): Promise<void> {
    const updateData: Record<string, unknown> = {};

    if (data.title) updateData.question = data.title;
    if (data.titleKn !== undefined) updateData.questionKn = data.titleKn;
    if (data.content !== undefined) updateData.answer = data.content;
    if (data.contentKn !== undefined) updateData.answerKn = data.contentKn;
    if (data.excerpt) updateData.keywords = [data.excerpt];
    if (data.categoryId) updateData.categoryId = data.categoryId;
    if (data.featured !== undefined) updateData.priority = data.featured ? 1 : 0;
    if (data.published !== undefined) updateData.active = data.published;

    await prisma.knowledgeArticle.update({
      where: { id },
      data: updateData,
    });

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
    const newFeatured = article.priority === 0;
    await prisma.knowledgeArticle.update({
      where: { id },
      data: { priority: newFeatured ? 1 : 0 },
    });
    return newFeatured;
  },

  async togglePublished(id: string): Promise<boolean> {
    const article = await prisma.knowledgeArticle.findUnique({ where: { id } });
    if (!article) throw new Error("Article not found");
    const newActive = !article.active;
    await prisma.knowledgeArticle.update({
      where: { id },
      data: { active: newActive },
    });
    return newActive;
  },

  async incrementViewCount(id: string): Promise<void> {
    await prisma.knowledgeArticle.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  },

  async recordHelpful(id: string, helpful: boolean): Promise<void> {
    if (helpful) {
      await prisma.knowledgeArticle.update({
        where: { id },
        data: { helpfulCount: { increment: 1 } },
      });
    } else {
      await prisma.knowledgeArticle.update({
        where: { id },
        data: { notHelpfulCount: { increment: 1 } },
      });
    }
  },

  // ============ CATEGORIES ============

  async createCategory(data: KnowledgeCategoryRequest): Promise<string> {
    const category = await prisma.knowledgeCategory.create({
      data: {
        name: data.name,
        
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
        include: { _count: { select: { articles: true } } },
        orderBy: { order: "asc" },
      }),
      prisma.knowledgeCategory.count({ where }),
    ]);

    return {
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        
        slug: c.slug,
        description: c.description,
        icon: c.icon,
        color: c.color,
        order: c.order,
        active: c.active,
        articleCount: c._count.articles,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
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
      id: category.id,
      name: category.name,
      
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      color: category.color,
      order: category.order,
      active: category.active,
      articleCount: category._count.articles,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    } as unknown as KnowledgeCategoryRecord;
  },

  async getCategoryBySlug(slug: string): Promise<KnowledgeCategoryRecord | null> {
    const category = await prisma.knowledgeCategory.findUnique({
      where: { slug },
      include: { _count: { select: { articles: true } } },
    });
    if (!category) return null;
    return {
      id: category.id,
      name: category.name,
      
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      color: category.color,
      order: category.order,
      active: category.active,
      articleCount: category._count.articles,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    } as unknown as KnowledgeCategoryRecord;
  },

  async updateCategory(id: string, data: Partial<KnowledgeCategoryRequest>): Promise<void> {
    await prisma.knowledgeCategory.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
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
    return tags.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      createdAt: t.createdAt,
    })) as unknown as KnowledgeTagRecord[];
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
        active: true,
        OR: [
          { question: { contains: query, mode: "insensitive" } },
          { questionKn: { contains: query, mode: "insensitive" } },
          { answer: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        category: true,
        articleTags: { include: { tag: true } },
      },
      orderBy: [{ priority: "desc" }, { viewCount: "desc" }],
      take: limit,
    });

    return {
      articles: articles.map(mapArticle),
      total: articles.length,
      query,
    };
  },

  // ============ ADVANCED SEARCH (For Raya AI) ============

  async searchAdvanced(options: {
    query?: string;
    categoryId?: string;
    tagIds?: string[];
    keywords?: string[];
    publishedOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<KnowledgeSearchResult> {
    const where: Record<string, unknown> = {};

    // Published filter
    if (options.publishedOnly !== false) {
      where.active = true;
    }

    // Category filter
    if (options.categoryId) {
      where.categoryId = options.categoryId;
    }

    // Tag filter (requires articleTags join)
    if (options.tagIds && options.tagIds.length > 0) {
      where.articleTags = {
        some: {
          tagId: { in: options.tagIds },
        },
      };
    }

    // Text search with keywords
    if (options.query || (options.keywords && options.keywords.length > 0)) {
      const searchTerms = [
        options.query,
        ...(options.keywords || []),
      ].filter(Boolean);

      where.OR = searchTerms.flatMap((term) => [
        { question: { contains: term as string, mode: "insensitive" } },
        { questionKn: { contains: term as string, mode: "insensitive" } },
        { answer: { contains: term as string, mode: "insensitive" } },
        { keywords: { has: term } },
      ]);
    }

    const [articles, total] = await Promise.all([
      prisma.knowledgeArticle.findMany({
        where,
        include: {
          category: true,
          articleTags: { include: { tag: true } },
        },
        orderBy: [
          { priority: "desc" }, // Featured first
          { viewCount: "desc" }, // Most viewed
          { createdAt: "desc" }, // Newest
        ],
        take: options.limit || 20,
        skip: options.offset || 0,
      }),
      prisma.knowledgeArticle.count({ where }),
    ]);

    return {
      articles: articles.map(mapArticle),
      total,
      query: options.query || "",
    };
  },

  // ============ STATISTICS ============

  async getStatistics(): Promise<KnowledgeStats> {
    const [totalArticles, publishedArticles, totalCategories, totalTags, topArticles] = await Promise.all([
      prisma.knowledgeArticle.count(),
      prisma.knowledgeArticle.count({ where: { active: true } }),
      prisma.knowledgeCategory.count(),
      prisma.knowledgeTag.count(),
      prisma.knowledgeArticle.findMany({
        where: { active: true },
        select: { id: true, question: true, viewCount: true },
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
        title: a.question,
        viewCount: a.viewCount,
      })),
    };
  },
};
