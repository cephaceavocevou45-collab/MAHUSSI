import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import ErrorBoundary from '@/components/common/ErrorBoundary';

// Customer pages
import HomePage from '@/pages/customer/HomePage';
import MenuPage from '@/pages/customer/MenuPage';
import ProductDetailPage from '@/pages/customer/ProductDetailPage';
import CartPage from '@/pages/customer/CartPage';
import CheckoutPage from '@/pages/customer/CheckoutPage';
import OrdersPage from '@/pages/customer/OrdersPage';
import OrderDetailPage from '@/pages/customer/OrderDetailPage';
import ProfilePage from '@/pages/customer/ProfilePage';
import AboutPage from '@/pages/customer/AboutPage';
import ContactPage from '@/pages/customer/ContactPage';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage';
import AdminOrderDetailPage from '@/pages/admin/AdminOrderDetailPage';
import AdminMenuPage from '@/pages/admin/AdminMenuPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminReportsPage from '@/pages/admin/AdminReportsPage';
import AdminPromotionsPage from '@/pages/admin/AdminPromotionsPage';
import AdminDeliveryZonesPage from '@/pages/admin/AdminDeliveryZonesPage';
import AdminReviewsPage from '@/pages/admin/AdminReviewsPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';

// Kitchen & Delivery
import KitchenDisplayPage from '@/pages/kitchen/KitchenDisplayPage';
import DeliveryDashboardPage from '@/pages/delivery/DeliveryDashboardPage';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Customer routes with layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute roles={['super_admin', 'restaurant_admin']}><Layout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="orders/:id" element={<AdminOrderDetailPage />} />
            <Route path="menu" element={<AdminMenuPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="promotions" element={<AdminPromotionsPage />} />
            <Route path="delivery" element={<AdminDeliveryZonesPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Kitchen route */}
          <Route path="/kitchen" element={<ProtectedRoute roles={['kitchen_staff', 'restaurant_admin', 'super_admin']}><KitchenDisplayPage /></ProtectedRoute>} />

          {/* Delivery route */}
          <Route path="/delivery" element={<ProtectedRoute roles={['delivery_agent', 'restaurant_admin', 'super_admin']}><DeliveryDashboardPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Layout><div className="text-center py-20"><h1 className="font-display text-4xl font-bold text-ink-800">404</h1><p className="text-ink-400 mt-2">Page not found</p></div></Layout>} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
