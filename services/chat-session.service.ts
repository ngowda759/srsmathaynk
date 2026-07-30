/**
 * Chat Session Service (Sprint 5.1)
 * Replaces legacy approach with Prisma-based session management
 */

import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import type { SourceMetadata } from '@/lib/ai/retrieval/types';

// Types
export interface ChatSessionCreate {
  sessionKey: string;
  userId?: string;
  userIp?: string;
  userAgent?: string;
  language?: string;
}

export interface ChatSessionUpdate {
  language?: string;
  lastIntent?: string;
  lastTopic?: string;
  isActive?: boolean;
}

export interface ChatMessageCreate {
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  contentKn?: string;
  model?: string;
  latency?: number;
  tokens?: number;
  confidence?: number;
  sources?: SourceMetadata[];
  detectedLang?: string;
  detectedIntent?: string;
}

export interface ChatFeedbackCreate {
  sessionId: string;
  messageId?: string;
  isHelpful: boolean;
  rating?: number;
  comment?: string;
  userQuery?: string;
  aiResponse?: string;
  userId?: string;
}

export interface UnknownQuestionCreate {
  sessionId?: string;
  question: string;
  questionKn?: string;
  language?: string;
  intent?: string;
  topic?: string;
  context?: unknown;
  userId?: string;
  userIp?: string;
}

export interface UnknownQuestionUpdate {
  status?: 'pending' | 'reviewed' | 'answered' | 'skipped';
  reviewedBy?: string;
  suggestedAnswer?: string;
}

export interface SessionWithMessages {
  id: string;
  sessionKey: string;
  userId: string | null;
  language: string;
  messageCount: number;
  lastIntent: string | null;
  lastTopic: string | null;
  helpfulCount: number;
  notHelpfulCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
  messages: Array<{
    id: string;
    role: string;
    content: string;
    contentKn: string | null;
    model: string | null;
    latency: number | null;
    confidence: number | null;
    sources: unknown;
    detectedLang: string | null;
    detectedIntent: string | null;
    createdAt: Date;
  }>;
}

