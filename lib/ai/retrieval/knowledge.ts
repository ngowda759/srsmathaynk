/**
 * Knowledge Base Retrieval
 * Retrieves relevant articles from the knowledge base
 */

import { prisma } from '@/lib/db';
import type { SourceMetadata, SearchQuery, RetrievalOptions } from './types';

const DEFAULT_LIMIT = 5;
const RELEVANCE_THRESHOLD = 0.3;

export async function retrieveFromKnowledge(
  query: SearchQuery,
  options: RetrievalOptions = {}
): Promise<SourceMetadata[]> {
  const { maxResults = DEFAULT_LIMIT, language = 'auto' } = options;
  
  const searchTerms = query.query.toLowerCase().split(/\s+/);
  
  // Build search conditions
  const whereCondition: Record<string, unknown> = {
    active: true,
  };

  // Language-specific search
  if (language === 'en') {
    whereCondition.OR = [
      { question: { contains: query.query, mode: 'insensitive' } },
      { answer: { contains: query.query, mode: 'insensitive' } },
      { keywords: { hasSome: searchTerms } },
    ];
  } else if (language === 'kn') {
    whereCondition.OR = [
      { questionKn: { contains: query.query, mode: 'insensitive' } },
      { answerKn: { contains: query.query, mode: 'insensitive' } },
    ];
  } else {
    // Mixed or auto - search both
    whereCondition.OR = [
      { question: { contains: query.query, mode: 'insensitive' } },
      { questionKn: { contains: query.query, mode: 'insensitive' } },
      { answer: { contains: query.query, mode: 'insensitive' } },
      { answerKn: { contains: query.query, mode: 'insensitive' } },
      { keywords: { hasSome: searchTerms } },
    ];
  }

  try {
    const articles = await prisma.knowledgeArticle.findMany({
      where: whereCondition,
      include: {
        category: true,
      },
      orderBy: [
        { priority: 'desc' }, // Featured articles first
        { viewCount: 'desc' }, // Most viewed
        { createdAt: 'desc' }, // Newest
      ],
      take: maxResults * 2, // Fetch more for relevance filtering
    });

    // Calculate relevance scores
    const scoredArticles = articles.map((article) => {
      const relevanceScore = calculateRelevance(query.query, article);
      return { article, relevanceScore };
    });

    // Filter and sort by relevance
    const relevantArticles = scoredArticles
      .filter((item) => item.relevanceScore >= RELEVANCE_THRESHOLD)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);

    return relevantArticles.map(({ article, relevanceScore }) => ({
      type: 'knowledge' as const,
      id: article.id,
      title: article.question,
      url: `/knowledge/${article.id}`,
      excerpt: article.answer.substring(0, 200) + (article.answer.length > 200 ? '...' : ''),
      relevanceScore,
      confidence: Math.min(relevanceScore * 1.2, 1.0), // Boost confidence slightly
    }));
  } catch (error) {
    console.error('[Knowledge Retrieval] Error:', error);
    return [];
  }
}

function calculateRelevance(
  query: string,
  article: {
    question: string;
    questionKn: string | null;
    answer: string;
    keywords: string[];
  }
): number {
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/);
  
  let score = 0;
  const maxScore = 100;

  // Exact match in question (highest weight)
  if (article.question.toLowerCase().includes(queryLower)) {
    score += 40;
  }

  // Question contains query terms
  const questionLower = article.question.toLowerCase();
  for (const term of queryTerms) {
    if (questionLower.includes(term)) {
      score += 10;
    }
  }

  // Exact match in Kannada question
  if (article.questionKn?.includes(query)) {
    score += 35;
  }

  // Answer contains query
  const answerLower = article.answer.toLowerCase();
  if (answerLower.includes(queryLower)) {
    score += 20;
  }
  for (const term of queryTerms) {
    if (answerLower.includes(term)) {
      score += 5;
    }
  }

  // Keywords match
  for (const keyword of article.keywords) {
    const keywordLower = keyword.toLowerCase();
    if (keywordLower.includes(queryLower)) {
      score += 15;
    }
    for (const term of queryTerms) {
      if (keywordLower.includes(term)) {
        score += 3;
      }
    }
  }

  // Normalize to 0-1 range
  return Math.min(score / maxScore, 1.0);
}

export async function getKnowledgeArticle(id: string) {
  try {
    const article = await prisma.knowledgeArticle.findUnique({
      where: { id },
      include: {
        category: true,
        articleTags: { include: { tag: true } },
      },
    });
    return article;
  } catch (error) {
    console.error('[Knowledge Retrieval] Error getting article:', error);
    return null;
  }
}
