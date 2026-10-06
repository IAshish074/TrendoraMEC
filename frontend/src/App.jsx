import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

import UserLayout from "./components/layout/userLayout";
import AdminLayout from "./components/Admin/AdminLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CollectionPage from "./pages/CollectionPage";
import ProductDetails from "./components/product/ProductDetails";
import CheckOut from "./components/Cart/CheckOut";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import MyOrderPage from "./pages/MyOrderPage";
import NotFoundPage from "./pages/NotFoundPage";

import AdminHomePage from "./pages/AdminHomePage";
import AdminAnalytics from "./components/Admin/AdminAnalytics";
import UserManagement from "./components/Admin/UserManagement";
import ProductManagement from "./components/Admin/ProductManagement";
import EditProductPage from "./components/Admin/EditProductPage";
import OrderManagement from "./components/Admin/OrderManagement";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Toaster position="top-right" richColors />
            <Routes>
              {/* User layout with public & protected routes */}
              <Route path="/" element={<UserLayout />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="collections/:collection" element={<CollectionPage />} />
                <Route path="product/:id" element={<ProductDetails />} />

                {/* Protected customer routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="profile" element={<Profile />} />
                  <Route path="checkout" element={<CheckOut />} />
                  <Route path="order-confirmation/:id" element={<OrderConfirmationPage />} />
                  <Route path="order-confirmation" element={<OrderConfirmationPage />} />
                  <Route path="order/:id" element={<OrderDetailsPage />} />
                  <Route path="my-orders" element={<MyOrderPage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Admin layout with admin-protected routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminHomePage />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="products" element={<ProductManagement />} />
                  <Route path="products/new" element={<EditProductPage />} />
                  <Route path="products/:id/edit" element={<EditProductPage />} />
                  <Route path="orders" element={<OrderManagement />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
