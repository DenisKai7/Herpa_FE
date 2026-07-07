'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { CreateUserPayload } from './useUserManagement';

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserPayload) => Promise<boolean>;
  isLoading: boolean;
}

const empty = { full_name: '', email: '', password: '', instansi: '', role: 'user' as const };

export function CreateUserModal({ open, onClose, onSubmit, isLoading }: CreateUserModalProps) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.full_name.trim()) e.full_name = 'Nama lengkap wajib diisi.';
    if (!form.email.trim()) e.email = 'Email wajib diisi.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Format email tidak valid.';
    if (!form.password) e.password = 'Password wajib diisi.';
    else if (form.password.length < 8) e.password = 'Password minimal 8 karakter.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const payload: CreateUserPayload = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
      ...(form.instansi.trim() ? { instansi: form.instansi.trim() } : {}),
    };
    const ok = await onSubmit(payload);
    if (ok) { setForm(empty); setErrors({}); onClose(); }
  };

  const handleClose = () => { setForm(empty); setErrors({}); onClose(); };

  const inputCls = 'w-full px-3 py-2 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-purple-500 text-gray-900 dark:text-gray-100 transition-colors';

  return (
    <Modal isOpen={open} onClose={handleClose} title="Tambah Pengguna">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
          <input className={inputCls} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
          <input type="password" className={inputCls} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Instansi (opsional)</label>
          <input className={inputCls} value={form.instansi} onChange={(e) => setForm({ ...form, instansi: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
          <select className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'admin' | 'user' })}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" size="sm" type="button" onClick={handleClose} disabled={isLoading}>Batal</Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>Simpan</Button>
        </div>
      </form>
    </Modal>
  );
}
