'use client';

import React, { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ResumeUpload from '@/components/ResumeUpload';
import JobSearch from '@/components/JobSearch';
import JobSourceFilter from '@/components/JobSourceFilter';
import JobCard, { Job } from '@/components/JobCard';
import JobCardSkeleton from '@/components/JobCardSkeleton';
import EmptyState from '@/components/EmptyState';
import { useJobMatching } from '@/hooks/useJobMatching';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { jobs, isLoading, error, processResume, clearError } = useJobMatching();

  const jobSources = [
    { id: 'all', name: 'All Sources', active: true },
    { id: 'google-jobs', name: 'Google Jobs', active: true },
    { id: 'linkedin', name: 'LinkedIn', active: true },
    { id: 'indeed', name: 'Indeed', active: false },
    { id: 'glassdoor', name: 'Glassdoor', active: false },
  ];

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        searchQuery === '' ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase());

      // Source filtering
      let matchesSource = true;
      if (selectedSource === 'google-jobs') {
        matchesSource = job.source === 'Google Jobs';
      } else if (selectedSource === 'linkedin') {
        matchesSource = job.source === 'LinkedIn';
      } else if (selectedSource === 'all') {
        matchesSource = true; // Show all sources
      }

      // Remote filtering
      const matchesRemote = !remoteOnly || job.isRemote === true;

      return matchesSearch && matchesSource && matchesRemote;
    });
  }, [jobs, searchQuery, selectedSource, remoteOnly]);

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    await processResume(file);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Hero />
        <ResumeUpload onFileUpload={handleFileUpload} />

        {error && (
          <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                  <button
                    onClick={clearError}
                    className="text-sm font-medium text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2 py-1"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Job Matches</h2>
              {!isLoading && (
                <div className="text-sm text-gray-600">
                  {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
                </div>
              )}
            </div>

            <div className="mb-6 space-y-4">
              <JobSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <JobSourceFilter sources={jobSources} onSourceChange={setSelectedSource} />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remoteOnly}
                    onChange={(e) => setRemoteOnly(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Remote Jobs Only</span>
                </label>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <JobCardSkeleton key={i} />
                ))}
              </div>
            ) : !uploadedFile ? (
              <EmptyState type="no-resume" />
            ) : filteredJobs.length > 0 ? (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <EmptyState type="no-jobs" searchQuery={searchQuery} />
            )}
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-7xl border-t border-gray-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-gray-500">
          <p>© 2024 JobMatch AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
