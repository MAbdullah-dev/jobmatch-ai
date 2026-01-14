import React from 'react';
import { FileText, Search, Upload } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-resume' | 'no-jobs';
  searchQuery?: string;
}

export default function EmptyState({ type, searchQuery }: EmptyStateProps) {
  if (type === 'no-resume') {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Upload className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Upload Your Resume to Get Started</h3>
        <p className="text-gray-600">
          Upload your resume above and our AI will analyze your skills and experience to find the perfect job matches for you.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <Search className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">No matching jobs found</h3>
      <p className="mb-4 text-gray-600">
        {searchQuery
          ? `We couldn't find any jobs matching "${searchQuery}". Try adjusting your search terms.`
          : 'No jobs match your current filters. Try adjusting your search criteria.'}
      </p>
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <FileText className="h-4 w-4" />
        <span>Make sure you've uploaded your resume to see personalized matches</span>
      </div>
    </div>
  );
}
