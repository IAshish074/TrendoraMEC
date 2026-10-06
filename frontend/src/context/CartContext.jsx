import React, { createContext, useState, useEffect, useCallback } from "react";
import cartApi from "../api/cartApi";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      // Local cart storage for unauthenticated guests
      try {
        const local = localStorage.getItem("guest_cart");
        const items = local ? JSON.parse(local) : [];
        const totalPrice = items.reduce(
          (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
          0
        );
        setCart({ items, totalPrice });
      } catch {
        setCart({ items: [], totalPrice: 0 });
      }
      return;
    }

    setIsLoading(true);
    try {
      const data = await cartApi.getCart();
      if (data) {
        const items = data.items || data.cartItems || data.products || [];
        const totalPrice =
          data.totalPrice ??
          items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);
        setCart({ items, totalPrice });
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (itemData) => {
    if (!isAuthenticated) {
      // Add to guest cart
      const currentItems = [...cart.items];
      const existingIndex = currentItems.findIndex(
        (i) =>
          i.productId === itemData.productId &&
          i.size === itemData.size &&
          i.color === itemData.color
      );

      if (existingIndex > -1) {
        currentItems[existingIndex].quantity += itemData.quantity;
      } else {
        currentItems.push({
          id: `guest-${Date.now()}`,
          ...itemData,
        });
      }

      const totalPrice = currentItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      localStorage.setItem("guest_cart", JSON.stringify(currentItems));
      setCart({ items: currentItems, totalPrice });
      toast.success("Added to cart!");
      return;
    }

    try {
      await cartApi.addItem(itemData);
      toast.success("Product added to cart!");
      await fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add item to cart.");
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;

    if (!isAuthenticated) {
      const updatedItems = cart.items.map((i) =>
        (i.id === itemId || i.productId === itemId) ? { ...i, quantity } : i
      );
      const totalPrice = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      localStorage.setItem("guest_cart", JSON.stringify(updatedItems));
      setCart({ items: updatedItems, totalPrice });
      return;
    }

    try {
      await cartApi.updateItem(itemId, quantity);
      await fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update item quantity.");
    }
  };

  const removeFromCart = async (itemId) => {
    if (!isAuthenticated) {
      const updatedItems = cart.items.filter(
        (i) => i.id !== itemId && i.productId !== itemId
      );
      const totalPrice = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      localStorage.setItem("guest_cart", JSON.stringify(updatedItems));
      setCart({ items: updatedItems, totalPrice });
      toast.success("Item removed from cart");
      return;
    }

    try {
      await cartApi.removeItem(itemId);
      toast.success("Item removed from cart");
      await fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove item.");
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      localStorage.removeItem("guest_cart");
      setCart({ items: [], totalPrice: 0 });
      return;
    }

    try {
      await cartApi.clearCart();
      setCart({ items: [], totalPrice: 0 });
    } catch {
      setCart({ items: [], totalPrice: 0 });
    }
  };

  const itemCount = cart.items.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refetchCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
