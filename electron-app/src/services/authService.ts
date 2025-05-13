import api from './api';

// Types for authentication
export interface ShopkeeperRegistrationData {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  printCosts?: {
    blackAndWhite: number;
    color: number;
  };  discountRules?: Array<{
    discountPercentage: number;
    minimumOrderAmount: number;
  }>;
  shopHours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  priorityRate?: number; // Added priorityRate field for express printing service pricing multiplier
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ShopkeeperData {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address?: any;
  printCosts?: any;
  discountRules?: any[];
  shopHours?: any;
  priorityRate?: number;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  shopkeeper?: ShopkeeperData;
  message?: string;
  error?: string;
}

/**
 * Authentication service to handle all auth-related API calls
 */
export const authService = {  /**
   * Register a new shopkeeper
   * @param data Registration data
   * @returns Promise with auth response
   */
  register: async (data: ShopkeeperRegistrationData): Promise<AuthResponse> => {
    try {
      // Using the exact endpoint as specified in the backend: POST /api/auth/register
      const response = await api.post<AuthResponse>('/api/auth/register', data);
      
      // Store token and user data if registration is successful
      if (response.data.success && response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_data', JSON.stringify(response.data.shopkeeper));
      }
      
      return response.data;
    } catch (error: any) {
      // Return error in consistent format
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
        error: error.response?.data?.error || error.message
      };
    }
  },
  /**
   * Login an existing shopkeeper
   * @param data Login credentials
   * @returns Promise with auth response
   */
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      // Using the exact endpoint as specified in the backend: POST /api/auth/login
      const response = await api.post<AuthResponse>('/api/auth/login', data);
      
      // Store token and user data if login is successful
      if (response.data.success && response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_data', JSON.stringify(response.data.shopkeeper));
      }
      
      return response.data;
    } catch (error: any) {
      // Return error in consistent format
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
        error: error.response?.data?.error || error.message
      };
    }
  },
  /**
   * Get current logged in shopkeeper's profile
   * @returns Promise with auth response
   */
  getProfile: async (): Promise<AuthResponse> => {
    try {
      // Using the exact endpoint as specified in the backend: GET /api/auth/me
      const response = await api.get<AuthResponse>('/api/auth/me');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get profile',
        error: error.response?.data?.error || error.message
      };
    }
  },
  /**
   * Update shopkeeper profile
   * @param data Profile data to update
   * @returns Promise with auth response
   */
  updateProfile: async (data: Partial<ShopkeeperRegistrationData>): Promise<AuthResponse> => {
    try {
      // Using the exact endpoint as specified in the backend: PUT /api/auth/me
      const response = await api.put<AuthResponse>('/api/auth/me', data);
      
      // Update stored user data if update is successful
      if (response.data.success && response.data.shopkeeper) {
        localStorage.setItem('user_data', JSON.stringify(response.data.shopkeeper));
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile',
        error: error.response?.data?.error || error.message
      };
    }
  },
  /**
   * Update shopkeeper password
   * @param currentPassword Current password
   * @param newPassword New password
   * @returns Promise with auth response
   */
  updatePassword: async (currentPassword: string, newPassword: string): Promise<AuthResponse> => {
    try {
      // Using the exact endpoint as specified in the backend: PUT /api/auth/update-password
      const response = await api.put<AuthResponse>('/api/auth/update-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update password',
        error: error.response?.data?.error || error.message
      };
    }
  },
  
  /**
   * Logout the current user
   */
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    // Here you could also invalidate the token on the server side if needed
  },
  
  /**
   * Check if the user is logged in
   * @returns Boolean indicating if user is logged in
   */
  isLoggedIn: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },
    /**
   * Get the current user data
   * @returns Shopkeeper data or null if not logged in
   */
  getCurrentUser: (): ShopkeeperData | null => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }
};

export default authService;
