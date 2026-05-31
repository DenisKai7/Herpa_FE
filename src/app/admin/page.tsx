'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  MessageSquare,
  MessagesSquare,
  Activity,
  ArrowLeft,
  Shield,
  UserCog,
  Search,
} from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { adminApi } from '@/lib/api/admin';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner, Skeleton } from '@/components/ui/Spinner';
import type { AdminAnalytics, AdminUser, UserRole } from '@/types';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isInitialized, initialize } = useAuthStore();

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Role update modal
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Protect admin route
  useEffect(() => {
    if (isInitialized && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [isInitialized, user, router]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoadingAnalytics(true);
      const data = await adminApi.getAnalytics();
      setAnalytics(data);
    } catch {
      // Handled by interceptor
    } finally {
      setIsLoadingAnalytics(false);
    }

    try {
      setIsLoadingUsers(true);
      const usersData = await adminApi.getUsers();
      setUsers(usersData);
    } catch {
      // Handled by interceptor
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user, fetchData]);

  const handleRoleUpdate = async () => {
    if (!roleTarget) return;
    setIsUpdatingRole(true);
    try {
      await adminApi.updateUserRole({ user_id: roleTarget.id, role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === roleTarget.id ? { ...u, role: newRole } : u))
      );
      toast.success(`Role updated to ${newRole}`);
      setRoleModalOpen(false);
    } catch {
      // Handled by interceptor
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isInitialized || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Users',
      value: analytics?.total_users ?? 0,
      icon: <Users className="h-5 w-5" />,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      label: 'Total Messages',
      value: analytics?.total_messages ?? 0,
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'text-green-600 bg-green-100',
    },
    {
      label: 'Total Chats',
      value: analytics?.total_chats ?? 0,
      icon: <MessagesSquare className="h-5 w-5" />,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      label: 'Active Today',
      value: analytics?.active_users_today ?? 0,
      icon: <Activity className="h-5 w-5" />,
      color: 'text-amber-600 bg-amber-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Cards */}
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
              >
                {isLoadingAnalytics ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ) : (
                  <>
                    <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center mb-3', card.color)}>
                      {card.icon}
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* User Management */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              User Management
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all w-64"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {isLoadingUsers ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-5 py-3 font-medium text-gray-500">Name</th>
                      <th className="text-left px-5 py-3 font-medium text-gray-500">Email</th>
                      <th className="text-left px-5 py-3 font-medium text-gray-500">Institution</th>
                      <th className="text-left px-5 py-3 font-medium text-gray-500">Role</th>
                      <th className="text-right px-5 py-3 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-medium text-gray-800">{u.full_name}</td>
                        <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                        <td className="px-5 py-3.5 text-gray-500">{u.instansi}</td>
                        <td className="px-5 py-3.5">
                          <span
                            className={cn(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-600'
                            )}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => {
                              setRoleTarget(u);
                              setNewRole(u.role === 'admin' ? 'user' : 'admin');
                              setRoleModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <UserCog className="h-3.5 w-3.5" />
                            Change role
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Role Update Modal */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title="Change User Role"
      >
        {roleTarget && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Update <span className="font-semibold">{roleTarget.full_name}</span>&apos;s role:
            </p>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all bg-white"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setRoleModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleRoleUpdate} isLoading={isUpdatingRole}>
                Update Role
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
