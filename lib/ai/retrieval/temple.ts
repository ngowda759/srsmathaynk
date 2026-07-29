/**
 * Temple Info Retrieval
 * Retrieves general temple information
 */

import { prisma } from '@/lib/db';
import type { SourceMetadata, SearchQuery, RetrievalOptions } from './types';

const DEFAULT_LIMIT = 2;
const RELEVANCE_THRESHOLD = 0.1;

export async function retrieveFromTempleInfo(
  query: SearchQuery,
  options: RetrievalOptions = {}
): Promise<SourceMetadata[]> {
  const { maxResults = DEFAULT_LIMIT } = options;
  const queryLower = query.query.toLowerCase();

  try {
    const templeInfo = await prisma.templeInfo.findFirst();

    if (!templeInfo) {
      return [];
    }

    // Check if query matches temple info fields
    const relevanceScore = calculateRelevance(queryLower, templeInfo);

    if (relevanceScore >= RELEVANCE_THRESHOLD) {
      return [{
        type: 'temple_info' as const,
        id: templeInfo.id,
        title: templeInfo.name,
        url: '/about',
        excerpt: getTempleExcerpt(templeInfo, queryLower),
        relevanceScore,
        confidence: Math.min(relevanceScore * 1.0, 0.85),
      }];
    }

    return [];
  } catch (error) {
    console.error('[Temple Info Retrieval] Error:', error);
    return [];
  }
}

function calculateRelevance(
  query: string,
  templeInfo: {
    name: string;
    shortName: string | null;
    address: string | null;
    city: string | null;
    description: string | null;
    phone: string | null;
    email: string | null;
  }
): number {
  let score = 0;
  const maxScore = 100;

  // Temple name match
  if (templeInfo.name.toLowerCase().includes(query)) {
    score += 40;
  }
  if (templeInfo.shortName?.toLowerCase().includes(query)) {
    score += 35;
  }

  // Location match
  if (templeInfo.address?.toLowerCase().includes(query)) {
    score += 20;
  }
  if (templeInfo.city?.toLowerCase().includes(query)) {
    score += 25;
  }

  // Contact info
  if (templeInfo.phone?.includes(query)) {
    score += 30;
  }
  if (templeInfo.email?.toLowerCase().includes(query)) {
    score += 30;
  }

  // Description match
  if (templeInfo.description?.toLowerCase().includes(query)) {
    score += 15;
  }

  return Math.min(score / maxScore, 1.0);
}

function getTempleExcerpt(
  templeInfo: {
    name: string;
    address: string | null;
    phone: string | null;
    description: string | null;
  },
  query: string
): string {
  const parts: string[] = [];

  if (templeInfo.description) {
    parts.push(templeInfo.description.substring(0, 200));
  }

  if (templeInfo.address) {
    parts.push(`Address: ${templeInfo.address}`);
  }

  if (templeInfo.phone) {
    parts.push(`Phone: ${templeInfo.phone}`);
  }

  return parts.join(' | ').substring(0, 300);
}

export async function getTempleInfo() {
  return prisma.templeInfo.findFirst();
}

export async function getTempleTimings() {
  const today = new Date();
  const dayOfWeek = today.getDay();

  // Get regular day timings
  const regularDay = await prisma.templeDay.findUnique({
    where: { dayOfWeek },
  });

  // Check for exceptions (special days)
  const exception = await prisma.templeException.findFirst({
    where: {
      date: {
        gte: new Date(today.setHours(0, 0, 0, 0)),
        lte: new Date(today.setHours(23, 59, 59, 999)),
      },
    },
  });

  return {
    regular: regularDay,
    exception,
    isHoliday: exception?.isClosed || regularDay?.isHoliday || false,
    morningOpen: exception?.morningOpenTime || regularDay?.morningOpenTime,
    morningClose: exception?.morningCloseTime || regularDay?.morningCloseTime,
    eveningOpen: exception?.eveningOpenTime || regularDay?.eveningOpenTime,
    eveningClose: exception?.eveningCloseTime || regularDay?.eveningCloseTime,
    notes: exception?.description || regularDay?.notes,
  };
}

export async function getContactInfo() {
  const templeInfo = await prisma.templeInfo.findFirst({
    select: {
      phone: true,
      alternatePhone: true,
      email: true,
      address: true,
      city: true,
      socialFacebook: true,
      socialTwitter: true,
      socialInstagram: true,
      socialYoutube: true,
      socialWhatsapp: true,
    },
  });
  return templeInfo;
}
