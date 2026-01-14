import React from 'react';

interface MatchScoreIndicatorProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function MatchScoreIndicator({
  score,
  size = 'md',
  showLabel = true,
}: MatchScoreIndicatorProps) {
  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-20 w-20',
    lg: 'h-24 w-24',
  };

  const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 5 : 6;
  const radius = size === 'sm' ? 28 : size === 'md' ? 36 : 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Updated color logic: 80-100% green, 60-79% yellow, below 60% red
  const getColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStrokeColor = (score: number) => {
    if (score >= 80) return 'stroke-green-600';
    if (score >= 60) return 'stroke-yellow-600';
    return 'stroke-red-600';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${sizeClasses[size]}`}>
        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100" aria-label={`Match score: ${score}%`}>
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${getStrokeColor(score)} transition-all duration-500`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold ${getColor(score)}`}>{score}%</span>
        </div>
      </div>
      {showLabel && (
        <p className="text-xs font-medium text-gray-600">Match Score</p>
      )}
    </div>
  );
}
