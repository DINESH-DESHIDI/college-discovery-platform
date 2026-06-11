import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Home from "@/pages/Home";
import Colleges from "@/pages/Colleges";
import CollegeDetail from "@/pages/CollegeDetail";
import Compare from "@/pages/Compare";
import Saved from "@/pages/Saved";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Predictor from "@/pages/Predictor";
import Community from "@/pages/Community";
import Assistant from "@/pages/Assistant";
import AnalyticsDashboard from "@/pages/AnalyticsDashboard";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/colleges" element={<Colleges />} />
                <Route path="/colleges/:id" element={<CollegeDetail />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/predictor" element={<Predictor />} />
                <Route path="/community" element={<Community />} />
                <Route path="/assistant" element={<Assistant />} />
                <Route path="/analytics" element={<AnalyticsDashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}
