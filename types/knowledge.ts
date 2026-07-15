import type {
  KnowledgeArticle,
  KnowledgeCategory,
  KnowledgeAttachment,
  KnowledgeTag,
  ArticleTag,
  ChatFeedback,
} from "@prisma/client";

export type {
  KnowledgeArticle,
  KnowledgeCategory,
  KnowledgeAttachment,
  KnowledgeTag,
  ArticleTag,
  ChatFeedback,
};

// Knowledge Article Record
export interface KnowledgeArticleRecord {
  id: string;
  title: string;
  titleKn: string | null;
  slug: string;
  content: string;
  contentKn: string | null;
  excerpt: string | null;
  excerptKn: string | null;
  categoryId: string;
  authorId: string | null;
  featured: boolean;
  published: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  category?: KnowledgeCategoryRecord | null;
  author?: { id: string; name: string | null } | null;
  tags?: KnowledgeTagRecord[];
  attachments?: KnowledgeAttachmentRecord[];
}

// Knowledge Category Record
export interface KnowledgeCategoryRecord {
  id: string;
  name: string;
  nameKn: string | null;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  order: number;
  active: boolean;
  articleCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Knowledge Tag Record
export interface KnowledgeTagRecord {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

// Knowledge Attachment Record
export interface KnowledgeAttachmentRecord {
  id: string;
  articleId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize: number | null;
  createdAt: Date;
}

// Knowledge Article Request
export interface KnowledgeArticleRequest {
  title: string;
  titleKn?: string;
  slug?: string;
  content: string;
  contentKn?: string;
  excerpt?: string;
  excerptKn?: string;
  categoryId: string;
  authorId?: string;
  featured?: boolean;
  published?: boolean;
  tagIds?: string[];
}

// Knowledge Category Request
export interface KnowledgeCategoryRequest {
  name: string;
  nameKn?: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  order?: number;
  active?: boolean;
}

// Knowledge Tag Request
export interface KnowledgeTagRequest {
  name: string;
  slug?: string;
}

// Search Result
export interface KnowledgeSearchResult {
  articles: KnowledgeArticleRecord[];
  total: number;
  query: string;
}

// Statistics
export interface KnowledgeStats {
  totalArticles: number;
  publishedArticles: number;
  totalCategories: number;
  totalTags: number;
  totalViews: number;
  topArticles: { id: string; title: string; viewCount: number }[];
}

// Knowledge Categories for UI
export const knowledgeCategories = [
  { id: "temple-history", name: "Temple History", icon: "landmark" },
  { id: "guru-parampara", name: "Guru Parampara", icon: "users" },
  { id: "rayaru", name: "Rayaru (Swami Raghavendra)", icon: "sparkles" },
  { id: "madhwa-philosophy", name: "Madhwa Philosophy", icon: "book-open" },
  { id: "aaradhanes", name: "Aaradhanes", icon: "flame" },
  { id: "panchanga", name: "Panchanga", icon: "calendar" },
  { id: "sevas", name: "Sevas", icon: "gem" },
  { id: "festivals", name: "Festivals", icon: "party-popper" },
  { id: "slokas", name: "Slokas & Stothras", icon: "music" },
  { id: "daily-rituals", name: "Daily Rituals", icon: "clock" },
  { id: "faqs", name: "FAQs", icon: "help-circle" },
];
