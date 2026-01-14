'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface JobSource {
  id: string;
  name: string;
  active: boolean;
}

interface JobSourceFilterProps {
  sources: JobSource[];
  onSourceChange: (sourceId: string) => void;
}

export default function JobSourceFilter({ sources, onSourceChange }: JobSourceFilterProps) {
  const [hoveredSource, setHoveredSource] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap gap-3">
      {sources.map((source) => {
        const isActive = source.active;
        const showTooltip = !isActive && hoveredSource === source.id;

        return (
          <div key={source.id} className="relative">
            <button
              onClick={() => isActive && onSourceChange(source.id)}
              onMouseEnter={() => !isActive && setHoveredSource(source.id)}
              onMouseLeave={() => setHoveredSource(null)}
              disabled={!isActive}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isActive
                  ? 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100 focus:ring-blue-500 cursor-pointer'
                  : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
              }`}
              aria-label={isActive ? `Filter by ${source.name}` : `${source.name} - Coming Soon`}
              aria-disabled={!isActive}
            >
              {isActive && <Check className="h-4 w-4" />}
              {source.name}
            </button>
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg">
                Coming Soon
                <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
