import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

// Public pages
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Guide from "./pages/Guide";
import NotFound from "./pages/NotFound";

// App layout and pages
import AppLayout from "./layouts/AppLayout";
import AppDashboard from "./pages/app/AppDashboard";
import AppChat from "./pages/app/AppChat";
import AppWizard from "./pages/app/AppWizard";
import AppProfile from "./pages/app/AppProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/guide" element={<Guide />} />
            
            {/* App routes (authenticated) */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<AppDashboard />} />
              <Route path="chat" element={<AppChat />} />
              <Route path="chat/:conversationId" element={<AppChat />} />
              <Route path="wizard" element={<AppWizard />} />
              <Route path="profile" element={<AppProfile />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
