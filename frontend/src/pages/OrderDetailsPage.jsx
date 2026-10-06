import React from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import orderApi from "../api/orderApi";
import { OrderStatusBadge, PaymentStatusBadge } from "../components/common/StatusBadge";

const OrderDetailsPage = () => {
  const { id } = useParams();

  const { data: orderDetails, isLoading, isError, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => orderApi.getOrder(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 text-center text-gray-500 font-medium">
        Loading order details...
      </div>
    );
  }

  if (isError || !orderDetails) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 text-center text-red-600">
        {error?.response?.data?.message || "Order details not found."}
      </div>
    );
  }

  const orderId = orderDetails.id || orderDetails.orderId || orderDetails._id || id;
  const items = orderDetails.orderItems || orderDetails.items || [];
  const address = orderDetails.shippingAddress || {};

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">Order Details</h2>
        <Link to="/my-orders" className="text-sm text-blue-600 font-semibold hover:underline">
          ← Back to My Orders
        </Link>
      </div>

      <div className="p-4 sm:p-6 rounded-lg border bg-white shadow-sm">
        {/* Order Info */}
        <div className="flex flex-col sm:flex-row justify-between mb-8 pb-6 border-b">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900">
              Order ID: #{orderId}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Placed on:{" "}
              {orderDetails.createdAt
                ? new Date(orderDetails.createdAt).toLocaleDateString() +
                  " at " +
                  new Date(orderDetails.createdAt).toLocaleTimeString()
                : "N/A"}
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <PaymentStatusBadge status={orderDetails.paymentStatus} isPaid={orderDetails.isPaid} />
            <OrderStatusBadge status={orderDetails.status} />
          </div>
        </div>

        {/* Customer Payment and Shipping Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8 text-sm">
          <div>
            <h4 className="text-base font-bold text-gray-900 mb-2">Payment Info</h4>
            <p className="text-gray-600">
              Method: <span className="font-semibold text-gray-800">{orderDetails.paymentMethod || "PayPal"}</span>
            </p>
            <p className="text-gray-600 mt-1">
              Total Amount: <span className="font-semibold text-gray-800">${orderDetails.totalPrice}</span>
            </p>
          </div>

          <div>
            <h4 className="text-base font-bold text-gray-900 mb-2">Shipping Info</h4>
            <p className="text-gray-600">Method: Standard Delivery</p>
            <p className="text-gray-600 mt-1">
              Address:{" "}
              <span className="font-semibold text-gray-800">
                {address.address
                  ? `${address.address}, ${address.city || ""}, ${address.country || ""}`
                  : "N/A"}
              </span>
            </p>
            {address.phone && (
              <p className="text-gray-600 mt-1">
                Phone: <span className="font-semibold text-gray-800">{address.phone}</span>
              </p>
            )}
          </div>

          <div>
            <h4 className="text-base font-bold text-gray-900 mb-2">Customer</h4>
            <p className="text-gray-600">
              Name: <span className="font-semibold text-gray-800">{orderDetails.userName || "Customer"}</span>
            </p>
            <p className="text-gray-600 mt-1">
              Email: <span className="font-semibold text-gray-800">{orderDetails.userEmail || "N/A"}</span>
            </p>
          </div>
        </div>

        {/* Product List */}
        <div className="overflow-x-auto">
          <h4 className="text-base font-bold text-gray-900 mb-4">Purchased Items</h4>
          <table className="min-w-full text-gray-600 mb-4 text-sm">
            <thead className="bg-gray-50 border-y">
              <tr>
                <th className="py-2.5 px-4 text-left font-semibold">Name</th>
                <th className="py-2.5 px-4 text-left font-semibold">Unit Price</th>
                <th className="py-2.5 px-4 text-left font-semibold">Quantity</th>
                <th className="py-2.5 px-4 text-left font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const prodId = item.productId || item.id || index;
                return (
                  <tr key={prodId} className="border-b">
                    <td className="py-3 px-4 flex items-center">
                      <img
                        src={item.image || "https://picsum.photos/150"}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg mr-4 bg-gray-100"
                      />
                      <div>
                        <Link
                          to={`/product/${prodId}`}
                          className="font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {item.size || "M"} | {item.color || "Black"}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">${item.price}</td>
                    <td className="py-3 px-4">{item.quantity}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
