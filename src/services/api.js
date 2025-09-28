import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config)=>{
        const token = localStorage.getItem('token');
        if(token){
            config.headers.Authorization= `Bearer ${token}`
        }
        return config;
    },
    (error)=>{
        return Promise.reject(error);
    }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Register user
  register: async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Timesheet API functions
export const timesheetAPI = {
  // Get all timesheets for user
  getTimesheets: async (userId = null) => {
    try {
      const url = userId ? `/timesheets?userId=${userId}` : '/timesheets';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get specific timesheet
  getTimesheetById: async (id) => {
    try {
      const response = await api.get(`/timesheets/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new timesheet
  createTimesheet: async (timesheetData) => {
    try {
      const response = await api.post('/timesheets', timesheetData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update timesheet
  updateTimesheet: async (id, timesheetData) => {
    try {
      const response = await api.put(`/timesheets/${id}`, timesheetData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete timesheet
  deleteTimesheet: async (id) => {
    try {
      const response = await api.delete(`/timesheets/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all timesheets (Admin only)
  getAllTimesheets: async () => {
    try {
      const response = await api.get('/timesheets/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default api;
