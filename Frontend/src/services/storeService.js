import apiClient from "./api";

const storeService = {
  async getMyStores() {
    return await apiClient.get("/stores");
  },

  async getStoreBySlug(slug) {
    return await apiClient.get(`/stores/${slug}`);
  },

  async getStoreById(id) {
    return await apiClient.get(`/stores/${id}`);
  },

  async createStore(storeData) {
    return await apiClient.post("/stores", storeData);
  },

  async updateStore(id, storeData) {
    return await apiClient.put(`/stores/${id}`, storeData);
  },

  async getThemes() {
    return await apiClient.get("/themes");
  },

  async getComponents() {
    return await apiClient.get("/components");
  },

  async uploadImage(formData) {
    return await apiClient.post("/media/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
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
