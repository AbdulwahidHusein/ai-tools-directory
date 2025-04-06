import { MongoClient, ObjectId, Document } from 'mongodb';
import { Tool } from '@/models/Tool';
import { Category } from '@/models/Category';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aitools';
let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient>;

// Declare global MongoDB client promise
declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

// Initialize MongoDB connection
if (!global._mongoClientPromise) {
  client = new MongoClient(MONGODB_URI);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

// Get database connection
export async function getDb() {
  const client = await clientPromise;
  return client.db();
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
  const db = await getDb();
  return db
    .collection('categories')
    .find({})
    .sort({ display_order: 1 })
    .toArray() as unknown as Promise<Category[]>;
}

// Get a single category by slug
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const db = await getDb();
  return db.collection('categories').findOne({ slug }) as unknown as Promise<Category | null>;
}

// Get a category with its tools
export async function getCategoryWithTools(slug: string, limit = 20, offset = 0) {
  const db = await getDb();
  const category = await getCategoryBySlug(slug);
  
  if (!category) return null;
  
  const tools = await db
    .collection('tools')
    .find({ "categories.main": category.name })
    .sort({ "rating.score": -1 })
    .skip(offset)
    .limit(limit)
    .toArray() as unknown as Tool[];
  
  return {
    ...category,
    tools
  };
}

// Get multiple tools with optional category filter
export async function getTools(limit = 20, offset = 0, category?: string): Promise<Tool[]> {
  const db = await getDb();
  const query = category ? { "categories.main": category } : {};
  
  return db
    .collection('tools')
    .find(query)
    .sort({ "rating.score": -1 })
    .skip(offset)
    .limit(limit)
    .toArray() as unknown as Promise<Tool[]>;
}

// Get a single tool by slug
export async function getToolBySlug(slug: string): Promise<Tool | null> {
  const db = await getDb();
  return db.collection('tools').findOne({ slug }) as unknown as Promise<Tool | null>;
}

