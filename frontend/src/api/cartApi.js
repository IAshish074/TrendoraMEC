import apiClient from "./client";

export const cartApi = {
  getCart: async () => {
    const response = await apiClient.get("/api/cart");
    return response.data;
  },

  addItem: async (itemData) => {
    try {
      const response = await apiClient.post("/api/cart/items", itemData);
      return response.data;
    } catch {
      // Fallback for endpoint variation POST /api/cart
      const response = await apiClient.post("/api/cart", itemData);
      return response.data;
    }
  },

  updateItem: async (itemId, quantity) => {
    try {
      const response = await apiClient.put(`/api/cart/items/${itemId}`, { quantity });
      return response.data;
    } catch {
      const response = await apiClient.put(`/api/cart/${itemId}`, { quantity });
      return response.data;
    }
  },

  removeItem: async (itemId) => {
    try {
      const response = await apiClient.delete(`/api/cart/items/${itemId}`);
      return response.data;
    } catch {
      const response = await apiClient.delete(`/api/cart/${itemId}`);
      return response.data;
    }
  },

  clearCart: async () => {
    const response = await apiClient.delete("/api/cart");
    return response.data;
  },
};

export default cartApi;
