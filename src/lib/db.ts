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
  const db = await getDb();
  
  // If query is empty, return most popular tools
  if (!query && !category && !tags?.length) {
    return db
      .collection('tools')
      .find({})
      .sort({ "rating.score": -1, "monthly_visitors": -1 })
      .skip(offset)
      .limit(limit)
      .toArray() as unknown as Promise<Tool[]>;
  }
  
  // Build the base search query
  let searchQuery: any = {};
  
  // If we have a text query, use MongoDB text search
  if (query && query.trim()) {
    searchQuery.$or = [
      // Primary text search
      { $text: { $search: query } },
      
      // Additional field-specific matches for better recall
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { "categories.primary": { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } },
      { search_terms: { $in: [new RegExp(query, 'i')] } },
      { what_is: { $regex: query, $options: 'i' } },
      { "core_features": { $in: [new RegExp(query, 'i')] } },
      { "use_cases": { $in: [new RegExp(query, 'i')] } }
    ];
  }
  
  // Add category filter if provided
  if (category) {
    if (!searchQuery.$and) searchQuery.$and = [];
    searchQuery.$and.push({ "categories.main": category });
  }
  
  // Add tags filter if provided
  if (tags && tags.length > 0) {
    if (!searchQuery.$and) searchQuery.$and = [];
    searchQuery.$and.push({ tags: { $in: tags } });
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
      // If we have a query, sort by text score first
      if (query && query.trim()) {
        sortOptions = { score: { $meta: "textScore" }, "rating.score": -1 };
      } else {
        // Otherwise, sort by rating
        sortOptions = { "rating.score": -1 };
      }
      break;
  }
  
  // Execute the search
  let searchOperation = db.collection('tools').find(searchQuery);
  
  // Add projection for text score if needed
  if (query && query.trim() && sortBy === 'relevance') {
    searchOperation = searchOperation.project({ score: { $meta: "textScore" } });
  }
  
  // Apply sorting, pagination and execute
  return searchOperation
    .sort(sortOptions)
    .skip(offset)
    .limit(limit)
    .toArray() as unknown as Promise<Tool[]>;
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
  const db = await getDb();
  
  // Build the search query
  let searchQuery: any = {};
  
  // If we have a text query, use MongoDB text search
  if (query && query.trim()) {
    searchQuery.$or = [
      // Primary text search
      { $text: { $search: query } },
      
      // Additional field-specific matches for better recall
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { "categories.primary": { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } },
      { search_terms: { $in: [new RegExp(query, 'i')] } },
      { what_is: { $regex: query, $options: 'i' } },
      { "core_features": { $in: [new RegExp(query, 'i')] } },
      { "use_cases": { $in: [new RegExp(query, 'i')] } }
    ];
  }
  
  // Add category filter if provided
  if (category) {
    if (!searchQuery.$and) searchQuery.$and = [];
    searchQuery.$and.push({ "categories.main": category });
  }
  
  // Add tags filter if provided
  if (tags && tags.length > 0) {
    if (!searchQuery.$and) searchQuery.$and = [];
    searchQuery.$and.push({ tags: { $in: tags } });
  }
  
  return db.collection('tools').countDocuments(searchQuery);
} 