// Enhanced search functionality with multiple filters and sorting options
export async function searchTools(
  query: string, 
  limit = 20, 
  offset = 0, 
  category?: string,
  tags?: string[],
  sortBy: 'relevance' | 'rating' | 'popularity' = 'relevance'
): Promise<Tool[]> {
  try {
    const db = await getDb();
    
    // Validate and sanitize inputs
    const sanitizedQuery = query ? query.trim() : '';
    const sanitizedLimit = Math.min(Math.max(1, limit), 100); // Between 1 and 100
    const sanitizedOffset = Math.max(0, offset);
    
    console.log(`Executing searchTools with: query=${sanitizedQuery}, category=${category}, tags=${JSON.stringify(tags)}, sortBy=${sortBy}`);
    
    // If query is empty, return most popular tools
    if (!sanitizedQuery && !category && !tags?.length) {
      return db
        .collection('tools')
        .find({})
        .sort({ "rating.score": -1, "monthly_visitors": -1 })
        .skip(sanitizedOffset)
        .limit(sanitizedLimit)
        .toArray() as unknown as Promise<Tool[]>;
    }
    
    // Build the base search query
    let searchQuery: any = {};
    const queryConditions = [];
    
    // If we have a text query, use MongoDB text search
    if (sanitizedQuery) {
      const isShortTerm = sanitizedQuery.length <= 3;
      
      // Special handling for short terms like "ai" that might cause regex issues
      if (isShortTerm) {
        console.log(`Using special handling for short search term: ${sanitizedQuery}`);
        
        // For short terms, we'll use more direct matches
        queryConditions.push(
          { name: { $regex: `\\b${sanitizedQuery}\\b`, $options: 'i' } },
          { description: { $regex: `\\b${sanitizedQuery}\\b`, $options: 'i' } },
          { "categories.primary": { $regex: `\\b${sanitizedQuery}\\b`, $options: 'i' } },
          { "categories.main": { $in: [new RegExp(`\\b${sanitizedQuery}\\b`, 'i')] } },
          { tags: { $in: [new RegExp(`\\b${sanitizedQuery}\\b`, 'i')] } }
        );
      } else {
        // Add field-specific matches
        queryConditions.push(
          { name: { $regex: sanitizedQuery, $options: 'i' } },
          { description: { $regex: sanitizedQuery, $options: 'i' } },
          { "categories.primary": { $regex: sanitizedQuery, $options: 'i' } }
        );
        
        // Try to add text search (may fail if there's no text index)
        try {
          queryConditions.push({ $text: { $search: sanitizedQuery } });
        } catch (error) {
          console.warn('Text search failed, continuing with regex search', error);
        }
        
        // Tags and other array matches
        try {
          queryConditions.push(
            { tags: { $in: [new RegExp(sanitizedQuery, 'i')] } },
            { search_terms: { $in: [new RegExp(sanitizedQuery, 'i')] } },
            { "core_features": { $in: [new RegExp(sanitizedQuery, 'i')] } },
            { "use_cases": { $in: [new RegExp(sanitizedQuery, 'i')] } }
          );
        } catch (error) {
          console.warn('Regex patterns for array fields failed', error);
        }
        
        // Add what_is field if it exists
        try {
          queryConditions.push({ what_is: { $regex: sanitizedQuery, $options: 'i' } });
        } catch (error) {
          console.warn('what_is field search failed', error);
        }
      }
      
      searchQuery.$or = queryConditions;
    }
    
    // Build filters array
    const filters = [];
    
    // Add category filter if provided
    if (category) {
      filters.push({ "categories.main": category });
    }
    
    // Add tags filter if provided
    if (tags && tags.length > 0) {
      filters.push({ tags: { $in: tags } });
    }
    
    // Combine query and filters if needed
    if (filters.length > 0) {
      if (searchQuery.$or) {
        // If we have both query and filters, use $and to combine them
        searchQuery = {
          $and: [
            { $or: searchQuery.$or },
            ...filters
          ]
        };
      } else {
        // If we only have filters, use them directly
        if (filters.length === 1) {
          searchQuery = filters[0];
        } else {
          searchQuery = { $and: filters };
        }
      }
    }
    
    // Define sort order based on sortBy parameter
    let sortOptions: any = {};
    
    switch (sortBy) {
      case 'rating':
        sortOptions = { "rating.score": -1 };
        break;
      case 'popularity':
        sortOptions = { "monthly_visitors": -1, "rating.score": -1 };
        break;
      case 'relevance':
      default:
        // If we have a query, sort by text score first if available
        if (sanitizedQuery) {
          try {
            sortOptions = { score: { $meta: "textScore" }, "rating.score": -1 };
          } catch (error) {
            console.warn('Text score sorting failed, falling back to rating', error);
            sortOptions = { "rating.score": -1 };
          }
        } else {
          // Otherwise, sort by rating
          sortOptions = { "rating.score": -1 };
        }
        break;
    }
    
    console.log(`Search query: ${JSON.stringify(searchQuery)}`);
    console.log(`Sort options: ${JSON.stringify(sortOptions)}`);
    
    // Try using the complex query first
    try {
      // Execute the search
      let searchOperation = db.collection('tools').find(searchQuery);
      
      // Add projection for text score if needed
      if (sanitizedQuery && sortBy === 'relevance' && sanitizedQuery.length > 3) {
        try {
          searchOperation = searchOperation.project({ score: { $meta: "textScore" } });
        } catch (error) {
          console.warn('Text score projection failed, continuing without it', error);
        }
      }
      
      // Apply sorting, pagination and execute
      return searchOperation
        .sort(sortOptions)
        .skip(sanitizedOffset)
        .limit(sanitizedLimit)
        .toArray() as unknown as Promise<Tool[]>;
    } catch (error) {
      console.error(`Error with complex query for term "${sanitizedQuery}":`, error);
      
      // If the complex query fails, fall back to a simpler query
      console.log("Falling back to simpler query strategy");
      
      const simpleQuery: any = {};
      
      // Add a simple name search if we have a query
      if (sanitizedQuery) {
        simpleQuery.name = { $regex: sanitizedQuery, $options: 'i' };
      }
      
      // Add category constraint if provided
      if (category) {
        simpleQuery["categories.main"] = category;
      }
      
      return db.collection('tools')
        .find(simpleQuery)
        .sort({ "rating.score": -1 })
        .skip(sanitizedOffset)
        .limit(sanitizedLimit)
        .toArray() as unknown as Promise<Tool[]>;
    }
  } catch (error) {
    console.error('Error in searchTools function:', error);
    // Return empty array instead of throwing to prevent breaking the app
    return [];
  }
}

// Find similar tools based on categories and tags
export async function findSimilarTools(toolId: string, limit = 4): Promise<Tool[]> {
  const db = await getDb();
  const tool = await db.collection('tools').findOne({ _id: new ObjectId(toolId) });
  
  if (!tool) return [];
  
  return db
    .collection('tools')
    .find({
      _id: { $ne: new ObjectId(toolId) },
      $or: [
        { "categories.main": { $in: tool.categories.main } },
        { tags: { $in: tool.tags } }
      ]
    })
    .limit(limit)
    .toArray() as unknown as Promise<Tool[]>;
}

