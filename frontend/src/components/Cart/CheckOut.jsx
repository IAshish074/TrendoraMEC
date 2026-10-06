import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import PaypalButton from "./PaypalButton";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import orderApi from "../../api/orderApi";
import paymentApi from "../../api/paymentApi";

const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(2, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().min(5, "Phone number is required"),
});

const CheckOut = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clearCart, isLoading: cartLoading } = useCart();

  const [realOrderId, setRealOrderId] = useState(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: user?.name?.split(" ")[0] || "",
      lastName: user?.name?.split(" ").slice(1).join(" ") || "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
      phone: "",
    },
  });

  const handleCreateOrder = async (shippingData) => {
    if (!cart.items || cart.items.length === 0) {
      toast.error("Your cart is empty. Add items before checking out.");
      return;
    }

    setIsCreatingOrder(true);
    try {
      const orderPayload = {
        userEmail: user?.email || "",
        userName: `${shippingData.firstName} ${shippingData.lastName}`,
        shippingAddress: shippingData,
        paymentMethod: "PayPal",
        totalPrice: cart.totalPrice,
        orderItems: cart.items.map((item) => ({
          productId: item.productId || item.id,
          name: item.name || item.product?.name || "Product",
          size: item.size || "M",
          color: item.color || "Black",
          quantity: item.quantity || 1,
          price: item.price || 0,
          image: item.image || item.product?.images?.[0]?.url || "https://picsum.photos/150",
        })),
      };

      const createdOrder = await orderApi.createOrder(orderPayload);
      const orderId = createdOrder?.id || createdOrder?.orderId || createdOrder?._id;

      if (!orderId) {
        throw new Error("Backend did not return a valid order ID.");
      }

      setRealOrderId(orderId);
      toast.success("Order created! Complete your payment with PayPal below.");
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to create order. Please try again."
      );
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handlePaymentSuccess = async (details) => {
    setIsVerifyingPayment(true);
    try {
      const verificationResponse = await paymentApi.verifyPayment({
        paymentId: details.id,
        orderId: realOrderId,
        amount: cart.totalPrice,
        status: details.status,
      });

      if (verificationResponse && verificationResponse.status === "FAILED") {
        toast.error("Payment verification failed. Please contact customer support.");
        return;
      }

      await clearCart();
      toast.success("Payment verified and order confirmed! 🎉");
      navigate(`/order-confirmation/${realOrderId}`);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Payment completed on PayPal, but verification failed on server. Please contact support."
      );
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const handlePaymentError = () => {
    toast.error("PayPal Payment failed. Please try again.");
  };

  const handlePaymentCancel = () => {
    toast.info("Payment cancelled.");
  };

  if (cartLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center text-gray-500 font-medium">
        Loading checkout details...
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
        <p className="text-gray-600 mb-6">
          You don't have any items in your cart to checkout.
        </p>
        <button
          onClick={() => navigate("/collections/all")}
          className="bg-black text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition"
        >
          Explore Shop
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto py-10 px-6">
      {/* LEFT SECTION - Address & Form */}
      <div className="bg-white rounded-lg p-6 border shadow-sm h-fit">
        <h2 className="text-2xl font-bold uppercase mb-6 tracking-tight">Checkout</h2>
        <form onSubmit={handleSubmit(handleCreateOrder)}>
          <h3 className="text-lg font-semibold mb-4">Contact Details</h3>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ""}
              className="w-full p-2 border rounded bg-gray-100 text-gray-700 text-sm"
              disabled
            />
          </div>

          <h3 className="text-lg font-semibold mb-4 mt-6">Delivery Address</h3>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-xs font-semibold mb-1">
                First Name
              </label>
              <input
                type="text"
                {...register("firstName")}
                disabled={!!realOrderId}
                className={`w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 ${
                  errors.firstName ? "border-red-500" : "border-gray-300 focus:ring-black"
                }`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 text-xs font-semibold mb-1">
                Last Name
              </label>
              <input
                type="text"
                {...register("lastName")}
                disabled={!!realOrderId}
                className={`w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 ${
                  errors.lastName ? "border-red-500" : "border-gray-300 focus:ring-black"
                }`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-xs font-semibold mb-1">
              Address
            </label>
            <input
              type="text"
              {...register("address")}
              disabled={!!realOrderId}
              className={`w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 ${
                errors.address ? "border-red-500" : "border-gray-300 focus:ring-black"
              }`}
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
            )}
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-xs font-semibold mb-1">City</label>
              <input
                type="text"
                {...register("city")}
                disabled={!!realOrderId}
                className={`w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 ${
                  errors.city ? "border-red-500" : "border-gray-300 focus:ring-black"
                }`}
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 text-xs font-semibold mb-1">
                Postal Code
              </label>
              <input
                type="text"
                {...register("postalCode")}
                disabled={!!realOrderId}
                className={`w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 ${
                  errors.postalCode ? "border-red-500" : "border-gray-300 focus:ring-black"
                }`}
              />
              {errors.postalCode && (
                <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-xs font-semibold mb-1">Country</label>
            <input
              type="text"
              {...register("country")}
              disabled={!!realOrderId}
              className={`w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 ${
                errors.country ? "border-red-500" : "border-gray-300 focus:ring-black"
              }`}
            />
            {errors.country && (
              <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-xs font-semibold mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              {...register("phone")}
              disabled={!!realOrderId}
              className={`w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 ${
                errors.phone ? "border-red-500" : "border-gray-300 focus:ring-black"
              }`}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div className="mt-6">
            {!realOrderId ? (
              <button
                type="submit"
                disabled={isCreatingOrder}
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
              >
                {isCreatingOrder ? "Initializing Order..." : "Continue to Payment"}
              </button>
            ) : (
              <div>
                <div className="bg-green-50 text-green-800 p-3 rounded mb-4 text-xs font-semibold border border-green-200">
                  Order ID #{realOrderId} created. Complete PayPal payment below.
                </div>
                {isVerifyingPayment ? (
                  <div className="text-center py-6 text-sm font-semibold text-gray-700">
                    Verifying payment with server...
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Pay with PayPal</h3>
                    <PaypalButton
                      amount={cart.totalPrice}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      onCancel={handlePaymentCancel}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* RIGHT SECTION - Order Summary */}
      <div className="bg-gray-50 p-6 rounded-lg border h-fit">
        <h3 className="text-xl font-bold mb-4">Order Summary</h3>
        <div className="border-t py-4 mb-4 divide-y">
          {cart.items.map((item, index) => {
            const itemId = item.id || item.productId || index;
            const imageUrl =
              item.image || item.product?.images?.[0]?.url || "https://picsum.photos/150";

            return (
              <div key={itemId} className="flex items-start justify-between py-3">
                <div className="flex items-start">
                  <img
                    src={imageUrl}
                    alt={item.name || "Product"}
                    className="w-16 h-20 object-cover mr-4 rounded bg-gray-100"
                  />
                  <div>
                    <h3 className="text-sm font-semibold">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Size: {item.size || "M"}</p>
                    <p className="text-xs text-gray-500">Color: {item.color || "Black"}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  ${((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between items-center text-sm mb-2">
          <p className="text-gray-600">Subtotal</p>
          <p className="font-semibold">${cart.totalPrice?.toLocaleString()}</p>
        </div>
        <div className="flex justify-between items-center text-sm mb-2">
          <p className="text-gray-600">Shipping</p>
          <p className="text-green-600 font-semibold">Free</p>
        </div>
        <div className="flex justify-between items-center text-lg font-bold mt-4 border-t pt-4">
          <p>Total</p>
          <p>${cart.totalPrice?.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default CheckOut;
