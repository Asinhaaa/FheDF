import { Document, Packer, Paragraph, TextRun, PageBreak, convertInchesToTwip } from 'docx';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface ConversionOptions {
  includeImages?: boolean;
  preserveFormatting?: boolean;
  onProgress?: (progress: number) => void;
}

/**
 * Extract text from PDF with formatting information
 */
export async function extractPdfContent(
  file: File,
  options: ConversionOptions = {}
): Promise<Array<{ text: string; isBold?: boolean; isItalic?: boolean; fontSize?: number }>> {
  const { onProgress } = options;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  const content: Array<{ text: string; isBold?: boolean; isItalic?: boolean; fontSize?: number }> = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Group text items by line
    let currentLine = '';
    let lastY = 0;

    for (const item of textContent.items) {
      if ('transform' in item) {
        const y = item.transform[5];

        // Check if we're on a new line
        if (lastY !== 0 && Math.abs(y - lastY) > 5) {
          if (currentLine.trim()) {
            content.push({
              text: currentLine.trim(),
              isBold: false,
              isItalic: false,
            });
          }
          currentLine = '';
        }

        if ('str' in item) {
          currentLine += item.str + ' ';
          lastY = y;
        }
      }
    }

    // Add remaining line
    if (currentLine.trim()) {
      content.push({
        text: currentLine.trim(),
        isBold: false,
        isItalic: false,
      });
    }

    // Add page break
    if (pageNum < totalPages) {
      content.push({ text: '\n---PAGE_BREAK---\n' });
    }

    if (onProgress) {
      onProgress((pageNum / totalPages) * 100);
    }
  }

  return content;
}

/**
 * Convert extracted PDF content to DOCX
 */
export async function createDocxFromContent(
  content: Array<{ text: string; isBold?: boolean; isItalic?: boolean; fontSize?: number }>,
  fileName: string
): Promise<Blob> {
  const paragraphs: Paragraph[] = [];

  for (const item of content) {
    if (item.text === '\n---PAGE_BREAK---\n') {
      paragraphs.push(new Paragraph({ pageBreakBefore: true }));
    } else if (item.text.trim()) {
      paragraphs.push(
        new Paragraph({
          text: item.text,
          run: new TextRun({
            bold: item.isBold || false,
            italics: item.isItalic || false,
            size: (item.fontSize || 11) * 2, // Convert to half-points
          }),
        })
      );
    } else {
      paragraphs.push(new Paragraph(''));
    }
  }

  const doc = new Document({
    sections: [
      {
        children: paragraphs,
        properties: {
          page: {
            margins: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}

/**
 * Complete PDF to DOCX conversion
 */
export async function convertPdfToDocx(
  file: File,
  options: ConversionOptions = {}
): Promise<{ blob: Blob; fileName: string }> {
  const { onProgress } = options;

  try {
    // Extract content
    if (onProgress) onProgress(0);
    const content = await extractPdfContent(file, {
      ...options,
      onProgress: (p) => onProgress && onProgress(p * 0.7),
    });

    // Create DOCX
    if (onProgress) onProgress(70);
    const fileName = file.name.replace('.pdf', '.docx');
    const blob = await createDocxFromContent(content, fileName);

    if (onProgress) onProgress(100);

    return { blob, fileName };
  } catch (error) {
    console.error('PDF to DOCX conversion error:', error);
    throw new Error(`Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Download DOCX file
 */
export function downloadDocx(blob: Blob, fileName: string): void {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Download error:', error);
    throw new Error('Failed to download DOCX file');
  }
}