// Chat Session Service
export const chatSessionService = {
  // ============= SESSION MANAGEMENT =============

  /**
   * Create a new chat session
   */
  async createSession(data: ChatSessionCreate): Promise<string> {
    const session = await prisma.chatSession.create({
      data: {
        sessionKey: data.sessionKey,
        userId: data.userId,
        userIp: data.userIp,
        userAgent: data.userAgent,
        language: data.language || 'en',
        messageCount: 0,
        isActive: true,
      },
    });
    return session.id;
  },

  /**
   * Get session by ID
   */
  async getSession(id: string): Promise<{ id: string } & ChatSessionUpdate | null> {
    const session = await prisma.chatSession.findUnique({
      where: { id },
    });
    if (!session) return null;
    return {
      id: session.id,
      language: session.language ?? undefined,
      lastIntent: session.lastIntent ?? undefined,
      lastTopic: session.lastTopic ?? undefined,
      isActive: session.isActive,
    };
  },

  /**
   * Get session by session key
   */
  async getSessionByKey(sessionKey: string): Promise<{ id: string; language: string } | null> {
    const session = await prisma.chatSession.findUnique({
      where: { sessionKey },
      select: { id: true, language: true },
    });
    return session;
  },

  /**
   * Update session
   */
  async updateSession(id: string, data: ChatSessionUpdate): Promise<void> {
    await prisma.chatSession.update({
      where: { id },
      data: {
        ...data,
        lastActivityAt: new Date(),
      },
    });
  },

  /**
   * Get or create session by key
   */
  async getOrCreateSession(data: ChatSessionCreate): Promise<string> {
    const existing = await prisma.chatSession.findUnique({
      where: { sessionKey: data.sessionKey },
    });

    if (existing) {
      // Update activity
      await prisma.chatSession.update({
        where: { id: existing.id },
        data: { lastActivityAt: new Date() },
      });
      return existing.id;
    }

    return this.createSession(data);
  },

  /**
   * Get user's sessions
   */
  async getUserSessions(
    userId: string,
    options: { limit?: number; offset?: number; activeOnly?: boolean } = {}
  ): Promise<{ sessions: Array<{ id: string; sessionKey: string; language: string; messageCount: number; lastActivityAt: Date; createdAt: Date }>; total: number }> {
    const { limit = 20, offset = 0, activeOnly = true } = options;

    const where = {
      userId,
      ...(activeOnly && { isActive: true }),
    };

    const [sessions, total] = await Promise.all([
      prisma.chatSession.findMany({
        where,
        select: {
          id: true,
          sessionKey: true,
          language: true,
          messageCount: true,
          lastActivityAt: true,
          createdAt: true,
        },
        orderBy: { lastActivityAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.chatSession.count({ where }),
    ]);

    return { sessions, total };
  },

  /**
   * Delete session
   */
  async deleteSession(id: string): Promise<void> {
    await prisma.chatSession.delete({
      where: { id },
    });
  },

  // ============= MESSAGE MANAGEMENT =============

  /**
   * Save a message
   */
  async saveMessage(data: ChatMessageCreate): Promise<string> {
    const message = await prisma.chatMessage.create({
      data: {
        sessionId: data.sessionId,
        role: data.role,
        content: data.content,
        contentKn: data.contentKn,
        model: data.model,
        latency: data.latency,
        tokens: data.tokens,
        confidence: data.confidence,
        sources: data.sources ? JSON.parse(JSON.stringify(data.sources)) : undefined,
        detectedLang: data.detectedLang,
        detectedIntent: data.detectedIntent,
      },
    });

    // Update session message count and activity
    await prisma.chatSession.update({
      where: { id: data.sessionId },
      data: {
        messageCount: { increment: 1 },
        lastActivityAt: new Date(),
        lastIntent: data.detectedIntent,
      },
    });

    return message.id;
  },

  /**
   * Get session messages
   */
  async getSessionMessages(
    sessionId: string,
    options: { limit?: number; beforeId?: string } = {}
  ): Promise<Array<{
    id: string;
    role: string;
    content: string;
    contentKn: string | null;
    model: string | null;
    latency: number | null;
    confidence: number | null;
    sources: unknown;
    detectedLang: string | null;
    createdAt: Date;
  }>> {
    const { limit = 50, beforeId } = options;

    const where: Record<string, unknown> = { sessionId };
    if (beforeId) {
      where.id = { lt: beforeId };
    }

    const messages = await prisma.chatMessage.findMany({
      where,
      select: {
        id: true,
        role: true,
        content: true,
        contentKn: true,
        model: true,
        latency: true,
        confidence: true,
        sources: true,
        detectedLang: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    return messages;
  },

  /**
   * Get recent messages for context
   */
  async getRecentMessages(sessionId: string, limit = 10): Promise<string[]> {
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      select: { content: true, role: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return messages.reverse().map(m => `${m.role}: ${m.content}`);
  },

  // ============= FEEDBACK =============

  /**
   * Submit feedback
   */
  async submitFeedback(data: ChatFeedbackCreate): Promise<string> {
    const feedback = await prisma.aIFeedback.create({
      data: {
        sessionId: data.sessionId,
        messageId: data.messageId,
        isHelpful: data.isHelpful,
        rating: data.rating ?? undefined,
        comment: data.comment,
        userQuery: data.userQuery,
        aiResponse: data.aiResponse,
        userId: data.userId,
      },
    });

    // Update session feedback counts
    await prisma.chatSession.update({
      where: { id: data.sessionId },
      data: {
        helpfulCount: data.isHelpful ? { increment: 1 } : undefined,
        notHelpfulCount: !data.isHelpful ? { increment: 1 } : undefined,
      },
    });

    return feedback.id;
  },

  /**
   * Get feedback stats
   */
  async getFeedbackStats(sessionId?: string): Promise<{
    helpful: number;
    notHelpful: number;
    total: number;
    percentage: number;
  }> {
    const where = sessionId ? { sessionId } : {};

    const feedbacks = await prisma.aIFeedback.findMany({
      where,
      select: { isHelpful: true },
    });

    const helpful = feedbacks.filter(f => f.isHelpful).length;
    const notHelpful = feedbacks.filter(f => !f.isHelpful).length;
    const total = feedbacks.length;
    const percentage = total > 0 ? Math.round((helpful / total) * 100) : 0;

    return { helpful, notHelpful, total, percentage };
  },

  // ============= UNKNOWN QUESTIONS =============

  /**
   * Log an unknown question
   */
  async logUnknownQuestion(data: UnknownQuestionCreate): Promise<string> {
    const question = await prisma.unknownQuestion.create({
      data: {
        sessionId: data.sessionId,
        question: data.question,
        questionKn: data.questionKn,
        language: data.language || 'en',
        intent: data.intent,
        topic: data.topic,
        context: data.context as Prisma.InputJsonValue,
        userId: data.userId,
        userIp: data.userIp,
      },
    });
    return question.id;
  },

  /**
   * Get unknown questions for admin review
   */
  async getUnknownQuestions(options: {
    status?: string;
    language?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ questions: Array<{
    id: string;
    question: string;
    questionKn: string | null;
    language: string;
    intent: string | null;
    status: string;
    reviewedBy: string | null;
    reviewedAt: Date | null;
    suggestedAnswer: string | null;
    createdAt: Date;
  }>; total: number }> {
    const { status, language, limit = 50, offset = 0 } = options;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (language) where.language = language;

    const [questions, total] = await Promise.all([
      prisma.unknownQuestion.findMany({
        where,
        select: {
          id: true,
          question: true,
          questionKn: true,
          language: true,
          intent: true,
          status: true,
          reviewedBy: true,
          reviewedAt: true,
          suggestedAnswer: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.unknownQuestion.count({ where }),
    ]);

    return { questions, total };
  },

  /**
   * Update unknown question
   */
  async updateUnknownQuestion(id: string, data: UnknownQuestionUpdate): Promise<void> {
    await prisma.unknownQuestion.update({
      where: { id },
      data: {
        ...data,
        reviewedAt: data.status ? new Date() : undefined,
      },
    });
  },

  // ============= ANALYTICS =============

  /**
   * Get conversation analytics
   */
  async getAnalytics(options: {
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<{
    totalSessions: number;
    totalMessages: number;
    avgMessagesPerSession: number;
    activeSessions: number;
    feedbackStats: {
      helpful: number;
      notHelpful: number;
      percentage: number;
    };
    topLanguages: Array<{ language: string; count: number }>;
    dailyConversations: Array<{ date: string; count: number }>;
  }> {
    const { startDate, endDate } = options;

    const dateFilter: Record<string, unknown> = {};
    if (startDate) dateFilter.gte = startDate;
    if (endDate) dateFilter.lte = endDate;

    const [
      totalSessions,
      totalMessages,
      activeSessions,
      feedbackStats,
      languageCounts,
      dailyData,
    ] = await Promise.all([
      // Total sessions
      prisma.chatSession.count({
        where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter as { gte?: Date; lte?: Date } } : {},
      }),

      // Total messages
      prisma.chatMessage.count({
        where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter as { gte?: Date; lte?: Date } } : {},
      }),

      // Active sessions
      prisma.chatSession.count({ where: { isActive: true } }),

      // Feedback stats
      this.getFeedbackStats(),

      // Language distribution
      prisma.chatSession.groupBy({
        by: ['language'],
        _count: { id: true },
        where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter as { gte?: Date; lte?: Date } } : {},
      }),

      // Daily conversations
      prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM chat_sessions
        WHERE is_active = true
        ${startDate ? Prisma.sql`AND created_at >= ${startDate}` : Prisma.empty}
        ${endDate ? Prisma.sql`AND created_at <= ${endDate}` : Prisma.empty}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `,
    ]);

    return {
      totalSessions,
      totalMessages,
      avgMessagesPerSession: totalSessions > 0 ? Math.round(totalMessages / totalSessions * 10) / 10 : 0,
      activeSessions,
      feedbackStats,
      topLanguages: languageCounts.map(l => ({
        language: l.language,
        count: l._count.id,
      })),
      dailyConversations: dailyData.map(d => ({
        date: d.date,
        count: Number(d.count),
      })),
    };
  },
};
