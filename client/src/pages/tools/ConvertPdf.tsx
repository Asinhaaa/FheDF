import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileDropZone } from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  RefreshCw, 
  Download, 
  Loader2, 
  CheckCircle2, 
  FileText,
  Image,
  FileImage
} from "lucide-react";
import { convertPdfToImages, downloadAsZip, downloadFile } from "@/lib/pdfUtils";
import { toast } from "sonner";

type OutputFormat = "png" | "jpeg";

export default function ConvertPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<OutputFormat>("png");
  const [scale, setScale] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ name: string; data: Blob }[] | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileSelected = useCallback((files: File[]) => {
    setFile(files[0]);
    setResults(null);
    setPreviews([]);
  }, []);

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const images = await convertPdfToImages(file, format, scale, setProgress);
      setResults(images);
      
      // Generate previews for first few images
      const previewUrls = await Promise.all(
        images.slice(0, 4).map(img => URL.createObjectURL(img.data))
      );
      setPreviews(previewUrls);
      
      toast.success(`Converted ${images.length} page${images.length !== 1 ? "s" : ""} to ${format.toUpperCase()}!`);
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error("Failed to convert PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAll = async () => {
    if (results && results.length > 0) {
      if (results.length === 1) {
        const url = URL.createObjectURL(results[0].data);
        const a = document.createElement("a");
        a.href = url;
        a.download = results[0].name;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        await downloadAsZip(
          results.map(r => ({ name: r.name, data: r.data })),
          `${file?.name.replace(".pdf", "")}_images.zip`
        );
      }
      toast.success("Download started!");
    }
  };

  const handleReset = () => {
    // Clean up preview URLs
    previews.forEach(url => URL.revokeObjectURL(url));
    setFile(null);
    setResults(null);
    setPreviews([]);
    setProgress(0);
  };

  return (
    <ToolLayout
      title="Convert PDF"
      description="Convert PDF pages to high-quality images"
      icon={<RefreshCw className="w-8 h-8 text-white" />}
      iconColor="from-emerald-500 to-teal-600"
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

                <div className="space-y-6">
                  {/* Format Selection */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Output Format</Label>
                    <RadioGroup
                      value={format}
                      onValueChange={(v) => setFormat(v as OutputFormat)}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div
                        className={`flex items-center gap-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                          format === "png"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setFormat("png")}
                      >
                        <RadioGroupItem value="png" id="png" />
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          <Image className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <Label htmlFor="png" className="font-medium cursor-pointer">PNG</Label>
                          <p className="text-xs text-muted-foreground">Lossless, transparent</p>
                        </div>
                      </div>
                      
                      <div
                        className={`flex items-center gap-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                          format === "jpeg"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setFormat("jpeg")}
                      >
                        <RadioGroupItem value="jpeg" id="jpeg" />
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          <FileImage className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <Label htmlFor="jpeg" className="font-medium cursor-pointer">JPEG</Label>
                          <p className="text-xs text-muted-foreground">Smaller size</p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Quality/Scale Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Image Quality</Label>
                      <span className="text-sm text-muted-foreground">{scale}x resolution</span>
                    </div>
                    <Slider
                      value={[scale]}
                      onValueChange={([v]) => setScale(v)}
                      min={1}
                      max={4}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Smaller files</span>
                      <span>Higher quality</span>
                    </div>
                  </div>
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
                <span className="font-medium">Converting PDF to images...</span>
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
                  <h3 className="font-semibold text-lg">Conversion Complete!</h3>
                  <p className="text-muted-foreground">
                    {results.length} {format.toUpperCase()} image{results.length !== 1 ? "s" : ""} created
                  </p>
                </div>
              </div>
              
              {/* Image Previews */}
              {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {previews.map((url, index) => (
                    <div
                      key={index}
                      className="aspect-[3/4] rounded-lg overflow-hidden bg-secondary border border-border"
                    >
                      <img
                        src={url}
                        alt={`Page ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {results.length > 4 && (
                    <div className="aspect-[3/4] rounded-lg bg-secondary border border-border flex items-center justify-center">
                      <span className="text-muted-foreground">
                        +{results.length - 4} more
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-3">
                <Button
                  className="flex-1 gradient-primary border-0"
                  onClick={handleDownloadAll}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download {results.length > 1 ? "All (ZIP)" : "Image"}
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent"
                  onClick={handleReset}
                >
                  Convert Another
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
            onClick={handleConvert}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Convert to {format.toUpperCase()}
          </Button>
        )}
      </div>
    </ToolLayout>
  );
}
