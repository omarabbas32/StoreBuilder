import apiClient from "./api";

const storeService = {
  async getMyStores() {
    try {
      const response = await apiClient.get("/stores");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to fetch stores",
      };
    }
  },

  async getStoreBySlug(slug) {
    try {
      const response = await apiClient.get(`/stores/${slug}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Store not found",
      };
    }
  },

  async getStoreById(id) {
    try {
      const response = await apiClient.get(`/stores/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Store not found",
      };
    }
  },

  async createStore(storeData) {
    try {
      const response = await apiClient.post("/stores", storeData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to create store",
      };
    }
  },

  async updateStore(id, storeData) {
    try {
      const response = await apiClient.put(`/stores/${id}`, storeData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to update store",
      };
    }
  },

  async getThemes() {
    try {
      const response = await apiClient.get("/themes");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to fetch themes",
      };
    }
  },

  async getComponents() {
    try {
      const response = await apiClient.get("/components");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to fetch components",
      };
    }
  },

  async uploadImage(formData) {
    try {
      const response = await apiClient.post("/media/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to upload image",
      };
    }
  },
  async uploadMultipleImages(formData) {
    try {
      const response = await apiClient.post(
        "/media/upload-multiple",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to upload images",
      };
    }
  },
};

export default storeService;
