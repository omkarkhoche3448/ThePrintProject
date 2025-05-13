// API service for handling HTTP requests
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor to include authentication token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Use the exact format expected by the backend: Bearer <token>
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error status codes
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.status, error.response.data);
      
      // Handle unauthorized errors (token expired or invalid)
      if (error.response.status === 401) {
        // Clear authentication data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        
        // Redirect to login page if we're in a browser environment
        // This will trigger a re-render in the AuthContext
        if (typeof window !== 'undefined') {
          // Use a custom event to notify the app about auth state change
          window.dispatchEvent(new CustomEvent('auth_state_changed', { detail: { authenticated: false } }));
          
          // If not already on the login page, redirect there
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
