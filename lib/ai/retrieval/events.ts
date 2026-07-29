/**
 * Events Retrieval
 * Retrieves relevant events from the database
 */

import { prisma } from '@/lib/db';
import type { SourceMetadata, SearchQuery, RetrievalOptions } from './types';
import { startOfDay } from 'date-fns';

const DEFAULT_LIMIT = 5;
const RELEVANCE_THRESHOLD = 0.25;

export async function retrieveFromEvents(
  query: SearchQuery,
  options: RetrievalOptions = {}
): Promise<SourceMetadata[]> {
  const { maxResults = DEFAULT_LIMIT } = options;
  
  const today = new Date();
  const queryLower = query.query.toLowerCase();

  try {
    // Search for events
    const events = await prisma.event.findMany({
      where: {
        published: true,
        deletedAt: null,
        OR: [
          { title: { contains: query.query, mode: 'insensitive' } },
          { titleKn: { contains: query.query, mode: 'insensitive' } },
          { description: { contains: query.query, mode: 'insensitive' } },
          { descriptionKn: { contains: query.query, mode: 'insensitive' } },
        ],
        // Only upcoming events
        startDate: { gte: startOfDay(today) },
      },
      orderBy: [
        { startDate: 'asc' }, // Soonest first
        { featured: 'desc' },
      ],
      take: maxResults * 2,
    });

    // Calculate relevance scores
    const scoredEvents = events.map((event) => {
      const relevanceScore = calculateRelevance(queryLower, event);
      return { event, relevanceScore };
    });

    // Filter and sort
    const relevantEvents = scoredEvents
      .filter((item) => item.relevanceScore >= RELEVANCE_THRESHOLD)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);

    return relevantEvents.map(({ event, relevanceScore }) => ({
      type: 'event' as const,
      id: event.id,
      title: event.title,
      url: `/events/${event.id}`,
      excerpt: event.description?.substring(0, 150) + (event.description && event.description.length > 150 ? '...' : ''),
      relevanceScore,
      confidence: Math.min(relevanceScore * 1.1, 0.95),
    }));
  } catch (error) {
    console.error('[Events Retrieval] Error:', error);
    return [];
  }
}

function calculateRelevance(
  query: string,
  event: {
    title: string;
    titleKn: string | null;
    description: string | null;
    descriptionKn: string | null;
    featured: boolean;
  }
): number {
  let score = 0;
  const maxScore = 100;

  // Featured events get a boost
  if (event.featured) {
    score += 10;
  }

  // Title match (highest weight)
  if (event.title.toLowerCase().includes(query)) {
    score += 40;
  }
  
  // Kannada title match
  if (event.titleKn?.includes(query)) {
    score += 35;
  }

  // Query terms in title
  const terms = query.split(/\s+/);
  const titleLower = event.title.toLowerCase();
  for (const term of terms) {
    if (titleLower.includes(term)) {
      score += 8;
    }
  }

  // Description match
  if (event.description?.toLowerCase().includes(query)) {
    score += 20;
  }
  if (event.descriptionKn?.includes(query)) {
    score += 18;
  }

  return Math.min(score / maxScore, 1.0);
}

export async function getUpcomingEvents(limit = 5) {
  const today = new Date();
  
  return prisma.event.findMany({
    where: {
      published: true,
      deletedAt: null,
      startDate: { gte: startOfDay(today) },
    },
    orderBy: { startDate: 'asc' },
    take: limit,
  });
}

export async function getEventById(id: string) {
  return prisma.event.findUnique({
    where: { id },
  });
}
