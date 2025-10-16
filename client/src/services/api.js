import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});



api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const mediaAPI = {
  getAllMedia: (params) => api.get('/media', { params }),
  getMediaById: (id) => api.get(`/media/${id}`),
  uploadMedia: (formData) => {
    return api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updateMedia: (id, data) => api.put(`/media/${id}`, data),
  deleteMedia: (id) => api.delete(`/media/${id}`),
  bulkDeleteMedia: (mediaIds) => api.post('/media/bulk-delete', { mediaIds }),
  bulkUpdateStatus: (mediaIds, status) => api.post('/media/bulk-update-status', { mediaIds, status }),
  getMediaStats: () => api.get('/media/stats/overview'),
  searchMedia: (query, params) => api.get('/media/search', { params: { q: query, ...params } }),
  getLatestMedia: (limit) => api.get('/media/latest', { params: { limit } }),
  getMediaByType: (type, limit) => api.get(`/media/type/${type}`, { params: { limit } }),
};

export default api;