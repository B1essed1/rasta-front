import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Marketplace from './pages/Marketplace';
import StorefrontPage from './pages/StorefrontPage';
import Dashboard from './pages/dashboard/Dashboard';
import HomeView from './pages/dashboard/HomeView';
import ProductsView from './pages/dashboard/ProductsView';
import OrdersView from './pages/dashboard/OrdersView';
import SalesView from './pages/dashboard/SalesView';
import DesignView from './pages/dashboard/DesignView';
import SettingsView from './pages/dashboard/SettingsView';
import ReviewsView from './pages/dashboard/ReviewsView';
import ToastHost from './components/ui/ToastHost';

function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <ToastHost />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/explore" element={<Marketplace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomeView />} />
          <Route path="products" element={<ProductsView />} />
          <Route path="orders" element={<OrdersView />} />
          <Route path="sales" element={<SalesView />} />
          <Route path="design" element={<DesignView />} />
          <Route path="settings" element={<SettingsView />} />
          <Route path="reviews" element={<ReviewsView />} />
        </Route>
        <Route path="/:handle" element={<StorefrontPage />} />
      </Routes>
    </>
  );
}
