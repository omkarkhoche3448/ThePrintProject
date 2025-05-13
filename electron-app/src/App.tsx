import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import "./App.css";

// Function to detect if app is running in Electron
const isElectron = () => {
  return window.navigator.userAgent.toLowerCase().indexOf('electron') > -1;
};

const queryClient = new QueryClient();

const App = () => {
  const [isElectronApp, setIsElectronApp] = useState(false);

  useEffect(() => {
    setIsElectronApp(isElectron());    // Example of using Electron API if available
    if (isElectron() && 'electronAPI' in window) {
      // You could add your Electron-specific initialization here
      console.log("Running in Electron environment");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {isElectronApp && (
          <div className="fixed top-0 left-0 right-0 bg-primary text-primary-foreground text-xs p-1 text-center z-50">
            Gemini Property Dashboard Desktop App
          </div>
        )}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/index" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/documents" element={<Navigate to="/dashboard" />} />
              <Route path="/calendar" element={<Navigate to="/dashboard" />} />
              <Route path="/printers" element={<Navigate to="/settings" />} />
              <Route path="/help" element={<Navigate to="/settings" />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
