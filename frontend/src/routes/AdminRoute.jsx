import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const AdminRoute = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">403 - Access Denied</h1>
        <p className="text-gray-600 mb-6 max-w-md">
          You do not have administrative privileges required to access this area.
        </p>
        <a
          href="/"
          className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
        >
          Return to Shop
        </a>
      </div>
    );
  }

  return <Outlet />;
};

export default AdminRoute;
