/**
 * Documents Retrieval
 * Retrieves relevant documents from the database
 */

import { prisma } from '@/lib/db';
import type { SourceMetadata, SearchQuery, RetrievalOptions } from './types';

const DEFAULT_LIMIT = 3;
const RELEVANCE_THRESHOLD = 0.2;

export async function retrieveFromDocuments(
  query: SearchQuery,
  options: RetrievalOptions = {}
): Promise<SourceMetadata[]> {
  const { maxResults = DEFAULT_LIMIT } = options;
  const queryLower = query.query.toLowerCase();

  try {
    const documents = await prisma.document.findMany({
      where: {
        active: true,
        OR: [
          { title: { contains: query.query, mode: 'insensitive' } },
          { titleKn: { contains: query.query, mode: 'insensitive' } },
          { description: { contains: query.query, mode: 'insensitive' } },
        ],
      },
      include: {
        category: true,
        media: true,
      },
      orderBy: [
        { featured: 'desc' },
        { downloadCount: 'desc' },
      ],
      take: maxResults * 2,
    });

    // Calculate relevance scores
    const scoredDocs = documents.map((doc) => {
      const relevanceScore = calculateRelevance(queryLower, doc);
      return { doc, relevanceScore };
    });

    // Filter and sort
    const relevantDocs = scoredDocs
      .filter((item) => item.relevanceScore >= RELEVANCE_THRESHOLD)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);

    return relevantDocs.map(({ doc, relevanceScore }) => ({
      type: 'document' as const,
      id: doc.id,
      title: doc.title,
      url: `/documents/${doc.id}`,
      excerpt: doc.description || `Download ${doc.title}`,
      relevanceScore,
      confidence: Math.min(relevanceScore * 1.0, 0.9),
    }));
  } catch (error) {
    console.error('[Documents Retrieval] Error:', error);
    return [];
  }
}

function calculateRelevance(
  query: string,
  doc: {
    title: string;
    titleKn: string | null;
    description: string | null;
    featured: boolean;
    downloadCount: number;
  }
): number {
  let score = 0;
  const maxScore = 100;

  // Featured documents get a boost
  if (doc.featured) {
    score += 15;
  }

  // Popular documents get a slight boost
  if (doc.downloadCount > 50) {
    score += 5;
  }

  // Title match (highest weight)
  if (doc.title.toLowerCase().includes(query)) {
    score += 45;
  }

  // Kannada title match
  if (doc.titleKn?.includes(query)) {
    score += 40;
  }

  // Query terms in title
  const terms = query.split(/\s+/);
  const titleLower = doc.title.toLowerCase();
  for (const term of terms) {
    if (titleLower.includes(term)) {
      score += 8;
    }
  }

  // Description match
  if (doc.description?.toLowerCase().includes(query)) {
    score += 20;
  }

  return Math.min(score / maxScore, 1.0);
}

export async function getDocumentCategories() {
  return prisma.documentCategory.findMany({
    where: { active: true },
    include: {
      _count: { select: { documents: true } },
    },
    orderBy: { order: 'asc' },
  });
}

export async function getDocument(id: string) {
  return prisma.document.findUnique({
    where: { id },
    include: {
      category: true,
      media: true,
    },
  });
}

export async function incrementDownloadCount(id: string) {
  return prisma.document.update({
    where: { id },
    data: { downloadCount: { increment: 1 } },
  });
}
