'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Mail,
  Building2,
  MapPin,
  Calendar,
  Camera,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Shield,
  AtSign,
  KeyRound,
  MessageSquare,
  BookOpen,
  History,
} from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { authApi } from '@/lib/api/auth';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import type { Persona } from '@/types/persona';
import type { ModelMode } from '@/types/model';
import toast from 'react-hot-toast';

// ─── Form Input Component ────────────────────────────────────────────
interface FormInputProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  prefix?: string;
}

function FormInput({
  id,
  label,
  icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  prefix,
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400"
      >
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
          {icon}
        </div>
        {prefix && (
          <span className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 text-sm select-none font-medium">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full py-3 border rounded-xl text-sm transition-all duration-200',
            'bg-white text-slate-900 border-slate-200 focus:ring-purple-500/40 focus:border-purple-500',
            'dark:bg-[#1f2937] dark:text-white dark:border-slate-700 dark:focus:ring-blue-500/50 dark:focus:border-blue-500',
            'placeholder:text-slate-400 dark:placeholder:text-gray-600',
            'focus:outline-none focus:ring-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            prefix ? 'pl-14 pr-4' : 'pl-11 pr-4'
          )}
        />
      </div>
    </div>
  );
}

// ─── Password Input Component ────────────────────────────────────────
interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function PasswordInput({ id, label, value, onChange, placeholder }: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400"
      >
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-11 pr-11 py-3 border rounded-xl text-sm transition-all duration-200',
            'bg-white text-slate-900 border-slate-200 focus:ring-purple-500/40 focus:border-purple-500',
            'dark:bg-[#1f2937] dark:text-white dark:border-slate-700 dark:focus:ring-blue-500/50 dark:focus:border-blue-500',
            'placeholder:text-slate-400 dark:placeholder:text-gray-650',
            'focus:outline-none focus:ring-2'
          )}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

