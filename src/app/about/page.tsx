import Link from "next/link";

export const metadata = {
  title: 'About AI Tools Directory',
  description: 'Learn about the AI Tools Directory, our mission, and how we help users discover the best AI tools.',
};

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">About AI Tools Directory</h1>
        
        <div className="prose prose-blue prose-lg max-w-none">
          <p className="lead text-xl text-gray-600 mb-8">
            AI Tools Directory is a comprehensive resource dedicated to helping you discover, compare, and 
            find the perfect AI tools for your specific needs, whether personal or professional.
          </p>
          
          <h2>Our Mission</h2>
          
          <p>
            As artificial intelligence continues to transform how we work and create, finding the right AI tools 
            becomes increasingly important. Our mission is to provide a well-organized, up-to-date directory of 
            the best AI tools available across numerous categories.
          </p>
          
          <p>
            We aim to save you time and help you make informed decisions by offering detailed information about 
            each tool, including features, use cases, ratings, and more.
          </p>
          
          <h2>What We Offer</h2>
          
          <ul>
            <li>
              <strong>Comprehensive Database:</strong> Our directory includes thousands of AI tools across over 30 categories, 
              from content creation to data analysis, image generation to productivity enhancers.
            </li>
            <li>
              <strong>Detailed Tool Information:</strong> For each tool, we provide descriptions, features, use cases, 
              ratings, and direct links to the tool websites.
            </li>
            <li>
              <strong>User-Friendly Interface:</strong> Our intuitive design makes it easy to browse categories, 
              search for specific tools, and filter results based on your needs.
            </li>
            <li>
              <strong>Regular Updates:</strong> We continuously update our directory to include new tools and ensure 
              information remains current.
            </li>
          </ul>
          
          <h2>How We Categorize Tools</h2>
          
          <p>
            We've developed a comprehensive categorization system that organizes AI tools based on their primary 
            functions and use cases. This makes it easy for you to find tools that address your specific needs.
          </p>
          
          <p>
            Our main categories include:
          </p>
          
          <ul>
            <li>Content Creation</li>
            <li>Image Generation & Editing</li>
            <li>Text Generation & Writing</li>
            <li>Chatbots & Conversational AI</li>
            <li>Productivity & Workflow</li>
            <li>And many more...</li>
          </ul>
          
          <h2>Get Started</h2>
          
          <p>
            Ready to explore the world of AI tools? Start by browsing our categories or use the search 
            function to find tools for your specific needs.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/categories"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Browse Categories
            </Link>
            <Link
              href="/search"
              className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors text-center"
            >
              Search Tools
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 