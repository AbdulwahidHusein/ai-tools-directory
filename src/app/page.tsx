import Image from "next/image";
import Link from "next/link";
import { getCategories, getTools } from "@/lib/db";
import { Metadata } from "next";
import React from "react";

// SEO metadata
export const metadata: Metadata = {
  title: "AI Tools Directory | Discover 6,000+ AI Tools for Every Need",
  description: "Browse our curated collection of 8,000+ AI tools across 35+ categories. Find the perfect AI solutions for content creation, image generation, productivity and more.",
  keywords: "AI tools, artificial intelligence, machine learning, AI directory, AI software",
};

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

export default async function Home() {
  const categories = await getCategories();
  const featuredTools = await getTools(8);

  return (
    <div className="min-h-screen">
      {/* Hero Section with teal gradient */}
      <section className="bg-gradient-to-r from-teal-500 to-cyan-600 py-24 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjxwYXRoIGQ9Ik0xNiA0YzAtMi4yIDEuOC00IDQtNHM0IDEuOCA0IDQtMS44IDQtNCA0LTQtMS44LTQtNHoiLz48cGF0aCBkPSJNMTYgNDRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')]">
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Discover the Perfect AI Tools for Your Needs
          </h1>
          <p className="text-xl md:text-2xl text-white mb-10 max-w-3xl mx-auto font-light">
            Explore our curated collection of <span className="font-semibold">6,000+</span> AI tools across <span className="font-semibold">35+</span> categories.
          </p>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for AI tools..."
                aria-label="Search for AI tools"
                className="w-full px-6 py-4 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-teal-400/30 shadow-lg"
              />
              <Link 
                href="/search" 
                className="absolute right-2 top-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg transition-colors duration-200 font-medium shadow-md"
                aria-label="Search tools"
              >
                Search
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section with improved card design and images */}
      <section className="py-20 px-4 md:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Browse by Category</h2>
          <p className="text-center text-gray-700 mb-12 max-w-2xl mx-auto">
            Find specialized AI tools organized by category to match your specific needs
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories?.slice(0, 12).map((category) => (
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
                    <h3 className="text-white font-semibold p-4 text-lg">{category.name}</h3>
                  </div>
                </div>
                <div className="p-4 bg-white flex-grow">
                  <p className="text-sm text-gray-700 font-medium">{category.count} tools available</p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{category.description}</p>
                </div>
              </Link>
            ))}
            <Link 
              href="/categories"
              className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-center items-center p-6 transform hover:-translate-y-1 border border-teal-100"
            >
              <div className="w-12 h-12 mb-4 rounded-full bg-teal-600 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <span className="text-teal-700 font-semibold text-center">View All Categories</span>
              <span className="text-sm text-teal-600 mt-1">Browse all {categories?.length} categories</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Tools Section with improved card design */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Featured AI Tools</h2>
          <p className="text-center text-gray-700 mb-12 max-w-2xl mx-auto">
            Discover our handpicked selection of the most innovative AI tools
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTools?.map((tool) => (
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
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{tool.name}</h3>
                  <p className="text-gray-700 line-clamp-2 mb-3">{tool.description}</p>
                  <div className="flex items-center mt-auto">
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
                    <div className="ml-auto text-teal-600 text-sm font-medium group-hover:underline">
                      View Details
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link 
              href="/tools"
              className="inline-block px-8 py-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-md hover:shadow-lg font-medium"
            >
              Explore All Tools
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-r from-teal-50 to-cyan-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-4xl font-bold text-teal-600 mb-2">6,000+</div>
              <div className="text-gray-700 font-medium">AI Tools</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-4xl font-bold text-teal-600 mb-2">35+</div>
              <div className="text-gray-700 font-medium">Categories</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-4xl font-bold text-teal-600 mb-2">Daily</div>
              <div className="text-gray-700 font-medium">Updates</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-4xl font-bold text-teal-600 mb-2">Free</div>
              <div className="text-gray-700 font-medium">Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section with improved design */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">The Ultimate AI Tools Directory</h2>
          <p className="text-lg text-gray-700 mb-10 leading-relaxed">
            Our comprehensive database features thousands of AI tools to help you find the perfect solution for your needs. 
            From content creation to image generation, coding assistants to productivity tools, we've curated the best AI tools 
            to help you work smarter, not harder.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/about"
              className="px-8 py-4 border-2 border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50 transition-colors font-medium"
            >
              Learn More
            </Link>
            <Link 
              href="/categories"
              className="px-8 py-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-md hover:shadow-lg font-medium"
            >
              Explore Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 md:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-lg text-gray-700 mb-8">
            Subscribe to our newsletter to receive updates about new AI tools and features
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Your email address"
              aria-label="Email for newsletter"
              className="flex-grow px-5 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg transition-colors sm:px-8 font-medium">
              Subscribe
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>
    </div>
  );
}
