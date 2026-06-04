import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AccommodationDetail from './pages/AccommodationDetail.jsx';
import Accommodations from './pages/Accommodations.jsx';
import AdminPlaceholder from './components/admin/AdminPlaceholder.jsx';
import About from './pages/About.jsx';
import ProtectedRoute from './components/admin/ProtectedRoute.jsx';
import Layout from './components/layout/Layout.jsx';
import Blogs from './pages/Blogs.jsx';
import BlogDetail from './pages/BlogDetail.jsx';
import Contact from './pages/Contact.jsx';
import DayTours from './pages/DayTours.jsx';
import DestinationDetail from './pages/DestinationDetail.jsx';
import DiscoverSriLanka from './pages/DiscoverSriLanka.jsx';
import Home from './pages/Home.jsx';
import Itineraries from './pages/Itineraries.jsx';
import ItineraryPlan from './pages/ItineraryPlan.jsx';
import NotFound from './pages/NotFound.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import TermsConditions from './pages/TermsConditions.jsx';
import TourPlanThemePage from './pages/TourPlanThemePage.jsx';

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminBlogCreate = lazy(() => import('./pages/admin/AdminBlogCreate.jsx'));
const AdminBlogDetail = lazy(() => import('./pages/admin/AdminBlogDetail.jsx'));
const AdminBlogEdit = lazy(() => import('./pages/admin/AdminBlogEdit.jsx'));
const AdminBlogs = lazy(() => import('./pages/admin/AdminBlogs.jsx'));
const AdminAccommodationCreate = lazy(
  () => import('./pages/admin/AdminAccommodationCreate.jsx'),
);
const AdminAccommodationDetail = lazy(
  () => import('./pages/admin/AdminAccommodationDetail.jsx'),
);
const AdminAccommodationEdit = lazy(
  () => import('./pages/admin/AdminAccommodationEdit.jsx'),
);
const AdminAccommodations = lazy(
  () => import('./pages/admin/AdminAccommodations.jsx'),
);
const AdminDiscover = lazy(() => import('./pages/admin/AdminDiscover.jsx'));
const AdminDiscoverCreate = lazy(
  () => import('./pages/admin/AdminDiscoverCreate.jsx'),
);
const AdminDiscoverEdit = lazy(
  () => import('./pages/admin/AdminDiscoverEdit.jsx'),
);
const AdminDayTours = lazy(() => import('./pages/admin/AdminDayTours.jsx'));
const AdminDayTourCreate = lazy(
  () => import('./pages/admin/AdminDayTourCreate.jsx'),
);
const AdminDayTourEdit = lazy(
  () => import('./pages/admin/AdminDayTourEdit.jsx'),
);
const AdminForgotPassword = lazy(
  () => import('./pages/admin/AdminForgotPassword.jsx'),
);
const AdminItineraryCategories = lazy(
  () => import('./pages/admin/AdminItineraryCategories.jsx'),
);
const AdminItineraryCategoryCreate = lazy(
  () => import('./pages/admin/AdminItineraryCategoryCreate.jsx'),
);
const AdminItineraryCategoryEdit = lazy(
  () => import('./pages/admin/AdminItineraryCategoryEdit.jsx'),
);
const AdminItineraryPlans = lazy(
  () => import('./pages/admin/AdminItineraryPlans.jsx'),
);
const AdminItineraryPlanCreate = lazy(
  () => import('./pages/admin/AdminItineraryPlanCreate.jsx'),
);
const AdminItineraryPlanEdit = lazy(
  () => import('./pages/admin/AdminItineraryPlanEdit.jsx'),
);
const AdminLayout = lazy(() => import('./components/admin/AdminLayout.jsx'));
const AdminLocationCreate = lazy(
  () => import('./pages/admin/AdminLocationCreate.jsx'),
);
const AdminLocationEdit = lazy(
  () => import('./pages/admin/AdminLocationEdit.jsx'),
);
const AdminLocations = lazy(() => import('./pages/admin/AdminLocations.jsx'));
const AdminLogin = lazy(() => import('./pages/AdminLogin.jsx'));
const AdminResetPassword = lazy(
  () => import('./pages/admin/AdminResetPassword.jsx'),
);

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-obsidian text-pearl">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-champagne">
            Loading
          </p>
        </div>
      }
    >
      <Routes>
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="locations" element={<AdminLocations />} />
            <Route path="locations/new" element={<AdminLocationCreate />} />
            <Route path="locations/:id/edit" element={<AdminLocationEdit />} />
            <Route path="discover" element={<AdminDiscover />} />
            <Route path="discover/new" element={<AdminDiscoverCreate />} />
            <Route path="discover/:id/edit" element={<AdminDiscoverEdit />} />
            <Route path="day-tours" element={<AdminDayTours />} />
            <Route path="day-tours/create" element={<AdminDayTourCreate />} />
            <Route path="day-tours/:id/edit" element={<AdminDayTourEdit />} />
            <Route
              path="itinerary-categories"
              element={<AdminItineraryCategories />}
            />
            <Route
              path="itinerary-categories/new"
              element={<AdminItineraryCategoryCreate />}
            />
            <Route
              path="itinerary-categories/:id/edit"
              element={<AdminItineraryCategoryEdit />}
            />
            <Route
              path="itineraries"
              element={<AdminItineraryPlans />}
            />
            <Route
              path="itineraries/create"
              element={<AdminItineraryPlanCreate />}
            />
            <Route
              path="itineraries/:id/edit"
              element={<AdminItineraryPlanEdit />}
            />
            <Route
              path="itinerary-plans"
              element={<Navigate to="/admin/itineraries" replace />}
            />
            <Route
              path="itinerary-plans/new"
              element={<Navigate to="/admin/itineraries/create" replace />}
            />
            <Route
              path="itinerary-plans/:id/edit"
              element={<AdminItineraryPlanEdit />}
            />
            <Route
              path="day-plans"
              element={<Navigate to="/admin/itineraries" replace />}
            />
            <Route
              path="day-plans/new"
              element={<Navigate to="/admin/itineraries/create" replace />}
            />
            <Route
              path="day-plans/:id/edit"
              element={<Navigate to="/admin/itineraries" replace />}
            />
            <Route
              path="accommodations"
              element={<AdminAccommodations />}
            />
            <Route
              path="accommodations/new"
              element={<AdminAccommodationCreate />}
            />
            <Route
              path="accommodations/:id"
              element={<AdminAccommodationDetail />}
            />
            <Route
              path="accommodations/:id/edit"
              element={<AdminAccommodationEdit />}
            />
            <Route path="blogs" element={<AdminBlogs />} />
            <Route path="blogs/new" element={<AdminBlogCreate />} />
            <Route path="blogs/:id" element={<AdminBlogDetail />} />
            <Route path="blogs/:id/edit" element={<AdminBlogEdit />} />
            <Route path="settings" element={<AdminPlaceholder title="Settings" />} />
          </Route>
        </Route>

        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/travel-themes" element={<Itineraries />} />
          <Route
            path="/tour-plans"
            element={<Navigate to="/travel-themes" replace />}
          />
          <Route path="/tour-plans/:themeSlug" element={<TourPlanThemePage />} />
          <Route path="/day-tours" element={<DayTours />} />
          <Route
            path="/itineraries"
            element={<Navigate to="/travel-themes" replace />}
          />
          <Route path="/itineraries/:planSlug" element={<ItineraryPlan />} />
          <Route
            path="/itineraries/:categorySlug/:planSlug"
            element={<ItineraryPlan />}
          />
          <Route path="/discover-sri-lanka" element={<DiscoverSriLanka />} />
          <Route path="/discover-sri-lanka/:slug" element={<DestinationDetail />} />
          <Route path="/accommodations" element={<Accommodations />} />
          <Route path="/accommodations/:slug" element={<AccommodationDetail />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:slug" element={<BlogDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route
            path="/terms-and-conditions"
            element={<TermsConditions />}
          />
          <Route
            path="/privacy"
            element={<Navigate to="/privacy-policy" replace />}
          />
          <Route
            path="/terms"
            element={<Navigate to="/terms-and-conditions" replace />}
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
