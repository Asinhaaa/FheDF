import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minimize2, Download, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
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
import { compressPdf, downloadFile } from "@/lib/pdfUtils";
import { toast } from "sonner";

export default function CompressPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState<"low" | "medium" | "high">("medium");
  const [result, setResult] = useState<{
    data: Uint8Array;
    originalSize: number;
  } | null>(null);

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setResult(null);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setResult(null);
  }, []);

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const compressed = await compressPdf(file, quality, setProgress);
      
      if (compressed.length >= file.size && quality !== "high") {
        toast.info("This PDF is already highly optimized.");
      }

      setResult({
        data: compressed,
        originalSize: file.size,
      });
      
      const reduction = Math.max(0, ((file.size - compressed.length) / file.size * 100)).toFixed(1);
      toast.success(`PDF compressed! Reduced by ${reduction}%`);
      
      // Automatically trigger download
      const newName = file.name.replace(".pdf", "_compressed.pdf");
      downloadFile(compressed, newName);
    } catch (error) {
      console.error("Compression error:", error);
      toast.error("Failed to compress PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result && file) {
      const newName = file.name.replace(".pdf", "_compressed.pdf");
      downloadFile(result.data, newName);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
  };

  return (
    <ToolLayout
      title="Compress PDF"
      description="Reduce PDF file size while maintaining the best possible quality."
      badge="OPTIMIZE"
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
                        Compression Level
                      </label>
                      <Select
                        value={quality}
                        onValueChange={(v: any) => setQuality(v)}
                      >
                        <SelectTrigger className="w-full md:w-[240px] h-12 bg-secondary border-border font-bold">
                          <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="low" className="font-bold">Low (Maximum Compression)</SelectItem>
                          <SelectItem value="medium" className="font-bold">Medium (Balanced)</SelectItem>
                          <SelectItem value="high" className="font-bold">High (Best Quality)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      size="lg"
                      onClick={handleCompress}
                      className="h-14 px-10 text-lg font-black rounded-xl gradient-primary border-0 text-black hover:scale-105 transition-transform"
                    >
                      Compress PDF <Minimize2 className="ml-2 w-5 h-5" />
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
                    <h3 className="text-2xl font-black">Optimizing PDF...</h3>
                    <p className="text-muted-foreground">This may take a few seconds depending on the file size.</p>
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
              {/* Success Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-primary" />
              
              <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>

              <div className="space-y-2">
                <h2 className="text-4xl font-black">Compression Complete!</h2>
                <p className="text-muted-foreground text-lg">Your file has been optimized and is ready for download.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Original</p>
                  <p className="text-xl font-black">{(result.originalSize / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Compressed</p>
                  <p className="text-xl font-black text-primary">{(result.data.length / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Button
                  size="lg"
                  onClick={handleDownload}
                  className="h-14 px-10 text-lg font-black rounded-xl gradient-primary border-0 text-black hover:scale-105 transition-transform"
                >
                  Download PDF <Download className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleReset}
                  className="h-14 px-10 text-lg font-black rounded-xl border-2 border-white/10 hover:bg-white/5 transition-colors"
                >
                  Compress Another <RefreshCw className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Section */}
        <div className="grid md:grid-cols-3 gap-6 pt-12">
          <div className="p-6 rounded-xl bg-secondary/30 border border-border">
            <ShieldCheck className="w-8 h-8 text-primary mb-4" />
            <h4 className="font-bold mb-2">100% Private</h4>
            <p className="text-sm text-muted-foreground">Your files never leave your browser. All processing is done locally.</p>
          </div>
          <div className="p-6 rounded-xl bg-secondary/30 border border-border">
            <Zap className="w-8 h-8 text-primary mb-4" />
            <h4 className="font-bold mb-2">Fast Processing</h4>
            <p className="text-sm text-muted-foreground">Optimized algorithms ensure quick compression without quality loss.</p>
          </div>
          <div className="p-6 rounded-xl bg-secondary/30 border border-border">
            <AlertCircle className="w-8 h-8 text-primary mb-4" />
            <h4 className="font-bold mb-2">No Limits</h4>
            <p className="text-sm text-muted-foreground">Compress as many files as you want, completely free of charge.</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

// Helper icons for the info section
function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function Zap(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14h6l-1 9 10-11h-6l1-9z" />
    </svg>
  );
}
