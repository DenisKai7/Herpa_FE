'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { AdminUser } from '@/types';
import type { UpdateUserPayload } from './useUserManagement';

interface EditUserModalProps {
  user: AdminUser | null;
  onClose: () => void;
  onSubmit: (data: UpdateUserPayload) => Promise<boolean>;
  isLoading: boolean;
}

export function EditUserModal({ user, onClose, onSubmit, isLoading }: EditUserModalProps) {
  const [form, setForm] = useState({ full_name: '', instansi: '', role: 'user' as 'admin' | 'user', account_status: 'active' as 'active' | 'suspended' });

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name ?? '',
        instansi: user.instansi ?? '',
        role: user.role,
        account_status: user.account_status === 'deleted' ? 'active' : user.account_status,
      });
    }
  }, [user]);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const payload: UpdateUserPayload = {
      full_name: form.full_name.trim() || undefined,
      instansi: form.instansi.trim() || undefined,
      role: form.role,
      account_status: form.account_status,
    };
    const ok = await onSubmit(payload);
    if (ok) onClose();
  };

  const inputCls = 'w-full px-3 py-2 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-purple-500 text-gray-900 dark:text-gray-100 transition-colors';

  return (
    <Modal isOpen={!!user} onClose={onClose} title="Edit Pengguna">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
          <input className={inputCls} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Instansi</label>
          <input className={inputCls} value={form.instansi} onChange={(e) => setForm({ ...form, instansi: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
          <select className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'admin' | 'user' })}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select className={inputCls} value={form.account_status} onChange={(e) => setForm({ ...form, account_status: e.target.value as 'active' | 'suspended' })}>
            <option value="active">Aktif</option>
            <option value="suspended">Ditangguhkan</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isLoading}>Batal</Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>Simpan</Button>
        </div>
      </form>
    </Modal>
  );
}
