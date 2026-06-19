import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

const token = localStorage.getItem('ssc_token');
if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;

export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/profile', data);

export const getProducts = (params) => api.get('/products', { params });
export const getFlashDeals = () => api.get('/products/flash-deals');
export const getProduct = (id) => api.get(`/products/${id}`);
export const getCategories = () => api.get('/products/categories');
export const getRecommendations = (id) => api.get(`/products/${id}/recommendations`);
export const getSearchHistoryRecommendations = (terms) =>
  api.get('/products/recommendations/search-history', { params: { terms } });

export const getCoupons = () => api.get('/coupons');
export const applyCoupon = (data) => api.post('/coupons/apply', data);
export const createOrder = (data) => api.post('/orders/create', data);
export const getOrders = (userId) => api.get('/orders', { params: { userId } });
export const getOrder = (id) => api.get(`/orders/${id}`);
export const trackOrder = (orderNumber) => api.get(`/orders/track/${orderNumber}`);

export const getAddresses = (userId) => api.get(`/addresses/${userId}`);
export const createAddress = (data) => api.post('/addresses', data);
export const updateAddress = (id, data) => api.put(`/addresses/${id}`, data);
export const deleteAddress = (id) => api.delete(`/addresses/${id}`);

export const getWishlistApi = (userId) => api.get(`/wishlist/${userId}`);
export const addWishlistApi = (data) => api.post('/wishlist/add', data);
export const removeWishlistApi = (data) => api.post('/wishlist/remove', data);

export const getAdminStats = () => api.get('/admin/stats');
export const getAdminAnalytics = () => api.get('/admin/analytics');
export const getAdminOrders = () => api.get('/admin/orders');
export const updateOrderStatus = (id, status) =>
  api.patch(`/orders/${id}/status`, { status });

// Emails Sandbox API
export const getEmails = (userId) => api.get('/emails', { params: { userId } });
export const deleteEmail = (id) => api.delete(`/emails/${id}`);
export const clearEmails = () => api.delete('/emails/clear');

// Notifications API
export const getNotifications = (userId) => api.get('/notifications', { params: { userId } });
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);
export const clearNotifications = (userId) => api.delete('/notifications/clear', { params: { userId } });
export const broadcastNotification = (data) => api.post('/notifications', data);

// Admin Extensions API
export const createCoupon = (data) => api.post('/coupons/create', data);
export const toggleCoupon = (data) => api.patch('/coupons/toggle', data);
export const createProduct = (data) => api.post('/products/create', data);
export const updateProductStock = (id, stock) => api.patch(`/products/${id}/stock`, { stock });

export default api;
