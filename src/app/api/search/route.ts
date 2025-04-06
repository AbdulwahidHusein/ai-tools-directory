import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Tool } from '@/models/Tool';

// Helper function to convert MongoDB documents to plain objects
function convertToPlainObject<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Extremely simplified search function to avoid MongoDB query planner errors
async function simpleSearch(
  query: string, 
  limit: number, 
  offset: number, 
  category?: string,
  tags?: string[],
  sortBy: 'relevance' | 'rating' | 'popularity' = 'relevance'
): Promise<[Tool[], number]> {
  const db = await getDb();
  
  // Handle specific search cases like "ai image generator"
  const lowerQuery = query.toLowerCase().trim();
  const isImageRelated = lowerQuery.includes('image') || lowerQuery.includes('picture') || lowerQuery.includes('photo');
  const isCodeRelated = lowerQuery.includes('code') || lowerQuery.includes('programming') || lowerQuery.includes('developer');
  const isTextRelated = lowerQuery.includes('text') || lowerQuery.includes('writing') || lowerQuery.includes('content');
  const isChatRelated = lowerQuery.includes('chat') || lowerQuery.includes('conversation') || lowerQuery.includes('message');
  
  // If the search is related to a specific category and no category filter is applied,
  // prioritize tools from relevant categories
  let inferredCategory = '';
  
  if (!category) {
    if (isImageRelated) {
      inferredCategory = 'Image Generation';
    } else if (isCodeRelated) {
      inferredCategory = 'Code Development';
    } else if (isTextRelated) {
      inferredCategory = 'Text Generation';
    } else if (isChatRelated) {
      inferredCategory = 'Chatbots';
    }
  }
  
  // Build a simple query that won't overwhelm MongoDB
  let searchQuery: any = {};
  
  // Handle search text (keep it extremely simple)
  if (query && query.trim()) {
    // For multi-word queries, split into individual words and use only the first 2
    const words = query.trim().split(/\s+/).slice(0, 2);
    
    if (words.length === 1) {
      // For single-word queries, just search in name and description
      searchQuery.$or = [
        { name: { $regex: words[0], $options: 'i' } },
        { description: { $regex: words[0], $options: 'i' } }
      ];
    } else {
      // For multi-word queries, search individual words and the full phrase
      const term1 = words[0];
      const term2 = words[1];
      searchQuery.$or = [
        { name: { $regex: term1, $options: 'i' } },
        { name: { $regex: term2, $options: 'i' } },
        { name: { $regex: query.trim(), $options: 'i' } },
        { description: { $regex: query.trim(), $options: 'i' } }
      ];
    }
  }
  
  // Handle explicit category filter
  let categoryQuery = category ? { "categories.main": category } : {};
  
  // Handle tags filter
  let tagsQuery = tags && tags.length > 0 ? { tags: { $in: tags } } : {};
  
  // Define sort order based on sortBy parameter
  let sortOptions: any = {};
  switch (sortBy) {
    case 'rating':
      sortOptions = { "rating.score": -1 };
      break;
    case 'popularity':
      sortOptions = { "monthly_visitors": -1, "rating.score": -1 };
      break;
    default:
      // For relevance, we'll sort differently based on inferred category
      sortOptions = { "rating.score": -1 };
      break;
  }
  
  console.log(`Simple search query: ${JSON.stringify(searchQuery)}, Inferred category: ${inferredCategory}`);
  
  try {
    // Perform two separate searches and combine results if we have an inferred category
    if (inferredCategory && !category) {
      // First search: Match the inferred category AND the search query
      const categorySearchQuery = { 
        $and: [
          { "categories.main": inferredCategory },
          searchQuery
        ] 
      };
      
      // Second search: Match search query only, excluding the inferred category
      const generalSearchQuery = {
        $and: [
          { "categories.main": { $ne: inferredCategory } },
          searchQuery
        ]
      };
      
      // Run both searches independently
      const [categoryResults, generalResults] = await Promise.all([
        db.collection('tools')
          .find(categorySearchQuery)
          .sort(sortOptions)
          .limit(limit)
          .toArray() as unknown as Promise<Tool[]>,
          
        db.collection('tools')
          .find(generalSearchQuery)
          .sort(sortOptions)
          .limit(limit)
          .toArray() as unknown as Promise<Tool[]>
      ]);
      
      // Combine results, prioritizing category results
      let combinedResults = [...categoryResults];
      
      // Add general results until we reach the limit
      let remainingSlots = limit - combinedResults.length;
      if (remainingSlots > 0) {
        combinedResults = combinedResults.concat(generalResults.slice(0, remainingSlots));
      }
      
      // Count total results (with limit for safety)
      const categoryCount = Math.min(
        await db.collection('tools').countDocuments(categorySearchQuery, { limit: 500 }),
        500
      );
      
      const generalCount = Math.min(
        await db.collection('tools').countDocuments(generalSearchQuery, { limit: 500 }),
        500
      );
      
      return [combinedResults, Math.min(categoryCount + generalCount, 1000)];
    }
    
    // Standard search approach for other cases
    // Build our aggregation pipeline to apply filters separately
    const pipeline: any[] = [];
    
    // First filter by category if provided
    if (Object.keys(categoryQuery).length > 0) {
      pipeline.push({ $match: categoryQuery });
    }
    
    // Then filter by tags if provided
    if (Object.keys(tagsQuery).length > 0) {
      pipeline.push({ $match: tagsQuery });
    }
    
    // Then apply the search query if provided
    if (Object.keys(searchQuery).length > 0) {
      pipeline.push({ $match: searchQuery });
    }
    
    // Apply sorting
    pipeline.push({ $sort: sortOptions });
    
    // Apply pagination
    pipeline.push({ $skip: offset });
    pipeline.push({ $limit: limit });
    
    // Execute the pipeline
    const results = await db
      .collection('tools')
      .aggregate(pipeline)
      .toArray() as unknown as Tool[];
    
    // For counting, use a simpler approach
    let totalCount = 0;
    
    // Construct a simple query combining all filters
    const combinedQuery: any = {};
    
    if (category) {
      combinedQuery["categories.main"] = category;
    }
    
    if (tags && tags.length > 0) {
      combinedQuery.tags = { $in: tags };
    }
    
    if (query && query.trim()) {
      // Just use name search for counting to keep it simple
      combinedQuery.name = { $regex: query.trim().substring(0, 20), $options: 'i' };
    }
    
    // Use countDocuments with a limit for safety
    totalCount = Math.min(
      await db.collection('tools').countDocuments(combinedQuery, { limit: 1000 }),
      1000
    );
    
    return [results, totalCount];
  } catch (error) {
    console.error('Search execution error:', error);
    
    // If anything fails, fall back to the simplest possible query
    console.log('Falling back to basic name-only search');
    
    let results: Tool[] = [];
    let count = 0;
    
    // Try searching by inferred category + simple query if applicable
    if (inferredCategory && !category) {
      results = await db
        .collection('tools')
        .find({ 
          "categories.main": inferredCategory,
          name: { $regex: query.trim().substring(0, 20), $options: 'i' }
        })
        .sort({ "rating.score": -1 })
        .limit(limit)
        .toArray() as unknown as Tool[];
      
      // If we don't have enough results, add some from general search
      if (results.length < limit) {
        const generalResults = await db
          .collection('tools')
          .find({ name: { $regex: query.trim().substring(0, 20), $options: 'i' } })
          .sort({ "rating.score": -1 })
          .limit(limit - results.length)
          .toArray() as unknown as Tool[];
          
        results = results.concat(generalResults);
      }
      
      count = Math.min(
        await db.collection('tools').countDocuments({ name: { $regex: query.trim().substring(0, 20), $options: 'i' } }),
        1000
      );
    }
    // First try just searching by category if provided
    else if (category) {
      results = await db
        .collection('tools')
        .find({ "categories.main": category })
        .sort({ "rating.score": -1 })
        .skip(offset)
        .limit(limit)
        .toArray() as unknown as Tool[];
      
      count = Math.min(
        await db.collection('tools').countDocuments({ "categories.main": category }),
        1000
      );
    } 
    // Otherwise just return popular tools
    else {
      results = await db
        .collection('tools')
        .find({})
        .sort({ "rating.score": -1 })
        .skip(offset)
        .limit(limit)
        .toArray() as unknown as Tool[];
      
      count = Math.min(
        await db.collection('tools').countDocuments({}),
        1000
      );
    }
    
    return [results, count];
  }
}

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
    console.log(`Search API called with: query=${query}, category=${category}, tags=${JSON.stringify(tags)}, sortBy=${sortBy}`);
    
    // Use our simplified search function for all cases
    const [results, totalCount] = await simpleSearch(
      query, 
      limit, 
      offset, 
      category || undefined, 
      tags, 
      sortBy as any
    );
    
    // Convert MongoDB documents to plain JavaScript objects
    const plainResults = convertToPlainObject(results);
    
    return NextResponse.json({
      results: plainResults,
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
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}, message: ${error.message}`);
      console.error(`Stack trace: ${error.stack}`);
    }
    
    // Improved error handling
    const isMongoError = error instanceof Error && 
      (error.name === 'MongoServerError' || error.message.includes('mongo'));
    
    const statusCode = isMongoError ? 503 : 500;
    const errorMessage = isMongoError
      ? 'Database is currently unavailable. Please try again later.'
      : `Failed to perform search: ${error instanceof Error ? error.message : 'Unknown error'}`;
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        code: statusCode,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: statusCode }
    );
  }
} 