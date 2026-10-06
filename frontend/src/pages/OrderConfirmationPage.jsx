import React from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import orderApi from "../api/orderApi";
import { OrderStatusBadge, PaymentStatusBadge } from "../components/common/StatusBadge";

const OrderConfirmationPage = () => {
  const { id } = useParams();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["order", id],
    queryFn: () => orderApi.getOrder(id),
    enabled: !!id,
  });

  const calculateEstimatedDelivery = (createdAt) => {
    const orderDate = createdAt ? new Date(createdAt) : new Date();
    orderDate.setDate(orderDate.getDate() + 7);
    return orderDate.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center text-gray-500 font-medium">
        Loading order confirmation...
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Received!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/my-orders"
            className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition"
          >
            My Orders
          </Link>
          <Link
            to="/collections/all"
            className="border border-gray-300 text-gray-800 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const orderId = order.id || order.orderId || order._id || id;
  const items = order.orderItems || order.items || [];
  const address = order.shippingAddress || {};

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white my-8 border rounded-lg shadow-sm">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-emerald-700 mb-8">
        Thank You For Your Order! 🎉
      </h1>

      <div className="p-6 rounded-lg border bg-gray-50/50">
        <div className="flex flex-col sm:flex-row justify-between mb-8 pb-6 border-b gap-4">
          {/* Order ID & Date */}
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order #{orderId}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Order Date:{" "}
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString()
                : new Date().toLocaleDateString()}
            </p>
            <div className="mt-3 flex items-center space-x-2">
              <PaymentStatusBadge status={order.paymentStatus} isPaid={order.isPaid} />
              <OrderStatusBadge status={order.status} />
            </div>
          </div>

          {/* Estimated Delivery */}
          <div className="text-left sm:text-right">
            <p className="text-emerald-700 font-semibold text-sm">
              Estimated Delivery: {calculateEstimatedDelivery(order.createdAt)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Standard Express Shipping</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-8 divide-y">
          <h3 className="text-lg font-bold mb-4">Purchased Items</h3>
          {items.map((item, index) => (
            <div key={item.productId || index} className="flex items-center py-4">
              <img
                src={item.image || "https://picsum.photos/150"}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-md mr-4 bg-gray-100"
              />
              <div>
                <h4 className="text-sm font-semibold text-gray-900">{item.name}</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.color || "Standard"} | {item.size || "Standard"}
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm font-bold text-gray-900">${item.price}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Payment & Delivery Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t">
          <div>
            <h4 className="text-sm font-bold uppercase text-gray-700 mb-2">
              Payment Method
            </h4>
            <p className="text-sm text-gray-600">{order.paymentMethod || "PayPal"}</p>
            <p className="text-sm text-gray-600 mt-1">
              Total Amount: <span className="font-bold">${order.totalPrice}</span>
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase text-gray-700 mb-2">
              Shipping Address
            </h4>
            <p className="text-sm text-gray-600">{address.address || "N/A"}</p>
            <p className="text-sm text-gray-600">
              {address.city ? `${address.city}, ` : ""}
              {address.country || ""}
            </p>
            {address.phone && (
              <p className="text-sm text-gray-600 mt-1">Phone: {address.phone}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 mt-8">
        <Link
          to="/my-orders"
          className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-semibold text-center hover:bg-gray-800 transition"
        >
          View My Orders
        </Link>
        <Link
          to="/collections/all"
          className="border border-gray-300 text-gray-800 px-6 py-2.5 rounded-lg text-sm font-semibold text-center hover:bg-gray-100 transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
