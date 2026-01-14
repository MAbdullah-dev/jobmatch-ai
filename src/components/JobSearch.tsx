'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface JobSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function JobSearch({ searchQuery, onSearchChange }: JobSearchProps) {
  return (
    <div className="relative">
      <Search
        className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
        aria-hidden="true"
      />
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by job title, company, or keyword..."
        aria-label="Search jobs"
        className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      />
    </div>
  );
}
