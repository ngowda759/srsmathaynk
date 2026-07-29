/**
 * Search Suggestions API Route
 * Provides autocomplete suggestions
 */
import { NextRequest, NextResponse } from 'next/server'
import { searchService } from '@/services/search.service'

export const dynamic = 'force-dynamic'

/**
 * GET /api/search/suggestions?q=query&limit=5
 * Get search suggestions for autocomplete
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!query) {
      return NextResponse.json({ suggestions: [] })
    }

    const suggestions = await searchService.getSuggestions(query, limit)

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Suggestions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
