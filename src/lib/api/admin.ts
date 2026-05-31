import apiClient from './client';
import type { AdminAnalytics, AdminUser, UpdateUserRoleRequest } from '@/types';

export const adminApi = {
  getAnalytics: async (): Promise<AdminAnalytics> => {
    const response = await apiClient.get<AdminAnalytics>('/api/admin/analytics');
    return response.data;
  },

  getUsers: async (): Promise<AdminUser[]> => {
    const response = await apiClient.get<AdminUser[]>('/api/admin/users');
    return response.data;
  },

  updateUserRole: async (data: UpdateUserRoleRequest): Promise<AdminUser> => {
    const response = await apiClient.post<AdminUser>('/api/admin/users/role', data);
    return response.data;
  },
};
