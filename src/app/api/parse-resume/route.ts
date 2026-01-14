import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';

// Type definitions
interface ParseResumeResponse {
  text: string;
}

interface ErrorResponse {
  error: string;
}

/**
 * POST /api/parse-resume
 * 
 * Accepts a resume file (PDF, DOC, DOCX) via FormData and extracts text from it.
 * 
 * @param request - Next.js request object containing FormData with 'file' field
 * @returns JSON response with extracted text or error message
 * 
 * @example
 * Request: FormData with 'file' field containing PDF/DOC/DOCX
 * Response: { "text": "Extracted resume text here" }
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ParseResumeResponse | ErrorResponse>> {
  try {
    // Parse FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    // Validate file exists
    if (!file) {
      return NextResponse.json<ErrorResponse>(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get file type and buffer
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate file type
    const isPDF =
      fileType === 'application/pdf' || fileName.endsWith('.pdf');
    const isDOCX =
      fileType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx');
    const isDOC =
      fileType === 'application/msword' || fileName.endsWith('.doc');

    if (!isPDF && !isDOCX && !isDOC) {
      return NextResponse.json<ErrorResponse>(
        {
          error:
            'Unsupported file type. Please upload a PDF, DOC, or DOCX file.',
        },
        { status: 400 }
      );
    }

    // Extract text based on file type
    let extractedText = '';

    if (isPDF) {
      // Use pdf-parse for PDF files (with proper Next.js serverless handling)
      try {
        // Ensure buffer is valid
        if (!buffer || buffer.length === 0) {
          throw new Error('Invalid PDF buffer');
        }
        
        // Load pdf-parse using createRequire for Next.js serverless compatibility
        // This approach works around CommonJS/ESM issues in Next.js API routes
        const { createRequire } = await import('module');
        const path = await import('path');
        
        // Use package.json as base for createRequire (most reliable in serverless)
        const basePath = path.resolve(process.cwd(), 'package.json');
        const require = createRequire(basePath);
        
        // Load pdf-parse - it may throw test file errors during init, but still works
        let pdfParse: any;
        try {
          pdfParse = require('pdf-parse');
        } catch (requireError: any) {
          // If it's a test file error, the module might still be partially loaded
          // Try to access it anyway - pdf-parse often works despite test file errors
          if (requireError?.message?.includes('test') || requireError?.code === 'ENOENT') {
            // Suppress the error and try to use the module anyway
            // pdf-parse can work even if test files are missing
            try {
              pdfParse = require('pdf-parse');
            } catch (retryError) {
              // If it still fails, try dynamic import as fallback
              const pdfModule = await import('pdf-parse');
              pdfParse = pdfModule.default || pdfModule;
            }
          } else {
            throw requireError;
          }
        }
        
        // Verify pdfParse is a function
        if (typeof pdfParse !== 'function') {
          throw new Error('pdf-parse module did not export a function');
        }
        
        // Parse the PDF buffer
        const pdfData = await pdfParse(buffer, {
          max: 0, // No page limit
        });
        
        extractedText = pdfData.text || '';
        
        if (!extractedText || extractedText.trim().length === 0) {
          throw new Error('No text extracted from PDF - file may be image-based or corrupted');
        }
      } catch (pdfError: any) {
        console.error('PDF parsing error details:', {
          message: pdfError?.message,
          stack: pdfError?.stack,
          name: pdfError?.name,
          bufferLength: buffer?.length,
          errorType: typeof pdfError,
        });
        
        // Provide user-friendly error message
        const errorMessage = pdfError?.message || 'Unknown error';
        let userMessage = 'Failed to parse PDF file. ';
        
        if (errorMessage.includes('password') || errorMessage.includes('encrypted')) {
          userMessage += 'The PDF appears to be password-protected. Please remove the password and try again.';
        } else if (errorMessage.includes('corrupted') || errorMessage.includes('invalid')) {
          userMessage += 'The PDF file appears to be corrupted. Please try a different file.';
        } else if (errorMessage.includes('No text extracted')) {
          userMessage += 'The PDF appears to be image-based or contains no extractable text. Please use a text-based PDF.';
        } else {
          userMessage += 'The file may be corrupted, password-protected, or in an unsupported format.';
        }
        
        return NextResponse.json<ErrorResponse>(
          { error: userMessage },
          { status: 500 }
        );
      }
    } else if (isDOCX || isDOC) {
      // Use mammoth for DOC/DOCX files
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || '';
      } catch (mammothError) {
        console.error('DOC/DOCX parsing error:', mammothError);
        return NextResponse.json<ErrorResponse>(
          {
            error:
              'Failed to parse DOC/DOCX file. The file may be corrupted.',
          },
          { status: 500 }
        );
      }
    }

    // Validate extracted text
    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json<ErrorResponse>(
        {
          error:
            'Could not extract text from the file. The file may be empty or corrupted.',
        },
        { status: 500 }
      );
    }

    // Return extracted text
    return NextResponse.json<ParseResumeResponse>(
      { text: extractedText.trim() },
      { status: 200 }
    );
  } catch (error) {
    // Handle unexpected errors
    console.error('Unexpected error parsing resume:', error);
    return NextResponse.json<ErrorResponse>(
      {
        error:
          error instanceof Error
            ? `Failed to process file: ${error.message}`
            : 'An unexpected error occurred while processing the file.',
      },
      { status: 500 }
    );
  }
}
