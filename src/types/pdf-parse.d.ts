declare module 'pdf-parse' {
  interface PDFData {
    text: string;
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
  }

  interface PDFParseOptions {
    max?: number;
    version?: string;
  }

  function pdfParse(
    data: Buffer | Uint8Array,
    options?: PDFParseOptions
  ): Promise<PDFData>;

  export = pdfParse;
}
