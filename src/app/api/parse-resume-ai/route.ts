import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface ParsedResume {
  primaryRole: string;
  skills: string[];
  experienceLevel: string;
  keywords: string[];
}

interface ParseRequest {
  text: string;
}

export async function POST(request: NextRequest) {
  try {
    // Initialize OpenAI client inside the handler to avoid build-time errors
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey,
    });

    const body: ParseRequest = await request.json();
    const { text } = body;

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Resume text is too short or empty' },
        { status: 400 }
      );
    }

    // Call OpenAI to parse resume
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a resume parser. Extract structured information from the resume text. Return ONLY valid JSON without markdown, explanations, or code blocks.`,
        },
        {
          role: 'user',
          content: `Parse this resume and return JSON with this exact structure:
{
  "primaryRole": "job title or role",
  "skills": ["skill1", "skill2", "skill3", ...],
  "experienceLevel": "entry-level" | "mid-level" | "senior" | "executive",
  "keywords": ["keyword1", "keyword2", ...]
}

Resume text:
${text.substring(0, 4000)}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const parsedResume: ParsedResume = JSON.parse(
      completion.choices[0].message.content || '{}'
    );

    // Validate response
    if (!parsedResume.primaryRole || !parsedResume.skills || !Array.isArray(parsedResume.skills) || parsedResume.skills.length === 0) {
      return NextResponse.json(
        { error: 'Failed to parse resume. Please ensure your resume contains clear job titles and skills.' },
        { status: 500 }
      );
    }

    // Ensure all fields are properly formatted
    return NextResponse.json({
      primaryRole: parsedResume.primaryRole || 'Developer',
      skills: Array.isArray(parsedResume.skills) ? parsedResume.skills : [],
      experienceLevel: parsedResume.experienceLevel || 'mid-level',
      keywords: Array.isArray(parsedResume.keywords) ? parsedResume.keywords : [],
    });
  } catch (error) {
    console.error('Error parsing resume with AI:', error);
    return NextResponse.json(
      { error: 'Failed to parse resume. Please try again.' },
      { status: 500 }
    );
  }
}
