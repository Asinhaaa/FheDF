import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Lock, ShieldCheck, RefreshCw, CheckCircle2, AlertCircle, Key, FileText, Zap, Loader2, Shield, Clock, Database, Cpu, TrendingUp } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileDropZone } from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  initializeFHE,
  encryptDocumentEnhanced, 
  searchEncryptedEnhanced, 
  cleanup,
  isFheInitialized,
  getPerformanceMetrics
} from "@/lib/fheServiceEnhanced";
import { getEncryptedTokens, setEncryptedTokens } from "@/lib/keyStorage";
import { extractTextFromPdf, getPdfPageCount } from "@/lib/pdfUtils";
import { toast } from "sonner";

interface SearchResultWithContext {
  batchIndex: number;
  matchCount: number;
  positions: number[];
  context?: string[];
}

interface PerformanceMetrics {
  encryptionTime: number;
  searchTime: number;
  totalTokens: number;
  batchCount: number;
  slotCount: number;
}

export default function EncryptedSearchEnhanced() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const [encryptedBatches, setEncryptedBatches] = useState<string[]>([]);
  const [originalText, setOriginalText] = useState("");
  const [results, setResults] = useState<SearchResultWithContext[] | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
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
    setOriginalText("");
    
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
        setOriginalText(text.join(' '));
        setProgress(100);
        toast.success("Loaded from cache!");
      } else {
        setStatus("Encrypting document with FHE...");
        const { encryptedBatches: encrypted, originalText: origText, metrics: encMetrics } = 
          await encryptDocumentEnhanced(text, (p) => setProgress(50 + p * 0.5));
        
        setEncryptedBatches(encrypted);
        setOriginalText(origText);
        setMetrics(encMetrics);
        
        await setEncryptedTokens(documentId, encrypted);
        toast.success(`Document encrypted! ${encMetrics.totalTokens} tokens in ${(encMetrics.encryptionTime / 1000).toFixed(2)}s`);
      }
    } catch (error) {
      console.error("Processing error:", error);
      toast.error("Failed to process PDF.");
    } finally {
      setIsProcessing(false);
      setStatus("");
    }
  }, [fheReady]);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setEncryptedBatches([]);
    setOriginalText("");
    setResults(null);
    setMetrics(null);
  }, []);

  const handleSearch = async () => {
    if (!query.trim() || encryptedBatches.length === 0) return;

    setIsSearching(true);
    setProgress(0);

    try {
      const { results: searchResults, metrics: searchMetrics } = await searchEncryptedEnhanced(
        encryptedBatches,
        originalText,
        query.toLowerCase(),
        setProgress
      );

      setResults(searchResults);
      setMetrics(searchMetrics);
      
      if (searchResults.length > 0) {
        const totalMatches = searchResults.reduce((sum, r) => sum + r.matchCount, 0);
        toast.success(`Found ${totalMatches} matches in ${(searchMetrics.searchTime / 1000).toFixed(2)}s!`);
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
    setOriginalText("");
    setResults(null);
    setQuery("");
    setProgress(0);
    setMetrics(null);
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
            <div className="absolute top-0 left-0 w-1 h-full bg-primary glow-pulse" />
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start gap-4">
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
                  animate={isInitializing ? { rotate: 360 } : {}}
                  transition={{ duration: 2, repeat: isInitializing ? Infinity : 0, ease: "linear" }}
                >
                  {isInitializing ? (
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  ) : fheReady ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : initError ? (
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  ) : (
                    <Shield className="w-6 h-6 text-primary" />
                  )}
                </motion.div>
                <div className="flex-1">
                  <h3 className="font-black tracking-tight mb-1 text-base md:text-lg">
                    {isInitializing 
                      ? "INITIALIZING FHE ENGINE..." 
                      : initError 
                      ? "ENCRYPTION ERROR" 
                      : "FULLY HOMOMORPHIC ENCRYPTION"}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {isInitializing
                      ? "Setting up encryption keys and parameters using Microsoft SEAL..."
                      : initError
                      ? `Error: ${initError}. Please refresh the page.`
                      : "Your search query is encrypted before processing. The search is performed on encrypted data using node-seal (Microsoft SEAL), and results are decrypted only on your device. This implementation follows Zama's FHE best practices."}
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
                      <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-black text-[10px] tracking-widest">
                        <Cpu className="w-3 h-3 mr-1" />
                        BFV SCHEME
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
                    <h3 className="text-xl md:text-2xl font-black">{status || "Processing..."}</h3>
                    <p className="text-sm md:text-base text-muted-foreground">Using Microsoft SEAL to perform homomorphic encryption.</p>
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
              <div className="p-6 md:p-8 rounded-2xl bg-card border border-primary/30 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary/30" />
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm md:text-base break-all">{file.name}</h3>
                      <p className="text-xs text-muted-foreground">{pageCount} pages • {encryptedBatches.length} encrypted batches</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-primary font-bold text-xs md:text-sm">
                    Change File
                  </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Enter search term (supports multiple words)..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="h-12 md:h-14 pl-12 bg-secondary border-border font-bold text-base md:text-lg focus:ring-primary"
                      disabled={isSearching}
                    />
                  </div>
                  <Button
                    size="lg"
                    onClick={handleSearch}
                    disabled={isSearching || !query.trim()}
                    className="h-12 md:h-14 px-6 md:px-8 gradient-primary text-black font-black rounded-xl click-animation button-press"
                  >
                    {isSearching ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Search"}
                  </Button>
                </div>

                {isSearching && (
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex items-center justify-center gap-3 text-primary animate-pulse">
                      <Lock className="w-4 h-4" />
                      <span className="text-xs md:text-sm font-black tracking-widest uppercase">Performing Homomorphic Comparison...</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-secondary" />
                  </motion.div>
                )}
              </div>

              {/* Performance Metrics */}
              {metrics && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
                >
                  <Card className="bg-secondary/30 border-border">
                    <CardContent className="pt-4 md:pt-6 space-y-2">
                      <div className="flex items-center gap-2 text-primary">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-black uppercase">Encryption</span>
                      </div>
                      <p className="text-lg md:text-2xl font-black">{(metrics.encryptionTime / 1000).toFixed(2)}s</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-secondary/30 border-border">
                    <CardContent className="pt-4 md:pt-6 space-y-2">
                      <div className="flex items-center gap-2 text-green-500">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-black uppercase">Search</span>
                      </div>
                      <p className="text-lg md:text-2xl font-black">{(metrics.searchTime / 1000).toFixed(2)}s</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-secondary/30 border-border">
                    <CardContent className="pt-4 md:pt-6 space-y-2">
                      <div className="flex items-center gap-2 text-blue-500">
                        <Database className="w-4 h-4" />
                        <span className="text-xs font-black uppercase">Tokens</span>
                      </div>
                      <p className="text-lg md:text-2xl font-black">{metrics.totalTokens}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-secondary/30 border-border">
                    <CardContent className="pt-4 md:pt-6 space-y-2">
                      <div className="flex items-center gap-2 text-purple-500">
                        <Cpu className="w-4 h-4" />
                        <span className="text-xs font-black uppercase">Batches</span>
                      </div>
                      <p className="text-lg md:text-2xl font-black">{metrics.batchCount}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <AnimatePresence>
                {results && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 md:p-8 rounded-2xl bg-secondary/30 border border-border space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-black tracking-widest text-muted-foreground uppercase text-xs">Search Results</h4>
                      {results.length > 0 && (
                        <Badge className="bg-primary text-black font-black">
                          {results.reduce((sum, r) => sum + r.matchCount, 0)} TOTAL MATCHES
                        </Badge>
                      )}
                    </div>

                    {results.length > 0 ? (
                      <div className="space-y-4">
                        {results.map((result, idx) => (
                          <motion.div 
                            key={result.batchIndex}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-4 md:p-6 rounded-xl bg-card border border-primary/20 space-y-4"
                          >
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-primary" />
                                <span className="font-bold text-sm md:text-base">Batch {result.batchIndex + 1}</span>
                              </div>
                              <Badge className="bg-primary text-black font-black text-xs">{result.matchCount} MATCHES</Badge>
                            </div>
                            
                            {result.context && result.context.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Context Preview:</p>
                                {result.context.map((ctx, ctxIdx) => (
                                  <div key={ctxIdx} className="p-3 rounded-lg bg-secondary/50 border border-border">
                                    <p className="text-xs md:text-sm text-muted-foreground font-mono break-words">{ctx}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 space-y-2">
                        <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto" />
                        <p className="font-bold text-muted-foreground">No matches found in the encrypted document.</p>
                      </div>
                    )}
                    
                    <div className="pt-4 flex justify-center">
                      <Button variant="outline" onClick={handleReset} className="font-bold border-white/10 hover:bg-white/5 click-animation">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-12">
          <motion.div 
            className="p-4 md:p-6 rounded-xl bg-secondary/30 border border-border flex gap-4"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Key className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-bold mb-1 text-sm md:text-base">End-to-End Encryption</h4>
              <p className="text-xs md:text-sm text-muted-foreground">Your search query is encrypted before it ever touches the document. The comparison happens entirely in the encrypted domain using BFV scheme.</p>
            </div>
          </motion.div>
          <motion.div 
            className="p-4 md:p-6 rounded-xl bg-secondary/30 border border-border flex gap-4"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h4 className="font-bold mb-1 text-sm md:text-base">Zero-Knowledge Search</h4>
              <p className="text-xs md:text-sm text-muted-foreground">Neither the browser nor any server ever sees your plaintext document or your search terms. Only you hold the decryption key stored locally in IndexedDB.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </ToolLayout>
  );
}
