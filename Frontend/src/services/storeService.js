import apiClient from "./api";

const normalizeStore = (store) => {
  if (!store || typeof store !== "object") return store;
  if (typeof store.settings === "string") {
    try {
      return { ...store, settings: JSON.parse(store.settings) };
    } catch (e) {
      return store;
    }
  }
  return store;
};

const storeService = {
  async getMyStores() {
    const result = await apiClient.get("/stores");
    if (result.success && Array.isArray(result.data)) {
      return { ...result, data: result.data.map(normalizeStore) };
    }
    return result;
  },

  async getStoreBySlug(slug) {
    const result = await apiClient.get(`/stores/slug/${slug}`);
    if (result.success) {
      return { ...result, data: normalizeStore(result.data) };
    }
    return result;
  },

  async getStoreById(id) {
    const result = await apiClient.get(`/stores/${id}`);
    if (result.success) {
      return { ...result, data: normalizeStore(result.data) };
    }
    return result;
  },

  async getStoreBySlugOrId(slugOrId) {
    if (!slugOrId) return { success: false, error: 'No identifier provided' };

    // Check if it's a UUID or MongoID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    const isMongoID = /^[0-9a-fA-F]{24}$/.test(slugOrId);

    if (isUUID || isMongoID) {
      return await this.getStoreById(slugOrId);
    } else {
      return await this.getStoreBySlug(slugOrId);
    }
  },

  async createStore(storeData) {
    const result = await apiClient.post("/stores", storeData);
    if (result.success) {
      return { ...result, data: normalizeStore(result.data) };
    }
    return result;
  },

  async updateStore(id, storeData) {
    const result = await apiClient.put(`/stores/${id}`, storeData);
    if (result.success) {
      return { ...result, data: normalizeStore(result.data) };
    }
    return result;
  },

  async getThemes() {
    return await apiClient.get("/themes");
  },

  async getComponents() {
    return await apiClient.get("/components");
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

  async uploadStoreLogo(file) {
    const formData = new FormData();
    formData.append('image', file);
    return await apiClient.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async completeOnboarding(storeId, answers) {
    const result = await apiClient.post(`/onboarding/${storeId}/complete`, answers);
    if (result.success) {
      return { ...result, data: normalizeStore(result.data) };
    }
    return result;
  },

  async aiChat(messages, provider = 'gemini') {
    return await apiClient.post('/onboarding/assistant-chat', { messages, provider });
  },
};

export default storeService;
