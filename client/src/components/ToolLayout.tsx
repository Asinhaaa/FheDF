import React from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Lock,
  Menu,
  X,
  Twitter,
  Github
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ToolLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  isFhe?: boolean;
  // Compatibility with old props
  icon?: React.ReactNode;
  iconColor?: string;
  badge?: string;
  className?: string;
}

export function ToolLayout({ children, title, description, isFhe, badge }: ToolLayoutProps) {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-black/80 backdrop-blur-md">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center group-hover:rotate-12 transition-transform">
                <span className="font-black text-black text-xs">FHE</span>
              </div>
              <span className="font-black tracking-tighter text-xl">FheDF</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link href="/tools/merge" className={`text-sm font-bold transition-colors ${location === '/tools/merge' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}>Merge</Link>
              <Link href="/tools/split" className={`text-sm font-bold transition-colors ${location === '/tools/split' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}>Split</Link>
              <Link href="/tools/compress" className={`text-sm font-bold transition-colors ${location === '/tools/compress' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}>Compress</Link>
              <Link href="/tools/convert" className={`text-sm font-bold transition-colors ${location === '/tools/convert' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}>Convert</Link>
              <Link href="/tools/search" className={`text-sm font-bold transition-colors ${location === '/tools/search' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}>Search</Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black tracking-widest">
              <ShieldCheck className="w-3 h-3" />
              CLIENT-SIDE ONLY
            </div>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-16 left-0 right-0 z-40 md:hidden bg-card border-b border-border overflow-hidden"
          >
            <div className="container py-4 flex flex-col gap-4">
              <Link href="/tools/merge" className="text-lg font-bold p-2" onClick={() => setIsMenuOpen(false)}>Merge PDF</Link>
              <Link href="/tools/split" className="text-lg font-bold p-2" onClick={() => setIsMenuOpen(false)}>Split PDF</Link>
              <Link href="/tools/compress" className="text-lg font-bold p-2" onClick={() => setIsMenuOpen(false)}>Compress PDF</Link>
              <Link href="/tools/convert" className="text-lg font-bold p-2" onClick={() => setIsMenuOpen(false)}>Convert PDF</Link>
              <Link href="/tools/search" className="text-lg font-bold p-2 text-primary" onClick={() => setIsMenuOpen(false)}>Encrypted Search</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="container pt-32 pb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-12 text-center">
            <Link href="/" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-6">
              <ArrowLeft className="mr-2 w-4 h-4" /> Back to Tools
            </Link>
            
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">{title}</h1>
              {(isFhe || badge === "FHE PRIVACY") && (
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-primary text-black text-[10px] font-black tracking-tighter">
                  <Lock className="w-3 h-3" /> FHE
                </div>
              )}
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          </div>

          <div className="relative">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border mt-20">
        <div className="container flex flex-col items-center gap-6">
          <div className="flex items-center gap-6">
            <a href="https://twitter.com/ramx_ai" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://github.com/Asinhaaa" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
          <div className="text-center">
            <p className="text-sm font-black tracking-widest uppercase mb-2">
              Made by <a href="https://twitter.com/ramx_ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@ramx_ai</a>
            </p>
            <p className="text-xs text-muted-foreground">
              © 2025 FheDF. All processing happens locally in your browser.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
