import { NextRequest, NextResponse } from 'next/server';

interface JobSearchParams {
  query: string;
  location?: string;
  numPages?: number;
  source?: string; // 'google-jobs' | 'linkedin' | 'all'
  remoteOnly?: boolean;
}

interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_description?: string;
  job_apply_link?: string;
  job_posted_at_datetime_utc?: string;
}

interface LinkedInJob {
  id: string;
  title: string;
  organization: string;
  locations_derived?: string[];
  description_text?: string;
  url: string;
  date_posted: string;
  remote_derived?: boolean;
  source: string;
}

interface NormalizedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  apply_url: string;
  source: string;
  url?: string;
  isRemote?: boolean;
  datePosted?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: JobSearchParams = await request.json();
    const { query, location, numPages = 1, source = 'all', remoteOnly = false } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const rapidApiKey = process.env.RAPIDAPI_KEY;
    if (!rapidApiKey) {
      return NextResponse.json({ error: 'RapidAPI key not configured' }, { status: 500 });
    }

    const allJobs: NormalizedJob[] = [];

    // Search Google Jobs if source is 'google-jobs' or 'all'
    if (source === 'google-jobs' || source === 'all') {
      console.log(`Searching Google Jobs with query: "${query}", pages: ${numPages}`);
      const googleJobs = await searchGoogleJobs(rapidApiKey, query, location, numPages);
      console.log(`Found ${googleJobs.length} Google Jobs`);
      allJobs.push(...googleJobs);
    }

    // Search LinkedIn if source is 'linkedin' or 'all'
    if (source === 'linkedin' || source === 'all') {
      console.log(`Searching LinkedIn Jobs with query: "${query}"`);
      const linkedinJobs = await searchLinkedInJobs(rapidApiKey, query, location, remoteOnly);
      console.log(`Found ${linkedinJobs.length} LinkedIn Jobs`);
      allJobs.push(...linkedinJobs);
    }
    
    console.log(`Total jobs before filtering: ${allJobs.length} (Google: ${allJobs.filter(j => j.source === 'Google Jobs').length}, LinkedIn: ${allJobs.filter(j => j.source === 'LinkedIn').length})`);

    // Filter remote jobs if requested
    const filteredJobs = remoteOnly
      ? allJobs.filter((job) => job.isRemote === true)
      : allJobs;

    // Remove duplicates based on job ID
    const uniqueJobs = Array.from(
      new Map(filteredJobs.map((job) => [job.id, job])).values()
    );

    // Sort by date posted (newest first) if available
    uniqueJobs.sort((a, b) => {
      if (a.datePosted && b.datePosted) {
        return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime();
      }
      return 0;
    });

    return NextResponse.json({ jobs: uniqueJobs });
  } catch (error) {
    console.error('Error searching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to search jobs. Please try again.' },
      { status: 500 }
    );
  }
}

