import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileDropZone } from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Minimize2, 
  Download, 
  Loader2, 
  CheckCircle2, 
  FileText,
  Zap,
  Scale,
  Gem
} from "lucide-react";
import { compressPdf, downloadFile } from "@/lib/pdfUtils";
import { toast } from "sonner";

type CompressionQuality = "low" | "medium" | "high";

const qualityOptions = [
  {
    value: "low" as CompressionQuality,
    label: "Maximum Compression",
    description: "Smallest file size, some quality loss",
    icon: Zap,
  },
  {
    value: "medium" as CompressionQuality,
    label: "Balanced",
    description: "Good compression with minimal quality loss",
    icon: Scale,
  },
  {
    value: "high" as CompressionQuality,
    label: "High Quality",
    description: "Preserve quality, moderate compression",
    icon: Gem,
  },
];

export default function CompressPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<CompressionQuality>("medium");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ data: Uint8Array; originalSize: number } | null>(null);

  const handleFileSelected = useCallback((files: File[]) => {
    setFile(files[0]);
    setResult(null);
  }, []);

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const compressed = await compressPdf(file, quality, setProgress);
      setResult({
        data: compressed,
        originalSize: file.size,
      });
      
      const reduction = ((file.size - compressed.length) / file.size * 100).toFixed(1);
      toast.success(`PDF compressed! Reduced by ${reduction}%`);
    } catch (error) {
      console.error("Compression error:", error);
      toast.error("Failed to compress PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      const newName = file?.name.replace(".pdf", "_compressed.pdf") || "compressed.pdf";
      downloadFile(result.data, newName);
      toast.success("Download started!");
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
  };

  const compressionRatio = result 
    ? ((result.originalSize - result.data.length) / result.originalSize * 100).toFixed(1)
    : 0;

  return (
    <ToolLayout
      title="Compress PDF"
      description="Reduce PDF file size while maintaining quality"
      icon={<Minimize2 className="w-8 h-8 text-white" />}
      iconColor="from-amber-500 to-orange-600"
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
        {file && !result && (
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
                      {(file.size / 1024 / 1024).toFixed(2)} MB
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

                <div className="space-y-4">
                  <Label className="text-base font-medium">Compression Level</Label>
                  <RadioGroup
                    value={quality}
                    onValueChange={(v) => setQuality(v as CompressionQuality)}
                    className="space-y-3"
                  >
                    {qualityOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-colors cursor-pointer ${
                          quality === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setQuality(option.value)}
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          <option.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor={option.value} className="font-medium cursor-pointer">
                            {option.label}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
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
                <span className="font-medium">Compressing PDF...</span>
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
                  <h3 className="font-semibold text-lg">Compression Complete!</h3>
                  <p className="text-muted-foreground">
                    Reduced by {compressionRatio}%
                  </p>
                </div>
              </div>
              
              {/* Size Comparison */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground mb-1">Original</p>
                  <p className="text-xl font-bold">
                    {(result.originalSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-accent/10">
                  <p className="text-sm text-muted-foreground mb-1">Compressed</p>
                  <p className="text-xl font-bold text-accent">
                    {(result.data.length / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  className="flex-1 gradient-primary border-0"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Compressed PDF
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent"
                  onClick={handleReset}
                >
                  Compress Another
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        {file && !result && !isProcessing && (
          <Button
            size="lg"
            className="w-full gradient-primary border-0 h-14 text-lg"
            onClick={handleCompress}
          >
            <Minimize2 className="w-5 h-5 mr-2" />
            Compress PDF
          </Button>
        )}
      </div>
    </ToolLayout>
  );
}
