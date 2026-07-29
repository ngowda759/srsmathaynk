/**
 * Donations Retrieval
 * Retrieves donation-related information
 */

import { prisma } from '@/lib/db';
import type { SourceMetadata, SearchQuery, RetrievalOptions } from './types';

const DEFAULT_LIMIT = 3;
const RELEVANCE_THRESHOLD = 0.2;

export async function retrieveFromDonations(
  query: SearchQuery,
  options: RetrievalOptions = {}
): Promise<SourceMetadata[]> {
  const { maxResults = DEFAULT_LIMIT } = options;
  const queryLower = query.query.toLowerCase();

  try {
    // Search for active campaigns
    const campaigns = await prisma.donationCampaign.findMany({
      where: {
        active: true,
        deletedAt: null,
        OR: [
          { title: { contains: query.query, mode: 'insensitive' } },
          { titleKn: { contains: query.query, mode: 'insensitive' } },
          { description: { contains: query.query, mode: 'insensitive' } },
          { descriptionKn: { contains: query.query, mode: 'insensitive' } },
        ],
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
      take: maxResults,
    });

    // Calculate relevance scores
    const scoredCampaigns = campaigns.map((campaign) => {
      const relevanceScore = calculateRelevance(queryLower, campaign);
      return { campaign, relevanceScore };
    });

    // Filter and sort
    const relevantCampaigns = scoredCampaigns
      .filter((item) => item.relevanceScore >= RELEVANCE_THRESHOLD)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);

    return relevantCampaigns.map(({ campaign, relevanceScore }) => ({
      type: 'donation' as const,
      id: campaign.id,
      title: campaign.title,
      url: `/donations/${campaign.id}`,
      excerpt: campaign.description?.substring(0, 150) + (campaign.description && campaign.description.length > 150 ? '...' : ''),
      relevanceScore,
      confidence: Math.min(relevanceScore * 1.0, 0.9),
    }));
  } catch (error) {
    console.error('[Donations Retrieval] Error:', error);
    return [];
  }
}

function calculateRelevance(
  query: string,
  campaign: {
    title: string;
    titleKn: string | null;
    description: string | null;
    descriptionKn: string | null;
    featured: boolean;
    urgencyLevel: string;
  }
): number {
  let score = 0;
  const maxScore = 100;

  // Featured campaigns get a boost
  if (campaign.featured) {
    score += 15;
  }

  // Urgent campaigns get a slight boost
  if (campaign.urgencyLevel === 'URGENT') {
    score += 10;
  }

  // Title match
  if (campaign.title.toLowerCase().includes(query)) {
    score += 45;
  }

  // Kannada title match
  if (campaign.titleKn?.includes(query)) {
    score += 40;
  }

  // Query terms in title
  const terms = query.split(/\s+/);
  const titleLower = campaign.title.toLowerCase();
  for (const term of terms) {
    if (titleLower.includes(term)) {
      score += 8;
    }
  }

  // Description match
  if (campaign.description?.toLowerCase().includes(query)) {
    score += 20;
  }
  if (campaign.descriptionKn?.toLowerCase().includes(query)) {
    score += 18;
  }

  return Math.min(score / maxScore, 1.0);
}

export async function getActiveCampaigns(limit = 10) {
  return prisma.donationCampaign.findMany({
    where: {
      active: true,
      deletedAt: null,
    },
    orderBy: [
      { featured: 'desc' },
      { createdAt: 'desc' },
    ],
    take: limit,
  });
}

export async function getCampaignById(id: string) {
  return prisma.donationCampaign.findUnique({
    where: { id },
  });
}

export async function getTempleBankDetails() {
  const templeInfo = await prisma.templeInfo.findFirst({
    select: {
      bankName: true,
      bankAccountName: true,
      bankAccountNumber: true,
      bankIFSCCode: true,
      bankUPIId: true,
    },
  });
  return templeInfo;
}
