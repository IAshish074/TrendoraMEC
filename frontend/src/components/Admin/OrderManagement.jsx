import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import orderApi from "../../api/orderApi";
import { OrderStatusBadge, PaymentStatusBadge } from "../common/StatusBadge";
import { ORDER_STATUS } from "../../constants/orderStatus";

const OrderManagement = () => {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: () => orderApi.getAllOrders(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => orderApi.updateOrderStatus(orderId, status),
    onSuccess: () => {
      toast.success("Order status updated!");
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update order status.");
    },
  });

  const handleStatusChange = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Order Management</h2>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500 font-medium">Loading orders...</div>
      ) : (
        <div className="overflow-x-auto shadow-sm rounded-lg border bg-white">
          <table className="min-w-full text-left text-gray-500 text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Change Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => {
                  const orderId = order.id || order.orderId || order._id;
                  return (
                    <tr key={orderId} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4 font-semibold text-gray-900 whitespace-nowrap">
                        #{orderId}
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-gray-900">
                          {order.userName || "Customer"}
                        </div>
                        <div className="text-xs text-gray-400">{order.userEmail}</div>
                      </td>

                      <td className="p-4 font-bold text-gray-900">${order.totalPrice}</td>

                      <td className="p-4">
                        <PaymentStatusBadge status={order.paymentStatus} isPaid={order.isPaid} />
                      </td>

                      <td className="p-4">
                        <OrderStatusBadge status={order.status} />
                      </td>

                      <td className="p-4">
                        <select
                          value={order.status || ORDER_STATUS.PROCESSING}
                          onChange={(e) => handleStatusChange(orderId, e.target.value)}
                          className="bg-white border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-black focus:border-black block p-2"
                        >
                          <option value={ORDER_STATUS.PENDING}>Pending</option>
                          <option value={ORDER_STATUS.PAYMENT_PENDING}>Payment Pending</option>
                          <option value={ORDER_STATUS.CONFIRMED}>Confirmed</option>
                          <option value={ORDER_STATUS.PROCESSING}>Processing</option>
                          <option value={ORDER_STATUS.SHIPPED}>Shipped</option>
                          <option value={ORDER_STATUS.DELIVERED}>Delivered</option>
                          <option value={ORDER_STATUS.CANCELLED}>Cancelled</option>
                        </select>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => handleStatusChange(orderId, ORDER_STATUS.DELIVERED)}
                          disabled={order.status === ORDER_STATUS.DELIVERED}
                          className="bg-emerald-600 text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-emerald-700 transition disabled:opacity-40"
                        >
                          Mark Delivered
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
