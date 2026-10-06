import apiClient from "./client";

export const orderApi = {
  createOrder: async (orderPayload) => {
    const response = await apiClient.post("/api/orders", orderPayload);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await apiClient.get("/api/orders/my-orders");
    return response.data;
  },

  getOrder: async (id) => {
    const response = await apiClient.get(`/api/orders/${id}`);
    return response.data;
  },

  getAllOrders: async () => {
    const response = await apiClient.get("/api/orders");
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await apiClient.put(`/api/orders/${id}/status`, { status });
    return response.data;
  },
};

export default orderApi;
