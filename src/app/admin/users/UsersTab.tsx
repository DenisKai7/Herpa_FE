'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, RotateCcw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { StatusBadge, RoleBadge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useUserManagement } from './useUserManagement';
import { CreateUserModal } from './CreateUserModal';
import { EditUserModal } from './EditUserModal';
import { UserDetailModal } from './UserDetailModal';
import type { AdminUser } from '@/types';

const LIMIT = 10;

export function UsersTab() {
  const { user: currentUser } = useAuthStore();
  const { users, total, loading, actionLoading, params, fetchUsers, createUser, updateUser, deleteUser, restoreUser } = useUserManagement();

  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('created_at:desc');

  const reload = useCallback((overrides?: Record<string, string | number>) => {
    const [sortField, sortDir] = sort.split(':');
    fetchUsers({
      limit: LIMIT,
      offset: 0,
      search: search || undefined,
      role: roleFilter || undefined,
      status: statusFilter || undefined,
      sort: sortField,
      sort_dir: sortDir,
      ...overrides,
    });
  }, [search, roleFilter, statusFilter, sort, fetchUsers]);

  useEffect(() => { reload(); }, [search, roleFilter, statusFilter, sort]);

  const selectCls = 'px-3 py-2 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-purple-500 text-gray-900 dark:text-gray-100 transition-colors';

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <SearchInput value={search} onChange={setSearch} placeholder="Cari nama atau email..." />
        </div>
        <select className={selectCls} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">Semua Role</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <select className={selectCls} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="suspended">Ditangguhkan</option>
          <option value="deleted">Dihapus</option>
        </select>
        <select className={selectCls} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="created_at:desc">Terbaru</option>
          <option value="created_at:asc">Terlama</option>
          <option value="full_name:asc">Nama A-Z</option>
          <option value="full_name:desc">Nama Z-A</option>
          <option value="email:asc">Email A-Z</option>
        </select>
        <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
          Tambah Pengguna
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              {['Nama', 'Email', 'Role', 'Status', 'Instansi', 'Terdaftar', 'Aksi'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">Tidak ada pengguna ditemukan.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 cursor-pointer transition-colors"
                  onClick={() => setDetailUser(u)}
                >
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{u.full_name ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{u.email}</td>
                  <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-4 py-3"><StatusBadge status={u.account_status} /></td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{u.instansi ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-500">{fmtDate(u.created_at)}</td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" icon={<Eye className="h-3.5 w-3.5" />} onClick={() => setDetailUser(u)} />
                      <Button variant="secondary" size="sm" onClick={() => setEditUser(u)}>Edit</Button>
                      {u.account_status === 'deleted' ? (
                        <Button variant="secondary" size="sm" icon={<RotateCcw className="h-3.5 w-3.5" />} onClick={() => restoreUser(u.id)} isLoading={actionLoading}>
                          Pulihkan
                        </Button>
                      ) : currentUser?.id !== u.id ? (
                        <Button variant="danger" size="sm" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setDeleteTarget(u)}>
                          Hapus
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        total={total}
        limit={params.limit ?? LIMIT}
        offset={params.offset ?? 0}
        onPageChange={(offset) => reload({ offset })}
      />

      {/* Modals */}
      <CreateUserModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={createUser}
        isLoading={actionLoading}
      />
      <EditUserModal
        user={editUser}
        onClose={() => setEditUser(null)}
        onSubmit={(data) => editUser ? updateUser(editUser.id, data) : Promise.resolve(false)}
        isLoading={actionLoading}
      />
      <UserDetailModal user={detailUser} onClose={() => setDetailUser(null)} />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Pengguna"
        message={`Apakah Anda yakin ingin menghapus pengguna "${deleteTarget?.full_name ?? deleteTarget?.email}"?`}
        confirmLabel="Hapus"
        variant="danger"
        isLoading={actionLoading}
        onConfirm={async () => {
          if (deleteTarget) {
            const ok = await deleteUser(deleteTarget.id);
            if (ok) setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
