import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import AuthModal from './components/AuthModal';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderConfirmationModal from './components/OrderConfirmationModal';
import AiConcierge from './components/AiConcierge';

// Route Guards
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Public Store Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ContactPage from './pages/ContactPage';
import OrdersPage from './pages/OrdersPage';
import ComparePage from './pages/ComparePage';
import WarrantyPage from './pages/WarrantyPage';
import NotFoundPage from './pages/NotFoundPage';

// Customer User Panel Pages (/account/*)
import AccountLayout from './pages/account/AccountLayout';
import AccountOverviewPage from './pages/account/AccountOverviewPage';
import AccountProfilePage from './pages/account/AccountProfilePage';
import AccountOrdersPage from './pages/account/AccountOrdersPage';
import AccountOrderDetailPage from './pages/account/AccountOrderDetailPage';
import AccountWishlistPage from './pages/account/AccountWishlistPage';
import AccountReviewsPage from './pages/account/AccountReviewsPage';
import AccountAddressesPage from './pages/account/AccountAddressesPage';
import AccountWarrantyPage from './pages/account/AccountWarrantyPage';
import AccountSettingsPage from './pages/account/AccountSettingsPage';

// Enterprise Admin Panel Pages (/admin/*)
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminCustomerDetailPage from './pages/admin/AdminCustomerDetailPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminWarrantyPage from './pages/admin/AdminWarrantyPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <ScrollToTop />

      {/* Global Toast Notification Container */}
      <Toast />

      {/* Universal Drawers & Modals */}
      <AuthModal />
      <ProductDetailModal />
      <CartDrawer />
      <WishlistDrawer />
      <CheckoutModal />
      <OrderConfirmationModal />

      {/* Floating AI Shopping Concierge (Storefront only) */}
      {!isAdminPath && <AiConcierge />}

      {/* Navigation Header (Storefront only) */}
      {!isAdminPath && <Navbar />}

      {/* Main View Router */}
      <main className="flex-1">
        <Routes>
          {/* Public Storefront Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/warranty" element={<WarrantyPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Customer User Panel Routes (/account/*) */}
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AccountOverviewPage />} />
            <Route path="profile" element={<AccountProfilePage />} />
            <Route path="orders" element={<AccountOrdersPage />} />
            <Route path="orders/:id" element={<AccountOrderDetailPage />} />
            <Route path="wishlist" element={<AccountWishlistPage />} />
            <Route path="reviews" element={<AccountReviewsPage />} />
            <Route path="addresses" element={<AccountAddressesPage />} />
            <Route path="warranty" element={<AccountWarrantyPage />} />
            <Route path="settings" element={<AccountSettingsPage />} />
          </Route>

          {/* Enterprise Admin Panel Routes (/admin/*) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="products/new" element={<AdminProductFormPage />} />
            <Route path="products/:id/edit" element={<AdminProductFormPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="orders/:id" element={<AdminOrderDetailPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="customers/:id" element={<AdminCustomerDetailPage />} />
            <Route path="inventory" element={<AdminInventoryPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="coupons" element={<AdminCouponsPage />} />
            <Route path="warranty" element={<AdminWarrantyPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Universal Footer (Storefront only) */}
      {!isAdminPath && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </BrowserRouter>
  );
}
