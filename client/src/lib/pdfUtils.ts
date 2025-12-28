import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { toast } from "sonner";

// Initialize PDF.js worker
export async function initPdfJs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
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

// Compress PDF (improved compression by removing metadata and using object streams)
export async function compressPdf(
  file: File,
  quality: "low" | "medium" | "high" = "medium",
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  try {
    const fileData = await loadPdfFile(file);
    if (onProgress) onProgress(10);
    
    const pdf = await PDFDocument.load(fileData, { 
      ignoreEncryption: true,
      throwOnInvalidObject: false 
    });
    if (onProgress) onProgress(30);
    
    // Remove metadata for all levels
    pdf.setTitle("");
    pdf.setAuthor("");
    pdf.setSubject("");
    pdf.setKeywords([]);
    pdf.setProducer("");
    pdf.setCreator("");
    
    if (onProgress) onProgress(50);

    // Save with optimization
    // quality: low -> max compression, high -> min compression
    const pdfBytes = await pdf.save({
      useObjectStreams: quality !== "high",
      addDefaultPage: false,
      updateFieldAppearances: false,
      objectsPerTick: 50,
    });
    
    if (onProgress) onProgress(100);
    return pdfBytes;
  } catch (error) {
    console.error("Compression error:", error);
    throw error;
  }
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

// Download a single file (Fail-safe implementation)
export function downloadFile(data: Uint8Array | Blob, filename: string) {
  try {
    let type = "application/octet-stream";
    if (filename.endsWith(".pdf")) type = "application/pdf";
    else if (filename.endsWith(".zip")) type = "application/zip";
    else if (filename.endsWith(".png")) type = "image/png";
    else if (filename.endsWith(".jpeg") || filename.endsWith(".jpg")) type = "image/jpeg";

    const blob = data instanceof Blob ? data : new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    
    // Method 1: Standard Link Click
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    
    // Method 2: Fallback for some mobile browsers / strict CSP
    setTimeout(() => {
      if (document.body.contains(link)) {
        // If the link is still there, try one more time or use window.location
        try {
          link.click();
        } catch (e) {
          window.location.href = url;
        }
      }
    }, 100);

    // Cleanup
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      window.URL.revokeObjectURL(url);
    }, 1000);
    
    return true;
  } catch (error) {
    console.error("Download error:", error);
    // Method 3: Last resort - open in new tab
    try {
      const blob = data instanceof Blob ? data : new Blob([data]);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (e) {
      toast.error("Download failed. Please check your browser settings.");
    }
    return false;
  }
}


// Download multiple files as a ZIP
export async function downloadAsZip(
  files: { name: string; data: Uint8Array | Blob }[],
  zipName: string
) {
  try {
    const zip = new JSZip();
    
    for (const file of files) {
      zip.file(file.name, file.data as any);
    }
    
    const content = await zip.generateAsync({ type: "blob" });
    downloadFile(content, zipName);
  } catch (error) {
    console.error("ZIP download error:", error);
    throw new Error("Failed to download ZIP file");
  }
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
