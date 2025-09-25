import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Notes API
export const notesAPI = {
  getAllNotes: (params) => api.get('/notes', { params }),
  getNote: (id) => api.get(`/notes/${id}`),
  uploadNote: (formData) => api.post('/notes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  downloadNote: (id) => api.get(`/notes/${id}/download`, { responseType: 'blob' }),
  getMyNotes: (params) => api.get('/notes/my-notes', { params }),
  bookmarkNote: (id) => api.post(`/notes/${id}/bookmark`),
  removeBookmark: (id) => api.delete(`/notes/${id}/bookmark`),
  getBookmarks: (params) => api.get('/notes/bookmarks', { params }),
  getSubjects: () => api.get('/notes/subjects'),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  getActivity: (params) => api.get('/users/activity', { params }),
  getDownloadHistory: (params) => api.get('/users/download-history', { params }),
  getPublicProfile: (id) => api.get(`/users/${id}/public-profile`),
  searchUsers: (params) => api.get('/users/search', { params }),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard-stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.post(`/admin/users/${id}/toggle-status`),
  getPendingNotes: (params) => api.get('/admin/notes/pending', { params }),
  approveNote: (id) => api.post(`/admin/notes/${id}/approve`),
  rejectNote: (id) => api.post(`/admin/notes/${id}/reject`),
  deleteNote: (id) => api.delete(`/admin/notes/${id}`),
  createSubject: (data) => api.post('/admin/subjects', data),
  updateSubject: (id, data) => api.put(`/admin/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/admin/subjects/${id}`),
  getSettings: () => api.get('/admin/settings'),
  updateSetting: (key, data) => api.put(`/admin/settings/${key}`, data),
};

export default api;