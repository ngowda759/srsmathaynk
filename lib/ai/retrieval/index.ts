/**
 * Hybrid Retrieval Orchestrator
 * Combines multiple data sources for comprehensive AI responses
 */

import { retrieveFromKnowledge } from './knowledge';
import { retrieveFromEvents } from './events';
import { retrieveFromSevas } from './sevas';
import { retrieveFromDocuments } from './documents';
import { retrieveFromDonations } from './donations';
import { retrieveFromTempleInfo } from './temple';
import type { SourceMetadata, SearchQuery, RetrievalOptions, RetrievalResult } from './types';

// Intent patterns for detecting user intent
const INTENT_PATTERNS: Record<string, RegExp[]> = {
  donation: [
    /donat(e|ion|ing)/i,
    /contribut(e|ion)/i,
    /support/i,
    /offering/i,
    /ದೇಣ/i, // Kannada donation
  ],
  event: [
    /event/i,
    /festival/i,
    /celebration/i,
    /utsav/i,
    /mahotsav/i,
    /ಉತ್ಸವ/i,
  ],
  seva: [
    /seva/i,
    /pooja/i,
    /archana/i,
    /abhisheka/i,
    /ಸೇವೆ/i,
    /ಪೂಜೆ/i,
  ],
  timing: [
    /tim(e|ing|ings)/i,
    /schedule/i,
    /hours/i,
    /open/i,
    /close/i,
    /ಸಮಯ/i,
  ],
  contact: [
    /contact/i,
    /phone/i,
    /email/i,
    /address/i,
    /reach/i,
    /ಸಂಪರ್ಕ/i,
  ],
  gallery: [
    /gallery/i,
    /photo/i,
    /image/i,
    /video/i,
    /ಗ್ಯಾಲರಿ/i,
  ],
  document: [
    /document/i,
    /form/i,
    /pdf/i,
    /download/i,
    /ದಾಖಲೆ/i,
  ],
  volunteer: [
    /volunteer/i,
    /help/i,
    /service/i,
    /ಸ್ಯಾಂಪಂದನ/i,
  ],
  aaradhane: [
    /aaradhana/i,
    /aaradhane/i,
    /ಆರಾಧನೆ/i,
  ],
  panchanga: [
    /panchanga/i,
    /tithi/i,
    /nakshatra/i,
    /ಪಂಚಾಂಗ/i,
  ],
};

/**
 * Detect user intent from query
 */
export function detectIntent(query: string): { intent: string; confidence: number } {
  const queryLower = query.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    let score = 0;
    for (const pattern of patterns) {
      if (pattern.test(query)) {
        score += 1;
      }
    }
    scores[intent] = score;
  }

  // Find the highest scoring intent
  let maxIntent = 'general';
  let maxScore = 0;

  for (const [intent, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      maxIntent = intent;
    }
  }

  // Normalize confidence
  const confidence = maxScore > 0 ? Math.min(maxScore * 0.5, 1.0) : 0;

  return { intent: maxIntent, confidence };
}

/**
 * Detect language from query
 */
export function detectLanguage(query: string): 'en' | 'kn' | 'mixed' {
  // Kannada Unicode range: U+0C80 to U+0CFF
  const kannadaRegex = /[\u0C80-\u0CFF]/;
  const hasKannada = kannadaRegex.test(query);
  
  // Count English words (basic heuristic)
  const englishWords = query.match(/[a-zA-Z]+/g) || [];
  const hasEnglish = englishWords.length > 0;

  if (hasKannada && hasEnglish) {
    return 'mixed';
  } else if (hasKannada) {
    return 'kn';
  }
  return 'en';
}

/**
 * Main retrieval orchestrator
 * Queries all configured sources and combines results
 */
