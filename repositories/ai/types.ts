/**
 * AI Knowledge Base Repository Types
 */

import { AIKnowledgeCategory, AIKnowledgeArticle, AIChatFeedback } from "@prisma/client"
export type { AIKnowledgeCategory, AIKnowledgeArticle, AIChatFeedback }

export interface CreateCategoryDTO {
  name: string
  description?: string
  icon?: string
  color?: string
  order?: number
  active?: boolean
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {}

export interface CreateArticleDTO {
  categoryId: string
  question: string
  questionKannada?: string
  answer: string
  answerKannada?: string
  keywords?: string[]
  priority?: number
  active?: boolean
}

export interface UpdateArticleDTO extends Partial<CreateArticleDTO> {}

export interface CreateFeedbackDTO {
  articleId?: string
  userId?: string
  rating: number
  isHelpful: boolean
  comment?: string
  userQuery?: string
  aiResponse?: string
}
