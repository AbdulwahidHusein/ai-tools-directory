import { getToolBySlug, getTools } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Tool } from "@/models/Tool";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tool = await getToolBySlug(params.slug);
  
  if (!tool) {
    return {
      title: 'Tool Not Found',
      description: 'The requested AI tool could not be found.',
    };
  }
  
  return {
    title: tool.seo_title || `${tool.name} - AI Tool Overview`,
    description: tool.seo_description || `Learn about ${tool.name}, an AI tool for ${tool.categories.primary.toLowerCase()}.`,
    openGraph: {
      title: tool.seo_title || `${tool.name} - AI Tool Overview`,
      description: tool.seo_description || `Learn about ${tool.name}, an AI tool for ${tool.categories.primary.toLowerCase()}.`,
      images: [tool.image_url || "/placeholder-tool.png"]
    }
  };
}

export async function generateStaticParams() {
  // Generate only for the most popular tools to avoid too many static pages
  const popularTools = await getTools(100);
  
  return popularTools.map((tool) => ({
    slug: tool.slug,
  }));
}

export default async function ToolPage({ params }: { params: { slug: string } }) {
  const toolData = await getToolBySlug(params.slug);
  
  if (!toolData) {
    notFound();
  }
  
  const tool = toolData as Tool;
  
  // Badge design helper function
  function Badge({ text, className }: { text: string; className?: string }) {
    return (
      <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${className}`}>
        {text}
      </span>
    );
  }
  
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section with Teal Gradient Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
            <div className="mb-8 md:mb-0 md:flex-1">
              <div className="mb-4">
                {tool.categories.main.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tool.categories.main.map((category, index) => (
                      <Link 
                        key={index} 
                        href={`/categories/${category.toLowerCase().replace(/\s+/g, '-')}`}
                        className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-white/30 transition-colors"
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                )}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3">{tool.name}</h1>
                <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl">
                  {tool.description}
                </p>
              </div>
              
              {/* Rating and Metadata */}
              <div className="flex flex-wrap gap-6 text-sm text-white/80 mb-6">
                {tool.rating && (
                  <div className="flex items-center bg-white/10 rounded-lg px-3 py-1.5">
                    <div className="flex items-center mr-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className={`w-4 h-4 ${star <= Math.round(typeof tool.rating === 'number' ? tool.rating : (tool.rating?.score || 0)) ? 'text-yellow-400' : 'text-white/30'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="font-medium text-white">
                      {typeof tool.rating === 'number' 
                        ? tool.rating 
                        : tool.rating?.score || 'N/A'}
                      {typeof tool.rating !== 'number' && tool.rating?.count && 
                        <span className="text-white/60 ml-1 text-xs">({tool.rating.count} reviews)</span>
                      }
                    </span>
                  </div>
                )}
                {tool.added_date && (
                  <div className="flex items-center bg-white/10 rounded-lg px-3 py-1.5">
                    <svg className="w-4 h-4 mr-1.5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Added: {tool.added_date}</span>
                  </div>
                )}
                {tool.monthly_visitors && (
                  <div className="flex items-center bg-white/10 rounded-lg px-3 py-1.5">
                    <svg className="w-4 h-4 mr-1.5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Monthly Visitors: {tool.monthly_visitors}</span>
                  </div>
                )}
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3">
                {tool.website && (
                  <a 
                    href={tool.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white text-blue-700 py-3 px-6 rounded-lg shadow-md text-center font-semibold hover:bg-gray-50 transition-all transform hover:-translate-y-0.5"
                  >
                    Visit Website
                  </a>
                )}
                {tool.toolify_url && (
                  <a 
                    href={tool.toolify_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white/10 backdrop-blur-sm text-white border border-white/30 py-3 px-6 rounded-lg text-center font-medium hover:bg-white/20 transition-colors"
                  >
                    View on Toolify
                  </a>
                )}
              </div>
            </div>
            
            {/* Tool Image */}
            <div className="md:w-2/5 lg:w-1/3">
              <div className="aspect-video relative rounded-xl overflow-hidden bg-white shadow-xl">
                <Image 
                  src={tool.image_url || "/placeholder-tool.png"} 
                  alt={tool.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content Column */}
          <div className="lg:col-span-2">
            {/* What Is Section */}
            {tool.what_is && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What is {tool.name}?</h2>
                <div className="prose prose-blue max-w-none text-gray-700">
                  <p className="whitespace-pre-line leading-relaxed">{tool.what_is}</p>
                </div>
              </div>
            )}
            
            {/* How to Use Section */}
            {tool.how_to_use && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use {tool.name}</h2>
                <div className="prose prose-blue max-w-none text-gray-700">
                  <p className="whitespace-pre-line leading-relaxed">{tool.how_to_use}</p>
                </div>
              </div>
            )}
            
            {/* Features Section */}
            {tool.core_features && tool.core_features.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tool.core_features.map((feature, index) => (
                    <div key={index} className="flex items-start bg-blue-50 p-4 rounded-lg">
                      <div className="flex-shrink-0 h-8 w-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-800 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Use Cases Section */}
            {tool.use_cases && tool.use_cases.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Use Cases</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tool.use_cases.map((useCase, index) => (
                    <div key={index} className="bg-green-50 p-5 rounded-lg border border-green-100">
                      <div className="font-medium text-gray-900">{useCase}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Company Info */}
            {tool.company && tool.company.name && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Company</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Company Name</div>
                    <div className="font-medium text-gray-900">{tool.company.name}</div>
                  </div>
                  {tool.company.address && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Location</div>
                      <div className="text-gray-900">{tool.company.address}</div>
                    </div>
                  )}
                  {tool.company.website && (
                    <div>
                      <a 
                        href={tool.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <span>Visit Company Website</span>
                        <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Tags */}
            {tool.tags && tool.tags.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag, index) => (
                    <Link 
                      key={index} 
                      href={`/tags/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                      className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Original Categories (if different from main) */}
            {tool.categories.original && tool.categories.original.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Original Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {tool.categories.original.map((subcat: string, index: number) => (
                    <span key={index} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium">
                      {subcat}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Social Media Links */}
            {tool.social_media && Object.values(tool.social_media).some(link => link) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect</h3>
                <div className="flex flex-wrap gap-3">
                  {tool.social_media.twitter && (
                    <a 
                      href={tool.social_media.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-100 rounded-full text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      aria-label="Twitter"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.1 10.1 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                  )}
                  {tool.social_media.linkedin && (
                    <a 
                      href={tool.social_media.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-100 rounded-full text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      aria-label="LinkedIn"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  )}
                  {/* Add more social media icons as needed */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 