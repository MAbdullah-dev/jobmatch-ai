import React from 'react';
import { MapPin, ExternalLink, Sparkles, Home } from 'lucide-react';
import MatchScoreIndicator from './MatchScoreIndicator';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  source: string;
  url?: string;
  matchedSkills?: string[];
  isRemote?: boolean;
}

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  // Updated color logic: 80-100% green, 60-79% yellow, below 60% red
  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColor = (score: number) => {
    if (score >= 80) return 'text-green-700';
    if (score >= 60) return 'text-yellow-700';
    return 'text-red-700';
  };

  const isLinkedIn = job.source === 'LinkedIn';
  const sourceBorderColor = isLinkedIn ? 'border-purple-200 hover:border-purple-300' : 'border-gray-200 hover:border-gray-300';
  const sourceBadgeColor = isLinkedIn ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200';

  return (
    <article className={`group rounded-xl border-2 ${sourceBorderColor} bg-white p-6 shadow-sm transition-all hover:shadow-md relative`}>
      {/* Source Badge */}
      <div className={`absolute top-4 right-4 px-2.5 py-1 rounded-md text-xs font-semibold border ${sourceBadgeColor}`}>
        {job.source}
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 pr-16">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {job.title}
              </h3>
              <p className="mb-1 text-base font-medium text-gray-700">{job.company}</p>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                {job.isRemote ? (
                  <>
                    <div className="flex items-center gap-1 text-green-600 font-medium">
                      <Home className="h-4 w-4" aria-hidden="true" />
                      <span>Remote</span>
                    </div>
                    {job.location !== 'Location not specified' && (
                      <>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" aria-hidden="true" />
                          <span>{job.location}</span>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    <span>{job.location}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <MatchScoreIndicator score={job.matchScore} size="sm" showLabel={false} />
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full transition-all duration-500 ${getProgressColor(job.matchScore)}`}
                style={{ width: `${job.matchScore}%` }}
                role="progressbar"
                aria-valuenow={job.matchScore}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Match score: ${job.matchScore}%`}
              />
            </div>
            <p className={`text-sm font-medium ${getTextColor(job.matchScore)}`}>
              {job.matchScore}% match
            </p>
          </div>

          {job.matchedSkills && job.matchedSkills.length > 0 && (
            <div className="mb-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <h4 className="text-sm font-semibold text-gray-900">Why this match?</h4>
              </div>
              <p className="mb-2 text-xs text-gray-600">
                Your resume matches these key skills:
              </p>
              <div className="flex flex-wrap gap-2">
                {job.matchedSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-md bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.url && job.url !== '#' ? (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              aria-label={`Apply for ${job.title} at ${job.company}`}
            >
              Apply Now
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : (
            <button
              onClick={() => {
                // For mock jobs without real URLs, show a message or handle application
                alert(`Application for ${job.title} at ${job.company}\n\nIn a production app, this would open the job application page.`);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              aria-label={`Apply for ${job.title} at ${job.company}`}
            >
              Apply Now
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
