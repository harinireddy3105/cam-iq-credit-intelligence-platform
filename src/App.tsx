import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewAssessment from "./pages/NewAssessment";
import AssessmentResults from "./pages/AssessmentResults";
import FraudIntelligence from "./pages/FraudIntelligence";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/assessment/new" element={<ProtectedRoute><NewAssessment /></ProtectedRoute>} />
            <Route path="/assessment/:id/results" element={<ProtectedRoute><AssessmentResults /></ProtectedRoute>} />
            <Route path="/fraud-intelligence" element={<ProtectedRoute><FraudIntelligence /></ProtectedRoute>} />
            <Route path="/register" element={<ProtectedRoute><Register /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
