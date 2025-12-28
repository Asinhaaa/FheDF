import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Download, RefreshCw, CheckCircle2, FileText } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileDropZone } from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { splitPdf, downloadFile, downloadAsZip } from "@/lib/pdfUtils";
import { toast } from "sonner";

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ranges, setRanges] = useState("");
  const [results, setResults] = useState<{ name: string; data: Uint8Array }[] | null>(null);

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setResults(null);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setResults(null);
  }, []);

  const handleSplit = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      let splitResults;
      if (!ranges.trim()) {
        // Default: split every page
        splitResults = await splitPdf(file, [], setProgress);
      } else {
        // Parse ranges: "1, 2-5, 8"
        const validRanges = ranges.split(",").map(r => {
          const parts = r.trim().split("-");
          if (parts.length === 1) return parseInt(parts[0]);
          return { start: parseInt(parts[0]), end: parseInt(parts[1]) };
        }).filter(r => r !== null && !isNaN(typeof r === "number" ? r : r.start));
        
        splitResults = await splitPdf(file, validRanges as any, setProgress);
      }
      
      setResults(splitResults);
      toast.success(`PDF split into ${splitResults.length} file${splitResults.length !== 1 ? "s" : ""}!`);
      
      // Automatically trigger download
      if (splitResults.length === 1) {
        downloadFile(splitResults[0].data, splitResults[0].name);
      } else {
        await downloadAsZip(splitResults, `${file.name.replace(".pdf", "")}_split.zip`);
      }
    } catch (error) {
      console.error("Split error:", error);
      toast.error("Failed to split PDF. Please try again.");
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
          await downloadAsZip(results, `${file.name.replace(".pdf", "")}_split.zip`);
        }
      } catch (error) {
        toast.error("Failed to download files.");
      }
    }
  };

  const handleReset = () => {
    setFile(null);
    setResults(null);
    setRanges("");
    setProgress(0);
  };

  return (
    <ToolLayout
      title="Split PDF"
      description="Extract specific pages or split your PDF into multiple individual files."
      badge="ORGANIZE"
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
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-sm font-black tracking-widest text-muted-foreground uppercase">
                        Page Ranges (Optional)
                      </label>
                      <Input
                        placeholder="e.g. 1, 2-5, 8 (Leave empty to split every page)"
                        value={ranges}
                        onChange={(e) => setRanges(e.target.value)}
                        className="h-12 bg-secondary border-border font-bold"
                      />
                      <p className="text-xs text-muted-foreground">Use commas for separate pages and hyphens for ranges.</p>
                    </div>

                    <Button
                      size="lg"
                      onClick={handleSplit}
                      className="w-full h-14 text-lg font-black rounded-xl gradient-primary border-0 text-black hover:scale-[1.02] transition-transform"
                    >
                      Split PDF <Scissors className="ml-2 w-5 h-5" />
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
                    <h3 className="text-2xl font-black">Splitting Document...</h3>
                    <p className="text-muted-foreground">Extracting pages and creating new PDF files.</p>
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
                <h2 className="text-4xl font-black">Split Complete!</h2>
                <p className="text-muted-foreground text-lg">
                  Your PDF has been split into {results.length} file{results.length !== 1 ? "s" : ""}.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="p-4 rounded-xl bg-secondary/50 border border-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Output</p>
                    <p className="font-bold">{results.length} Files</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50 border border-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                    <Download className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Format</p>
                    <p className="font-bold">{results.length > 1 ? "ZIP Archive" : "PDF File"}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Button
                  size="lg"
                  onClick={handleDownloadAll}
                  className="h-14 px-10 text-lg font-black rounded-xl gradient-primary border-0 text-black hover:scale-105 transition-transform"
                >
                  Download {results.length > 1 ? "All as ZIP" : "PDF"} <Download className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleReset}
                  className="h-14 px-10 text-lg font-black rounded-xl border-2 border-white/10 hover:bg-white/5 transition-colors"
                >
                  Split Another <RefreshCw className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
}
