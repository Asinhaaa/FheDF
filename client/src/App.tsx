import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useCustomCursor } from "./hooks/useCustomCursor";
import "./styles/cursor.css";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import MergePdf from "./pages/tools/MergePdf";
import SplitPdf from "./pages/tools/SplitPdf";
import CompressPdf from "./pages/tools/CompressPdf";
import ConvertPdf from "./pages/tools/ConvertPdf";
import PdfToDocx from "./pages/tools/PdfToDocx";
import Documentation from "./pages/Documentation";
import { WalletProvider } from "./components/WalletProvider";
import { ConnectButton } from "@rainbow-me/rainbowkit";

function AppContent() {
  useCustomCursor();
  return (
    <div className="relative min-h-screen">
      <div className="absolute top-4 right-4 z-50">
        <ConnectButton />
      </div>
      <Router />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/tools/merge" component={MergePdf} />
      <Route path="/tools/split" component={SplitPdf} />
      <Route path="/tools/compress" component={CompressPdf} />
      <Route path="/tools/convert" component={ConvertPdf} />
      <Route path="/tools/pdf-to-docx" component={PdfToDocx} />
      <Route path="/docs" component={Documentation} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <WalletProvider>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <Toaster />
            <AppContent />
          </TooltipProvider>
        </ThemeProvider>
      </WalletProvider>
    </ErrorBoundary>
  );
}

export default App;
