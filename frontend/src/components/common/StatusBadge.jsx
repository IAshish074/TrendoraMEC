import React from "react";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "../../constants/orderStatus";

export const OrderStatusBadge = ({ status }) => {
  const normalized = (status || "PENDING").toUpperCase();
  const label = ORDER_STATUS_LABELS[normalized] || status || "Pending";

  let colorClasses = "bg-gray-100 text-gray-800 border-gray-200";

  switch (normalized) {
    case "DELIVERED":
      colorClasses = "bg-green-100 text-green-800 border-green-200";
      break;
    case "SHIPPED":
      colorClasses = "bg-blue-100 text-blue-800 border-blue-200";
      break;
    case "PROCESSING":
    case "CONFIRMED":
      colorClasses = "bg-yellow-100 text-yellow-800 border-yellow-200";
      break;
    case "CANCELLED":
      colorClasses = "bg-red-100 text-red-800 border-red-200";
      break;
    case "PAYMENT_PENDING":
    case "PENDING":
      colorClasses = "bg-orange-100 text-orange-800 border-orange-200";
      break;
    default:
      colorClasses = "bg-gray-100 text-gray-800 border-gray-200";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`}
    >
      {label}
    </span>
  );
};

export const PaymentStatusBadge = ({ status, isPaid }) => {
  const normalized = isPaid
    ? "PAID"
    : (status || "PENDING").toUpperCase();
  const label = PAYMENT_STATUS_LABELS[normalized] || (isPaid ? "Paid" : "Pending");

  let colorClasses = "bg-gray-100 text-gray-800 border-gray-200";

  switch (normalized) {
    case "PAID":
      colorClasses = "bg-emerald-100 text-emerald-800 border-emerald-200";
      break;
    case "FAILED":
      colorClasses = "bg-red-100 text-red-800 border-red-200";
      break;
    case "REFUNDED":
      colorClasses = "bg-purple-100 text-purple-800 border-purple-200";
      break;
    case "PENDING":
    default:
      colorClasses = "bg-amber-100 text-amber-800 border-amber-200";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`}
    >
      {label}
    </span>
  );
};

export default OrderStatusBadge;
