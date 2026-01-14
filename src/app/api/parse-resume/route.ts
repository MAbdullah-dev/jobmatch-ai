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
      // Use pdf-parse for PDF files
      // Handle CommonJS module in Next.js API routes (works in serverless)
      try {
        // Dynamic import for serverless compatibility
        const pdfParseModule = await import('pdf-parse');
        const pdfParse = pdfParseModule.default || pdfParseModule;
        
        // Ensure buffer is valid
        if (!buffer || buffer.length === 0) {
          throw new Error('Invalid PDF buffer');
        }
        
        // Parse the PDF buffer
        const pdfData = await pdfParse(buffer, {
          // Options to help with serverless environments
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
