import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? 
      document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login on unauthorized
      if (typeof window !== 'undefined') {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  verifyEmail: (email, otp) => api.post('/api/auth/verify-email', { email, otp }),
  getProfile: (token) => api.get('/api/auth/profile', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  updateProfile: (data, token) => api.put('/api/auth/profile', data, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  changePassword: (data, token) => api.post('/api/auth/change-password', data, {
    headers: { Authorization: `Bearer ${token}` }
  }),
};

// Listings API
export const listingsAPI = {
  getAll: (params) => api.get('/api/listings/', { params }),
  getById: (id) => api.get(`/api/listings/${id}`),
  create: (data) => api.post('/api/listings/', data),
  update: (id, data) => api.put(`/api/listings/${id}`, data),
  delete: (id) => api.delete(`/api/listings/${id}`),
  search: (params) => api.get('/api/listings/search', { params }),
  checkAvailability: (id, params) => api.get(`/api/listings/${id}/availability`, { params }),
  getHostListings: (hostId, params) => api.get(`/api/listings/host/${hostId}`, { params }),
};

// Bookings API
export const bookingsAPI = {
  create: (data) => api.post('/api/bookings/', data),
  getAll: (params) => api.get('/api/bookings/', { params }),
  getById: (id) => api.get(`/api/bookings/${id}`),
  completePayment: (id, data) => api.post(`/api/bookings/${id}/payment`, data),
  cancel: (id, data) => api.post(`/api/bookings/${id}/cancel`, data),
  complete: (id) => api.post(`/api/bookings/${id}/complete`),
};

// AI Features API
export const aiAPI = {
  // Voice to Listing
  voiceToListing: (data) => api.post('/api/ai-features/voice-to-listing', data),
  createListingFromVoice: (data) => api.post('/api/ai-features/create-listing-from-voice', data),
  demoVoiceTranscription: (data) => api.post('/api/ai-features/demo/voice-transcription', data),
  
  // Village Story Generator
  generateVillageStory: (data) => api.post('/api/ai-features/generate-village-story', data),
  getStoryStatus: (id) => api.get(`/api/ai-features/village-story-status/${id}`),
  
  // Cultural Concierge
  culturalConcierge: (data) => api.post('/api/ai-features/cultural-concierge', data),
  demoCulturalChat: (data) => api.post('/api/ai-features/demo/cultural-chat', data),
  getConciergeHistory: (params) => api.get('/api/ai-features/cultural-concierge/history', { params }),
  getCulturalInsights: (location) => api.get(`/api/ai-features/cultural-insights/${location}`),
  
  // Image Analysis
  analyzePropertyImages: (data) => api.post('/api/ai-features/analyze-property-images', data),
  generateListingPhotos: (data) => api.post('/api/ai-features/generate-listing-photos', data),
  
  // General AI
  travelAssistant: (data) => api.post('/api/ai/travel-assistant', data),
  translate: (data) => api.post('/api/ai/translate', data),
  generateDescription: (data) => api.post('/api/ai/generate-description', data),
  sustainabilitySuggestions: (data) => api.post('/api/ai/sustainability-suggestions', data),
};

// Impact API
export const impactAPI = {
  getUserImpact: (userId) => api.get(`/api/impact/user/${userId}`),
  getCommunityImpact: (location) => api.get(`/api/impact/community/${location}`),
  getOverallImpact: (params) => api.get('/api/impact/overall', { params }),
  calculateCarbonFootprint: (data) => api.post('/api/impact/carbon-footprint', data),
  getLeaderboard: (params) => api.get('/api/impact/leaderboard', { params }),
  getSustainabilityScore: (listingId) => api.get(`/api/impact/sustainability-score/${listingId}`),
};

// Admin API
export const adminAPI = {
  getDashboard: (params) => api.get('/api/admin/dashboard', { params }),
  getUsers: (params) => api.get('/api/admin/users', { params }),
  getListings: (params) => api.get('/api/admin/listings', { params }),
  approveListing: (id, data) => api.post(`/api/admin/listings/${id}/approve`, data),
  rejectListing: (id, data) => api.post(`/api/admin/listings/${id}/reject`, data),
  getBookings: (params) => api.get('/api/admin/bookings', { params }),
  getAnalytics: (params) => api.get('/api/admin/analytics', { params }),
  // User management
  suspendUser: (userId) => api.post(`/api/admin/users/${userId}/suspend`),
  activateUser: (userId) => api.post(`/api/admin/users/${userId}/activate`),
  deleteUser: (userId) => api.delete(`/api/admin/users/${userId}`),
  
  // Listing management  
  getListingDetails: (listingId) => api.get(`/api/admin/listings/${listingId}`),
  
  // System health
  getSystemHealth: () => api.get('/api/admin/system/health'),
  getSystemLogs: (params) => api.get('/api/admin/system/logs', { params }),
};

export default api;