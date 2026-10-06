import React from "react";
import { RiDeleteBin3Line } from "react-icons/ri";
import { useCart } from "../../hooks/useCart";

const CartContent = () => {
  const { cart, updateQuantity, removeFromCart, isLoading } = useCart();

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2].map((n) => (
          <div key={n} className="flex items-center space-x-4 animate-pulse">
            <div className="w-20 h-24 bg-gray-200 rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 font-medium mb-2">Your cart is empty</p>
        <p className="text-xs text-gray-400">Explore our products and add items to your cart.</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {cart.items.map((item, index) => {
        const itemId = item.id || item.itemId || item.productId || index;
        const imageUrl =
          item.image ||
          item.product?.images?.[0]?.url ||
          "https://picsum.photos/200?random=" + index;

        return (
          <div key={itemId} className="flex items-start justify-between py-4">
            <div className="flex items-center">
              <img
                src={imageUrl}
                alt={item.name || item.product?.name || "Product"}
                className="w-20 h-24 object-cover mr-4 rounded bg-gray-100"
              />
              <div>
                <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">
                  {item.name || item.product?.name || "Product"}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Size: {item.size || "Default"} | Color: {item.color || "Default"}
                </p>
                <div className="flex items-center mt-3">
                  <button
                    onClick={() => updateQuantity(itemId, (item.quantity || 1) - 1)}
                    className="border rounded px-2 py-0.5 text-sm font-medium hover:bg-gray-100 disabled:opacity-40"
                    disabled={(item.quantity || 1) <= 1}
                  >
                    -
                  </button>
                  <span className="mx-3 text-sm font-semibold">{item.quantity || 1}</span>
                  <button
                    onClick={() => updateQuantity(itemId, (item.quantity || 1) + 1)}
                    className="border rounded px-2 py-0.5 text-sm font-medium hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm text-gray-900">
                ${((item.price || 0) * (item.quantity || 1)).toLocaleString()}
              </p>
              <button
                onClick={() => removeFromCart(itemId)}
                className="text-red-500 hover:text-red-700 mt-3 transition"
                aria-label="Remove product"
              >
                <RiDeleteBin3Line className="h-5 w-5 ml-auto" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CartContent;
