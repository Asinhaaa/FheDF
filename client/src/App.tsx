import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import MergePdf from "./pages/tools/MergePdf";
import SplitPdf from "./pages/tools/SplitPdf";
import CompressPdf from "./pages/tools/CompressPdf";
import ConvertPdf from "./pages/tools/ConvertPdf";
import EncryptedSearch from "./pages/tools/EncryptedSearch";
import Documentation from "./pages/Documentation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/tools/merge" component={MergePdf} />
      <Route path="/tools/split" component={SplitPdf} />
      <Route path="/tools/compress" component={CompressPdf} />
      <Route path="/tools/convert" component={ConvertPdf} />
      <Route path="/tools/encrypted-search" component={EncryptedSearch} />
      <Route path="/docs" component={Documentation} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
