import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Lock, ShieldCheck, RefreshCw, CheckCircle2, AlertCircle, Key, FileText, Zap, Loader2, Shield } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileDropZone } from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  initializeFHE,
  encryptDocument, 
  searchEncrypted, 
  cleanup,
  isFheInitialized
} from "@/lib/fheService";
import { getEncryptedTokens, setEncryptedTokens } from "@/lib/keyStorage";
import { extractTextFromPdf, getPdfPageCount } from "@/lib/pdfUtils";
import { toast } from "sonner";

interface SearchResult {
  batchIndex: number;
  matchCount: number;
}

export default function EncryptedSearch() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const [encryptedBatches, setEncryptedBatches] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [fheReady, setFheReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize FHE on mount
  useEffect(() => {
    const init = async () => {
      setIsInitializing(true);
      try {
        await initializeFHE();
        setFheReady(true);
        toast.success("FHE engine ready!");
      } catch (error) {
        console.error("FHE Init error:", error);
        setInitError(error instanceof Error ? error.message : "Unknown error");
        toast.error("Failed to initialize FHE engine.");
      } finally {
        setIsInitializing(false);
      }
    };
    init();
    return () => cleanup();
  }, []);

  const handleFileSelected = useCallback(async (files: File[]) => {
    if (!fheReady) {
      toast.error("Encryption not ready yet. Please wait.");
      return;
    }

    const selectedFile = files[0];
    setFile(selectedFile);
    setResults(null);
    setEncryptedBatches([]);
    
    try {
      const count = await getPdfPageCount(selectedFile);
      setPageCount(count);
      
      setIsProcessing(true);
      setProgress(0);
      setStatus("Extracting text from PDF...");
      
      const text = await extractTextFromPdf(selectedFile, (p) => setProgress(p * 0.5));

      // Check cache
      const documentId = `${selectedFile.name}-${selectedFile.size}`;
      const cached = await getEncryptedTokens(documentId);

      if (cached) {
        setEncryptedBatches(cached.encryptedBatches);
        setProgress(100);
        toast.success("Loaded from cache!");
      } else {
        setStatus("Encrypting document with FHE...");
        const encrypted = await encryptDocument(text, (p) => setProgress(50 + p * 0.5));
        setEncryptedBatches(encrypted);
        await setEncryptedTokens(documentId, encrypted);
        toast.success("Document encrypted with FHE!");
      }
    } catch (error) {
      console.error("Processing error:", error);
      toast.error("Failed to process PDF.");
    } finally {
      setIsProcessing(false);
      setStatus("");
    }
  }, [fheReady]);

  const handleSearch = async () => {
    if (!query.trim() || encryptedBatches.length === 0) return;

    setIsSearching(true);
    setProgress(0);

    try {
      const searchResults = await searchEncrypted(
        encryptedBatches,
        query.toLowerCase(),
        setProgress
      );

      setResults(searchResults);
      
      if (searchResults.length > 0) {
        const totalMatches = searchResults.reduce((sum, r) => sum + r.matchCount, 0);
        toast.success(`Found ${totalMatches} matches!`);
      } else {
        toast.info("No matches found.");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Homomorphic search failed.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setEncryptedBatches([]);
    setResults(null);
    setQuery("");
    setProgress(0);
  };

  return (
    <ToolLayout
      title="Encrypted Search"
      description="Search inside your PDF documents using Fully Homomorphic Encryption. Your data remains encrypted even during the search process."
      isFhe={true}
      badge="FHE PRIVACY"
    >
      <div className="space-y-8">
        {/* FHE Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-primary/5 border-primary/20 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  {isInitializing ? (
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  ) : fheReady ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : initError ? (
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  ) : (
                    <Shield className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-black tracking-tight mb-1">
                    {isInitializing 
                      ? "INITIALIZING FHE ENGINE..." 
                      : initError 
                      ? "ENCRYPTION ERROR" 
                      : "FULLY HOMOMORPHIC ENCRYPTION"}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {isInitializing
                      ? "Setting up encryption keys and parameters using Microsoft SEAL..."
                      : initError
                      ? `Error: ${initError}. Please refresh the page.`
                      : "Your search query is encrypted before processing. The search is performed on encrypted data using node-seal (Microsoft SEAL), and results are decrypted only on your device."}
                  </p>
                  {fheReady && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-black text-[10px] tracking-widest">
                        <Lock className="w-3 h-3 mr-1" />
                        ENCRYPTED QUERY
                      </Badge>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20 font-black text-[10px] tracking-widest">
                        <Key className="w-3 h-3 mr-1" />
                        KEYS LOADED
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
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
                disabled={isProcessing || !fheReady}
              />

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
                    <h3 className="text-2xl font-black">{status || "Processing..."}</h3>
                    <p className="text-muted-foreground">Using Microsoft SEAL to perform homomorphic encryption.</p>
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
              key="search"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="p-8 rounded-2xl bg-card border border-primary/30 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary/30" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-bold">{file.name}</h3>
                      <p className="text-xs text-muted-foreground">{pageCount} pages • {encryptedBatches.length} encrypted batches</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-primary font-bold">
                    Change File
                  </Button>
                </div>

                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Enter search term..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="h-14 pl-12 bg-secondary border-border font-bold text-lg focus:ring-primary"
                      disabled={isSearching}
                    />
                  </div>
                  <Button
                    size="lg"
                    onClick={handleSearch}
                    disabled={isSearching || !query.trim()}
                    className="h-14 px-8 font-black rounded-xl gradient-primary border-0 text-black hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    {isSearching ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Search"}
                  </Button>
                </div>

                {isSearching && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3 text-primary animate-pulse">
                      <Lock className="w-4 h-4" />
                      <span className="text-sm font-black tracking-widest uppercase">Performing Homomorphic Comparison...</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-secondary" />
                  </div>
                )}
              </div>

              <AnimatePresence>
                {results && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 rounded-2xl bg-secondary/30 border border-border space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-black tracking-widest text-muted-foreground uppercase text-xs">Search Results</h4>
                    </div>

                    {results.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {results.map((result) => (
                          <div key={result.batchIndex} className="p-4 rounded-xl bg-card border border-primary/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-primary" />
                              <span className="font-bold">Batch {result.batchIndex + 1}</span>
                            </div>
                            <Badge className="bg-primary text-black font-black">{result.matchCount} MATCHES</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 space-y-2">
                        <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto" />
                        <p className="font-bold text-muted-foreground">No matches found in the encrypted document.</p>
                      </div>
                    )}
                    
                    <div className="pt-4 flex justify-center">
                      <Button variant="outline" onClick={handleReset} className="font-bold border-white/10 hover:bg-white/5">
                        Search Another Document <RefreshCw className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Technical Info */}
        <div className="grid md:grid-cols-2 gap-6 pt-12">
          <div className="p-6 rounded-xl bg-secondary/30 border border-border flex gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Key className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-bold mb-1">End-to-End Encryption</h4>
              <p className="text-sm text-muted-foreground">Your search query is encrypted before it ever touches the document. The comparison happens entirely in the encrypted domain.</p>
            </div>
          </div>
          <div className="p-6 rounded-xl bg-secondary/30 border border-border flex gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h4 className="font-bold mb-1">Zero-Knowledge Search</h4>
              <p className="text-sm text-muted-foreground">Neither the browser nor any server ever sees your plaintext document or your search terms. Only you hold the decryption key.</p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
