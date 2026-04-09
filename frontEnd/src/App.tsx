import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route
} from "react-router-dom";
// import Authorisation from "./assets/Layouts/Authorisation";
// import Reset from "./pages/Authorization/Reset";
// import ResetPasswordPage from "./pages/Authorization/ResetPasswordPage";
import Authorisation from "./assets/Layouts/Authorisation";
import Reset from "./pages/Authorization/Reset";
import ResetPasswordPage from "./pages/Authorization/ResetPasswordPage";
import Pageoulet from "./assets/Layouts/Pageoulet";
import Challenge from "./pages/Devotions/pages/Challenge";
import Rosary from "./pages/Devotions/pages/Rosary";
import Liturgy from "./pages/Devotions/pages/Liturgy";
import Prayer from "./pages/Devotions/pages/Prayer";
import Readings from "./pages/Devotions/pages/Readings";
import Dashboard from "./pages/Devotions/pages/Dashboard";
import Layout from "./pages/Devotions/components/Layout";
import Appadmin from "./pages/Devotions/Adminpage/App"
import AdminPanel from "./pages/officials/AdminPanel";
import PublicView from "./pages/officials/PublicView";
import {
  AboutSection,
  CommunitySection,
  SupportSection,
} from "./pages/Landing/components/sections";
import ActivitiesSection from "./pages/Landing/components/sections/activities";
import GallerySection from "./pages/Landing/components/sections/gallery";
import ProjectsSection from "./pages/Landing/components/sections/projects";
import OfficialsSection from "./pages/Landing/components/sections/officials";
import JumuiyaSection from "./pages/Landing/components/sections/jumuiya";
import ImageSlider from "./pages/Landing/components/ImageSlider";
import JumuiyaLanding from "./pages/Jumuiya/JumuiyaLanding";
import JumuiyaDetail from "./pages/Jumuiya/JumuiyaDetail";
import CommunityHub from "./pages/sacramental/CommunityHub";
import { DataProvider } from "./pages/Jumuiya/context/DataContext";
import AdminLayout from "./pages/Jumuiya/admin/AdminLayout";
import AdminMembers from "./pages/Jumuiya/admin/AdminMembers";
import DatabaseRegistration from "./pages/Jumuiya/admin/DatabaseRegistration";
import MemberProgressCard from "./pages/Jumuiya/components/MemberProgressCard";
import { useJumuiyaMembers } from "./hooks/useJumuiyaMembers";




import { useAuth } from "./context/AuthContext";
import { PublicRoute, ProtectedRoute } from "./Regulator";

// Lazy-loaded component
const Login = lazy(() => import("./pages/Authorization/Login"));

import PageLoader from "./assets/Layouts/PageLoader";

// Fallback component
const FallBack: React.FC = () => <PageLoader fullScreen message="Loading Space..." />;

const Home: React.FC = () => {
  const { user } = useAuth();
  const { members, isLoading } = useJumuiyaMembers();

  // Find current member profile details
  const memberProfile = members.find(m => m.id === user?.member_id);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow">
        {/* Show landing page content when NOT logged in */}
        {!user && (
          <>
            <ImageSlider />
            <AboutSection />
            <CommunitySection />
            <GallerySection />
          </>
        )}

        {/* Show all sections when logged in */}
        {user && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            {memberProfile && <MemberProgressCard member={memberProfile} />}
            <JumuiyaSection />
            <OfficialsSection />
            <ProjectsSection />
            <ActivitiesSection />
            <GallerySection />
          </div>
        )}

        {/* Show Support section when NOT logged in */}
        {!user && <SupportSection />}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
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
        <Route path="/admin/quiz" element={<Appadmin />} />
        <Route path="/admin/officials" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <DataProvider>
                <AdminLayout />
              </DataProvider>
            </ProtectedRoute>
          }
        >
          <Route path="members" element={<AdminMembers />} />
        </Route>
        <Route path="/register-member" element={<DataProvider><DatabaseRegistration /></DataProvider>} />
        <Route path="/officials" element={<PublicView />} />

        <Route path="/" element={<Pageoulet />}>
          <Route index element={<Home />} />

          <Route
            path="/devotions"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="readings" element={<Readings />} />
            <Route path="prayer" element={<Prayer />} />
            <Route path="liturgy" element={<Liturgy />} />
            <Route path="rosary" element={<Rosary />} />
            <Route path="challenge" element={<Challenge />} />
          </Route>

          <Route
            path="/jumuiya"
            element={
              <ProtectedRoute>
                <DataProvider>
                  <JumuiyaLanding />
                </DataProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/jumuiya/:id"
            element={
              <ProtectedRoute>
                <DataProvider>
                  <JumuiyaDetail />
                </DataProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/community/:moduleSlug?"
            element={<CommunityHub />}
          />
        </Route>

      </>,
    ),
  );

  return (
    <Suspense fallback={<FallBack />}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default App;
