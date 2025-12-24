import { ReactNode } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Shield, Github } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolLayoutProps {
  title: string;
  description: string;
  icon: ReactNode;
  iconColor?: string;
  badge?: string;
  children: ReactNode;
  className?: string;
}

export function ToolLayout({
  title,
  description,
  icon,
  iconColor = "from-purple-500 to-indigo-600",
  badge,
  children,
  className
}: ToolLayoutProps) {
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
            <div className="hidden md:flex items-center gap-2 text-sm text-accent">
              <Shield className="w-4 h-4" />
              <span>Client-side processing</span>
            </div>
            <a 
              href="https://github.com/ramx_ai" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="icon">
                <Github className="w-5 h-5" />
              </Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="container">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className={cn(
              "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mx-auto mb-6",
              iconColor
            )}>
              {icon}
            </div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
              {badge && (
                <Badge variant="secondary" className="bg-accent/20 text-accent">
                  {badge}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-lg">{description}</p>
          </div>

          {/* Tool Content */}
          <div className={cn("max-w-4xl mx-auto", className)}>
            {children}
          </div>
        </div>
      </main>

      {/* Privacy Footer */}
      <div className="fixed bottom-0 left-0 right-0 py-3 glass">
        <div className="container">
          <div className="flex items-center justify-center gap-3 text-sm text-accent">
            <div className="w-2 h-2 rounded-full bg-accent privacy-pulse" />
            <span>Your files never leave your device</span>
          </div>
        </div>
      </div>
    </div>
  );
}
