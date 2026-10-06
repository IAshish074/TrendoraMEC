import apiClient from "./client";

export const userApi = {
  getProfile: async () => {
    const response = await apiClient.get("/api/users/profile");
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.put("/api/users/profile", data);
    return response.data;
  },

  getUsers: async () => {
    const response = await apiClient.get("/api/users");
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await apiClient.put(`/api/users/${id}/role`, { role });
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await apiClient.delete(`/api/users/${id}`);
    return response.data;
  },
};

export default userApi;
