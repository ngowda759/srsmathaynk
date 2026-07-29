/**
 * Hybrid Retrieval Types
 * Unified interface for retrieving content from multiple sources
 */

export type SourceType = 
  | 'knowledge'
  | 'event'
  | 'seva'
  | 'document'
  | 'donation'
  | 'pooja'
  | 'gallery'
  | 'announcement'
  | 'temple_info';

export interface SourceMetadata {
  type: SourceType;
  id: string;
  title: string;
  url?: string;
  excerpt?: string;
  relevanceScore: number;
  confidence: number;
}

export interface RetrievalResult {
  sources: SourceMetadata[];
  content: string;
  confidence: number;
  language: 'en' | 'kn' | 'mixed';
  intent?: string;
  topic?: string;
}

export interface RetrievalOptions {
  maxResults?: number;
  minRelevanceScore?: number;
  language?: 'en' | 'kn' | 'mixed' | 'auto';
  includeTypes?: SourceType[];
  excludeTypes?: SourceType[];
}

export interface SearchQuery {
  query: string;
  language?: 'en' | 'kn' | 'mixed';
  intent?: string;
  context?: string[];
}
