import { NextResponse } from 'next/server';
import { getTools, getToolBySlug } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  
  try {
    if (slug) {
      // Fetch a single tool by slug
      const tool = await getToolBySlug(slug);
      
      if (!tool) {
        return NextResponse.json(
          { error: 'Tool not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(tool);
    } else {
      // Fetch multiple tools with optional category filter
      const tools = await getTools(limit, offset, category || undefined);
      return NextResponse.json(tools);
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tools' },
      { status: 500 }
    );
  }
} 