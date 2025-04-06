'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import { Category } from "@/models/Category";
import { Tool } from "@/models/Tool";

// Loading Component
function SearchSkeletonCard() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 flex flex-col animate-pulse h-full">
      <div className="h-40 relative bg-gray-200">
        <div className="absolute top-3 left-3">
          <div className="bg-gray-300 w-16 h-6 rounded-full"></div>
        </div>
      </div>
      <div className="p-5 flex-grow space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="pt-4 flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}

// No Results Component
function NoResults({ query }: { query: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-8 text-center">
      <div className="text-gray-500 mb-4">
        <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">No results found</h2>
      <p className="text-gray-500 mb-6">
        We couldn't find any AI tools matching "{query}".
      </p>
      <div className="text-left bg-white p-5 rounded-lg border border-gray-200 max-w-md mx-auto">
        <h3 className="text-base font-medium text-gray-800 mb-3">Search tips:</h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-600 text-sm">
          <li>Check spelling and try different keywords</li>
          <li>Use more general terms</li>
          <li>Try removing filters to broaden your search</li>
          <li>Look through categories directly</li>
        </ul>
      </div>
    </div>
  );
}

// Result Item Component
function ResultItem({ tool }: { tool: Tool }) {
  // Validate the image URL to make sure it's from the CDN
  const hasValidImage = tool.image_url && 
    (tool.image_url.startsWith('https://cdn-images.toolify.ai/') ||
     tool.image_url.startsWith('http://cdn-images.toolify.ai/'));
  
  return (
    <Link 
      href={`/tools/${tool.slug}`}
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col h-full transform hover:-translate-y-1"
    >
      <div className="h-40 relative bg-gray-100">
        {/* Gradient background (always visible for consistency) */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 z-0">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">{tool.name.charAt(0).toUpperCase()}</span>
          </div>
        </div>
        
        {/* Display CDN image if available */}
        {hasValidImage && (
          <div className="absolute inset-0 z-10">
            <Image 
              src={tool.image_url}
              alt={tool.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 384px"
              unoptimized={true} // Use this for external images that are already optimized
              onError={(e) => {
                // Hide the image on error, showing the gradient background
                const imgElement = e.currentTarget as HTMLImageElement;
                imgElement.style.display = 'none';
              }}
            />
            {/* Semi-transparent overlay to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/30 to-transparent"></div>
          </div>
        )}
        
        {/* Category tag */}
        {tool.categories?.primary && (
          <div className="absolute top-3 left-3 z-20">
            <div className="bg-white/30 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
              {tool.categories.primary}
            </div>
          </div>
        )}
      </div>
      <div className="p-5 flex-grow flex flex-col">
        <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-teal-600 transition-colors">
          {tool.name}
        </h2>
        <p className="text-gray-500 mb-4 line-clamp-2 flex-grow">
          {tool.description}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-wrap gap-2">
            {tool.categories.main.slice(0, 1).map((cat, index) => (
              <span key={index} className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded">
                {cat}
              </span>
            ))}
          </div>
          {tool.rating && (
            <div className="flex items-center text-yellow-500">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
              </svg>
              <span className="text-xs ml-1 font-medium">
                {typeof tool.rating === 'number' 
                  ? tool.rating 
                  : tool.rating?.score || 'N/A'}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function SearchPageClient({
  initialData,
  initialCategories,
  initialTotalResults
}: {
  initialData: Tool[];
  initialCategories: Category[];
  initialTotalResults: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State variables
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get('tags') ? searchParams.get('tags')!.split(',') : []
  );
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'popularity'>(
    (searchParams.get('sort') as any) || 'relevance'
  );
  
  const [results, setResults] = useState<Tool[]>(initialData);
  const [totalResults, setTotalResults] = useState(initialTotalResults);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialTotalResults / 20));
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Common tags (this could be dynamic based on data)
  const commonTags = [
    'Free', 'Premium', 'Open Source', 'No-Code', 'API', 
    'Mobile App', 'Browser Extension', 'Enterprise'
  ];
  
  // Debounce search input
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update debouncedQuery after delay when query changes
  useEffect(() => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set a new timer
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500); // 500ms delay
    
    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);
  
  // Update search when parameters change
  const updateSearch = useCallback(async () => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    if (category) params.set('category', category);
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    if (sortBy !== 'relevance') params.set('sort', sortBy);
    if (page > 1) params.set('page', page.toString());
    
    // Only update URL if query is debounced
    router.push(`/search?${params.toString()}`, { scroll: false });
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Make API call to get search results
      const response = await fetch(`/api/search?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search. Please try again.');
      }
      
      const data = await response.json();
      
      setResults(data.results);
      setTotalResults(data.meta.totalCount);
      setTotalPages(data.meta.totalPages);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
      console.error('Search error:', err);
    }
  }, [debouncedQuery, category, selectedTags, sortBy, page, router]);
  
  // Handle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  // Reset all filters
  const resetFilters = () => {
    setCategory('');
    setSelectedTags([]);
    setSortBy('relevance');
    setPage(1);
  };
  
  // Update search when parameters change
  useEffect(() => {
    updateSearch();
  }, [debouncedQuery, category, selectedTags, sortBy, page, updateSearch]);
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    // Force immediate update by setting debouncedQuery directly
    setDebouncedQuery(query);
  };
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Teal Gradient */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Search AI Tools</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Find the perfect AI tool from our database of over 6,000 options
            </p>
            <div className="mt-8 max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="relative">
                <div className="flex rounded-lg overflow-hidden shadow-lg">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 block w-full px-4 py-4 focus:outline-none text-gray-700"
                    placeholder="Search by keyword, feature, or use case..."
                    aria-label="Search AI tools"
                  />
                  <button
                    type="submit"
                    className="px-6 py-4 bg-white text-teal-600 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Search
                  </button>
                </div>
                <div className="text-left text-white/80 text-sm mt-2 ml-1">
                  {!query ? 'Popular searches:' : 'Search tips:'} 
                  <span className="inline-flex gap-2 ml-2">
                    {!query ? (
                      <>
                        <button type="button" onClick={() => { setQuery('image generation'); setDebouncedQuery('image generation'); }} className="hover:text-white">image generation</button>
                        <span>•</span>
                        <button type="button" onClick={() => { setQuery('chatbot'); setDebouncedQuery('chatbot'); }} className="hover:text-white">chatbot</button>
                        <span>•</span>
                        <button type="button" onClick={() => { setQuery('code'); setDebouncedQuery('code'); }} className="hover:text-white">code</button>
                      </>
                    ) : (
                      'Try specific features or use cases'
                    )}
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Mobile filter button */}
        <div className="lg:hidden mb-4">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <span className="font-medium text-gray-700">Filters & Options</span>
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform ${showFilters ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                {(category || selectedTags.length > 0 || sortBy !== 'relevance') && (
                  <button 
                    onClick={resetFilters}
                    className="text-sm text-teal-600 hover:text-teal-800 font-medium"
                  >
                    Reset All
                  </button>
                )}
              </div>
              
              {/* Search Refinement */}
              <div className="mb-6">
                <form onSubmit={handleSearch}>
                  <label htmlFor="search-refine" className="block text-sm font-medium text-gray-700 mb-1">
                    Refine Search
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="text"
                      id="search-refine"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="focus:ring-teal-500 focus:border-teal-500 block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md"
                      placeholder="Refine your search..."
                    />
                    <button type="submit" className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Sort Options */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Sort By</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'relevance', label: 'Relevance' },
                    { id: 'rating', label: 'Rating' },
                    { id: 'popularity', label: 'Popularity' }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSortBy(option.id as any)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        sortBy === option.id
                          ? 'bg-teal-100 text-teal-800 font-medium'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Categories Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
                  <button
                    onClick={() => setCategory('')}
                    className={`block w-full text-left px-3 py-2 rounded-md ${!category ? 'bg-teal-100 text-teal-800 font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => setCategory(cat.name)}
                      className={`block w-full text-left px-3 py-2 rounded-md ${
                        category === cat.name 
                          ? 'bg-teal-100 text-teal-800 font-medium' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{cat.name}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {cat.count}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Tags Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {commonTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-teal-100 text-teal-800 font-medium'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Search Results */}
          <div className="lg:col-span-3">
            {/* Search Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {query ? `Results for "${query}"` : "All Tools"}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {category && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-teal-100 text-teal-800">
                      {category}
                      <button 
                        onClick={() => setCategory('')}
                        className="ml-1 hover:text-teal-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {selectedTags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-teal-100 text-teal-800">
                      {tag}
                      <button 
                        onClick={() => toggleTag(tag)}
                        className="ml-1 hover:text-teal-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {isLoading ? 'Searching...' : error ? (
                  <div className="text-red-500">{error}</div>
                ) : (
                  totalResults > 0 
                    ? `Found ${totalResults} tools`
                    : "No results found. Try adjusting your search filters."
                )}
              </div>
            </div>
            
            {/* Results Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <SearchSkeletonCard key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                <div className="text-red-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Search Error</h2>
                <p className="text-gray-500 mb-4">{error}</p>
                <button
                  onClick={() => updateSearch()}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Try Again
                </button>
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map((tool) => (
                  <ResultItem key={tool.slug} tool={tool} />
                ))}
              </div>
            ) : query || category || selectedTags.length > 0 ? (
              <NoResults query={query || category || selectedTags.join(', ')} />
            ) : null}
            
            {/* Pagination */}
            {!isLoading && !error && results.length > 0 && totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center space-x-2">
                  {page > 1 && (
                    <button 
                      onClick={() => setPage(page - 1)}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Previous
                    </button>
                  )}
                  <div className="text-sm text-gray-500 px-2">
                    Page {page} of {totalPages}
                  </div>
                  {page < totalPages && (
                    <button 
                      onClick={() => setPage(page + 1)}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                      Next
                    </button>
                  )}
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 