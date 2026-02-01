import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import CalendarPage from "@/pages/Calendar";
import Workspaces from "@/pages/Workspaces";
import WorkspaceDetail from "@/pages/WorkspaceDetail";
import Activity from "@/pages/Activity";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

// Layout
import { MainLayout } from "@/components/layout/MainLayout";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected layout */}
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/workspaces" element={<Workspaces />} />
                <Route
                  path="/workspaces/:workspaceId"
                  element={<WorkspaceDetail />}
                />
                <Route path="/activity" element={<Activity />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
