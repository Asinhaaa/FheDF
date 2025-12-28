import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
  className?: string;
  disabled?: boolean;
  selectedFiles?: File[];
  onRemoveFile?: (index: number) => void;
}

export function FileDropZone({
  onFilesSelected,
  accept = ".pdf",
  multiple = true,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB default
  className,
  disabled = false,
  selectedFiles = [],
  onRemoveFile
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = useCallback((files: File[]): File[] => {
    setError(null);
    
    if (!multiple && files.length > 1) {
      setError("Only one file allowed");
      return [files[0]];
    }

    if (files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return files.slice(0, maxFiles);
    }

    const validFiles: File[] = [];
    for (const file of files) {
      if (file.size > maxSize) {
        setError(`File "${file.name}" exceeds maximum size of ${Math.round(maxSize / 1024 / 1024)}MB`);
        continue;
      }
      
      const acceptedTypes = accept.split(",").map(t => t.trim());
      const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
      const isValidType = acceptedTypes.some(type => {
        if (type.startsWith(".")) {
          return fileExtension === type.toLowerCase();
        }
        return file.type.match(type.replace("*", ".*"));
      });

      if (!isValidType) {
        setError(`File "${file.name}" is not a valid type`);
        continue;
      }

      validFiles.push(file);
    }

    return validFiles;
  }, [accept, maxFiles, maxSize, multiple]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(files);
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  }, [disabled, onFilesSelected, validateFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = validateFiles(files);
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
    // Reset input
    e.target.value = "";
  }, [onFilesSelected, validateFiles]);

  return (
    <div className={cn("w-full space-y-6", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "drop-zone relative overflow-hidden rounded-2xl p-12 text-center cursor-pointer transition-all duration-300",
          isDragging ? "active scale-[0.99]" : "hover:bg-white/5",
          selectedFiles.length > 0 ? "border-primary/50 bg-primary/5" : "bg-card",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
        
        <AnimatePresence mode="wait">
          {isDragging ? (
            <motion.div
              key="active"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                <Upload className="w-10 h-10 text-primary animate-bounce" />
              </div>
              <p className="text-xl font-bold text-primary">Drop files here</p>
            </motion.div>
          ) : (
            <motion.div
              key="inactive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <p className="text-xl font-bold mb-1">
                  {multiple ? "Choose files or drag here" : "Choose a file or drag here"}
                </p>
                <p className="text-muted-foreground">
                  {multiple ? `Up to ${maxFiles} PDF files` : "Select a PDF file to get started"}
                </p>
              </div>
              <Button variant="outline" className="mt-4 border-primary/50 text-primary hover:bg-primary hover:text-black font-bold">
                Select Files
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <FileText className="w-24 h-24" />
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-auto hover:bg-destructive/20 rounded p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Selected Files List */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black tracking-widest text-muted-foreground uppercase">
                Selected Files ({selectedFiles.length})
              </h3>
            </div>
            
            <div className="grid gap-3">
              {selectedFiles.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border group hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm truncate max-w-[200px] sm:max-w-md">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {onRemoveFile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFile(index);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Keep FileList for compatibility if needed elsewhere
export function FileList({ files, onRemove, className }: { files: File[], onRemove: (index: number) => void, className?: string }) {
  if (files.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {files.map((file, index) => (
        <div
          key={`${file.name}-${index}`}
          className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onRemove(index)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
