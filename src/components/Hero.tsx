import React from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';

export default function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            <Sparkles className="h-4 w-4" />
            AI-Powered Job Matching
          </div>
        </div>
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Find Your Perfect Job Match
        </h1>
        <p className="mb-8 text-xl leading-8 text-gray-600">
          Upload your resume and let our AI analyze your skills and experience to discover
          the best job opportunities tailored just for you.
        </p>
        <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>Smart Matching</span>
          </div>
          <div className="h-4 w-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span>AI Analysis</span>
          </div>
        </div>
      </div>
    </section>
  );
}
