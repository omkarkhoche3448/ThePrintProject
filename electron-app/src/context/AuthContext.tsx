import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { ShopkeeperData, AuthResponse } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: ShopkeeperData | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (registrationData: any) => Promise<AuthResponse>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<ShopkeeperData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuthStatus = async () => {
      setLoading(true);
      try {
        if (authService.isLoggedIn()) {
          // Get current user profile to validate token
          const response = await authService.getProfile();
          if (response.success) {
            setIsAuthenticated(true);
            setUser(response.shopkeeper || authService.getCurrentUser());
          } else {
            // If token is invalid, logout
            authService.logout();
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setError('Authentication check failed');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Add listener for auth state changes from API interceptors
    const handleAuthStateChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.authenticated === false) {
        setIsAuthenticated(false);
        setUser(null);
      }
    };
    
    window.addEventListener('auth_state_changed', handleAuthStateChange);
    
    checkAuthStatus();
    
    // Clean up listener when component unmounts
    return () => {
      window.removeEventListener('auth_state_changed', handleAuthStateChange);
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login({ email, password });
      
      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.shopkeeper || null);
      } else {
        setError(response.message || 'Login failed');
      }
      
      setLoading(false);
      return response;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setLoading(false);
      return {
        success: false,
        message: err.message || 'Login failed'
      };
    }
  };

  const register = async (registrationData: any): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.register(registrationData);
      
      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.shopkeeper || null);
      } else {
        setError(response.message || 'Registration failed');
      }
      
      setLoading(false);
      return response;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setLoading(false);
      return {
        success: false,
        message: err.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
