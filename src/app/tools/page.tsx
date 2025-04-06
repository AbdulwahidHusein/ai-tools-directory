import { getTools, getCategories } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Tool } from "@/models/Tool";
import { Category } from "@/models/Category";

export const metadata = {
  title: 'All AI Tools - Browse Our Collection',
  description: 'Browse our comprehensive collection of AI tools for various purposes and categories.',
};

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: { page?: string; category?: string };
}) {
  const page = parseInt(searchParams.page || '1', 10);
  const category = searchParams.category;
  const pageSize = 20;
  const offset = (page - 1) * pageSize;
  
  const tools = await getTools(pageSize, offset, category) as Tool[];
  const categories = await getCategories() as Category[];
  
  // Calculate total pages - in a real app, you'd get the count from the database
  // Here we'll just assume there are more pages if we have a full page of results
  const hasNextPage = tools.length === pageSize;
  
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Browse AI Tools</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover our collection of AI tools to enhance your workflow, creativity, productivity, and more.
        </p>
      </div>
      
      {/* Category Pills */}
      <div className="mb-10">
        <div className="flex flex-wrap gap-2 justify-center">
          <Link 
            href="/tools"
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              !category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Tools
          </Link>
          {categories.map((cat) => (
            <Link 
              key={cat.slug}
              href={`/tools?category=${encodeURIComponent(cat.name)}`}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                category === cat.name ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
      
      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <Link 
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col"
          >
            <div className="h-40 relative bg-gray-100">
              <Image 
                src={tool.image_url || "/placeholder-tool.svg"} 
                alt={tool.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-5 flex-grow flex flex-col">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                {tool.name}
              </h2>
              <p className="text-gray-500 mb-4 line-clamp-2 flex-grow">
                {tool.description}
              </p>
              <div className="mt-auto flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {tool.categories.main.slice(0, 1).map((cat, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {cat}
                    </span>
                  ))}
                </div>
                <div className="flex items-center text-yellow-500">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
                  </svg>
                  <span className="text-xs ml-1">
                    {typeof tool.rating === 'number' 
                      ? tool.rating 
                      : tool.rating?.score || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Pagination */}
      <div className="mt-12 flex justify-center">
        <div className="flex space-x-2">
          {page > 1 && (
            <Link 
              href={`/tools?page=${page - 1}${category ? `&category=${encodeURIComponent(category)}` : ''}`}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Previous
            </Link>
          )}
          {hasNextPage && (
            <Link 
              href={`/tools?page=${page + 1}${category ? `&category=${encodeURIComponent(category)}` : ''}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
} 