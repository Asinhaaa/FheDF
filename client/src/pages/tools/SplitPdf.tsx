import { useState, useCallback, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileDropZone } from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Scissors, 
  Download, 
  Loader2, 
  CheckCircle2, 
  FileText,
  Plus,
  X
} from "lucide-react";
import { 
  splitPdf, 
  splitPdfToPages, 
  getPdfPageCount, 
  downloadAsZip,
  downloadFile 
} from "@/lib/pdfUtils";
import { toast } from "sonner";

interface PageRange {
  start: number;
  end: number;
}

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ name: string; data: Uint8Array }[] | null>(null);
  const [splitMode, setSplitMode] = useState<"all" | "ranges">("all");
  const [ranges, setRanges] = useState<PageRange[]>([{ start: 1, end: 1 }]);

  const handleFileSelected = useCallback(async (files: File[]) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setResults(null);
    
    try {
      const count = await getPdfPageCount(selectedFile);
      setPageCount(count);
      setRanges([{ start: 1, end: count }]);
    } catch (error) {
      toast.error("Failed to read PDF. Please try another file.");
    }
  }, []);

  const handleAddRange = () => {
    setRanges(prev => [...prev, { start: 1, end: pageCount }]);
  };

  const handleRemoveRange = (index: number) => {
    setRanges(prev => prev.filter((_, i) => i !== index));
  };

  const handleRangeChange = (index: number, field: "start" | "end", value: number) => {
    setRanges(prev => prev.map((range, i) => {
      if (i !== index) return range;
      const newValue = Math.max(1, Math.min(pageCount, value));
      return { ...range, [field]: newValue };
    }));
  };

  const handleSplit = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      let splitResults;
      
      if (splitMode === "all") {
        splitResults = await splitPdfToPages(file, setProgress);
      } else {
        // Validate ranges
        const validRanges = ranges.filter(r => r.start <= r.end && r.start >= 1 && r.end <= pageCount);
        if (validRanges.length === 0) {
          toast.error("Please enter valid page ranges");
          setIsProcessing(false);
          return;
        }
        splitResults = await splitPdf(file, validRanges, setProgress);
      }
      
      setResults(splitResults);
      toast.success(`PDF split into ${splitResults.length} file${splitResults.length !== 1 ? "s" : ""}!`);
    } catch (error) {
      console.error("Split error:", error);
      toast.error("Failed to split PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAll = async () => {
    if (results && results.length > 0) {
      if (results.length === 1) {
        downloadFile(results[0].data, results[0].name);
      } else {
        await downloadAsZip(results, `${file?.name.replace(".pdf", "")}_split.zip`);
      }
      toast.success("Download started!");
    }
  };

  const handleDownloadSingle = (index: number) => {
    if (results && results[index]) {
      downloadFile(results[index].data, results[index].name);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPageCount(0);
    setResults(null);
    setProgress(0);
    setRanges([{ start: 1, end: 1 }]);
  };

  return (
    <ToolLayout
      title="Split PDF"
      description="Extract pages or split your PDF into multiple files"
      icon={<Scissors className="w-8 h-8 text-white" />}
      iconColor="from-pink-500 to-rose-600"
    >
      <div className="space-y-6">
        {/* File Drop Zone */}
        {!file && (
          <FileDropZone
            onFilesSelected={handleFileSelected}
            accept=".pdf"
            multiple={false}
            disabled={isProcessing}
          />
        )}

        {/* File Info & Options */}
        {file && !results && (
          <>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {pageCount} page{pageCount !== 1 ? "s" : ""} • {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    disabled={isProcessing}
                  >
                    Change file
                  </Button>
                </div>

                <Tabs value={splitMode} onValueChange={(v) => setSplitMode(v as "all" | "ranges")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="all">Split All Pages</TabsTrigger>
                    <TabsTrigger value="ranges">Custom Ranges</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="mt-4">
                    <p className="text-muted-foreground">
                      Split the PDF into {pageCount} individual page{pageCount !== 1 ? "s" : ""}.
                      Each page will be saved as a separate PDF file.
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="ranges" className="mt-4 space-y-4">
                    <p className="text-muted-foreground mb-4">
                      Define custom page ranges to extract specific sections.
                    </p>
                    
                    {ranges.map((range, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">From</Label>
                            <Input
                              type="number"
                              min={1}
                              max={pageCount}
                              value={range.start}
                              onChange={(e) => handleRangeChange(index, "start", parseInt(e.target.value) || 1)}
                              className="bg-secondary"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">To</Label>
                            <Input
                              type="number"
                              min={1}
                              max={pageCount}
                              value={range.end}
                              onChange={(e) => handleRangeChange(index, "end", parseInt(e.target.value) || 1)}
                              className="bg-secondary"
                            />
                          </div>
                        </div>
                        {ranges.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveRange(index)}
                            className="mt-5 text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddRange}
                      className="w-full bg-transparent"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Range
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}

        {/* Processing Progress */}
        {isProcessing && (
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="font-medium">Splitting PDF...</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                {Math.round(progress)}% complete
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results && (
          <Card className="bg-card border-border gradient-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Split Complete!</h3>
                  <p className="text-muted-foreground">
                    Created {results.length} file{results.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">{result.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(result.data.length / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadSingle(index)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3">
                <Button
                  className="flex-1 gradient-primary border-0"
                  onClick={handleDownloadAll}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download {results.length > 1 ? "All (ZIP)" : "PDF"}
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent"
                  onClick={handleReset}
                >
                  Split Another
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        {file && !results && !isProcessing && (
          <Button
            size="lg"
            className="w-full gradient-primary border-0 h-14 text-lg"
            onClick={handleSplit}
          >
            <Scissors className="w-5 h-5 mr-2" />
            {splitMode === "all" 
              ? `Split into ${pageCount} Pages` 
              : `Extract ${ranges.length} Range${ranges.length !== 1 ? "s" : ""}`
            }
          </Button>
        )}
      </div>
    </ToolLayout>
  );
}
