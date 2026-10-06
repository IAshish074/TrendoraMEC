import apiClient from "./client";

export const paymentApi = {
  createPayment: async (data) => {
    try {
      const response = await apiClient.post("/api/payments/create", data);
      return response.data;
    } catch {
      const response = await apiClient.post("/api/payments", data);
      return response.data;
    }
  },

  verifyPayment: async (verificationData) => {
    const response = await apiClient.post("/api/payments/verify", verificationData);
    return response.data;
  },

  refund: async (refundData) => {
    const response = await apiClient.post("/api/payments/refund", refundData);
    return response.data;
  },
};

export default paymentApi;
