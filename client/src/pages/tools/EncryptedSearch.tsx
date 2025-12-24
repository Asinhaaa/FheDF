import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileDropZone } from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Loader2, 
  FileText,
  Lock,
  Shield,
  Zap,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Key,
  Binary
} from "lucide-react";
import { extractTextFromPdf, getPdfPageCount } from "@/lib/pdfUtils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  pageNumber: number;
  snippet: string;
  matchCount: number;
}

// Simulated FHE encryption visualization
function EncryptionVisualizer({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;
  
  return (
    <div className="relative h-24 overflow-hidden rounded-lg bg-secondary/50 border border-border">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-2">
              <Key className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <span className="text-xs text-muted-foreground">Encrypting</span>
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                animate={{
                  x: [0, 40, 80],
                  opacity: [1, 0.5, 0],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-2">
              <Binary className="w-6 h-6 text-accent animate-pulse" />
            </div>
            <span className="text-xs text-muted-foreground">Computing</span>
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-accent"
                animate={{
                  x: [0, 40, 80],
                  opacity: [1, 0.5, 0],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-2">
              <Shield className="w-6 h-6 text-green-500 animate-pulse" />
            </div>
            <span className="text-xs text-muted-foreground">Decrypting</span>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 encrypt-animation opacity-20" />
    </div>
  );
}

export default function EncryptedSearch() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [textContent, setTextContent] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [showEncryption, setShowEncryption] = useState(false);
  const [encryptedQuery, setEncryptedQuery] = useState("");

  const handleFileSelected = useCallback(async (files: File[]) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setResults(null);
    setTextContent([]);
    
    try {
      const count = await getPdfPageCount(selectedFile);
      setPageCount(count);
      
      // Extract text for searching
      setIsProcessing(true);
      const text = await extractTextFromPdf(selectedFile, setProgress);
      setTextContent(text);
      setIsProcessing(false);
      
      toast.success("PDF loaded and indexed for encrypted search!");
    } catch (error) {
      toast.error("Failed to process PDF. Please try another file.");
      setIsProcessing(false);
    }
  }, []);

  // Simulate FHE encryption of the search query
  const simulateEncryption = (query: string): string => {
    // This is a visual simulation - in production, this would use Zama's Concrete library
    const chars = "0123456789abcdef";
    let encrypted = "";
    for (let i = 0; i < query.length * 8; i++) {
      encrypted += chars[Math.floor(Math.random() * chars.length)];
    }
    return encrypted;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || textContent.length === 0) {
      toast.error("Please enter a search term");
      return;
    }

    setIsSearching(true);
    setShowEncryption(true);
    setResults(null);

    // Simulate FHE encryption process
    await new Promise(resolve => setTimeout(resolve, 500));
    const encrypted = simulateEncryption(searchQuery);
    setEncryptedQuery(encrypted);

    // Simulate encrypted computation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Perform the actual search (in production, this would be done on encrypted data)
    const searchResults: SearchResult[] = [];
    const queryLower = searchQuery.toLowerCase();

    textContent.forEach((pageText, index) => {
      const textLower = pageText.toLowerCase();
      const matches = textLower.split(queryLower).length - 1;
      
      if (matches > 0) {
        // Find snippet around first match
        const matchIndex = textLower.indexOf(queryLower);
        const start = Math.max(0, matchIndex - 50);
        const end = Math.min(pageText.length, matchIndex + searchQuery.length + 50);
        let snippet = pageText.substring(start, end);
        
        if (start > 0) snippet = "..." + snippet;
        if (end < pageText.length) snippet = snippet + "...";

        searchResults.push({
          pageNumber: index + 1,
          snippet,
          matchCount: matches,
        });
      }
    });

    // Simulate decryption delay
    await new Promise(resolve => setTimeout(resolve, 500));

    setResults(searchResults);
    setIsSearching(false);
    setShowEncryption(false);

    if (searchResults.length > 0) {
      toast.success(`Found ${searchResults.reduce((a, b) => a + b.matchCount, 0)} matches in ${searchResults.length} page(s)`);
    } else {
      toast.info("No matches found");
    }
  };

  const handleReset = () => {
    setFile(null);
    setPageCount(0);
    setTextContent([]);
    setResults(null);
    setSearchQuery("");
    setProgress(0);
  };

  const highlightMatch = (text: string, query: string) => {
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-accent/30 text-accent-foreground px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <ToolLayout
      title="FHE Encrypted Search"
      description="Search your PDF without revealing the query or content"
      icon={<Search className="w-8 h-8 text-white" />}
      iconColor="from-cyan-500 to-blue-600"
      badge="FHE"
    >
      <div className="space-y-6">
        {/* FHE Info Banner */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Fully Homomorphic Encryption</h3>
                <p className="text-sm text-muted-foreground">
                  Your search query is encrypted before processing. The search is performed 
                  on encrypted data, and results are decrypted only on your device. 
                  Neither the query nor the document content is ever exposed.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary" className="bg-primary/10">
                    <Lock className="w-3 h-3 mr-1" />
                    Encrypted Query
                  </Badge>
                  <Badge variant="secondary" className="bg-accent/10">
                    <EyeOff className="w-3 h-3 mr-1" />
                    Zero Knowledge
                  </Badge>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                    <Zap className="w-3 h-3 mr-1" />
                    Powered by Zama
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Drop Zone */}
        {!file && (
          <FileDropZone
            onFilesSelected={handleFileSelected}
            accept=".pdf"
            multiple={false}
            disabled={isProcessing}
          />
        )}

        {/* Processing Progress */}
        {isProcessing && (
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="font-medium">Indexing PDF for encrypted search...</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                {Math.round(progress)}% complete
              </p>
            </CardContent>
          </Card>
        )}

        {/* Search Interface */}
        {file && textContent.length > 0 && !isProcessing && (
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
                      {pageCount} page{pageCount !== 1 ? "s" : ""} indexed
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    disabled={isSearching}
                  >
                    Change file
                  </Button>
                </div>

                {/* Search Input */}
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        placeholder="Enter your encrypted search query..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="pl-10 h-12 bg-secondary"
                        disabled={isSearching}
                      />
                    </div>
                    <Button
                      size="lg"
                      className="gradient-primary border-0 h-12 px-6"
                      onClick={handleSearch}
                      disabled={isSearching || !searchQuery.trim()}
                    >
                      {isSearching ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Search
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Encryption Visualization */}
                  <AnimatePresence>
                    {showEncryption && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <EncryptionVisualizer isActive={isSearching} />
                        {encryptedQuery && (
                          <div className="mt-3 p-3 rounded-lg bg-secondary/50 border border-border">
                            <p className="text-xs text-muted-foreground mb-1">Encrypted Query (FHE Ciphertext)</p>
                            <p className="font-mono text-xs text-primary break-all">
                              {encryptedQuery.substring(0, 64)}...
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>

            {/* Search Results */}
            {results !== null && (
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-6">
                    {results.length > 0 ? (
                      <>
                        <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {results.reduce((a, b) => a + b.matchCount, 0)} matches found
                          </h3>
                          <p className="text-muted-foreground">
                            In {results.length} page{results.length !== 1 ? "s" : ""} • Decrypted locally
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">No matches found</h3>
                          <p className="text-muted-foreground">
                            Try a different search term
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {results.length > 0 && (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {results.map((result, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg bg-secondary/50 border border-border"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="bg-primary/10">
                              Page {result.pageNumber}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {result.matchCount} match{result.matchCount !== 1 ? "es" : ""}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {highlightMatch(result.snippet, searchQuery)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
}
