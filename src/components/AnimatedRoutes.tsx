import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PageTransition } from "@/components/PageTransition";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import NewAssessment from "@/pages/NewAssessment";
import AssessmentResults from "@/pages/AssessmentResults";
import FraudIntelligence from "@/pages/FraudIntelligence";
import Register from "@/pages/Register";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

export const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/dashboard" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/assessment/new" element={<ProtectedRoute><PageTransition><NewAssessment /></PageTransition></ProtectedRoute>} />
        <Route path="/assessment/:id/results" element={<ProtectedRoute><PageTransition><AssessmentResults /></PageTransition></ProtectedRoute>} />
        <Route path="/fraud-intelligence" element={<ProtectedRoute><PageTransition><FraudIntelligence /></PageTransition></ProtectedRoute>} />
        <Route path="/register" element={<ProtectedRoute><PageTransition><Register /></PageTransition></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><PageTransition><Settings /></PageTransition></ProtectedRoute>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};
