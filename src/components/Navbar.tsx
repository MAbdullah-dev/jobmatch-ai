import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm" aria-label="Main navigation">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600" aria-hidden="true" />
            <span className="text-xl font-semibold text-gray-900">JobMatch AI</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1 transition-colors"
              aria-label="View saved jobs"
            >
              Saved Jobs
            </button>
            <button
              className="text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1 transition-colors"
              aria-label="Open settings"
            >
              Settings
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
