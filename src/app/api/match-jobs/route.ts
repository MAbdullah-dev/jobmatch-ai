import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ParsedResume {
  primaryRole: string;
  skills: string[];
  experienceLevel: string;
  keywords: string[];
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  apply_url: string;
  source: string;
}

interface MatchedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  source: string;
  url: string;
  matchedSkills: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resume, jobs }: { resume: ParsedResume; jobs: Job[] } = body;

    if (!resume || !jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json(
        { error: 'Resume and jobs array are required' },
        { status: 400 }
      );
    }

    // Process jobs in batches to avoid token limits
    const batchSize = 5;
    const matchedJobs: MatchedJob[] = [];

    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize);

      const prompt = `You are a job matching AI. Match each job with the candidate's resume and return a JSON object.

Candidate Resume:
- Primary Role: ${resume.primaryRole || 'Not specified'}
- Skills: ${(resume.skills && Array.isArray(resume.skills)) ? resume.skills.join(', ') : 'Not specified'}
- Experience Level: ${resume.experienceLevel || 'Not specified'}
- Keywords: ${(resume.keywords && Array.isArray(resume.keywords)) ? resume.keywords.join(', ') : 'Not specified'}

Jobs to match:
${batch
  .map(
    (job, idx) => `
Job ${idx + 1}:
- ID: ${job.id}
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location}
- Description: ${job.description.substring(0, 500)}
- Apply URL: ${job.apply_url}
`
  )
  .join('\n')}

For each job, calculate a match score (0-100) based on:
1. Role alignment (30%)
2. Skills match (40%)
3. Experience level fit (20%)
4. Keywords relevance (10%)

Return ONLY valid JSON without markdown, explanations, or code blocks. Format:
{
  "matches": [
    {
      "id": "job id",
      "matchScore": 0-100,
      "matchedSkills": ["skill1", "skill2", "skill3", "skill4"]
    }
  ]
}

Return 2-4 matched skills per job. Skills must be from the candidate's skills list or closely related.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a job matching AI. Return ONLY valid JSON without markdown, explanations, or code blocks.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      const matches = result.matches || [];

      // Combine match data with job data
      matches.forEach((match: { id: string; matchScore: number; matchedSkills: string[] }) => {
        const job = batch.find((j) => j.id === match.id);
        if (job) {
          matchedJobs.push({
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            matchScore: Math.round(Math.max(0, Math.min(100, match.matchScore))),
            source: job.source,
            url: job.apply_url || job.url || '',
            matchedSkills: (match.matchedSkills || []).slice(0, 4),
          });
        }
      });
    }

    // Sort by match score (highest first)
    matchedJobs.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ jobs: matchedJobs });
  } catch (error) {
    console.error('Error matching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to match jobs. Please try again.' },
      { status: 500 }
    );
  }
}
