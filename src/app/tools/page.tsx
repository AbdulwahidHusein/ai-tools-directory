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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-teal-500 to-cyan-600 py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Browse AI Tools
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Discover our collection of AI tools to enhance your workflow, creativity, productivity, and more.
          </p>
        </div>
      </section>
      
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Category Pills */}
        <div className="mb-10">
          <div className="flex flex-wrap gap-2 justify-center">
            <Link 
              href="/tools"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !category ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm'
              }`}
            >
              All Tools
            </Link>
            {categories.map((cat) => (
              <Link 
                key={cat.slug}
                href={`/tools?category=${encodeURIComponent(cat.name)}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === cat.name ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm'
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
              className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-200 transform hover:-translate-y-1"
            >
              <div className="h-48 relative bg-gray-100">
                {tool.image_url ? (
                  <Image 
                    src={tool.image_url} 
                    alt={tool.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-600 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold opacity-80">{tool.name.charAt(0)}</span>
                  </div>
                )}
                {tool.categories?.primary && (
                  <div className="absolute top-3 left-3">
                    <div className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium">
                      {tool.categories.primary}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-5 flex-grow flex flex-col">
                <h2 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-teal-600 transition-colors">
                  {tool.name}
                </h2>
                <p className="text-gray-700 mb-4 line-clamp-2 flex-grow">
                  {tool.description}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {tool.categories.main.slice(0, 1).map((cat, index) => (
                      <span key={index} className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded">
                        {cat}
                      </span>
                    ))}
                  </div>
                  {typeof tool.rating === 'object' && tool.rating?.score > 0 && (
                    <div className="flex items-center text-yellow-500">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
                      </svg>
                      <span className="ml-1 text-sm font-medium">
                        {tool.rating.score.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-600 ml-1">
                        ({tool.rating.count})
                      </span>
                    </div>
                  )}
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
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm"
              >
                Previous
              </Link>
            )}
            {hasNextPage && (
              <Link 
                href={`/tools?page=${page + 1}${category ? `&category=${encodeURIComponent(category)}` : ''}`}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-md"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 