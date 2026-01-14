'use client';

import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

interface ResumeUploadProps {
  onFileUpload: (file: File) => Promise<void>;
}

export default function ResumeUpload({ onFileUpload }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const validateFile = (file: File): boolean => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    return (
      validTypes.includes(file.type) ||
      validExtensions.includes(fileExtension)
    );
  };

  const handleFileProcess = useCallback(
    async (file: File) => {
      if (!validateFile(file)) {
        setUploadState('error');
        setErrorMessage('Please upload a PDF or DOC/DOCX file only.');
        return;
      }

      setUploadState('uploading');
      setErrorMessage('');

      try {
        // Call the parent's async upload handler
        await onFileUpload(file);
        
        setUploadedFile(file);
        setUploadState('success');

        // Reset success message after 3 seconds
        setTimeout(() => {
          setUploadState('idle');
        }, 3000);
      } catch (error) {
        setUploadState('error');
        setErrorMessage(
          error instanceof Error ? error.message : 'Failed to process resume. Please try again.'
        );
      }
    },
    [onFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileProcess(file);
      }
    },
    [handleFileProcess]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileProcess(file);
      }
    },
    [handleFileProcess]
  );

  const handleRemove = useCallback(() => {
    setUploadedFile(null);
    setUploadState('idle');
    setErrorMessage('');
  }, []);

  const getBorderColor = () => {
    if (uploadState === 'error') return 'border-red-300 bg-red-50';
    if (uploadState === 'success') return 'border-green-300 bg-green-50';
    if (isDragging) return 'border-blue-500 bg-blue-50';
    if (uploadState === 'uploading') return 'border-blue-400 bg-blue-50';
    return 'border-gray-300 bg-gray-50 hover:border-gray-400';
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">Upload Your Resume</h2>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-xl border-2 border-dashed transition-colors ${getBorderColor()}`}
          role="button"
          tabIndex={0}
          aria-label="Resume upload area"
        >
          {uploadState === 'uploading' ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
              <p className="text-lg font-medium text-gray-900">Uploading and analyzing...</p>
              <p className="mt-2 text-sm text-gray-500">Please wait while we process your resume</p>
            </div>
          ) : uploadState === 'success' && uploadedFile ? (
            <div className="p-8">
              <div className="mb-4 flex items-center gap-3 rounded-lg bg-green-100 p-4">
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">Resume uploaded successfully!</p>
                  <p className="text-sm text-green-700">
                    AI analysis complete. View your job matches below.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(uploadedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemove}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Remove uploaded file"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : uploadState === 'error' ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <p className="mb-2 text-lg font-medium text-gray-900">Upload failed</p>
              <p className="mb-4 text-sm text-red-600">{errorMessage}</p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className="inline-flex cursor-pointer items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Try Again
              </label>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <p className="mb-2 text-lg font-medium text-gray-900">
                Drag and drop your resume here
              </p>
              <p className="mb-4 text-sm text-gray-500">or click to browse</p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
                id="resume-upload"
                aria-label="Select resume file"
              />
              <label
                htmlFor="resume-upload"
                className="inline-flex cursor-pointer items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Select File
              </label>
              <p className="mt-4 text-xs text-gray-400">PDF or DOC/DOCX files only</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
