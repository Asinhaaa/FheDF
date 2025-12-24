import { useCallback, useState } from "react";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
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
}

export function FileDropZone({
  onFilesSelected,
  accept = ".pdf",
  multiple = true,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB default
  className,
  disabled = false
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
    <div className={cn("relative", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "drop-zone rounded-xl p-8 md:p-12 text-center transition-all duration-300",
          isDragging && "active",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "cursor-pointer"
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
        
        <div className="flex flex-col items-center gap-4">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
            isDragging ? "bg-primary/20 scale-110" : "bg-secondary"
          )}>
            <Upload className={cn(
              "w-8 h-8 transition-colors duration-300",
              isDragging ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          
          <div>
            <p className="text-lg font-medium mb-1">
              {isDragging ? "Drop files here" : "Drag & drop PDF files here"}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse • Max {Math.round(maxSize / 1024 / 1024)}MB per file
              {multiple && ` • Up to ${maxFiles} files`}
            </p>
          </div>

          <Button 
            variant="outline" 
            className="mt-2 bg-transparent"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById("file-input")?.click();
            }}
          >
            <FileText className="w-4 h-4 mr-2" />
            Select Files
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-auto hover:bg-destructive/20 rounded p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

interface FileListProps {
  files: File[];
  onRemove: (index: number) => void;
  className?: string;
}

export function FileList({ files, onRemove, className }: FileListProps) {
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
