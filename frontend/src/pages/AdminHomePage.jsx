import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import orderApi from "../api/orderApi";
import productApi from "../api/productApi";
import userApi from "../api/userApi";
import { OrderStatusBadge } from "../components/common/StatusBadge";
import { FaBoxOpen, FaChartLine, FaClipboardList, FaDollarSign, FaExclamationTriangle, FaUser } from "react-icons/fa";

const AdminHomePage = () => {
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: () => orderApi.getAllOrders(),
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: () => productApi.getProducts(),
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => userApi.getUsers(),
  });

  const isLoading = ordersLoading || productsLoading || usersLoading;

  const orderList = Array.isArray(orders) ? orders : orders?.content || [];
  const productList = Array.isArray(products) ? products : products?.content || [];
  const userList = Array.isArray(users) ? users : users?.content || [];

  const totalRevenue = orderList.reduce((sum, order) => sum + (order.totalPrice || order.totalAmount || 0), 0);
  const estimatedCost = totalRevenue * 0.65;
  const totalProfit = totalRevenue - estimatedCost;
  const lowStockCount = productList.filter((p) => (p.countInStock || p.stock || 0) < 10).length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your store's overall performance, sales, and catalog.</p>
        </div>
        <Link
          to="/admin/analytics"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition inline-flex items-center space-x-2"
        >
          <FaChartLine />
          <span>View Detailed Analytics</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 shadow-sm rounded-xl bg-white border">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Total Revenue
                </h2>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md text-lg">
                  <FaDollarSign />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="p-6 shadow-sm rounded-xl bg-white border">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Est. Profit
                </h2>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-md text-lg">
                  <FaChartLine />
                </div>
              </div>
              <p className="text-2xl font-bold text-emerald-600 mt-2">
                ${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="p-6 shadow-sm rounded-xl bg-white border">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Total Orders
                </h2>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-md text-lg">
                  <FaClipboardList />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{orderList.length}</p>
            </div>

            <div className="p-6 shadow-sm rounded-xl bg-white border">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Total Products
                </h2>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-md text-lg">
                  <FaBoxOpen />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{productList.length}</p>
            </div>
          </div>

          {/* Secondary Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 shadow-sm rounded-xl bg-white border flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Users</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{userList.length}</p>
              </div>
              <Link to="/admin/users" className="text-xs font-semibold text-blue-600 hover:underline">
                View Users →
              </Link>
            </div>

            <div className="p-6 shadow-sm rounded-xl bg-white border flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Low Stock Alert</p>
                <p className={`text-xl font-bold mt-1 ${lowStockCount > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                  {lowStockCount} items
                </p>
              </div>
              <Link to="/admin/analytics" className="text-xs font-semibold text-blue-600 hover:underline">
                View Low Stock →
              </Link>
            </div>

            <div className="p-6 shadow-sm rounded-xl bg-white border flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Completed Sales</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {orderList.filter(o => o.status === 'DELIVERED' || o.status === 'CONFIRMED').length}
                </p>
              </div>
              <Link to="/admin/orders" className="text-xs font-semibold text-blue-600 hover:underline">
                Manage Orders →
              </Link>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
              <Link to="/admin/orders" className="text-xs font-semibold text-blue-600 hover:underline">
                View All Orders →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-gray-500 text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orderList.length > 0 ? (
                    orderList.slice(0, 6).map((order) => {
                      const orderId = order.id || order.orderId || order._id;
                      return (
                        <tr key={orderId} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-semibold text-gray-900">#{orderId}</td>
                          <td className="p-4">
                            {order.userName || order.userEmail || "Customer"}
                          </td>
                          <td className="p-4 font-semibold text-gray-900">
                            ${order.totalPrice || order.totalAmount}
                          </td>
                          <td className="p-4">
                            <OrderStatusBadge status={order.status} />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">
                        No recent orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminHomePage;