// Count tools
export async function countTools(category?: string): Promise<number> {
  const db = await getDb();
  const query = category ? { "categories.main": category } : {};
  
  return db.collection('tools').countDocuments(query);
}

// Enhanced count search results with the same filtering options as searchTools
export async function countSearchResults(
  query: string, 
  category?: string,
  tags?: string[]
): Promise<number> {
  try {
    const db = await getDb();
    
    // Validate and sanitize inputs
    const sanitizedQuery = query ? query.trim() : '';
    
    console.log(`Executing countSearchResults with: query=${sanitizedQuery}, category=${category}, tags=${JSON.stringify(tags)}`);
    
    // Build the base search query
    let searchQuery: any = {};
    const queryConditions = [];
    
    // If we have a text query, use MongoDB text search
    if (sanitizedQuery) {
      const isShortTerm = sanitizedQuery.length <= 3;
      
      // Special handling for short terms like "ai" that might cause regex issues
      if (isShortTerm) {
        console.log(`Using special handling for short search term in count: ${sanitizedQuery}`);
        
        // For short terms, we'll use more direct matches
        queryConditions.push(
          { name: { $regex: `\\b${sanitizedQuery}\\b`, $options: 'i' } },
          { description: { $regex: `\\b${sanitizedQuery}\\b`, $options: 'i' } },
          { "categories.primary": { $regex: `\\b${sanitizedQuery}\\b`, $options: 'i' } },
          { "categories.main": { $in: [new RegExp(`\\b${sanitizedQuery}\\b`, 'i')] } },
          { tags: { $in: [new RegExp(`\\b${sanitizedQuery}\\b`, 'i')] } }
        );
      } else {
        // Add field-specific matches
        queryConditions.push(
          { name: { $regex: sanitizedQuery, $options: 'i' } },
          { description: { $regex: sanitizedQuery, $options: 'i' } },
          { "categories.primary": { $regex: sanitizedQuery, $options: 'i' } }
        );
        
        // Try to add text search (may fail if there's no text index)
        try {
          queryConditions.push({ $text: { $search: sanitizedQuery } });
        } catch (error) {
          console.warn('Text search failed in count, continuing with regex search', error);
        }
        
        // Tags and other array matches
        try {
          queryConditions.push(
            { tags: { $in: [new RegExp(sanitizedQuery, 'i')] } },
            { search_terms: { $in: [new RegExp(sanitizedQuery, 'i')] } },
            { "core_features": { $in: [new RegExp(sanitizedQuery, 'i')] } },
            { "use_cases": { $in: [new RegExp(sanitizedQuery, 'i')] } }
          );
        } catch (error) {
          console.warn('Regex patterns for array fields failed in count', error);
        }
        
        // Add what_is field if it exists
        try {
          queryConditions.push({ what_is: { $regex: sanitizedQuery, $options: 'i' } });
        } catch (error) {
          console.warn('what_is field search failed in count', error);
        }
      }
      
      searchQuery.$or = queryConditions;
    }
    
    // Build filters array
    const filters = [];
    
    // Add category filter if provided
    if (category) {
      filters.push({ "categories.main": category });
    }
    
    // Add tags filter if provided
    if (tags && tags.length > 0) {
      filters.push({ tags: { $in: tags } });
    }
    
    // Combine query and filters if needed
    if (filters.length > 0) {
      if (searchQuery.$or) {
        // If we have both query and filters, use $and to combine them
        searchQuery = {
          $and: [
            { $or: searchQuery.$or },
            ...filters
          ]
        };
      } else {
        // If we only have filters, use them directly
        if (filters.length === 1) {
          searchQuery = filters[0];
        } else {
          searchQuery = { $and: filters };
        }
      }
    }
    
    console.log(`Count query: ${JSON.stringify(searchQuery)}`);
    
    // Try using the complex query first
    try {
      return db.collection('tools').countDocuments(searchQuery);
    } catch (error) {
      console.error(`Error with complex count query for term "${sanitizedQuery}":`, error);
      
      // If the complex query fails, fall back to a simpler query
      console.log("Falling back to simpler count query strategy");
      
      const simpleQuery: any = {};
      
      // Add a simple name search if we have a query
      if (sanitizedQuery) {
        simpleQuery.name = { $regex: sanitizedQuery, $options: 'i' };
      }
      
      // Add category constraint if provided
      if (category) {
        simpleQuery["categories.main"] = category;
      }
      
      return db.collection('tools').countDocuments(simpleQuery);
    }
  } catch (error) {
    console.error('Error in countSearchResults function:', error);
    // Return 0 instead of throwing to prevent breaking the app
    return 0;
  }
} 