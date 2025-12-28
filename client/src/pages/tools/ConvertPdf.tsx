import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Download, CheckCircle2, Image as ImageIcon, FileText } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileDropZone } from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { convertPdfToImages, downloadFile, downloadAsZip } from "@/lib/pdfUtils";
import { toast } from "sonner";

export default function ConvertPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [results, setResults] = useState<{ name: string; data: Blob }[] | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setResults(null);
      setPreviews([]);
      setProgress(0);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setResults(null);
    setPreviews([]);
    setProgress(0);
  }, []);

  const handleConvert = async () => {
    if (!file) {
      toast.error("Please select a PDF file first.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      console.log("Starting conversion with format:", format);
      
      // Call convertPdfToImages with correct parameters: file, format, scale, onProgress
      const images = await convertPdfToImages(file, format, 2, (p) => {
        console.log("Progress:", p);
        setProgress(Math.round(p));
      });

      console.log("Conversion successful, got", images.length, "images");
      
      if (!images || images.length === 0) {
        toast.error("No images were generated. Please try again.");
        setIsProcessing(false);
        return;
      }

      setResults(images);
      
      // Generate previews for first few images
      const previewUrls = images.slice(0, 4).map(img => {
        return URL.createObjectURL(img.data);
      });
      setPreviews(previewUrls);
      
      toast.success(`Converted ${images.length} page${images.length !== 1 ? "s" : ""} to ${format.toUpperCase()}!`);
      
      // Automatically trigger download
      if (images.length === 1) {
        downloadFile(images[0].data, images[0].name);
      } else {
        try {
          const zipData = await Promise.all(
            images.map(async r => ({ 
              name: r.name, 
              data: new Uint8Array(await r.data.arrayBuffer()) 
            }))
          );
          await downloadAsZip(zipData, `${file.name.replace(".pdf", "")}_images.zip`);
        } catch (zipError) {
          console.error("ZIP creation error:", zipError);
          toast.error("Failed to create ZIP file. Trying individual downloads...");
        }
      }
    } catch (error) {
      console.error("Conversion error:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to convert PDF: ${errorMsg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAll = async () => {
    if (results && results.length > 0 && file) {
      try {
        if (results.length === 1) {
          downloadFile(results[0].data, results[0].name);
        } else {
          const zipData = await Promise.all(
            results.map(async r => ({ 
              name: r.name, 
              data: new Uint8Array(await r.data.arrayBuffer()) 
            }))
          );
          await downloadAsZip(zipData, `${file.name.replace(".pdf", "")}_images.zip`);
        }
      } catch (error) {
        console.error("Download error:", error);
        toast.error("Failed to download files.");
      }
    }
  };

  const handleReset = () => {
    setFile(null);
    setResults(null);
    setPreviews([]);
    setProgress(0);
  };

  return (
    <ToolLayout
      title="PDF to Image"
      description="Convert each PDF page into a high-quality PNG or JPEG image."
      badge="CONVERT"
    >
      <div className="space-y-8">
        <AnimatePresence mode="wait">
          {!results ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <FileDropZone
                onFilesSelected={handleFilesSelected}
                selectedFiles={file ? [file] : []}
                onRemoveFile={handleRemoveFile}
                multiple={false}
              />

              {file && !isProcessing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 rounded-2xl bg-card border border-border space-y-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-black tracking-widest text-muted-foreground uppercase">
                        Output Format
                      </label>
                      <Select
                        value={format}
                        onValueChange={(v: any) => setFormat(v)}
                      >
                        <SelectTrigger className="w-full md:w-[240px] h-12 bg-secondary border-border font-bold">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="png" className="font-bold">PNG (Lossless)</SelectItem>
                          <SelectItem value="jpeg" className="font-bold">JPEG (Smaller Size)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      size="lg"
                      onClick={handleConvert}
                      disabled={isProcessing}
                      className="h-14 px-10 text-lg font-black rounded-xl gradient-primary border-0 text-black hover:scale-105 transition-transform disabled:opacity-50"
                    >
                      Convert to Image <RefreshCw className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-12 rounded-2xl bg-card border border-primary/20 text-center space-y-6"
                >
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <RefreshCw className="w-10 h-10 text-primary animate-spin" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black">Converting Pages...</h3>
                    <p className="text-muted-foreground">Rendering PDF pages as high-quality images.</p>
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <Progress value={progress} className="h-3 bg-secondary" />
                    <p className="text-sm font-bold text-primary">{Math.round(progress)}% Complete</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 rounded-2xl bg-card border border-primary/30 text-center space-y-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-primary" />
              
              <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>

              <div className="space-y-2">
                <h2 className="text-4xl font-black">Conversion Complete!</h2>
                <p className="text-muted-foreground text-lg">
                  {results.length} page{results.length !== 1 ? "s" : ""} converted successfully.
                </p>
              </div>

              {/* Previews */}
              {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                  {previews.map((url, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="aspect-[3/4] rounded-lg bg-secondary border border-border overflow-hidden relative group"
                    >
                      <img src={url} alt={`Page ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] font-black text-white bg-primary/20 px-2 py-1 rounded">PAGE {i + 1}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Button
                  size="lg"
                  onClick={handleDownloadAll}
                  className="h-14 px-10 text-lg font-black rounded-xl gradient-primary border-0 text-black hover:scale-105 transition-transform"
                >
                  Download {results.length > 1 ? "as ZIP" : "Image"} <Download className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleReset}
                  className="h-14 px-10 text-lg font-black rounded-xl border-2 border-white/10 hover:bg-white/5 transition-colors"
                >
                  Convert Another <RefreshCw className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 pt-12">
          <div className="p-6 rounded-xl bg-secondary/30 border border-border">
            <ImageIcon className="w-8 h-8 text-primary mb-4" />
            <h4 className="font-bold mb-2">High Quality</h4>
            <p className="text-sm text-muted-foreground">Crisp, high-resolution images suitable for professional use.</p>
          </div>
          <div className="p-6 rounded-xl bg-secondary/30 border border-border">
            <FileText className="w-8 h-8 text-primary mb-4" />
            <h4 className="font-bold mb-2">All Pages</h4>
            <p className="text-sm text-muted-foreground">Convert every page of your PDF or select specific ones.</p>
          </div>
          <div className="p-6 rounded-xl bg-secondary/30 border border-border">
            <RefreshCw className="w-8 h-8 text-primary mb-4" />
            <h4 className="font-bold mb-2">Fast & Secure</h4>
            <p className="text-sm text-muted-foreground">All processing happens in your browser. Your files never leave your device.</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
