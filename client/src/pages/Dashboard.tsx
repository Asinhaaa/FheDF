import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Merge, 
  Scissors, 
  Minimize2, 
  RefreshCw, 
  Search,
  Clock,
  Shield,
  ArrowLeft,
  LogIn,
  Trash2,
  Download,
  ChevronRight
} from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

// Mock processing history - in production this would come from local storage or backend
interface ProcessingHistoryItem {
  id: string;
  type: "merge" | "split" | "compress" | "convert" | "search";
  fileName: string;
  timestamp: Date;
  details: string;
}

const toolIcons = {
  merge: Merge,
  split: Scissors,
  compress: Minimize2,
  convert: RefreshCw,
  search: Search,
};

const toolColors = {
  merge: "from-purple-500 to-indigo-600",
  split: "from-pink-500 to-rose-600",
  compress: "from-amber-500 to-orange-600",
  convert: "from-emerald-500 to-teal-600",
  search: "from-cyan-500 to-blue-600",
};

const tools = [
  {
    title: "Merge PDFs",
    description: "Combine multiple files",
    icon: Merge,
    href: "/tools/merge",
    color: "from-purple-500 to-indigo-600"
  },
  {
    title: "Split PDF",
    description: "Extract pages",
    icon: Scissors,
    href: "/tools/split",
    color: "from-pink-500 to-rose-600"
  },
  {
    title: "Compress PDF",
    description: "Reduce file size",
    icon: Minimize2,
    href: "/tools/compress",
    color: "from-amber-500 to-orange-600"
  },
  {
    title: "Convert PDF",
    description: "To images",
    icon: RefreshCw,
    href: "/tools/convert",
    color: "from-emerald-500 to-teal-600"
  },
  {
    title: "FHE Search",
    description: "Encrypted search",
    icon: Search,
    href: "/tools/encrypted-search",
    color: "from-cyan-500 to-blue-600",
    badge: "FHE"
  }
];

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [history, setHistory] = useState<ProcessingHistoryItem[]>([]);

  // In production, load history from localStorage or backend
  // useEffect(() => {
  //   const saved = localStorage.getItem('pdfzero_history');
  //   if (saved) setHistory(JSON.parse(saved));
  // }, []);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('pdfzero_history');
    toast.success("History cleared");
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
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
            <div className="hidden md:flex items-center gap-2 text-sm text-accent">
              <Shield className="w-4 h-4" />
              <span>All data stays local</span>
            </div>
            {isAuthenticated && user && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">
                    {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </span>
                </div>
                <span className="text-sm font-medium hidden sm:block">
                  {user.name || user.email || "User"}
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="container">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Quick access to all PDF tools and your processing history
            </p>
          </div>

          {/* Login Prompt (if not authenticated) */}
          {!loading && !isAuthenticated && (
            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <LogIn className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Sign in to save your history</h3>
                      <p className="text-sm text-muted-foreground">
                        Track your processing history across sessions
                      </p>
                    </div>
                  </div>
                  <a href={getLoginUrl()}>
                    <Button className="gradient-primary border-0">
                      Sign In
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Tools Grid */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">PDF Tools</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {tools.map((tool) => (
                <Link key={tool.title} href={tool.href}>
                  <Card className="h-full cursor-pointer transition-all duration-300 hover-glow bg-card border-border group">
                    <CardContent className="pt-6 text-center">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                        <tool.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <h3 className="font-medium text-sm">{tool.title}</h3>
                        {tool.badge && (
                          <Badge variant="secondary" className="text-xs bg-accent/20 text-accent">
                            {tool.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Processing History */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear History
                </Button>
              )}
            </div>

            {history.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="pt-12 pb-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No recent activity</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Your processing history will appear here. All operations are performed 
                    locally on your device for maximum privacy.
                  </p>
                  <Link href="/tools/merge">
                    <Button className="gradient-primary border-0">
                      Start Processing
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {history.map((item) => {
                  const Icon = toolIcons[item.type];
                  const color = toolColors[item.type];
                  
                  return (
                    <Card key={item.id} className="bg-card border-border">
                      <CardContent className="py-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.fileName}</p>
                            <p className="text-sm text-muted-foreground">{item.details}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm text-muted-foreground">
                              {formatTimeAgo(item.timestamp)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Privacy Notice */}
          <Card className="mt-12 bg-secondary/50 border-border">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Your Privacy is Protected</h3>
                  <p className="text-sm text-muted-foreground">
                    All PDF processing happens entirely in your browser. Your files are never 
                    uploaded to any server. Processing history is stored locally on your device 
                    and can be cleared at any time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
