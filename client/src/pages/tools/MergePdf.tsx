import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileDropZone, FileList } from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Merge, Download, Loader2, CheckCircle2, GripVertical } from "lucide-react";
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
      toast.success("Download started!");
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
    setProgress(0);
  };

  // Drag and drop reordering
  const moveFile = (fromIndex: number, toIndex: number) => {
    const newFiles = [...files];
    const [removed] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, removed);
    setFiles(newFiles);
    setResult(null);
  };

  return (
    <ToolLayout
      title="Merge PDFs"
      description="Combine multiple PDF files into a single document. Drag to reorder."
      icon={<Merge className="w-8 h-8 text-white" />}
      iconColor="from-purple-500 to-indigo-600"
    >
      <div className="space-y-6">
        {/* File Drop Zone */}
        {!result && (
          <FileDropZone
            onFilesSelected={handleFilesSelected}
            accept=".pdf"
            multiple={true}
            maxFiles={20}
            disabled={isProcessing}
          />
        )}

        {/* File List with Reordering */}
        {files.length > 0 && !result && (
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">
                  {files.length} file{files.length !== 1 ? "s" : ""} selected
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  disabled={isProcessing}
                >
                  Clear all
                </Button>
              </div>
              
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border group"
                  >
                    <div className="cursor-grab text-muted-foreground hover:text-foreground">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium text-primary">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {index > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveFile(index, index - 1)}
                          disabled={isProcessing}
                        >
                          ↑
                        </Button>
                      )}
                      {index < files.length - 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveFile(index, index + 1)}
                          disabled={isProcessing}
                        >
                          ↓
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                        disabled={isProcessing}
                        className="text-destructive hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processing Progress */}
        {isProcessing && (
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="font-medium">Merging PDFs...</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                {Math.round(progress)}% complete
              </p>
            </CardContent>
          </Card>
        )}

        {/* Result */}
        {result && (
          <Card className="bg-card border-border gradient-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Merge Complete!</h3>
                  <p className="text-muted-foreground">
                    {files.length} files merged • {(result.length / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  className="flex-1 gradient-primary border-0"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Merged PDF
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent"
                  onClick={handleReset}
                >
                  Merge More
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        {files.length >= 2 && !result && !isProcessing && (
          <Button
            size="lg"
            className="w-full gradient-primary border-0 h-14 text-lg"
            onClick={handleMerge}
          >
            <Merge className="w-5 h-5 mr-2" />
            Merge {files.length} PDFs
          </Button>
        )}
      </div>
    </ToolLayout>
  );
}
