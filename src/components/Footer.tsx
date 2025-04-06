'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter signup logic would go here
    alert(`Thanks for subscribing with ${email}! We'll keep you updated.`);
    setEmail('');
  };
  
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 pt-16 pb-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl p-6 sm:p-10 mb-12 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-6 md:mb-0 md:mr-8">
                <h3 className="text-2xl font-bold text-white mb-2">Stay Updated</h3>
                <p className="text-white/90 max-w-md">
                  Subscribe to our newsletter for the latest AI tools, trends, and exclusive updates.
                </p>
              </div>
              <div className="flex-shrink-0 w-full md:w-auto">
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 w-full"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-white text-teal-600 font-medium px-6 py-3 rounded-lg hover:bg-teal-50 transition-colors shadow-sm"
                  >
                    Subscribe
                  </button>
                </form>
                <p className="text-white/80 text-sm mt-2">We respect your privacy. Unsubscribe anytime.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: About */}
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold text-xl">AI</div>
              <div className="text-xl font-bold ml-2 text-gray-800">AI Tools Directory</div>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Discover and compare thousands of AI tools to find the perfect solution for your needs. Our curated directory helps you navigate the rapidly evolving AI landscape.
            </p>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="text-gray-500 hover:text-teal-600 transition-colors" aria-label="Twitter">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-teal-600 transition-colors" aria-label="LinkedIn">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-teal-600 transition-colors" aria-label="GitHub">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.84 9.49.5.09.68-.22.68-.485 0-.236-.008-.866-.013-1.7-2.782.603-3.37-1.34-3.37-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.07-.608.07-.608 1.003.07 1.532 1.03 1.532 1.03.892 1.53 2.34 1.088 2.91.833.09-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.09.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.296 2.747-1.026 2.747-1.026.546 1.376.202 2.394.1 2.646.64.699 1.026 1.591 1.026 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Column 2: Navigation Links */}
          <div className="col-span-1">
            <h3 className="text-gray-900 font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-600 hover:text-teal-600 transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-600 hover:text-teal-600 transition-colors">All Categories</Link>
              </li>
              <li>
                <Link href="/tools" className="text-gray-600 hover:text-teal-600 transition-colors">All Tools</Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-600 hover:text-teal-600 transition-colors">Search</Link>
              </li>
              <li>
                <Link href="/submit-tool" className="text-gray-600 hover:text-teal-600 transition-colors">Submit a Tool</Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-teal-600 transition-colors">About Us</Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Categories */}
          <div className="col-span-1">
            <h3 className="text-gray-900 font-semibold mb-4">Top Categories</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/categories/content-creation" className="text-gray-600 hover:text-teal-600 transition-colors">Content Creation</Link>
              </li>
              <li>
                <Link href="/categories/image-generation" className="text-gray-600 hover:text-teal-600 transition-colors">Image Generation</Link>
              </li>
              <li>
                <Link href="/categories/text-generation" className="text-gray-600 hover:text-teal-600 transition-colors">Text Generation</Link>
              </li>
              <li>
                <Link href="/categories/chatbots" className="text-gray-600 hover:text-teal-600 transition-colors">Chatbots</Link>
              </li>
              <li>
                <Link href="/categories/code-development" className="text-gray-600 hover:text-teal-600 transition-colors">Code Development</Link>
              </li>
              <li>
                <Link href="/categories/productivity" className="text-gray-600 hover:text-teal-600 transition-colors">Productivity</Link>
              </li>
            </ul>
          </div>
          
          {/* Column 4: Legal & Resources */}
          <div className="col-span-1">
            <h3 className="text-gray-900 font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-teal-600 transition-colors">FAQ</Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-teal-600 transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-teal-600 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-teal-600 transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/sitemap" className="text-gray-600 hover:text-teal-600 transition-colors">Sitemap</Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500 mb-4 md:mb-0">
              © {new Date().getFullYear()} AI Tools Directory. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-teal-600 transition-colors">Privacy</Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-teal-600 transition-colors">Terms</Link>
              <Link href="/cookie-policy" className="text-sm text-gray-500 hover:text-teal-600 transition-colors">Cookie Policy</Link>
              <Link href="/sitemap" className="text-sm text-gray-500 hover:text-teal-600 transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 