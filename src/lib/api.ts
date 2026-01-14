import { Job } from '@/components/JobCard';

export interface ParsedResume {
  primaryRole: string;
  skills: string[];
  experienceLevel: string;
  keywords: string[];
}

export interface JobSearchResult {
  jobs: Job[];
}

export interface MatchJobsResult {
  jobs: Job[];
}

interface ParseResumeTextResponse {
  text: string;
}

/**
 * Parse resume file and extract text, then parse with OpenAI
 */
export async function parseResume(file: File): Promise<ParsedResume> {
  // Step 1: Extract text from file
  const formData = new FormData();
  formData.append('file', file);

  const textResponse = await fetch('/api/parse-resume', {
    method: 'POST',
    body: formData,
  });

  if (!textResponse.ok) {
    const error = await textResponse.json();
    throw new Error(error.error || 'Failed to extract text from resume');
  }

  const { text }: ParseResumeTextResponse = await textResponse.json();

  // Step 2: Parse text with OpenAI
  const parseResponse = await fetch('/api/parse-resume-ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!parseResponse.ok) {
    const error = await parseResponse.json();
    throw new Error(error.error || 'Failed to parse resume with AI');
  }

  return parseResponse.json();
}

/**
 * Search for jobs using JSearch API and LinkedIn API
 */
export async function searchJobs(
  query: string,
  location?: string,
  numPages: number = 1,
  source: string = 'all',
  remoteOnly: boolean = false
): Promise<JobSearchResult> {
  const response = await fetch('/api/search-jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, location, numPages, source, remoteOnly }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to search jobs');
  }

  return response.json();
}

/**
 * Match jobs with parsed resume using OpenAI
 */
export async function matchJobs(
  resume: ParsedResume,
  jobs: any[]
): Promise<MatchJobsResult> {
  const response = await fetch('/api/match-jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resume, jobs }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to match jobs');
  }

  return response.json();
}
