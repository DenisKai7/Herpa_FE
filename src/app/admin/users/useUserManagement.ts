'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api/client';
import type { AdminUser } from '@/types';

export interface UserListParams {
  limit?: number;
  offset?: number;
  search?: string;
  role?: string;
  status?: string;
  sort?: string;
  sort_dir?: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  full_name: string;
  instansi?: string;
  role: 'admin' | 'user';
}

export interface UpdateUserPayload {
  full_name?: string;
  instansi?: string;
  role?: 'admin' | 'user';
  account_status?: 'active' | 'suspended';
}

export function useUserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [params, setParams] = useState<UserListParams>({ limit: 10, offset: 0 });

  const fetchUsers = useCallback(async (p?: UserListParams) => {
    const merged = p ? { ...params, ...p } : params;
    if (p) setParams(merged);
    setLoading(true);
    try {
      const { data } = await apiClient.get('/api/admin/users', { params: merged, silent: true });
      setUsers(data.users);
      setTotal(data.total);
    } catch {
      toast.error('Gagal memuat daftar pengguna.');
    } finally {
      setLoading(false);
    }
  }, [params]);

  const createUser = useCallback(async (payload: CreateUserPayload): Promise<boolean> => {
    setActionLoading(true);
    try {
      await apiClient.post('/api/admin/users', payload);
      toast.success('Pengguna berhasil ditambahkan.');
      await fetchUsers();
      return true;
    } catch {
      toast.error('Gagal menambahkan pengguna.');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [fetchUsers]);

  const updateUser = useCallback(async (userId: string, payload: UpdateUserPayload): Promise<boolean> => {
    setActionLoading(true);
    try {
      await apiClient.patch(`/api/admin/users/${userId}`, payload);
      toast.success('Pengguna berhasil diperbarui.');
      await fetchUsers();
      return true;
    } catch {
      toast.error('Gagal memperbarui pengguna.');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [fetchUsers]);

  const deleteUser = useCallback(async (userId: string, reason?: string): Promise<boolean> => {
    setActionLoading(true);
    try {
      await apiClient.delete(`/api/admin/users/${userId}`, { data: reason ? { reason } : undefined });
      toast.success('Pengguna berhasil dihapus.');
      await fetchUsers();
      return true;
    } catch {
      toast.error('Gagal menghapus pengguna.');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [fetchUsers]);

  const restoreUser = useCallback(async (userId: string): Promise<boolean> => {
    setActionLoading(true);
    try {
      await apiClient.post(`/api/admin/users/${userId}/restore`);
      toast.success('Pengguna berhasil dipulihkan.');
      await fetchUsers();
      return true;
    } catch {
      toast.error('Gagal memulihkan pengguna.');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [fetchUsers]);

  return {
    users, total, loading, params, actionLoading,
    fetchUsers, createUser, updateUser, deleteUser, restoreUser,
  };
}
