import { create } from 'zustand';
import { mediaAPI } from '../services/api';

const useMediaStore = create((set, get) => ({
  media: [],
  selectedMedia: null,
  stats: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
    limit: 12,
  },
  filters: {
    type: '',
    status: '',
    search: '',
  },

  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
  },

  
  clearFilters: () => {
    set({ filters: { type: '', status: '', search: '' } });
  },

  
  fetchMedia: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const response = await mediaAPI.getAllMedia({
        page,
        limit: get().pagination.limit,
        ...filters,
      });

      const { media, pagination } = response.data.data;

      set({
        media,
        pagination,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch media',
      });
    }
  },

  
  fetchStats: async () => {
    try {
      const response = await mediaAPI.getMediaStats();
      set({ stats: response.data.data });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  },

  
  uploadMedia: async (formData, onProgress) => {
    set({ isLoading: true, error: null });
    try {
      const response = await mediaAPI.uploadMedia(formData);
      set({ isLoading: false });
      
      
      get().fetchMedia(get().pagination.page);
      get().fetchStats();
      
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'ატვირთვა ვერ მოხერხდა';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  
  updateMedia: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await mediaAPI.updateMedia(id, data);
      set({ isLoading: false });
      
      
      set({
        media: get().media.map(m => m._id === id ? response.data.data : m)
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'განახლება ვერ მოხერხდა';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  
  deleteMedia: async (id) => {
    try {
      await mediaAPI.deleteMedia(id);
      
      
      set({
        media: get().media.filter(m => m._id !== id)
      });
      
      get().fetchStats();
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'წაშლა ვერ მოხერხდა';
      return { success: false, error: errorMessage };
    }
  },

  
  bulkDeleteMedia: async (mediaIds) => {
    set({ isLoading: true, error: null });
    try {
      await mediaAPI.bulkDeleteMedia(mediaIds);
      set({ isLoading: false });
      
      
      get().fetchMedia(get().pagination.page);
      get().fetchStats();
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'ბულკ წაშლა ვერ მოხერხდა';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  
  bulkUpdateStatus: async (mediaIds, status) => {
    set({ isLoading: true, error: null });
    try {
      await mediaAPI.bulkUpdateStatus(mediaIds, status);
      set({ isLoading: false });
      
      get().fetchMedia(get().pagination.page);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'ბულკ განახლება ვერ მოხერხდა';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  
  setSelectedMedia: (media) => {
    set({ selectedMedia: media });
  },

  
  clearSelectedMedia: () => {
    set({ selectedMedia: null });
  },

      
  searchMedia: async (query) => {
    set({ isLoading: true, error: null });
    try {
      const response = await mediaAPI.searchMedia(query, get().filters);
      set({
        media: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'ძებნა ვერ მოხერხდა',
      });
    }
  },
}));

export default useMediaStore;