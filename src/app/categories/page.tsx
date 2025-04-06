import { getCategories } from "@/lib/db";
import Link from "next/link";
import { Category } from "@/models/Category";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'AI Tools Categories - Browse All 35+ Categories',
  description: 'Browse our comprehensive list of AI tool categories, from content creation to data analysis and more.',
  keywords: 'AI tools categories, artificial intelligence categories, AI tools directory',
};

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

// Generate consistent icon based on input
function getIconPath(input: string): React.ReactNode {
  // Common icon paths for variety
  const iconPaths = [
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>,
    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>,
    <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>,
    <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>,
    <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>,
    <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>,
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>,
  ];
  
  // Generate a consistent number from the input string
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use the hash to select an icon
  const index = Math.abs(hash) % iconPaths.length;
  return iconPaths[index];
}

export default async function CategoriesPage() {
  const categories = await getCategories() as Category[];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-teal-500 to-cyan-600 py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Browse All AI Tool Categories
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Explore our comprehensive collection of <span className="font-semibold">{categories.length}+</span> categories to find the perfect AI tools for your needs.
          </p>
        </div>
      </section>
      
      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1"
            >
              <div className="h-40 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-600"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <svg className="w-20 h-20 text-white" viewBox="0 0 24 24" fill="currentColor">
                    {getIconPath(category.slug || category.name)}
                  </svg>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <h2 className="text-white font-semibold p-4 text-lg">{category.name}</h2>
                </div>
              </div>
              <div className="p-4 bg-white flex-grow">
                <p className="text-sm text-gray-700 font-medium">{category.count} tools available</p>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{category.description}</p>
                <div className="mt-4 text-teal-600 text-sm font-medium group-hover:underline">
                  Browse category →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="bg-gradient-to-r from-teal-50 to-cyan-50 py-16 px-4 md:px-8 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl md:text-4xl font-bold text-teal-600 mb-2">{categories.length}+</div>
              <div className="text-gray-700 font-medium">Categories</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl md:text-4xl font-bold text-teal-600 mb-2">6,000+</div>
              <div className="text-gray-700 font-medium">AI Tools</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl md:text-4xl font-bold text-teal-600 mb-2">Daily</div>
              <div className="text-gray-700 font-medium">Updates</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl md:text-4xl font-bold text-teal-600 mb-2">Free</div>
              <div className="text-gray-700 font-medium">Access</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 