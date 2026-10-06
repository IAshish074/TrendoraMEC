import apiClient from "./client";

export const productApi = {
  getProducts: async (params = {}) => {
    // Filter out undefined, null, or empty string values from params
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      const val = params[key];
      if (val !== undefined && val !== null && val !== "") {
        cleanParams[key] = val;
      }
    });

    const response = await apiClient.get("/api/products", { params: cleanParams });
    const data = response.data;
    if (data && Array.isArray(data.content)) {
      return data.content;
    }
    if (data && Array.isArray(data.data)) {
      return data.data;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  },

  getProduct: async (id) => {
    const response = await apiClient.get(`/api/products/${id}`);
    return response.data;
  },

  createProduct: async (data) => {
    const response = await apiClient.post("/api/products", data);
    return response.data;
  },

  updateProduct: async (id, data) => {
    const response = await apiClient.put(`/api/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/api/products/${id}`);
    return response.data;
  },
};

export default productApi;
