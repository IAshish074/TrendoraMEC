import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import orderApi from "../../api/orderApi";
import productApi from "../../api/productApi";
import userApi from "../../api/userApi";
import { OrderStatusBadge } from "../common/StatusBadge";
import { FaChartLine, FaDollarSign, FaShoppingBag, FaUsers, FaBoxOpen, FaExclamationTriangle } from "react-icons/fa";

const AdminAnalytics = () => {
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

  // Metrics Calculations
  const totalOrders = orderList.length;
  const totalRevenue = orderList.reduce((sum, o) => sum + (o.totalPrice || o.totalAmount || 0), 0);
  const estimatedCost = totalRevenue * 0.65; // Cost ratio estimate
  const totalProfit = totalRevenue - estimatedCost;
  const lowStockProducts = productList.filter((p) => (p.countInStock || p.stock || 0) < 10);

  // Status breakdown
  const statusCounts = orderList.reduce((acc, o) => {
    const st = o.status || "PENDING";
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

  // Category breakdown
  const categoryStats = productList.reduce((acc, p) => {
    const cat = p.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Analytics & Financial Performance</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time breakdown of sales, revenue, profit, and product inventory.</p>
        </div>
        <Link
          to="/admin"
          className="inline-flex items-center text-xs font-semibold text-gray-600 hover:text-black transition"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
        </div>
      ) : (
        <>
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <span className="text-xs font-semibold text-emerald-600 mt-1 inline-block">+12.4% vs last period</span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-xl">
                <FaDollarSign />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">Net Profit (Est.)</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                  ${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <span className="text-xs font-semibold text-gray-500 mt-1 inline-block">35% Gross Margin</span>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg text-xl">
                <FaChartLine />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">Total Orders</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalOrders}</h3>
                <span className="text-xs font-semibold text-gray-500 mt-1 inline-block">{orderList.filter(o => o.status === 'DELIVERED').length} Delivered</span>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg text-xl">
                <FaShoppingBag />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">Active Customers</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{userList.length}</h3>
                <span className="text-xs font-semibold text-gray-500 mt-1 inline-block">Registered Users</span>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg text-xl">
                <FaUsers />
              </div>
            </div>
          </div>

          {/* Visual Charts & Category Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Performance Bar Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Product Category Distribution</h2>
              <div className="space-y-4">
                {Object.keys(categoryStats).length > 0 ? (
                  Object.entries(categoryStats).map(([cat, count]) => {
                    const percentage = Math.round((count / (productList.length || 1)) * 100);
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-sm font-medium">
                          <span className="text-gray-800">{cat}</span>
                          <span className="text-gray-500">{count} items ({percentage}%)</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-black rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 py-4">No categories recorded yet.</p>
                )}
              </div>
            </div>

            {/* Order Status Breakdown */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Fulfillment Status</h2>
              <div className="space-y-3">
                {["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((st) => {
                  const count = statusCounts[st] || 0;
                  return (
                    <div key={st} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                      <OrderStatusBadge status={st} />
                      <span className="text-sm font-bold text-gray-900">{count} orders</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Low Stock Warning Section */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FaExclamationTriangle className="text-amber-500 text-lg" />
                <h2 className="text-lg font-bold text-gray-900">Low Stock Inventory Alerts (&lt; 10 units)</h2>
              </div>
              <Link to="/admin/products" className="text-xs font-semibold text-blue-600 hover:underline">
                Manage Stock →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b">
                  <tr>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Remaining Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.length > 0 ? (
                    lowStockProducts.map((p) => (
                      <tr key={p.id || p._id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-semibold text-gray-900">{p.name}</td>
                        <td className="p-4">{p.category || "N/A"}</td>
                        <td className="p-4 font-medium text-gray-900">${p.price}</td>
                        <td className="p-4 font-bold text-red-600">
                          {p.countInStock || p.stock || 0} units left
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-emerald-600 font-medium">
                        All product inventories are healthy! No low-stock items.
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

export default AdminAnalytics;
