import { getCategoryWithTools, getCategories } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CategoryWithTools } from "@/models/Category";
import { Tool } from "@/models/Tool";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const category = await getCategoryWithTools(params.slug, 1, 0);
  
  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.',
    };
  }
  
  return {
    title: `${category.name} AI Tools - Top Tools for ${category.name}`,
    description: `Discover the best AI tools for ${category.name.toLowerCase()}. Browse our curated list of ${category.count}+ tools.`,
  };
}

export async function generateStaticParams() {
  const categories = await getCategories();
  
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

// Scalable gradient generation based on string input
function getGradient(input: string): string {
  // Predefined gradients for consistent, attractive colors
  const gradients = [
    "from-blue-500 to-indigo-600", 
    "from-purple-500 to-purple-700",
    "from-pink-500 to-purple-600",
    "from-red-500 to-pink-600",
    "from-orange-500 to-red-600",
    "from-amber-500 to-orange-600",
    "from-yellow-500 to-amber-600",
    "from-lime-500 to-green-600",
    "from-green-500 to-teal-600",
    "from-emerald-500 to-cyan-600",
    "from-cyan-500 to-blue-600",
    "from-blue-600 to-blue-800",
    "from-indigo-500 to-violet-600",
    "from-violet-500 to-purple-600",
    "from-fuchsia-500 to-pink-600",
    "from-gray-700 to-gray-900",
  ];
  
  // Generate a consistent number from the input string
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use the hash to select a gradient
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const categoryData = await getCategoryWithTools(params.slug, 20, 0);
  
  if (!categoryData) {
    notFound();
  }
  
  // Use as any to avoid TypeScript issues with the model differences
  const category = categoryData as any;
  const tools = category.tools as any[];
  
  return (
    <div className="min-h-screen bg-white">
      {/* Category Header with Teal Gradient */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-3">{category.name}</h1>
              <p className="text-xl text-white/90 max-w-3xl">
                {category.description}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="rounded-full bg-white/20 text-white py-2 px-4 backdrop-blur-sm">
                {category.count} tools
              </div>
            </div>
          </div>
          
          {/* Keywords/Tags */}
          {category.keywords && category.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {category.keywords.map((keyword: string, index: number) => (
                <div key={index} className="bg-white/20 backdrop-blur-sm text-white text-sm py-1 px-3 rounded-full">
                  {keyword}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools && tools.map((tool: any) => (
            <Link 
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-200 transform hover:-translate-y-1"
            >
              <div className="h-48 relative bg-gray-100">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold opacity-80">{tool.name.charAt(0)}</span>
                </div>
                {tool.categories?.primary && (
                  <div className="absolute top-3 left-3">
                    <div className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium">
                      {tool.categories.primary}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-5 flex-grow">
                <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-teal-600 transition-colors">
                  {tool.name}
                </h2>
                <p className="text-gray-700 mb-4 line-clamp-2">
                  {tool.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-wrap gap-2">
                    {tool.categories.main && tool.categories.main.slice(0, 2).map((cat: string, index: number) => (
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
        
        {/* Pagination - Basic version */}
        <div className="mt-12 flex justify-center">
          <div className="flex space-x-2">
            <a className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-not-allowed opacity-50">
              Previous
            </a>
            <a className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              Next
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 