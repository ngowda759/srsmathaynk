/**
 * Search Service
 * Global search across all entities
 */
import { prisma } from '@/lib/db'

export type SearchResultType = 
  | 'EVENT'
  | 'SEVA'
  | 'ANNOUNCEMENT'
  | 'DOCUMENT'
  | 'DONATION_CAMPAIGN'
  | 'KNOWLEDGE_ARTICLE'

export interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  titleKn?: string
  description?: string
  descriptionKn?: string
  url: string
  relevanceScore: number
}

export interface SearchOptions {
  limit?: number
  offset?: number
  type?: SearchResultType
  language?: 'en' | 'kn'
}

class SearchService {
  /**
   * Global search across all entities
   */
  async search(query: string, options: SearchOptions = {}): Promise<{
    results: SearchResult[]
    total: number
  }> {
    const { limit = 20, offset = 0, language = 'en' } = options

    if (!query || query.trim().length < 2) {
      return { results: [], total: 0 }
    }

    const searchTerm = query.trim().toLowerCase()

    // Search across multiple entities in parallel
    const [
      events,
      sevas,
      announcements,
      documents,
      campaigns,
    ] = await Promise.all([
      this.searchEvents(searchTerm),
      this.searchSevas(searchTerm),
      this.searchAnnouncements(searchTerm),
      this.searchDocuments(searchTerm),
      this.searchCampaigns(searchTerm),
    ])

    // Combine and sort by relevance
    const allResults: SearchResult[] = [
      ...events,
      ...sevas,
      ...announcements,
      ...documents,
      ...campaigns,
    ]

    // Sort by relevance score
    allResults.sort((a, b) => b.relevanceScore - a.relevanceScore)

    // Apply pagination
    const paginatedResults = allResults.slice(offset, offset + limit)

    return {
      results: paginatedResults,
      total: allResults.length,
    }
  }

  /**
   * Search events
   */
  private async searchEvents(searchTerm: string): Promise<SearchResult[]> {
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { titleKn: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { descriptionKn: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        titleKn: true,
        description: true,
        descriptionKn: true,
      },
      take: 10,
    })

    return events.map(event => ({
      id: event.id,
      type: 'EVENT' as SearchResultType,
      title: event.title,
      titleKn: event.titleKn || undefined,
      description: event.description?.substring(0, 200),
      descriptionKn: event.descriptionKn?.substring(0, 200),
      url: `/events/${event.id}`,
      relevanceScore: this.calculateRelevance(event.title, searchTerm),
    }))
  }

  /**
   * Search sevas
   */
  private async searchSevas(searchTerm: string): Promise<SearchResult[]> {
    const sevas = await prisma.seva.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { nameKn: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        nameKn: true,
        description: true,
        descriptionKn: true,
      },
      take: 10,
    })

    return sevas.map(seva => ({
      id: seva.id,
      type: 'SEVA' as SearchResultType,
      title: seva.name,
      titleKn: seva.nameKn || undefined,
      description: seva.description?.substring(0, 200),
      descriptionKn: seva.descriptionKn?.substring(0, 200),
      url: `/sevas/${seva.id}`,
      relevanceScore: this.calculateRelevance(seva.name, searchTerm),
    }))
  }

  /**
   * Search announcements
   */
  private async searchAnnouncements(searchTerm: string): Promise<SearchResult[]> {
    const announcements = await prisma.announcement.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { content: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
      },
      take: 10,
    })

    return announcements.map(ann => ({
      id: ann.id,
      type: 'ANNOUNCEMENT' as SearchResultType,
      title: ann.title,
      description: ann.excerpt || ann.content?.substring(0, 200),
      url: `/announcements/${ann.id}`,
      relevanceScore: this.calculateRelevance(ann.title, searchTerm),
    }))
  }

  /**
   * Search documents
   */
  private async searchDocuments(searchTerm: string): Promise<SearchResult[]> {
    const documents = await prisma.document.findMany({
      where: {
        active: true,
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
      },
      take: 10,
    })

    return documents.map(doc => ({
      id: doc.id,
      type: 'DOCUMENT' as SearchResultType,
      title: doc.title,
      description: doc.description?.substring(0, 200),
      url: `/documents/${doc.id}`,
      relevanceScore: this.calculateRelevance(doc.title, searchTerm),
    }))
  }

  /**
   * Search donation campaigns
   */
  private async searchCampaigns(searchTerm: string): Promise<SearchResult[]> {
    const campaigns = await prisma.donationCampaign.findMany({
      where: {
        active: true,
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { titleKn: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        titleKn: true,
        description: true,
        descriptionKn: true,
      },
      take: 10,
    })

    return campaigns.map(campaign => ({
      id: campaign.id,
      type: 'DONATION_CAMPAIGN' as SearchResultType,
      title: campaign.title,
      titleKn: campaign.titleKn || undefined,
      description: campaign.description?.substring(0, 200),
      descriptionKn: campaign.descriptionKn?.substring(0, 200),
      url: `/donate/${campaign.id}`,
      relevanceScore: this.calculateRelevance(campaign.title, searchTerm),
    }))
  }

  /**
   * Calculate relevance score based on match position and frequency
   */
  private calculateRelevance(text: string, searchTerm: string): number {
    if (!text) return 0

    const normalizedText = text.toLowerCase()
    let score = 0

    // Exact match bonus
    if (normalizedText === searchTerm) {
      score += 100
    }

    // Starts with bonus
    if (normalizedText.startsWith(searchTerm)) {
      score += 50
    }

    // Contains bonus
    if (normalizedText.includes(searchTerm)) {
      score += 30
    }

    // Word boundary match bonus
    const words = normalizedText.split(/\s+/)
    if (words.some(word => word.startsWith(searchTerm))) {
      score += 20
    }

    // Position bonus (earlier is better)
    const position = normalizedText.indexOf(searchTerm)
    if (position >= 0) {
      score += Math.max(0, 10 - Math.floor(position / 20))
    }

    return score
  }

  /**
   * Get search suggestions (autocomplete)
   */
  async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (!query || query.trim().length < 2) {
      return []
    }

    const searchTerm = query.trim().toLowerCase()
    const suggestions: Set<string> = new Set()

    // Get event titles
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { titleKn: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: { title: true },
      take: limit,
    })
    events.forEach(e => suggestions.add(e.title))

    // Get seva names
    const sevas = await prisma.seva.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { nameKn: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: { name: true },
      take: limit,
    })
    sevas.forEach(s => suggestions.add(s.name))

    return Array.from(suggestions).slice(0, limit)
  }
}

export const searchService = new SearchService()
