import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  ArrowLeft, 
  Shield, 
  Lock, 
  Zap, 
  Eye, 
  Server,
  Github,
  ExternalLink,
  BookOpen,
  Code,
  Binary,
  Key,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { Link } from "wouter";

const sections = [
  { id: "overview", title: "Overview" },
  { id: "fhe-technology", title: "FHE Technology" },
  { id: "how-it-works", title: "How It Works" },
  { id: "privacy-guarantees", title: "Privacy Guarantees" },
  { id: "technical-implementation", title: "Technical Implementation" },
  { id: "use-cases", title: "Use Cases" },
  { id: "zama-integration", title: "Zama Integration" },
];

export default function Documentation() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg hidden sm:block">FHE<span className="text-gradient">Pdf</span></span>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <a 
              href="https://github.com/asinhaaa" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="icon">
                <Github className="w-5 h-5" />
              </Button>
            </a>
            <a 
              href="https://www.zama.ai/" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="bg-transparent">
                <Zap className="w-4 h-4 mr-2" />
                Zama
              </Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="container">
          <div className="grid lg:grid-cols-[250px_1fr] gap-8">
            {/* Sidebar Navigation */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-1">
                <p className="text-sm font-medium text-muted-foreground mb-4 px-3">
                  Documentation
                </p>
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-secondary transition-colors"
                  >
                    {section.title}
                  </button>
                ))}
                <div className="pt-4 mt-4 border-t border-border">
                  <a 
                    href="https://docs.zama.ai/concrete" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Zama Concrete Docs
                  </a>
                </div>
              </div>
            </aside>

            {/* Content */}
            <div className="max-w-3xl">
              {/* Header */}
              <div className="mb-12">
                <Badge variant="secondary" className="mb-4 bg-accent/20 text-accent">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Technical Documentation
                </Badge>
                <h1 className="text-4xl font-bold mb-4">
                  Privacy-Preserving PDF Processing with FHE
                </h1>
                <p className="text-xl text-muted-foreground">
                  A comprehensive guide to our implementation of Fully Homomorphic Encryption 
                  for secure document processing and search.
                </p>
              </div>

              {/* Overview Section */}
              <section id="overview" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">Overview</h2>
                <p className="text-muted-foreground mb-6">
                  FHEPdf is a privacy-focused PDF toolkit that processes documents entirely 
                  client-side, ensuring your sensitive files never leave your device. Our 
                  flagship feature—FHE Encrypted Search—uses Fully Homomorphic Encryption 
                  to enable searching within encrypted documents without ever exposing the 
                  search query or document content.
                </p>
                
                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Client-Side Processing</h3>
                          <p className="text-sm text-muted-foreground">
                            All PDF operations run in your browser using WebAssembly
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                          <Lock className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">FHE Encryption</h3>
                          <p className="text-sm text-muted-foreground">
                            Search encrypted data without decryption
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                          <Eye className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Zero Knowledge</h3>
                          <p className="text-sm text-muted-foreground">
                            We never see your files, queries, or results
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                          <Server className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Self-Hostable</h3>
                          <p className="text-sm text-muted-foreground">
                            Deploy on your own infrastructure
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* FHE Technology Section */}
              <section id="fhe-technology" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">FHE Technology</h2>
                <p className="text-muted-foreground mb-6">
                  Fully Homomorphic Encryption (FHE) is a form of encryption that allows 
                  computations to be performed on encrypted data without first decrypting it. 
                  The result of the computation, when decrypted, matches the result of 
                  performing the same computation on the plaintext.
                </p>

                <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 mb-6">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-4">Key Properties of FHE</h3>
                    <ul className="space-y-3">
                      {[
                        {
                          title: "Semantic Security",
                          description: "Encrypted data reveals nothing about the underlying plaintext"
                        },
                        {
                          title: "Homomorphic Operations",
                          description: "Addition and multiplication can be performed on ciphertexts"
                        },
                        {
                          title: "Circuit Privacy",
                          description: "The computation being performed can also be hidden"
                        },
                        {
                          title: "Verifiable Computation",
                          description: "Results can be verified without revealing the input"
                        }
                      ].map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium">{item.title}:</span>{" "}
                            <span className="text-muted-foreground">{item.description}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <p className="text-muted-foreground">
                  Our implementation leverages <strong>TFHE (Torus Fully Homomorphic Encryption)</strong>, 
                  which is particularly well-suited for boolean and integer operations. This makes 
                  it ideal for text search operations where we need to compare characters and 
                  compute match scores.
                </p>
              </section>

              {/* How It Works Section */}
              <section id="how-it-works" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">How It Works</h2>
                <p className="text-muted-foreground mb-6">
                  The FHE Encrypted Search feature follows a three-phase process that ensures 
                  your search query and document content remain private throughout the entire 
                  operation.
                </p>

                <div className="space-y-6">
                  {[
                    {
                      step: 1,
                      title: "Key Generation & Encryption",
                      icon: Key,
                      description: "When you initiate a search, a fresh FHE key pair is generated locally in your browser. Your search query is then encrypted using the public key, producing a ciphertext that reveals nothing about the original query.",
                      code: `// Pseudocode for key generation and encryption
const { publicKey, privateKey } = generateFHEKeyPair();
const encryptedQuery = encrypt(searchQuery, publicKey);
// encryptedQuery is a ciphertext that can be safely processed`
                    },
                    {
                      step: 2,
                      title: "Homomorphic Computation",
                      icon: Binary,
                      description: "The encrypted query is compared against the document index using homomorphic operations. These operations produce encrypted results without ever decrypting the query or revealing which parts of the document matched.",
                      code: `// Pseudocode for homomorphic search
for (const encryptedChar of encryptedQuery) {
  // Homomorphic comparison - works on encrypted data
  const match = homomorphicCompare(encryptedChar, documentIndex);
  encryptedResults.push(match);
}`
                    },
                    {
                      step: 3,
                      title: "Decryption & Results",
                      icon: Shield,
                      description: "The encrypted search results are decrypted locally using your private key. Only then are the matching locations and snippets revealed—and only to you.",
                      code: `// Pseudocode for decryption
const results = decrypt(encryptedResults, privateKey);
// results now contains plaintext match locations
displaySearchResults(results);`
                    }
                  ].map((phase) => (
                    <Card key={phase.step} className="bg-card border-border">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <phase.icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary">Step {phase.step}</Badge>
                              <h3 className="font-semibold">{phase.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {phase.description}
                            </p>
                          </div>
                        </div>
                        <div className="bg-secondary/50 rounded-lg p-4 overflow-x-auto">
                          <pre className="text-xs text-muted-foreground font-mono">
                            {phase.code}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Privacy Guarantees Section */}
              <section id="privacy-guarantees" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">Privacy Guarantees</h2>
                <p className="text-muted-foreground mb-6">
                  PDFZero provides multiple layers of privacy protection to ensure your 
                  sensitive documents remain confidential.
                </p>

                <div className="grid gap-4">
                  {[
                    {
                      title: "No Server Upload",
                      description: "Your PDF files are never uploaded to any server. All processing happens locally in your browser using WebAssembly-compiled libraries.",
                      guarantee: "Files stay on your device"
                    },
                    {
                      title: "Encrypted Queries",
                      description: "Search queries are encrypted before any processing. Even if network traffic were intercepted, the query content would be indecipherable.",
                      guarantee: "Query content is hidden"
                    },
                    {
                      title: "Local Key Management",
                      description: "Encryption keys are generated and stored locally. They never leave your browser and are discarded after each session.",
                      guarantee: "Keys are ephemeral"
                    },
                    {
                      title: "No Logging",
                      description: "We do not log, store, or analyze any user data, search queries, or document content. Our architecture makes this technically impossible.",
                      guarantee: "Zero data retention"
                    }
                  ].map((item, index) => (
                    <Card key={index} className="bg-card border-border">
                      <CardContent className="py-4">
                        <div className="flex items-start gap-4">
                          <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold">{item.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {item.guarantee}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Technical Implementation Section */}
              <section id="technical-implementation" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">Technical Implementation</h2>
                <p className="text-muted-foreground mb-6">
                  Our implementation combines modern web technologies with cutting-edge 
                  cryptographic libraries to deliver a seamless, privacy-preserving experience.
                </p>

                <Card className="bg-card border-border mb-6">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Code className="w-5 h-5 text-primary" />
                      Technology Stack
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-secondary/50">
                        <h4 className="font-medium mb-2">Frontend</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• React 19 with TypeScript</li>
                          <li>• Tailwind CSS 4</li>
                          <li>• PDF.js for rendering</li>
                          <li>• pdf-lib for manipulation</li>
                        </ul>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary/50">
                        <h4 className="font-medium mb-2">Cryptography</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Zama Concrete (TFHE)</li>
                          <li>• WebAssembly compilation</li>
                          <li>• Client-side key generation</li>
                          <li>• Secure random number generation</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-secondary/50 border-border">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4">Architecture Diagram</h3>
                    <div className="bg-background rounded-lg p-6 text-center">
                      <div className="flex items-center justify-center gap-4 flex-wrap">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center mb-2">
                            <FileText className="w-8 h-8 text-primary" />
                          </div>
                          <span className="text-xs text-muted-foreground">PDF Input</span>
                        </div>
                        <ArrowRight className="w-6 h-6 text-muted-foreground" />
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 rounded-xl bg-accent/20 flex items-center justify-center mb-2">
                            <Key className="w-8 h-8 text-accent" />
                          </div>
                          <span className="text-xs text-muted-foreground">FHE Encrypt</span>
                        </div>
                        <ArrowRight className="w-6 h-6 text-muted-foreground" />
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 rounded-xl bg-orange-500/20 flex items-center justify-center mb-2">
                            <Binary className="w-8 h-8 text-orange-500" />
                          </div>
                          <span className="text-xs text-muted-foreground">Compute</span>
                        </div>
                        <ArrowRight className="w-6 h-6 text-muted-foreground" />
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 rounded-xl bg-green-500/20 flex items-center justify-center mb-2">
                            <Shield className="w-8 h-8 text-green-500" />
                          </div>
                          <span className="text-xs text-muted-foreground">Decrypt</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-6">
                        All operations occur client-side in the browser
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Use Cases Section */}
              <section id="use-cases" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">Use Cases</h2>
                <p className="text-muted-foreground mb-6">
                  FHEPdf's privacy-preserving features are ideal for handling sensitive 
                  documents across various industries and scenarios.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Legal Documents",
                      description: "Search through contracts, NDAs, and legal briefs without exposing confidential client information."
                    },
                    {
                      title: "Medical Records",
                      description: "Process and search patient records while maintaining HIPAA compliance and patient privacy."
                    },
                    {
                      title: "Financial Reports",
                      description: "Analyze financial statements and tax documents without risking data exposure."
                    },
                    {
                      title: "Research Papers",
                      description: "Search through proprietary research and unpublished papers securely."
                    },
                    {
                      title: "HR Documents",
                      description: "Process employee records, performance reviews, and sensitive HR materials."
                    },
                    {
                      title: "Government Files",
                      description: "Handle classified or sensitive government documents with confidence."
                    }
                  ].map((useCase, index) => (
                    <Card key={index} className="bg-card border-border">
                      <CardContent className="pt-6">
                        <h3 className="font-semibold mb-2">{useCase.title}</h3>
                        <p className="text-sm text-muted-foreground">{useCase.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Zama Integration Section */}
              <section id="zama-integration" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">Zama Integration</h2>
                <p className="text-muted-foreground mb-6">
                  FHEPdf is built on Zama's Concrete library, the leading open-source 
                  implementation of TFHE (Torus Fully Homomorphic Encryption).
                </p>

                <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 mb-6">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                        <Zap className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">About Zama</h3>
                        <p className="text-muted-foreground mb-4">
                          Zama is a cryptography company building state-of-the-art FHE solutions. 
                          Their Concrete library provides a high-level API for building FHE 
                          applications, making advanced cryptography accessible to developers.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <a 
                            href="https://www.zama.ai/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm" className="bg-transparent">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Zama Website
                            </Button>
                          </a>
                          <a 
                            href="https://docs.zama.ai/concrete" 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm" className="bg-transparent">
                              <BookOpen className="w-4 h-4 mr-2" />
                              Concrete Docs
                            </Button>
                          </a>
                          <a 
                            href="https://github.com/zama-ai/concrete" 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm" className="bg-transparent">
                              <Github className="w-4 h-4 mr-2" />
                              GitHub
                            </Button>
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4">Why Concrete?</h3>
                    <ul className="space-y-3">
                      {[
                        "High-performance TFHE implementation optimized for modern CPUs",
                        "Python and Rust APIs for flexible integration",
                        "WebAssembly compilation support for browser-based applications",
                        "Active development and community support",
                        "Comprehensive documentation and examples"
                      ].map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </section>

              {/* CTA Section */}
              <Card className="gradient-border">
                <CardContent className="pt-8 pb-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Ready to Try It?</h2>
                  <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                    Experience privacy-preserving PDF processing firsthand. 
                    No sign-up required—start using our tools immediately.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/tools/encrypted-search">
                      <Button size="lg" className="gradient-primary border-0">
                        <Lock className="w-5 h-5 mr-2" />
                        Try FHE Search
                      </Button>
                    </Link>
                    <a 
                      href="https://github.com/asinhaaa" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button size="lg" variant="outline" className="bg-transparent">
                        <Github className="w-5 h-5 mr-2" />
                        View Source
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>Built with privacy-first PDF processing using Zama FHE technology</p>
            <div className="flex items-center gap-4">
              <a 
                href="https://www.zama.ai/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Powered by Zama
              </a>
              <a 
                href="https://github.com/asinhaaa" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
