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
  Loader2,
  Shield,
  AtSign,
  KeyRound,
  Save,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { authApi } from '@/lib/api/auth';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
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
        className="block text-sm font-medium text-gray-400"
      >
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
          {icon}
        </div>
        {prefix && (
          <span className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-500 text-sm select-none">
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
            'w-full py-3 border rounded-xl text-sm text-gray-100 transition-all duration-200',
            'bg-gray-800/50 border-gray-700',
            'placeholder:text-gray-600',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50',
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
        className="block text-sm font-medium text-gray-400"
      >
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-11 pr-11 py-3 border rounded-xl text-sm text-gray-100 transition-all duration-200',
            'bg-gray-800/50 border-gray-700',
            'placeholder:text-gray-600',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50'
          )}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
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
      });
    }
  }, [user]);

  // ── Loading state ──
  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <Spinner size="lg" />
      </div>
    );
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ── Avatar Upload ──
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB.');
      return;
    }

    try {
      const updatedUser = await authApi.uploadAvatar(file);
      setUser(updatedUser);
      toast.success('Avatar updated successfully!');
    } catch {
      // Error toast handled by interceptor
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
      });
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch {
      // Error toast handled by interceptor
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
      // Error toast handled by interceptor
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
    <div className="min-h-screen bg-gray-950">
      {/* ── Header ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all duration-200 cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-400" />
              <h1 className="text-lg font-semibold text-gray-100">Profile</h1>
            </div>
          </div>

          {/* Logout Button (top-right) */}
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium',
              'text-red-400 hover:bg-red-500/10 hover:text-red-300',
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
            className="bg-gray-900 rounded-2xl border border-gray-800 shadow-sm overflow-hidden"
          >
            {/* ── Avatar Section ───────────────────────────────── */}
            <div className="px-6 py-10 flex flex-col items-center border-b border-gray-800">
              {/* Clickable Avatar */}
              <div className="relative mb-5">
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  onMouseEnter={() => setIsAvatarHovered(true)}
                  onMouseLeave={() => setIsAvatarHovered(false)}
                  className="relative h-24 w-24 rounded-full bg-blue-900/40 flex items-center justify-center text-blue-400 font-bold text-4xl cursor-pointer overflow-hidden ring-4 ring-gray-800 transition-all duration-300 hover:ring-blue-500/30"
                >
                  {initials}

                  {/* Camera Overlay */}
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

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              {/* Name + Role Badge */}
              <h2 className="text-xl font-semibold text-gray-100">{user.full_name}</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-900/40 text-blue-300 mt-2 capitalize">
                {user.role === 'admin' && <Shield className="h-3 w-3 mr-1.5" />}
                {user.role}
              </span>

              {/* Joined date */}
              <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-500">
                <Calendar className="h-3.5 w-3.5" />
                <span>Joined {joinedDate}</span>
              </div>
            </div>

            {/* ── Editable Form Fields ─────────────────────────── */}
            <div className="p-6 space-y-6">
              {/* Section: Personal Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-5">
                  Personal Information
                </h3>

                <div className="space-y-5">
                  {/* Username */}
                  <FormInput
                    id="username"
                    label="Username"
                    icon={<AtSign className="h-4 w-4" />}
                    value={form.username}
                    onChange={(v) => updateField('username', v)}
                    placeholder="ahmadsuryadi"
                  />

                  {/* Full Name */}
                  <FormInput
                    id="full_name"
                    label="Full Name"
                    icon={<User className="h-4 w-4" />}
                    value={form.full_name}
                    onChange={(v) => updateField('full_name', v)}
                    placeholder="Dr. Ahmad Suryadi"
                  />

                  {/* Email */}
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

              {/* Divider */}
              <div className="border-t border-gray-800" />

              {/* Section: Institution & Location */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-5">
                  Institution & Location
                </h3>

                <div className="space-y-5">
                  {/* Institution */}
                  <FormInput
                    id="instansi"
                    label="Institution (Instansi)"
                    icon={<Building2 className="h-4 w-4" />}
                    value={form.instansi}
                    onChange={(v) => updateField('instansi', v)}
                    placeholder="Rumah Sakit Harapan Kita"
                  />

                  {/* Province & City side by side */}
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

              {/* Divider */}
              <div className="border-t border-gray-800" />

              {/* ── Security Section ──────────────────────────── */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-5">
                  Security
                </h3>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-800/40 border border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gray-700/50 flex items-center justify-center">
                      <KeyRound className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">Password</p>
                      <p className="text-xs text-gray-500">Last changed &mdash; unknown</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(true)}
                      className={cn(
                        'px-4 py-2 rounded-xl text-sm font-medium',
                        'bg-gray-700 text-gray-200',
                        'hover:bg-gray-600 transition-all duration-200 cursor-pointer'
                      )}
                    >
                      Change Password
                    </button>
                    <button
                      type="button"
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Action Buttons ───────────────────────────────── */}
            <div className="px-6 py-5 border-t border-gray-800 bg-gray-900/50">
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                {/* Cancel */}
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className={cn(
                    'w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-medium',
                    'text-gray-300 hover:bg-gray-800',
                    'transition-all duration-200 cursor-pointer'
                  )}
                >
                  Cancel
                </button>

                {/* Save Changes */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    'w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium',
                    'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-gray-900',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'transition-all duration-200 shadow-sm cursor-pointer'
                  )}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* ── Bottom Logout (mobile fallback) ───────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
            className="mt-4 sm:hidden"
          >
            <button
              type="button"
              onClick={handleLogout}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-medium',
                'bg-gray-900 border border-gray-800',
                'text-red-400 hover:bg-red-500/10 hover:border-red-500/20',
                'transition-all duration-200 cursor-pointer'
              )}
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </motion.div>
        </form>
      </main>

      {/* ── Change Password Modal ──────────────────────────────── */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        }}
        title="Change Password"
        className="dark:bg-gray-800 dark:border dark:border-gray-700"
      >
        <form onSubmit={handleChangePassword} className="space-y-5">
          <PasswordInput
            id="old-password"
            label="Current Password"
            value={passwordForm.oldPassword}
            onChange={(v) => setPasswordForm((p) => ({ ...p, oldPassword: v }))}
            placeholder="Enter current password"
          />
          <PasswordInput
            id="new-password"
            label="New Password"
            value={passwordForm.newPassword}
            onChange={(v) => setPasswordForm((p) => ({ ...p, newPassword: v }))}
            placeholder="Min. 8 characters"
          />
          <PasswordInput
            id="confirm-password"
            label="Confirm New Password"
            value={passwordForm.confirmPassword}
            onChange={(v) => setPasswordForm((p) => ({ ...p, confirmPassword: v }))}
            placeholder="Repeat new password"
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
              }}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isChangingPassword}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium',
                'bg-blue-600 text-white hover:bg-blue-700',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-all duration-200 cursor-pointer'
              )}
            >
              {isChangingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
              {isChangingPassword ? 'Changing...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
