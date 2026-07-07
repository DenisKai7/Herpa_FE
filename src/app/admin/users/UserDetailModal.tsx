'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { StatusBadge, RoleBadge } from '@/components/ui/Badge';
import type { AdminUser } from '@/types';

interface UserDetailModalProps {
  user: AdminUser | null;
  onClose: () => void;
}

function fmt(dateStr: string | null): string {
  if (!dateStr) return 'Belum pernah';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-xs text-gray-900 dark:text-gray-100 text-right max-w-[60%]">{children}</span>
    </div>
  );
}

export function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  if (!user) return null;

  return (
    <Modal isOpen={!!user} onClose={onClose} title="Detail Pengguna">
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        <Row label="Nama Lengkap">{user.full_name ?? '-'}</Row>
        <Row label="Email">{user.email}</Row>
        <Row label="Username">{user.username ?? '-'}</Row>
        <Row label="Role"><RoleBadge role={user.role} /></Row>
        <Row label="Status"><StatusBadge status={user.account_status} /></Row>
        <Row label="Persona">{user.persona ?? '-'}</Row>
        <Row label="Instansi">{user.instansi ?? '-'}</Row>
        <Row label="Provinsi">{user.provinsi ?? '-'}</Row>
        <Row label="Kota">{user.kota ?? '-'}</Row>
        <Row label="Terdaftar">{fmt(user.created_at)}</Row>
        <Row label="Terakhir Aktif">{fmt(user.last_active_at)}</Row>
      </div>
      <div className="flex justify-end pt-4">
        <Button variant="secondary" size="sm" onClick={onClose}>Tutup</Button>
      </div>
    </Modal>
  );
}
