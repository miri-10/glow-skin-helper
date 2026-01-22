import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState, createContext, useContext } from "react";
import { Layout } from "@/components/layout/Layout";
import { AIChatbot } from "@/components/AIChatbot";
import { type ScanContext } from "@/utils/chatbotService";
import Index from "./pages/Index";
import Detect from "./pages/Detect";
import About from "./pages/About";
import Prevention from "./pages/Prevention";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import MedicalHelp from "./pages/MedicalHelp";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Create context for scan data
const ScanContextProvider = createContext<{
  scanContext: ScanContext | undefined;
  setScanContext: (context: ScanContext | undefined) => void;
}>({
  scanContext: undefined,
  setScanContext: () => {}
});

export const useScanContext = () => useContext(ScanContextProvider);

function ScrollToTop() {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  const { setScanContext } = useScanContext();
  
  // Clear scan context when navigating away from detect page
  useEffect(() => {
    if (location.pathname !== '/detect') {
      setScanContext(undefined);
    }
  }, [location.pathname, setScanContext]);
  
  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          <Route path="/detect" element={<Detect />} />
          <Route path="/about" element={<About />} />
          <Route path="/prevention" element={<Prevention />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/medical-help" element={<MedicalHelp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

function AppContent() {
  const [scanContext, setScanContext] = useState<ScanContext | undefined>();
  
  return (
    <ScanContextProvider.Provider value={{ scanContext, setScanContext }}>
      <Layout>
        <AnimatedRoutes />
        <AIChatbot scanContext={scanContext} />
      </Layout>
    </ScanContextProvider.Provider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
