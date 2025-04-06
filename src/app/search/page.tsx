import React from 'react';
import { getCategories, getDb } from '@/lib/db';
import { Metadata } from 'next';
import { Tool } from '@/models/Tool';

export const metadata: Metadata = {
  title: 'Search AI Tools | Find the Perfect AI Tools for Your Needs',
  description: 'Search our comprehensive database of AI tools by keywords, features, categories, and use cases to find the perfect tool for your needs.',
  openGraph: {
    title: 'Search AI Tools | Find the Perfect AI Tools for Your Needs',
    description: 'Search our comprehensive database of AI tools by keywords, features, categories, and use cases to find the perfect tool for your needs.',
    images: ['/og-image.png'],
  },
};

// Helper function to convert MongoDB documents to plain objects
function convertToPlainObject<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Simple search function for server initial data
async function simpleInitialSearch(
  query: string,
  category?: string,
  limit = 20,
  offset = 0
): Promise<[Tool[], number]> {
  try {
    const db = await getDb();
    
    // Create a simple query to avoid MongoDB errors
    let searchQuery: any = {};
    
    // Handle category filter first - simplest and most reliable
    if (category) {
      searchQuery["categories.main"] = category;
    }
    
    // Only add name search if a query is provided
    if (query && query.trim()) {
      // For multi-word queries, just search in name to keep it simple
      searchQuery.name = { $regex: query.trim().substring(0, 20), $options: 'i' };
    }
    
    // Execute simple search
    const results = await db
      .collection('tools')
      .find(searchQuery)
      .sort({ "rating.score": -1 })
      .skip(offset)
      .limit(limit)
      .toArray() as unknown as Tool[];
    
    // Get count with limit to prevent long operations
    const count = Math.min(
      await db.collection('tools').countDocuments(searchQuery, { limit: 1000 }),
      1000
    );
    
    return [results, count];
  } catch (error) {
    console.error('Initial search error:', error);
    // Return empty results on error
    return [[], 0];
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Parse search parameters
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  
  // Fetch categories for the filter sidebar
  const categoriesData = await getCategories();
  // Convert categories to plain objects
  const categories = convertToPlainObject(categoriesData);
  
  // Initial search results
  let initialData: Tool[] = [];
  let initialTotalResults = 0;
  
  try {
    // If we have a query or category, perform a simple search
    if (query || category) {
      const [results, count] = await simpleInitialSearch(query, category, limit, offset);
      initialData = convertToPlainObject(results);
      initialTotalResults = count;
    } else {
      // Otherwise, just get popular tools
      const db = await getDb();
      const results = await db
        .collection('tools')
        .find({})
        .sort({ "rating.score": -1 })
        .skip(offset)
        .limit(limit)
        .toArray() as unknown as Tool[];
      
      const count = Math.min(
        await db.collection('tools').countDocuments({}, { limit: 1000 }),
        1000
      );
      
      initialData = convertToPlainObject(results);
      initialTotalResults = count;
    }
  } catch (error) {
    console.error('Error fetching initial search data:', error);
    // Provide empty data on error, client will handle retry
    initialData = [];
    initialTotalResults = 0;
  }
  
  // Import the client component dynamically to avoid SSR issues
  const SearchPageClient = (await import('./client')).default;
  
  return (
    <SearchPageClient 
      initialData={initialData}
      initialCategories={categories}
      initialTotalResults={initialTotalResults}
    />
  );
} 