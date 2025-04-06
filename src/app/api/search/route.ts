import { NextResponse } from 'next/server';
import { searchTools, countSearchResults } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category');
  const tagsParam = searchParams.get('tags');
  const sortBy = searchParams.get('sort') || 'relevance';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const offset = (page - 1) * limit;
  
  // Parse tags if provided
  const tags = tagsParam ? tagsParam.split(',').filter(Boolean) : undefined;
  
  try {
    // Get search results and total count in parallel
    const [results, totalCount] = await Promise.all([
      searchTools(query, limit, offset, category || undefined, tags, sortBy as any),
      countSearchResults(query, category || undefined, tags)
    ]);
    
    return NextResponse.json({
      results,
      meta: {
        query,
        category: category || null,
        tags: tags || [],
        sort: sortBy,
        page,
        limit,
        offset,
        count: results.length,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Search API error:', error);
    
    // Improved error handling
    const isMongoError = error instanceof Error && 
      (error.name === 'MongoServerError' || error.message.includes('mongo'));
    
    const statusCode = isMongoError ? 503 : 500;
    const errorMessage = isMongoError
      ? 'Database is currently unavailable. Please try again later.'
      : 'Failed to perform search. Please try again.';
    
    return NextResponse.json(
      { error: errorMessage, code: statusCode },
      { status: statusCode }
    );
  }
} 