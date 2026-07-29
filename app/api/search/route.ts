/**
 * Global Search API Route
 */
import { NextRequest, NextResponse } from 'next/server'
import { searchService, SearchResultType } from '@/services/search.service'

export const dynamic = 'force-dynamic'

/**
 * GET /api/search?q=query&limit=20&offset=0&type=EVENT
 * Global search across all entities
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type') as SearchResultType | null
    const language = (searchParams.get('lang') || 'en') as 'en' | 'kn'

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter (q) is required' },
        { status: 400 }
      )
    }

    const result = await searchService.search(query, {
      limit,
      offset,
      type: type || undefined,
      language,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
