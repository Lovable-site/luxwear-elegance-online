
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { useRealTimeSync } from "@/hooks/useRealTimeSync";
import { usePreloadRoutes } from "@/hooks/usePreloadRoutes";
import { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminCollections = lazy(() => import("@/pages/admin/AdminCollections"));
const Checkout = lazy(() => import("./pages/Checkout"));

import ProtectedRoute from "./components/auth/ProtectedRoute";
import Navbar from "./components/Navbar";
import AuthenticatedNavbar from "./components/auth/AuthenticatedNavbar";
import Footer from "./components/Footer";
import { useAuth } from "@/contexts/AuthContext";

// Optimized QueryClient with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        return failureCount < 2;
      },
    },
  },
});

// Loading component for suspense fallbacks
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md">
      <Skeleton className="h-8 w-3/4 mx-auto" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  </div>
);

const AppContent = () => {
  const { user, loading } = useAuth();
  
  // Initialize real-time synchronization and route preloading
  useRealTimeSync();
  usePreloadRoutes();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <Suspense fallback={<PageLoader />}>
              <AdminLayout />
            </Suspense>
          </ProtectedRoute>
        }>
          <Route index element={
            <Suspense fallback={<PageLoader />}>
              <AdminDashboard />
            </Suspense>
          } />
          <Route path="products" element={
            <Suspense fallback={<PageLoader />}>
              <AdminProducts />
            </Suspense>
          } />
          <Route path="orders" element={
            <Suspense fallback={<PageLoader />}>
              <AdminOrders />
            </Suspense>
          } />
          <Route path="users" element={
            <Suspense fallback={<PageLoader />}>
              <AdminUsers />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<PageLoader />}>
              <AdminSettings />
            </Suspense>
          } />
          <Route path="collections" element={
            <Suspense fallback={<PageLoader />}>
              <AdminCollections />
            </Suspense>
          } />
        </Route>
        
        {/* Public Routes */}
        <Route path="/*" element={
          <>
            {user ? <AuthenticatedNavbar /> : <Navbar />}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={
                  <Suspense fallback={<PageLoader />}>
                    <Index />
                  </Suspense>
                } />
                <Route path="/products" element={
                  <Suspense fallback={<PageLoader />}>
                    <Products />
                  </Suspense>
                } />
                <Route path="/products/:id" element={
                  <Suspense fallback={<PageLoader />}>
                    <ProductDetail />
                  </Suspense>
                } />
                <Route path="/contact" element={
                  <Suspense fallback={<PageLoader />}>
                    <Contact />
                  </Suspense>
                } />
                <Route path="/cart" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <Cart />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <Checkout />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/login" element={
                  <Suspense fallback={<PageLoader />}>
                    <Login />
                  </Suspense>
                } />
                <Route path="/register" element={
                  <Suspense fallback={<PageLoader />}>
                    <Register />
                  </Suspense>
                } />
                <Route path="*" element={
                  <Suspense fallback={<PageLoader />}>
                    <NotFound />
                  </Suspense>
                } />
              </Routes>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