async function searchGoogleJobs(
  rapidApiKey: string,
  query: string,
  location?: string,
  numPages: number = 3
): Promise<NormalizedJob[]> {
  const rapidApiHost = process.env.RAPIDAPI_HOST || 'jsearch.p.rapidapi.com';
  const jobs: NormalizedJob[] = [];

  const cleanQuery = query.trim();
  
  // Try multiple query formats to maximize results
  const queryVariants = [
    cleanQuery, // Original query
    location && location.trim() ? `${cleanQuery} in ${location.trim()}` : null,
    location && location.trim() ? `${cleanQuery} jobs in ${location.trim()}` : null,
  ].filter(Boolean) as string[];

  for (const searchQuery of queryVariants) {
    if (jobs.length >= 50) break; // Stop if we have enough jobs
    
    for (let page = 1; page <= numPages; page++) {
      if (jobs.length >= 50) break; // Stop if we have enough jobs
      
      const url = `https://${rapidApiHost}/search?query=${encodeURIComponent(searchQuery)}&page=${page}`;

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': rapidApiHost,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`JSearch API error (${response.status}):`, errorText.substring(0, 200));
          
          // If 400 error on first page, try next query variant
          if (response.status === 400 && page === 1) {
            break; // Try next query variant
          }
          continue; // Try next page
        }

        const data = await response.json();
        
        // Log response for debugging
        if (page === 1) {
          console.log(`Google Jobs search "${searchQuery}": Found ${data.data?.length || 0} jobs on page ${page}`);
        }
        
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          const normalizedJobs = data.data
            .map((job: JSearchJob) => normalizeGoogleJob(job))
            .filter((job: NormalizedJob) => job.title && job.company); // Filter invalid jobs
          
          // Avoid duplicates
          const existingIds = new Set(jobs.map(j => j.id));
          const newJobs = normalizedJobs.filter((job: NormalizedJob) => !existingIds.has(job.id));
          jobs.push(...newJobs);
        }

        // If no more results, try next query variant
        if (!data.data || data.data.length === 0) {
          break;
        }
      } catch (error) {
        console.error(`Error fetching Google Jobs (query: "${searchQuery}", page: ${page}):`, error);
        // Continue to next page/query
      }
    }
  }

  console.log(`Total Google Jobs found: ${jobs.length}`);
  return jobs;
}

async function searchLinkedInJobs(
  rapidApiKey: string,
  query: string,
  location?: string,
  remoteOnly: boolean = false
): Promise<NormalizedJob[]> {
  const rapidApiHost = 'active-jobs-db.p.rapidapi.com';
  const jobs: NormalizedJob[] = [];

  try {
    // Build query parameters for LinkedIn API
    const params = new URLSearchParams({
      limit: '50', // Get up to 50 jobs
      offset: '0',
      title_filter: `"${query}"`,
      description_type: 'text',
    });

    // Add location filter if provided
    if (location && location.trim()) {
      // Format location for API (e.g., "United States" OR "United Kingdom")
      params.append('location_filter', `"${location.trim()}"`);
    }

    // Add remote filter if requested
    if (remoteOnly) {
      params.append('remote', 'true');
    }

    const url = `https://${rapidApiHost}/active-ats-7d?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': rapidApiHost,
      },
    });

    if (!response.ok) {
      console.error(`LinkedIn API error: ${response.status} ${response.statusText}`);
      return jobs;
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const normalizedJobs = data
        .slice(0, 50) // Limit to 50 jobs
        .map((job: LinkedInJob) => normalizeLinkedInJob(job))
        .filter((job: NormalizedJob) => job.title && job.company); // Filter out invalid jobs

      jobs.push(...normalizedJobs);
    }
  } catch (error) {
    console.error('Error fetching LinkedIn Jobs:', error);
  }

  return jobs;
}

function normalizeGoogleJob(job: JSearchJob): NormalizedJob {
  const jobLocation = [job.job_city, job.job_state, job.job_country]
    .filter(Boolean)
    .join(', ') || 'Location not specified';

  return {
    id: job.job_id || `google-${Math.random().toString(36).substr(2, 9)}`,
    title: job.job_title || 'Untitled Position',
    company: job.employer_name || 'Company not specified',
    location: jobLocation,
    description: job.job_description || '',
    apply_url: job.job_apply_link || '',
    url: job.job_apply_link || '',
    source: 'Google Jobs',
    isRemote: false, // Google Jobs API doesn't provide remote info
    datePosted: job.job_posted_at_datetime_utc,
  };
}

function normalizeLinkedInJob(job: LinkedInJob): NormalizedJob {
  const location = job.locations_derived && job.locations_derived.length > 0
    ? job.locations_derived[0]
    : 'Location not specified';

  return {
    id: job.id || `linkedin-${Math.random().toString(36).substr(2, 9)}`,
    title: job.title || 'Untitled Position',
    company: job.organization || 'Company not specified',
    location: location,
    description: job.description_text || '',
    apply_url: job.url || '',
    url: job.url || '',
    source: 'LinkedIn',
    isRemote: job.remote_derived === true,
    datePosted: job.date_posted,
  };
}
