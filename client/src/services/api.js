import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,  // your backend server URL
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
}

// Resident API
export const residentAPI = {
  getComplaints: (params) => api.get('/resident/complaints', { params }),
  getComplaint: (id) => api.get(`/resident/complaints/${id}`),
  createComplaint: (data) => api.post('/resident/complaints', data),
  uploadAttachments: (id, files) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    return api.post(`/resident/complaints/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getNotifications: (unread_only) => 
    api.get('/resident/notifications', { params: { unread_only } }),
  markNotificationRead: (id) => 
    api.put(`/resident/notifications/${id}/read`),
}

// Admin API
export const adminAPI = {
  getComplaints: (params) => api.get('/admin/complaints', { params }),
  getComplaint: (id) => api.get(`/admin/complaints/${id}`),
  approveComplaint: (id) => api.post(`/admin/complaints/${id}/approve`),
  rejectComplaint: (id, rejection_reason) => 
    api.post(`/admin/complaints/${id}/reject`, { rejection_reason }),
  assignComplaint: (id, worker_id) => 
    api.post(`/admin/complaints/${id}/assign`, { worker_id }),
  verifyWork: (id, action, feedback) => 
    api.post(`/admin/complaints/${id}/verify`, { action, feedback }),
  getWorkers: () => api.get('/admin/workers'),
  getAnalytics: () => api.get('/admin/analytics'),
  addComment: (id, comment) => 
    api.post(`/admin/complaints/${id}/comments`, { comment }),
}

// Worker API
export const workerAPI = {
  getTasks: (params) => api.get('/worker/tasks', { params }),
  getTask: (id) => api.get(`/worker/tasks/${id}`),
  updateTaskStatus: (id, status, resolution) => 
    api.put(`/worker/tasks/${id}/status`, { status, resolution }),
  uploadProof: (id, files) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    return api.post(`/worker/tasks/${id}/proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  addComment: (id, comment) => 
    api.post(`/worker/tasks/${id}/comments`, { comment }),
  getNotifications: (unread_only) => 
    api.get('/worker/notifications', { params: { unread_only } }),
}

export default api

