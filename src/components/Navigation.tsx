'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const pathname = usePathname();
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };
  
  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-md'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold text-xl">AI</div>
              <span className="ml-2 text-xl font-bold text-gray-900">AI Tools Directory</span>
            </Link>
            
            <div className="hidden md:ml-8 md:flex md:space-x-6">
              <Link 
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'border-teal-500 text-teal-800' 
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                }`}
              >
                Home
              </Link>
              
              <div className="relative">
                <button 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive('/categories') 
                      ? 'border-teal-500 text-teal-800' 
                      : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                  }`}
                  onMouseEnter={() => setShowCategoryDropdown(true)}
                  onMouseLeave={() => setShowCategoryDropdown(false)}
                >
                  <span>Categories</span>
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showCategoryDropdown && (
                  <div 
                    className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                    onMouseEnter={() => setShowCategoryDropdown(true)}
                    onMouseLeave={() => setShowCategoryDropdown(false)}
                  >
                    <div className="py-1">
                      <Link 
                        href="/categories" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-800"
                      >
                        All Categories
                      </Link>
                      <Link 
                        href="/categories/content-creation" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-800"
                      >
                        Content Creation
                      </Link>
                      <Link 
                        href="/categories/image-generation" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-800"
                      >
                        Image Generation
                      </Link>
                      <Link 
                        href="/categories/text-generation" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-800"
                      >
                        Text Generation
                      </Link>
                      <Link 
                        href="/categories/chatbots" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-800"
                      >
                        Chatbots
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <Link 
                        href="/categories" 
                        className="block px-4 py-2 text-sm text-teal-600 font-medium hover:bg-teal-50"
                      >
                        View all categories →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              <Link 
                href="/tools"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive('/tools') 
                    ? 'border-teal-500 text-teal-800' 
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                }`}
              >
                All Tools
              </Link>
              <Link 
                href="/search"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive('/search') 
                    ? 'border-teal-500 text-teal-800' 
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                }`}
              >
                Search
              </Link>
            </div>
          </div>
          
          <div className="hidden md:ml-6 md:flex md:items-center space-x-4">
            <Link 
              href="/submit-tool"
              className="text-teal-600 hover:text-teal-800 px-3 py-2 text-sm font-medium border border-transparent hover:border-teal-200 rounded-md transition-colors"
            >
              Submit a Tool
            </Link>
            <Link 
              href="/search"
              className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow"
            >
              Search Tools
            </Link>
          </div>
          
          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            <Link 
              href="/"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/') 
                  ? 'border-teal-500 text-teal-800 bg-teal-50' 
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/categories"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/categories') 
                  ? 'border-teal-500 text-teal-800 bg-teal-50' 
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Categories
            </Link>
            <Link 
              href="/tools"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/tools') 
                  ? 'border-teal-500 text-teal-800 bg-teal-50' 
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
              onClick={() => setIsOpen(false)}
            >
              All Tools
            </Link>
            <Link 
              href="/search"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/search') 
                  ? 'border-teal-500 text-teal-800 bg-teal-50' 
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Search
            </Link>
            <Link 
              href="/submit-tool"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-teal-600 hover:bg-gray-50 hover:border-gray-300"
              onClick={() => setIsOpen(false)}
            >
              Submit a Tool
            </Link>
            <div className="pl-3 pr-4 py-3">
              <Link 
                href="/search"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                onClick={() => setIsOpen(false)}
              >
                Search Tools
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 