export async function hybridRetrieval(
  query: SearchQuery,
  options: RetrievalOptions = {}
): Promise<RetrievalResult> {
  const startTime = Date.now();
  
  // Detect language if not provided
  const language = options.language === 'auto' || !options.language
    ? detectLanguage(query.query)
    : options.language;

  // Detect intent
  const { intent, confidence: intentConfidence } = detectIntent(query.query);

  // Determine which sources to query based on intent
  const sourcePriorities = getSourcePriorities(intent);

  // Execute all retrievals in parallel
  const retrievalTasks = [
    { source: 'knowledge', task: retrieveFromKnowledge(query, options) },
    { source: 'events', task: retrieveFromEvents(query, options) },
    { source: 'sevas', task: retrieveFromSevas(query, options) },
    { source: 'documents', task: retrieveFromDocuments(query, options) },
    { source: 'donations', task: retrieveFromDonations(query, options) },
    { source: 'temple', task: retrieveFromTempleInfo(query, options) },
  ];

  const results = await Promise.allSettled(retrievalTasks.map(t => t.task));

  // Combine and sort all sources
  const allSources: SourceMetadata[] = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const prioritizedSources = result.value.map(source => ({
        ...source,
        relevanceScore: source.relevanceScore * sourcePriorities[index],
      }));
      allSources.push(...prioritizedSources);
    }
  });

  // Sort by relevance score
  allSources.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Apply max results limit
  const finalSources = allSources.slice(0, options.maxResults || 10);

  // Calculate overall confidence
  const avgRelevance = finalSources.length > 0
    ? finalSources.reduce((sum, s) => sum + s.relevanceScore, 0) / finalSources.length
    : 0;
  const overallConfidence = Math.min(avgRelevance * intentConfidence, 1.0);

  const retrievalTime = Date.now() - startTime;

  console.log(`[Hybrid Retrieval] Query: "${query.query.substring(0, 50)}..." Intent: ${intent} Sources: ${finalSources.length} Time: ${retrievalTime}ms`);

  return {
    sources: finalSources,
    content: buildContextContent(finalSources),
    confidence: overallConfidence,
    language,
    intent,
    topic: finalSources[0]?.type,
  };
}

/**
 * Get source priorities based on detected intent
 */
function getSourcePriorities(intent: string): number[] {
  const priorities: Record<string, number[]> = {
    // [knowledge, events, sevas, documents, donations, temple]
    donation: [0.7, 0.3, 0.4, 0.3, 1.0, 0.5],
    event: [0.5, 1.0, 0.3, 0.2, 0.3, 0.4],
    seva: [0.6, 0.3, 1.0, 0.4, 0.4, 0.5],
    timing: [0.8, 0.6, 0.5, 0.2, 0.3, 1.0],
    contact: [0.5, 0.3, 0.3, 0.3, 0.3, 1.0],
    gallery: [0.3, 0.5, 0.2, 0.2, 0.2, 0.3],
    document: [0.5, 0.3, 0.4, 1.0, 0.3, 0.4],
    volunteer: [0.6, 0.5, 0.4, 0.4, 0.4, 0.5],
    aaradhane: [0.7, 1.0, 0.6, 0.3, 0.4, 0.5],
    panchanga: [0.6, 0.5, 0.4, 0.2, 0.3, 0.5],
    general: [1.0, 0.8, 0.8, 0.6, 0.6, 0.7],
  };

  return priorities[intent] || priorities.general;
}

/**
 * Build context string from retrieved sources
 */
function buildContextContent(sources: SourceMetadata[]): string {
  if (sources.length === 0) {
    return '';
  }

  const sections = sources.map((source, index) => {
    const header = `[Source ${index + 1}: ${source.type.toUpperCase()}] ${source.title}`;
    const content = source.excerpt || '';
    return `${header}\n${content}`;
  });

  return sections.join('\n\n');
}

/**
 * Get sources by type
 */
export async function getSourcesByType(
  type: string,
  query: SearchQuery,
  options: RetrievalOptions = {}
): Promise<SourceMetadata[]> {
  switch (type) {
    case 'knowledge':
      return retrieveFromKnowledge(query, options);
    case 'events':
      return retrieveFromEvents(query, options);
    case 'sevas':
      return retrieveFromSevas(query, options);
    case 'documents':
      return retrieveFromDocuments(query, options);
    case 'donations':
      return retrieveFromDonations(query, options);
    case 'temple':
      return retrieveFromTempleInfo(query, options);
    default:
      return [];
  }
}
