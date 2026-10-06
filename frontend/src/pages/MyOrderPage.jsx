import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import orderApi from "../api/orderApi";
import { OrderStatusBadge, PaymentStatusBadge } from "../components/common/StatusBadge";

const MyOrderPage = () => {
  const navigate = useNavigate();

  const { data: orders = [], isLoading, isError, error } = useQuery({
    queryKey: ["myOrders"],
    queryFn: () => orderApi.getMyOrders(),
  });

  const handleRowClick = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 text-center text-gray-500">
        Loading your orders...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 text-center text-red-600">
        Failed to load orders: {error?.response?.data?.message || error.message || "Server Error"}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-6">My Orders</h2>
      <div className="relative shadow-sm sm:rounded-lg overflow-x-auto border bg-white">
        <table className="min-w-full text-left text-gray-500">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b">
            <tr>
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4">Destination</th>
              <th className="py-3 px-4">Items</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => {
                const orderId = order.id || order.orderId || order._id;
                const items = order.orderItems || order.items || [];
                const firstItem = items[0];

                return (
                  <tr
                    onClick={() => handleRowClick(orderId)}
                    key={orderId}
                    className="border-b hover:bg-gray-50 cursor-pointer transition text-sm"
                  >
                    <td className="py-3 px-4">
                      <img
                        src={firstItem?.image || "https://picsum.photos/100"}
                        alt={firstItem?.name || "Product"}
                        className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg bg-gray-100"
                      />
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900 whitespace-nowrap">
                      #{orderId}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      {order.shippingAddress
                        ? `${order.shippingAddress.city || ""}, ${order.shippingAddress.country || ""}`
                        : "N/A"}
                    </td>
                    <td className="py-3 px-4">{items.length}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      ${order.totalPrice}
                    </td>
                    <td className="py-3 px-4">
                      <PaymentStatusBadge status={order.paymentStatus} isPaid={order.isPaid} />
                    </td>
                    <td className="py-3 px-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-8 px-4 text-center text-gray-500">
                  You have not placed any orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyOrderPage;
