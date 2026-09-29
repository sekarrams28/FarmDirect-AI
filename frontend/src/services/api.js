import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach the JWT (if present) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fd_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the token is rejected, clear it so the UI falls back to logged-out state.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fd_token');
      localStorage.removeItem('fd_user');
    }
    return Promise.reject(err);
  }
);

// ---- Auth ----
export const registerUser = (payload) => api.post('/auth/register', payload).then((r) => r.data);
export const loginUser = (payload) => api.post('/auth/login', payload).then((r) => r.data);
export const getMe = () => api.get('/auth/me').then((r) => r.data);
export const updateNotificationPreferences = (payload) =>
  api.put('/auth/notification-preferences', payload).then((r) => r.data);

// ---- Produce ----
export const createProduce = (payload) => api.post('/produce', payload).then((r) => r.data);
export const listMyProduce = () => api.get('/produce').then((r) => r.data);
export const getProduce = (id) => api.get(`/produce/${id}`).then((r) => r.data);
export const updateProduce = (id, payload) => api.put(`/produce/${id}`, payload).then((r) => r.data);
export const deleteProduce = (id) => api.delete(`/produce/${id}`).then((r) => r.data);

// ---- Marketplace ----
export const browseMarketplace = (params) => api.get('/marketplace', { params }).then((r) => r.data);
export const searchMarketplace = (q) => api.get('/marketplace/search', { params: { q } }).then((r) => r.data);
export const nearbyMarketplace = (params) => api.get('/marketplace/nearby', { params }).then((r) => r.data);

// ---- Offers ----
export const createOffer = (payload) => api.post('/offers', payload).then((r) => r.data);
export const listOffers = (produceId) => api.get('/offers', { params: { produceId } }).then((r) => r.data);
export const updateOffer = (id, payload) => api.put(`/offers/${id}`, payload).then((r) => r.data);

// ---- Orders ----
export const createOrder = (payload) => api.post('/orders', payload).then((r) => r.data);
export const listOrders = () => api.get('/orders').then((r) => r.data);
export const getOrder = (id) => api.get(`/orders/${id}`).then((r) => r.data);
export const updateOrderStatus = (id, payload) => api.put(`/orders/${id}/status`, payload).then((r) => r.data);

// ---- AI ----
export const predictDemand = (payload) => api.post('/ai/demand', payload).then((r) => r.data);
export const predictPrice = (payload) => api.post('/ai/price', payload).then((r) => r.data);
export const matchBuyers = (payload) => api.post('/ai/buyer-match', payload).then((r) => r.data);
export const optimizeLogistics = (payload) => api.post('/ai/logistics', payload).then((r) => r.data);
export const farmAdvisor = (payload) => api.post('/ai/farm-advisor', payload).then((r) => r.data);

// ---- Admin ----
export const getAdminDashboard = () => api.get('/admin/dashboard').then((r) => r.data);
export const getAdminAnalytics = () => api.get('/admin/analytics').then((r) => r.data);

// ---- Notifications ----
export const listNotifications = () => api.get('/notifications').then((r) => r.data);
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`).then((r) => r.data);
export const markAllNotificationsRead = () => api.put('/notifications/read-all').then((r) => r.data);

export default api;
