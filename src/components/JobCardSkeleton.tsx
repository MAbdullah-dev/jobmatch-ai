import React from 'react';

export default function JobCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="mb-1 h-5 w-1/2 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="h-16 w-16 animate-pulse rounded-full bg-gray-200" />
          </div>
          <div className="mb-4">
            <div className="mb-2 h-2 w-full animate-pulse rounded-full bg-gray-200" />
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="mb-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="mb-2 h-3 w-full animate-pulse rounded bg-gray-200" />
            <div className="flex gap-2">
              <div className="h-6 w-16 animate-pulse rounded-md bg-gray-200" />
              <div className="h-6 w-20 animate-pulse rounded-md bg-gray-200" />
              <div className="h-6 w-18 animate-pulse rounded-md bg-gray-200" />
            </div>
          </div>
          <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
