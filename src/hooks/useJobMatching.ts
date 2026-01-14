import { useState, useCallback } from 'react';
import { Job } from '@/components/JobCard';
import { ParsedResume, parseResume, searchJobs, matchJobs } from '@/lib/api';

interface UseJobMatchingReturn {
  jobs: Job[];
  isLoading: boolean;
  error: string | null;
  parsedResume: ParsedResume | null;
  processResume: (file: File) => Promise<void>;
  clearError: () => void;
}

export function useJobMatching(): UseJobMatchingReturn {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);

  const processResume = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setJobs([]);

    try {
      // Step 1: Parse resume
      const resume = await parseResume(file);
      setParsedResume(resume);

      // Step 2: Search for jobs
      // Build a broader search query to get more results
      const primaryRole = resume.primaryRole || 'Full Stack Developer';
      
      // Use primary role as main query, skills will be used for matching later
      // This gives us more job results to match against
      const searchQuery = primaryRole;
      
      // Search both Google Jobs and LinkedIn for more results
      const searchResult = await searchJobs(searchQuery, undefined, 2, 'all', false); // Get jobs from all sources

      if (!searchResult.jobs || searchResult.jobs.length === 0) {
        setError('No jobs found. Try adjusting your resume or search criteria.');
        setIsLoading(false);
        return;
      }

      // Step 3: Match jobs with resume
      const matchResult = await matchJobs(resume, searchResult.jobs);
      setJobs(matchResult.jobs || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error processing resume:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    jobs,
    isLoading,
    error,
    parsedResume,
    processResume,
    clearError,
  };
}
