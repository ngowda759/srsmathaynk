/**
 * Sevas Retrieval
 * Retrieves relevant sevas from the database
 */

import { prisma } from '@/lib/db';
import type { SourceMetadata, SearchQuery, RetrievalOptions } from './types';

const DEFAULT_LIMIT = 5;
const RELEVANCE_THRESHOLD = 0.25;

export async function retrieveFromSevas(
  query: SearchQuery,
  options: RetrievalOptions = {}
): Promise<SourceMetadata[]> {
  const { maxResults = DEFAULT_LIMIT } = options;
  const queryLower = query.query.toLowerCase();

  try {
    const sevas = await prisma.seva.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: query.query, mode: 'insensitive' } },
          { nameKn: { contains: query.query, mode: 'insensitive' } },
          { description: { contains: query.query, mode: 'insensitive' } },
          { descriptionKn: { contains: query.query, mode: 'insensitive' } },
        ],
      },
      orderBy: [
        { featured: 'desc' },
      ],
      take: maxResults * 2,
    });

    // Calculate relevance scores
    const scoredSevas = sevas.map((seva) => {
      const relevanceScore = calculateRelevance(queryLower, seva);
      return { seva, relevanceScore };
    });

    // Filter and sort
    const relevantSevas = scoredSevas
      .filter((item) => item.relevanceScore >= RELEVANCE_THRESHOLD)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);

    return relevantSevas.map(({ seva, relevanceScore }) => ({
      type: 'seva' as const,
      id: seva.id,
      title: seva.name,
      url: `/sevas/${seva.id}`,
      excerpt: seva.description?.substring(0, 150) + (seva.description && seva.description.length > 150 ? '...' : ''),
      relevanceScore,
      confidence: Math.min(relevanceScore * 1.1, 0.95),
    }));
  } catch (error) {
    console.error('[Sevas Retrieval] Error:', error);
    return [];
  }
}

function calculateRelevance(
  query: string,
  seva: {
    name: string;
    nameKn: string | null;
    description: string | null;
    descriptionKn: string | null;
    featured: boolean;
  }
): number {
  let score = 0;
  const maxScore = 100;

  // Featured sevas get a boost
  if (seva.featured) {
    score += 10;
  }

  // Name match (highest weight)
  if (seva.name.toLowerCase().includes(query)) {
    score += 45;
  }

  // Kannada name match
  if (seva.nameKn?.includes(query)) {
    score += 40;
  }

  // Query terms in name
  const terms = query.split(/\s+/);
  const nameLower = seva.name.toLowerCase();
  for (const term of terms) {
    if (nameLower.includes(term)) {
      score += 10;
    }
  }

  // Description match
  if (seva.description?.toLowerCase().includes(query)) {
    score += 20;
  }
  if (seva.descriptionKn?.toLowerCase().includes(query)) {
    score += 18;
  }

  return Math.min(score / maxScore, 1.0);
}

export async function getAllSevas(limit?: number) {
  return prisma.seva.findMany({
    where: { active: true },
    orderBy: [
      { featured: 'desc' },
    ],
    take: limit,
  });
}

export async function getSevaById(id: string) {
  return prisma.seva.findUnique({
    where: { id },
  });
}

export async function getSevaPricing(sevaId: string) {
  const seva = await prisma.seva.findUnique({
    where: { id: sevaId },
    select: {
      name: true,
      nameKn: true,
      price: true,
    },
  });
  return seva;
}
