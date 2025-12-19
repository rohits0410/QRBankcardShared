import api from './api';
import { LoginDto, RegisterDto, LoginResponse } from '@/types';

export const authService = {
  // Register
  register: async (data: RegisterDto): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/register', data);
    return response.data;
  },

  // Login
  login: async (data: LoginDto): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.clear();
  },

  // Check if authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Get current user data from localStorage
  getCurrentUser: () => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    
    if (userId && username) {
      return {
        userId: parseInt(userId),
        username,
      };
    }
    return null;
  },
};