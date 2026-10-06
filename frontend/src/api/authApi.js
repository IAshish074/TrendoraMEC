import apiClient from "./client";

export const authApi = {
  register: async (data) => {
    const response = await apiClient.post("/api/auth/register", data);
    return response.data;
  },

  login: async (credentials) => {
    const response = await apiClient.post("/api/auth/login", credentials);
    return response.data;
  },

  refreshToken: async (tokenData) => {
    const response = await apiClient.post("/api/auth/refresh", tokenData);
    return response.data;
  },

  logout: async () => {
    try {
      const response = await apiClient.post("/api/auth/logout");
      return response.data;
    } catch {
      // Return true even if server logout endpoint fails so client side logout proceeds
      return { success: true };
    }
  },
};

export default authApi;
