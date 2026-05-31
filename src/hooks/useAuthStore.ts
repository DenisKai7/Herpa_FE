import { create } from 'zustand';
import type { User } from '@/types';
import { authApi } from '@/lib/api/auth';
import type { LoginRequest, RegisterRequest } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;

  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,

  login: async (data: LoginRequest) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login(data);
      localStorage.setItem('access_token', response.token);
      set({
        user: response.user,
        token: response.token,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
      throw new Error('Login failed');
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true });
    try {
      const response = await authApi.register(data);
      localStorage.setItem('access_token', response.token);
      set({
        user: response.user,
        token: response.token,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
      throw new Error('Registration failed');
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    set({ user: null, token: null });
  },

  initialize: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ isInitialized: true });
      return;
    }
    try {
      const user = await authApi.getMe();
      set({ user, token, isInitialized: true });
    } catch {
      localStorage.removeItem('access_token');
      set({ user: null, token: null, isInitialized: true });
    }
  },
}));
