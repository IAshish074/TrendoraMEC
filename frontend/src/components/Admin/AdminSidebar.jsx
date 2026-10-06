import React from "react";
import { FaBoxOpen, FaChartLine, FaClipboardList, FaSignOutAlt, FaStore, FaTachometerAlt, FaUser } from "react-icons/fa";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully 👋");
    navigate("/login");
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link to="/admin" className="text-2xl font-bold tracking-tight">
          Trendora
        </Link>
      </div>

      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-6">
        Admin Console
      </h2>

      <nav className="flex flex-col space-y-2">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            isActive
              ? "bg-gray-800 text-white py-3 px-4 rounded-lg flex items-center space-x-3 font-medium text-sm"
              : "text-gray-400 hover:bg-gray-800 hover:text-white py-3 px-4 rounded-lg flex items-center space-x-3 font-medium text-sm transition"
          }
        >
          <FaTachometerAlt />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/analytics"
          className={({ isActive }) =>
            isActive
              ? "bg-gray-800 text-white py-3 px-4 rounded-lg flex items-center space-x-3 font-medium text-sm"
              : "text-gray-400 hover:bg-gray-800 hover:text-white py-3 px-4 rounded-lg flex items-center space-x-3 font-medium text-sm transition"
          }
        >
          <FaChartLine />
          <span>Analytics</span>
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            isActive
              ? "bg-gray-800 text-white py-3 px-4 rounded-lg flex items-center space-x-3 font-medium text-sm"
              : "text-gray-400 hover:bg-gray-800 hover:text-white py-3 px-4 rounded-lg flex items-center space-x-3 font-medium text-sm transition"
          }
        >
          <FaUser />
          <span>Users</span>
        </NavLink>

        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            isActive
              ? "bg-gray-800 text-white py-3 px-4 rounded-lg flex items-center space-x-3 font-medium text-sm"
              : "text-gray-400 hover:bg-gray-800 hover:text-white py-3 px-4 rounded-lg flex items-center space-x-3 font-medium text-sm transition"
          }
        >
          <FaBoxOpen />
          <span>Products</span>
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            isActive
              ? "bg-gray-800 text-white py-3 px-4 rounded-lg flex items-center space-x-3 font-medium text-sm"
              : "text-gray-400 hover:bg-gray-800 hover:text-white py-3 px-4 rounded-lg flex items-center space-x-3 font-medium text-sm transition"
          }
        >
          <FaClipboardList />
          <span>Orders</span>
        </NavLink>

        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? "bg-gray-800 text-white py-3 px-4 rounded-lg flex items-center space-x-3 font-medium text-sm"
              : "text-gray-400 hover:bg-gray-800 hover:text-white py-3 px-4 rounded-lg flex items-center space-x-3 font-medium text-sm transition"
          }
        >
          <FaStore />
          <span>Back to Shop</span>
        </NavLink>
      </nav>

      <div className="mt-8 pt-6 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 text-sm font-semibold transition"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
