import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, RefreshCw, CheckCircle2, AlertCircle, Loader2, FileJson } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileDropZone } from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { convertPdfToDocx, downloadDocx } from "@/lib/pdfToDocxConverter";
import { toast } from "sonner";

export default function PdfToDocx() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<{ blob: Blob; fileName: string } | null>(null);

  const handleFileSelected = useCallback(async (files: File[]) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setResult(null);
    setProgress(0);

    try {
      setIsProcessing(true);
      setStatus("Converting PDF to DOCX...");

      const { blob, fileName } = await convertPdfToDocx(selectedFile, {
        onProgress: setProgress,
      });

      setResult({ blob, fileName });
      setStatus("Conversion complete!");
      toast.success("PDF converted to DOCX successfully!");
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error("Failed to convert PDF to DOCX.");
      setStatus("Conversion failed");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setResult(null);
    setProgress(0);
    setStatus("");
  }, []);

  const handleDownload = useCallback(() => {
    if (result) {
      downloadDocx(result.blob, result.fileName);
      toast.success("DOCX file downloaded!");
    }
  }, [result]);

  return (
    <ToolLayout
      title="PDF to DOCX"
      description="Convert your PDF documents to editable Word format. All processing happens on your device - your files never leave your computer."
      badge="CLIENT-SIDE"
    >
      <div className="space-y-8">
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 md:p-8 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-4"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
              <FileJson className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-black text-lg mb-2">100% Client-Side Conversion</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your PDF is converted directly in your browser using advanced client-side processing. No server uploads, no data collection, complete privacy.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30 font-black text-[10px]">
                  NO SERVER
                </Badge>
                <Badge className="bg-green-500/20 text-green-500 border-green-500/30 font-black text-[10px]">
                  INSTANT
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/30 font-black text-[10px]">
                  EDITABLE
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <FileDropZone
                onFilesSelected={handleFileSelected}
                selectedFiles={file ? [file] : []}
                onRemoveFile={handleRemoveFile}
                multiple={false}
                disabled={isProcessing}
              />

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 md:p-12 rounded-2xl bg-card border border-primary/20 text-center space-y-6"
                >
                  <motion.div 
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                  </motion.div>
                  <div className="space-y-2">
                    <h3 className="text-xl md:text-2xl font-black">{status}</h3>
                    <p className="text-sm md:text-base text-muted-foreground">Processing your PDF file...</p>
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="p-6 md:p-8 rounded-2xl bg-card border border-primary/30 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary/30" />

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm md:text-base break-all">{file.name}</h3>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleRemoveFile} className="text-muted-foreground hover:text-primary font-bold text-xs md:text-sm">
                    Change File
                  </Button>
                </div>

                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <div>
                        <p className="font-bold text-sm text-green-600">Conversion Successful!</p>
                        <p className="text-xs text-muted-foreground">Your DOCX file is ready to download</p>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      onClick={handleDownload}
                      className="w-full h-12 md:h-14 gradient-primary text-black font-black rounded-xl click-animation button-press"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download {result.fileName}
                    </Button>
                  </motion.div>
                )}
              </div>

              {isProcessing && (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex items-center justify-center gap-3 text-primary animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs md:text-sm font-black tracking-widest uppercase">{status}</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-secondary" />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pt-12">
          <motion.div 
            className="p-4 md:p-6 rounded-xl bg-secondary/30 border border-border flex gap-4"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-bold mb-1 text-sm md:text-base">Editable Format</h4>
              <p className="text-xs md:text-sm text-muted-foreground">Convert to Microsoft Word format for easy editing and sharing.</p>
            </div>
          </motion.div>
          <motion.div 
            className="p-4 md:p-6 rounded-xl bg-secondary/30 border border-border flex gap-4"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-bold mb-1 text-sm md:text-base">Instant Conversion</h4>
              <p className="text-xs md:text-sm text-muted-foreground">Fast client-side processing with no waiting for server responses.</p>
            </div>
          </motion.div>
          <motion.div 
            className="p-4 md:p-6 rounded-xl bg-secondary/30 border border-border flex gap-4"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-bold mb-1 text-sm md:text-base">100% Private</h4>
              <p className="text-xs md:text-sm text-muted-foreground">Your files stay on your device. We never upload or store anything.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </ToolLayout>
  );
}