// ─── Main Profile Page ──────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const { user, isInitialized, initialize, logout, setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Form state ──
  const [form, setForm] = useState({
    username: '',
    full_name: '',
    email: '',
    instansi: '',
    provinsi: '',
    kota: '',
    default_persona: 'umum' as Persona,
    default_model_mode: 'fast-medium' as ModelMode,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);

  // ── Password modal state ──
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // ── Initialize auth ──
  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login');
    }
  }, [isInitialized, user, router]);

  // ── Populate form when user data arrives ──
  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || '',
        full_name: user.full_name || '',
        email: user.email || '',
        instansi: user.instansi || '',
        provinsi: user.provinsi || '',
        kota: user.kota || '',
        default_persona: ((user as any).default_persona as Persona) || 'umum',
        default_model_mode: ((user as any).default_model_mode as ModelMode) || 'fast-medium',
      });
    }
  }, [user]);

  // ── Loading state ──
  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090d16]">
        <Spinner size="lg" />
      </div>
    );
  }

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ── Avatar Upload ──
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB.');
      return;
    }

    try {
      const updatedUser = await authApi.uploadAvatar(file);
      setUser(updatedUser);
      toast.success('Avatar updated successfully!');
    } catch {
      // Handled by client toast interceptor
    }
  };

  // ── Save Profile ──
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.full_name.trim() || !form.email.trim()) {
      toast.error('Name and email are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedUser = await authApi.updateProfile({
        username: form.username,
        full_name: form.full_name,
        email: form.email,
        instansi: form.instansi,
        provinsi: form.provinsi,
        kota: form.kota,
        ...({
          default_persona: form.default_persona,
          default_model_mode: form.default_model_mode,
        } as any),
      });
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch {
      // Handled by client toast interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Change Password ──
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({
        old_password: passwordForm.oldPassword,
        new_password: passwordForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      // Handled by client toast interceptor
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ── Logout ──
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const initials = user.full_name?.charAt(0).toUpperCase() || '?';
  const joinedDate = new Date(user.created_at).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#090d16] dark:text-white transition-colors duration-200">
      {/* ── Header ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-700 dark:hover:text-gray-200 transition-all duration-200 cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              <h1 className="text-lg font-semibold text-slate-800 dark:text-gray-100">Profile</h1>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium',
              'text-red-500 dark:text-red-400 hover:bg-red-500/5 dark:hover:bg-red-500/10 hover:text-red-650 dark:hover:text-red-300',
              'transition-all duration-200 cursor-pointer'
            )}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* ── Main Content ──────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSave}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
          >
            {/* ── Avatar Section ───────────────────────────────── */}
            <div className="px-6 py-10 flex flex-col items-center border-b border-slate-200 dark:border-slate-800">
              <div className="relative mb-5">
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  onMouseEnter={() => setIsAvatarHovered(true)}
                  onMouseLeave={() => setIsAvatarHovered(false)}
                  className="relative h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-4xl cursor-pointer overflow-hidden ring-4 ring-slate-100 dark:ring-gray-800 transition-all duration-300 hover:ring-blue-500/30"
                >
                  {initials}
                  <AnimatePresence>
                    {isAvatarHovered && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full"
                      >
                        <Camera className="h-6 w-6 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              <h2 className="text-xl font-semibold text-slate-850 dark:text-gray-100">{user.full_name}</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 mt-2 capitalize">
                {user.role === 'admin' && <Shield className="h-3 w-3 mr-1.5" />}
                {user.role}
              </span>

              <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500 dark:text-gray-500">
                <Calendar className="h-3.5 w-3.5" />
                <span>Joined {joinedDate}</span>
              </div>
            </div>

            {/* ── Form Fields ─────────────────────────── */}
            <div className="p-6 space-y-6">
              {/* Section: Personal Information */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-5">
                  Personal Information
                </h3>
                <div className="space-y-5">
                  <FormInput
                    id="username"
                    label="Username"
                    icon={<AtSign className="h-4 w-4" />}
                    value={form.username}
                    onChange={(v) => updateField('username', v)}
                    placeholder="ahmadsuryadi"
                  />
                  <FormInput
                    id="full_name"
                    label="Full Name"
                    icon={<User className="h-4 w-4" />}
                    value={form.full_name}
                    onChange={(v) => updateField('full_name', v)}
                    placeholder="Dr. Ahmad Suryadi"
                  />
                  <FormInput
                    id="email"
                    label="Email"
                    icon={<Mail className="h-4 w-4" />}
                    type="email"
                    value={form.email}
                    onChange={(v) => updateField('email', v)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-gray-800" />

              {/* Section: AI Preferences */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-5">
                  AI Preferences
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                      Default Persona
                    </label>
                    <select
                      value={form.default_persona}
                      onChange={(e) => updateField('default_persona', e.target.value as Persona)}
                      className="w-full px-3 py-3 border border-slate-250 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-550 focus:border-purple-500 bg-white dark:bg-[#1f2937] text-slate-900 dark:text-white"
                    >
                      <option value="umum">Umum</option>
                      <option value="pelajar">Pelajar</option>
                      <option value="peneliti">Peneliti</option>
                      <option value="tenaga_medis">Tenaga Medis</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                      Default Model Mode
                    </label>
                    <select
                      value={form.default_model_mode}
                      onChange={(e) => updateField('default_model_mode', e.target.value as ModelMode)}
                      className="w-full px-3 py-3 border border-slate-250 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-550 focus:border-purple-500 bg-white dark:bg-[#1f2937] text-slate-900 dark:text-white"
                    >
                      <option value="fast-medium">Fast Medium</option>
                      <option value="thinking-high">Thinking High</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-gray-800" />

              {/* Section: Institution & Location */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-5">
                  Institution & Location
                </h3>
                <div className="space-y-5">
                  <FormInput
                    id="instansi"
                    label="Institution (Instansi)"
                    icon={<Building2 className="h-4 w-4" />}
                    value={form.instansi}
                    onChange={(v) => updateField('instansi', v)}
                    placeholder="Rumah Sakit Harapan Kita"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormInput
                      id="provinsi"
                      label="Province (Provinsi)"
                      icon={<MapPin className="h-4 w-4" />}
                      value={form.provinsi}
                      onChange={(v) => updateField('provinsi', v)}
                      placeholder="DKI Jakarta"
                    />
                    <FormInput
                      id="kota"
                      label="City (Kota)"
                      icon={<MapPin className="h-4 w-4" />}
                      value={form.kota}
                      onChange={(v) => updateField('kota', v)}
                      placeholder="Jakarta Pusat"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-gray-800" />

              {/* ── Security Section ──────────────────────────── */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-5">
                  Security
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-200/50 dark:bg-gray-700/50 flex items-center justify-center">
                      <KeyRound className="h-5 w-5 text-slate-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-gray-200">Password</p>
                      <p className="text-xs text-slate-500 dark:text-gray-500">Ubah password berkala untuk keamanan</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(true)}
                      className={cn(
                        'px-4 py-2 rounded-xl text-sm font-medium',
                        'bg-slate-200/60 dark:bg-gray-700 text-slate-700 dark:text-gray-200',
                        'hover:bg-slate-200 dark:hover:bg-gray-600 transition-all duration-200 cursor-pointer'
                      )}
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Action Buttons ───────────────────────────────── */}
            <div className="px-6 py-5 border-t border-slate-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50">
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className={cn(
                    'w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-medium',
                    'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800',
                    'transition-all duration-200 cursor-pointer'
                  )}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    'w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium',
                    'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
                    'disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer'
                  )}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </form>
      </main>

      {/* Password Update Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Ubah Password"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <PasswordInput
            id="oldPassword"
            label="Password Lama"
            value={passwordForm.oldPassword}
            onChange={(v) => setPasswordForm((prev) => ({ ...prev, oldPassword: v }))}
          />
          <PasswordInput
            id="newPassword"
            label="Password Baru"
            value={passwordForm.newPassword}
            onChange={(v) => setPasswordForm((prev) => ({ ...prev, newPassword: v }))}
          />
          <PasswordInput
            id="confirmPassword"
            label="Konfirmasi Password Baru"
            value={passwordForm.confirmPassword}
            onChange={(v) => setPasswordForm((prev) => ({ ...prev, confirmPassword: v }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              className="px-4 py-2 border rounded-xl text-sm font-medium hover:bg-slate-50 cursor-pointer text-slate-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              Ubah Password
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
