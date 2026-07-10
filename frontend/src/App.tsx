import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useAuthStore } from "./lib/useAuthStore";
import { MainLayout } from "./components/layout/main-layout";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { ProtectedRoute } from "./components/layout/protected-route";
import { api } from "./lib/api";
import { AdminRoute } from './components/layout/admin-route';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import {
  AboutPage,
  ContactPage,
  PrivacyPolicyPage,
  TermsPage,
  SupportPage
} from "./pages/public/StaticPages";
import { FAQPage } from './pages/public/FAQPage';
import { BlogPage } from './pages/public/BlogPage';

// Lazy-loaded App Pages (Code Splitting)
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage").then(m => ({ default: m.DashboardPage })));
const AnalyzePage = lazy(() => import("./pages/analyze/AnalyzePage").then(m => ({ default: m.AnalyzePage })));
const ReportPage = lazy(() => import("./pages/report/ReportPage").then(m => ({ default: m.ReportPage })));
const CropHistoryPage = lazy(() => import("./pages/history/CropHistoryPage").then(m => ({ default: m.CropHistoryPage })));
const WeatherPage = lazy(() => import("./pages/weather/WeatherPage").then(m => ({ default: m.WeatherPage })));
const AppNotificationsPage = lazy(() => import("./pages/notifications/NotificationsPage").then(m => ({ default: m.NotificationsPage })));
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage").then(m => ({ default: m.ProfilePage })));

// Lazy-loaded Admin Pages (Code Splitting)
const AdminLayout = lazy(() => import('./pages/admin/layout/AdminLayout'));
const AdminDashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));
const CropsPage = lazy(() => import('./pages/admin/library/CropsPage'));
const DiseasesPage = lazy(() => import('./pages/admin/library/DiseasesPage'));
const PestsPage = lazy(() => import('./pages/admin/library/PestsPage'));
const MedicinesPage = lazy(() => import('./pages/admin/library/MedicinesPage'));
const PredictionLogsPage = lazy(() => import('./pages/admin/monitoring/PredictionLogsPage'));
const AdminNotificationsPage = lazy(() => import('./pages/admin/engagement/NotificationsPage'));
const FeedbackPage = lazy(() => import('./pages/admin/engagement/FeedbackPage'));
const AIModelsPage = lazy(() => import('./pages/admin/settings/AIModelsPage'));

// Fallback loader
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { setUser, setToken, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const token = await user.getIdToken();
        setToken(token);
        
        // Sync with backend to get role and ensure DB record exists
        try {
          const response = await api.post('/auth/sync');
          if (response.data && response.data.role) {
            useAuthStore.getState().setUserRole(response.data.role as any);
          } else {
            useAuthStore.getState().setUserRole('farmer');
          }
        } catch (error) {
          console.error("Failed to sync user with backend:", error);
          useAuthStore.getState().setUserRole('farmer');
        }
      } else {
        logout();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setToken, setLoading, logout]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
          {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/support" element={<SupportPage />} />
        
        {/* Protected App Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/analyze" element={<ProtectedRoute><AnalyzePage /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><CropHistoryPage /></ProtectedRoute>} />
          <Route path="/weather" element={<ProtectedRoute><WeatherPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><AppNotificationsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Route>

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="library/crops" element={<CropsPage />} />
          <Route path="library/diseases" element={<DiseasesPage />} />
          <Route path="library/pests" element={<PestsPage />} />
          <Route path="library/medicines" element={<MedicinesPage />} />
          <Route path="logs" element={<PredictionLogsPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="models" element={<AIModelsPage />} />
        </Route>
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
    </QueryClientProvider>
  );
}

export default App;
