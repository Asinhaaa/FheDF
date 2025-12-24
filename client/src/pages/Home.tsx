import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Lock, 
  FileText, 
  Merge, 
  Scissors, 
  Minimize2, 
  RefreshCw, 
  Search, 
  Zap, 
  Eye, 
  Server,
  ChevronRight,
  Github,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

const tools = [
  {
    title: "Merge PDFs",
    description: "Combine multiple PDF files into a single document",
    icon: Merge,
    href: "/tools/merge",
    color: "from-purple-500 to-indigo-600"
  },
  {
    title: "Split PDF",
    description: "Extract pages or split into multiple files",
    icon: Scissors,
    href: "/tools/split",
    color: "from-pink-500 to-rose-600"
  },
  {
    title: "Compress PDF",
    description: "Reduce file size while maintaining quality",
    icon: Minimize2,
    href: "/tools/compress",
    color: "from-amber-500 to-orange-600"
  },
  {
    title: "Convert PDF",
    description: "Convert PDFs to images and other formats",
    icon: RefreshCw,
    href: "/tools/convert",
    color: "from-emerald-500 to-teal-600"
  },
  {
    title: "FHE Encrypted Search",
    description: "Privacy-preserving text search using homomorphic encryption",
    icon: Search,
    href: "/tools/encrypted-search",
    color: "from-cyan-500 to-blue-600",
    featured: true
  }
];

const features = [
  {
    icon: Shield,
    title: "100% Client-Side Processing",
    description: "Your files never leave your device. All PDF operations happen locally in your browser."
  },
  {
    icon: Lock,
    title: "Fully Homomorphic Encryption",
    description: "Search encrypted PDFs without decrypting. Powered by Zama's cutting-edge FHE technology."
  },
  {
    icon: Eye,
    title: "Zero Knowledge",
    description: "We can't see your files, your searches, or your results. True privacy by design."
  },
  {
    icon: Server,
    title: "Self-Hostable",
    description: "Deploy on your own infrastructure for complete control over your data."
  }
];

const stats = [
  { value: "0", label: "Data Sent to Server" },
  { value: "100%", label: "Client-Side Processing" },
  { value: "∞", label: "Privacy Guaranteed" }
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">PDF<span className="text-gradient">Zero</span></span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link href="/tools/merge" className="text-muted-foreground hover:text-foreground transition-colors">
              Tools
            </Link>
            <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
              Documentation
            </Link>
            <a 
              href="https://github.com/kanavtwt/pdf0" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="default" className="gradient-primary border-0">
                  Dashboard
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <Link href="/dashboard">
                <Button variant="default" className="gradient-primary border-0">
                  Get Started
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 gradient-glow opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
                <Sparkles className="w-4 h-4 mr-2 text-accent" />
                Powered by Zama FHE Technology
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              PDF Tools with
              <br />
              <span className="text-gradient">True Privacy</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Process your PDFs entirely in your browser. No uploads, no servers, no compromises. 
              Featuring the world's first FHE-powered encrypted document search.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link href="/tools/encrypted-search">
                <Button size="lg" className="gradient-primary border-0 text-lg px-8 h-14 hover-glow">
                  <Search className="w-5 h-5 mr-2" />
                  Try FHE Search
                </Button>
              </Link>
              <Link href="/docs">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 bg-transparent">
                  Learn More
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gradient">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Privacy Indicator */}
      <section className="py-8">
        <div className="container">
          <div className="flex items-center justify-center gap-3 text-accent">
            <div className="w-3 h-3 rounded-full bg-accent privacy-pulse" />
            <span className="text-sm font-medium">All processing happens locally in your browser</span>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">PDF Tools</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to work with PDFs, all processed client-side for maximum privacy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {tools.map((tool, index) => (
              <Link key={tool.title} href={tool.href}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className={`h-full cursor-pointer transition-all duration-300 hover-glow bg-card border-border ${tool.featured ? 'gradient-border' : ''}`}>
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4`}>
                        <tool.icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="flex items-center gap-2">
                        {tool.title}
                        {tool.featured && (
                          <Badge variant="secondary" className="text-xs bg-accent/20 text-accent">
                            FHE
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 gradient-glow opacity-30" />
        <div className="container relative">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Lock className="w-4 h-4 mr-2" />
              Privacy First
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why PDFZero?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built from the ground up with privacy as the core principle, not an afterthought.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full bg-card/50 backdrop-blur border-border">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FHE Explainer Section */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Card className="gradient-border overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <Badge variant="secondary" className="mb-4 bg-accent/20 text-accent">
                      <Zap className="w-4 h-4 mr-2" />
                      Zama FHE Technology
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                      Search Without Revealing
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Fully Homomorphic Encryption allows computations on encrypted data without ever decrypting it. 
                      Search your documents while keeping both the query and content completely private.
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Encrypted search queries",
                        "Results computed on ciphertext",
                        "Zero knowledge of document contents",
                        "Powered by Zama's Concrete library"
                      ].map((item, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-accent" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8">
                      <Link href="/docs">
                        <Button variant="outline" className="bg-transparent">
                          Read the Technical Docs
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <div className="relative">
                        <Shield className="w-32 h-32 text-primary/50 shield-pulse" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock className="w-12 h-12 text-accent" />
                        </div>
                      </div>
                    </div>
                    {/* Floating particles */}
                    <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-primary/50 particle" style={{ animationDelay: '0s' }} />
                    <div className="absolute bottom-8 left-8 w-3 h-3 rounded-full bg-accent/50 particle" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 right-8 w-2 h-2 rounded-full bg-primary/50 particle" style={{ animationDelay: '2s' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Process PDFs Privately?
            </h2>
            <p className="text-muted-foreground mb-8">
              No sign-up required. Start using our tools immediately with full privacy guarantees.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/tools/merge">
                <Button size="lg" className="gradient-primary border-0 text-lg px-8 h-14 hover-glow">
                  Start Processing
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="https://github.com/kanavtwt/pdf0" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 bg-transparent">
                  <Github className="w-5 h-5 mr-2" />
                  View on GitHub
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold">PDF<span className="text-gradient">Zero</span></span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/docs" className="hover:text-foreground transition-colors">
                Documentation
              </Link>
              <a 
                href="https://github.com/kanavtwt/pdf0" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                GitHub
              </a>
              <a 
                href="https://www.zama.ai/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Powered by Zama
              </a>
            </div>
            <div className="text-sm text-muted-foreground">
              Built for the Zama FHE Developer Grant
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
