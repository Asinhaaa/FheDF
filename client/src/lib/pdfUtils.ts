import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import JSZip from "jszip";

// Initialize PDF.js worker
export async function initPdfJs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  return pdfjs;
}

// Load a PDF file as Uint8Array
export async function loadPdfFile(file: File): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer);
}

// Merge multiple PDFs into one
export async function mergePdfs(
  files: File[],
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  
  for (let i = 0; i < files.length; i++) {
    const fileData = await loadPdfFile(files[i]);
    const pdf = await PDFDocument.load(fileData);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach(page => mergedPdf.addPage(page));
    
    if (onProgress) {
      onProgress(((i + 1) / files.length) * 100);
    }
  }
  
  return mergedPdf.save();
}

// Split a PDF into individual pages or ranges
export async function splitPdf(
  file: File,
  ranges: { start: number; end: number }[],
  onProgress?: (progress: number) => void
): Promise<{ name: string; data: Uint8Array }[]> {
  const fileData = await loadPdfFile(file);
  const sourcePdf = await PDFDocument.load(fileData);
  const results: { name: string; data: Uint8Array }[] = [];
  const baseName = file.name.replace(".pdf", "");
  
  for (let i = 0; i < ranges.length; i++) {
    const { start, end } = ranges[i];
    const newPdf = await PDFDocument.create();
    const pageIndices = Array.from(
      { length: end - start + 1 },
      (_, idx) => start - 1 + idx
    );
    const pages = await newPdf.copyPages(sourcePdf, pageIndices);
    pages.forEach(page => newPdf.addPage(page));
    
    const pdfBytes = await newPdf.save();
    results.push({
      name: `${baseName}_pages_${start}-${end}.pdf`,
      data: pdfBytes
    });
    
    if (onProgress) {
      onProgress(((i + 1) / ranges.length) * 100);
    }
  }
  
  return results;
}

// Split PDF into individual pages
export async function splitPdfToPages(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ name: string; data: Uint8Array }[]> {
  const fileData = await loadPdfFile(file);
  const sourcePdf = await PDFDocument.load(fileData);
  const pageCount = sourcePdf.getPageCount();
  const baseName = file.name.replace(".pdf", "");
  const results: { name: string; data: Uint8Array }[] = [];
  
  for (let i = 0; i < pageCount; i++) {
    const newPdf = await PDFDocument.create();
    const [page] = await newPdf.copyPages(sourcePdf, [i]);
    newPdf.addPage(page);
    
    const pdfBytes = await newPdf.save();
    results.push({
      name: `${baseName}_page_${i + 1}.pdf`,
      data: pdfBytes
    });
    
    if (onProgress) {
      onProgress(((i + 1) / pageCount) * 100);
    }
  }
  
  return results;
}

// Get PDF page count
export async function getPdfPageCount(file: File): Promise<number> {
  const fileData = await loadPdfFile(file);
  const pdf = await PDFDocument.load(fileData);
  return pdf.getPageCount();
}

// Compress PDF (basic compression by removing metadata and optimizing)
export async function compressPdf(
  file: File,
  quality: "low" | "medium" | "high" = "medium",
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  const fileData = await loadPdfFile(file);
  
  if (onProgress) onProgress(30);
  
  const pdf = await PDFDocument.load(fileData, {
    ignoreEncryption: true,
  });
  
  if (onProgress) onProgress(60);
  
  // Remove metadata for smaller size
  pdf.setTitle("");
  pdf.setAuthor("");
  pdf.setSubject("");
  pdf.setKeywords([]);
  pdf.setProducer("");
  pdf.setCreator("");
  
  if (onProgress) onProgress(80);
  
  // Save with compression options based on quality
  const pdfBytes = await pdf.save({
    useObjectStreams: quality !== "high",
    addDefaultPage: false,
  });
  
  if (onProgress) onProgress(100);
  
  return pdfBytes;
}

// Convert PDF pages to images
export async function convertPdfToImages(
  file: File,
  format: "png" | "jpeg" = "png",
  scale: number = 2,
  onProgress?: (progress: number) => void
): Promise<{ name: string; data: Blob }[]> {
  const pdfjs = await initPdfJs();
  const fileData = await loadPdfFile(file);
  const pdf = await pdfjs.getDocument({ data: fileData }).promise;
  const results: { name: string; data: Blob }[] = [];
  const baseName = file.name.replace(".pdf", "");
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    } as any).promise;
    
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (b) => resolve(b!),
        format === "jpeg" ? "image/jpeg" : "image/png",
        format === "jpeg" ? 0.9 : undefined
      );
    });
    
    results.push({
      name: `${baseName}_page_${i}.${format}`,
      data: blob,
    });
    
    if (onProgress) {
      onProgress((i / pdf.numPages) * 100);
    }
  }
  
  return results;
}

// Extract text from PDF
export async function extractTextFromPdf(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string[]> {
  const pdfjs = await initPdfJs();
  const fileData = await loadPdfFile(file);
  const pdf = await pdfjs.getDocument({ data: fileData }).promise;
  const textPages: string[] = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ");
    textPages.push(pageText);
    
    if (onProgress) {
      onProgress((i / pdf.numPages) * 100);
    }
  }
  
  return textPages;
}

// Download a single file
export function downloadFile(data: Uint8Array | Blob, filename: string) {
  const blob = data instanceof Blob ? data : new Blob([data as BlobPart], { type: "application/pdf" });
  saveAs(blob, filename);
}

// Download multiple files as a ZIP
export async function downloadAsZip(
  files: { name: string; data: Uint8Array | Blob }[],
  zipName: string
) {
  const zip = new JSZip();
  
  for (const file of files) {
    zip.file(file.name, file.data as any);
  }
  
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, zipName);
}

// Generate PDF thumbnail
export async function generatePdfThumbnail(
  file: File,
  pageNumber: number = 1,
  scale: number = 0.5
): Promise<string> {
  const pdfjs = await initPdfJs();
  const fileData = await loadPdfFile(file);
  const pdf = await pdfjs.getDocument({ data: fileData }).promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  await page.render({
    canvasContext: context,
    viewport: viewport,
    canvas: canvas,
  } as any).promise;
  
  return canvas.toDataURL("image/png");
}
