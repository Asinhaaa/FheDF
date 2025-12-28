import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Merge, Download, RefreshCw, CheckCircle2, Plus } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileDropZone } from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mergePdfs, downloadFile } from "@/lib/pdfUtils";
import { toast } from "sonner";

export default function MergePdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Uint8Array | null>(null);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    setResult(null);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setResult(null);
  }, []);

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error("Please select at least 2 PDF files to merge");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const mergedPdf = await mergePdfs(files, setProgress);
      setResult(mergedPdf);
      toast.success("PDFs merged successfully!");
      
      // Automatically trigger download
      downloadFile(mergedPdf, "merged.pdf");
    } catch (error) {
      console.error("Merge error:", error);
      toast.error("Failed to merge PDFs. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      downloadFile(result, "merged.pdf");
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
    setProgress(0);
  };

  return (
    <ToolLayout
      title="Merge PDF"
      description="Combine multiple PDF files into a single document in seconds."
      badge="ORGANIZE"
    >
      <div className="space-y-8">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <FileDropZone
                onFilesSelected={handleFilesSelected}
                selectedFiles={files}
                onRemoveFile={handleRemoveFile}
                multiple={true}
                maxFiles={20}
              />

              {files.length > 0 && !isProcessing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 rounded-2xl bg-card border border-border flex flex-col md:flex-row items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Merge className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">{files.length} Files Selected</p>
                      <p className="text-sm text-muted-foreground">Ready to be merged into one PDF</p>
                    </div>
                  </div>

                  <div className="flex gap-3 w-full md:w-auto">
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("file-input")?.click()}
                      className="flex-1 md:flex-none h-12 px-6 font-bold border-white/10 hover:bg-white/5"
                    >
                      Add More <Plus className="ml-2 w-4 h-4" />
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleMerge}
                      disabled={files.length < 2}
                      className="flex-1 md:flex-none h-12 px-10 font-black rounded-xl gradient-primary border-0 text-black hover:scale-105 transition-transform disabled:opacity-50"
                    >
                      Merge PDFs
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
                    <h3 className="text-2xl font-black">Merging Documents...</h3>
                    <p className="text-muted-foreground">Combining your files into a single PDF.</p>
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <Progress value={progress} className="h-3 bg-secondary" />
                    <p className="text-sm font-bold text-primary">{progress}% Complete</p>
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
                <h2 className="text-4xl font-black">Merge Complete!</h2>
                <p className="text-muted-foreground text-lg">
                  {files.length} files have been successfully combined.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Button
                  size="lg"
                  onClick={handleDownload}
                  className="h-14 px-10 text-lg font-black rounded-xl gradient-primary border-0 text-black hover:scale-105 transition-transform"
                >
                  Download Merged PDF <Download className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleReset}
                  className="h-14 px-10 text-lg font-black rounded-xl border-2 border-white/10 hover:bg-white/5 transition-colors"
                >
                  Merge Another <RefreshCw className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
}
