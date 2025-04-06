import { NextResponse } from 'next/server';
import { getCategories, getCategoryBySlug, getCategoryWithTools } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const includeTools = searchParams.get('includeTools') === 'true';
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  
  try {
    if (slug) {
      // Fetch a single category by slug
      if (includeTools) {
        // Include tools within the category
        const categoryWithTools = await getCategoryWithTools(slug, limit, offset);
        
        if (!categoryWithTools) {
          return NextResponse.json(
            { error: 'Category not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json(categoryWithTools);
      } else {
        // Just the category without tools
        const category = await getCategoryBySlug(slug);
        
        if (!category) {
          return NextResponse.json(
            { error: 'Category not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json(category);
      }
    } else {
      // Fetch all categories
      const categories = await getCategories();
      return NextResponse.json(categories);
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
} 