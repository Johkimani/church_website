import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Core Infrastructure
import { PublicRoute, ProtectedRoute } from "./Regulator";
import Authorisation from "./assets/Layouts/Authorisation";
import Login from "./pages/Authorization/Login";

// Admin Layout
const UniversalAdmin = lazy(() => import("./pages/Admin/UniversalAdmin"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/Admin/pages/AdminDashboard"));
const AdminPanel = lazy(() => import("./pages/officials/AdminPanel"));
const Appadmin = lazy(() => import("./pages/Devotions/Adminpage/App"));
const RecordsExplorer = lazy(() => import("./pages/Admin/pages/RecordsExplorer"));
const DonationMonitor = lazy(() => import("./pages/Admin/pages/DonationMonitor"));
const CommunityManager = lazy(() => import("./pages/Admin/pages/CommunityManager"));
const CommunityDetailEditor = lazy(() => import("./pages/Admin/pages/CommunityDetailEditor"));
const AdminSuggestions = lazy(() => import("./pages/Admin/pages/AdminSuggestions"));
const GalleryManager = lazy(() => import("./pages/Admin/pages/GalleryManager"));
const FormsDistribution = lazy(() => import("./pages/Jumuiya/admin/FormsDistribution"));
const Settings = lazy(() => import("./pages/Admin/pages/Settings"));

// Auth Pages
const Reset = lazy(() => import("./pages/Authorization/Reset"));
const ResetPasswordPage = lazy(() => import("./pages/Authorization/ResetPasswordPage"));

// Fallback component
const FallBack: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="text-xl font-medium text-slate-600 animate-pulse">
      🍷 Loading Admin Portal ...
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <Suspense fallback={<FallBack />}>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Redirect Root to Admin */}
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* Authentication Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Authorisation />
            </PublicRoute>
          }
        >
          <Route index element={<Login />} />
          <Route path="reset" element={<Reset />} />
          <Route path="otp/:reg" element={<ResetPasswordPage />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <UniversalAdmin />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="officials" element={<AdminPanel />} />
          <Route path="devotions" element={<Appadmin />} />
          <Route path="records" element={<RecordsExplorer />} />
          <Route path="donations" element={<DonationMonitor />} />
          <Route path="community-management" element={<CommunityManager />} />
          <Route path="community-management/:categoryId" element={<CommunityDetailEditor />} />
          <Route path="suggestions" element={<AdminSuggestions />} />
          <Route path="gallery" element={<GalleryManager />} />
          <Route path="forms-distribution" element={<FormsDistribution />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch-all - redirect to admin */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
