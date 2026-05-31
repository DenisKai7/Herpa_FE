'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  Mail,
  Lock,
  User,
  Building2,
  MapPin,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/hooks/useAuthStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();

  const [form, setForm] = useState({
    username: '',
    nama: '',
    email: '',
    password: '',
    confirmPassword: '',
    instansi: '',
    provinsi: '',
    kota: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Object.values(form).some((v) => !v.trim())) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      await register({
        username: form.username,
        nama: form.nama,
        email: form.email,
        password: form.password,
        instansi: form.instansi,
        provinsi: form.provinsi,
        kota: form.kota,
      });
      toast.success('Account created! Welcome.');
      router.push('/');
    } catch {
      // Error toast handled by interceptor
    }
  };

  const inputClass =
    'w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-gray-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-md"
    >
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4 shadow-md">
            <Stethoscope className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-sm text-gray-500 mt-1">Join MedBot AI today</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="username"
                type="text"
                value={form.username}
                onChange={(e) => updateField('username', e.target.value)}
                placeholder="ahmadsuryadi"
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Nama Lengkap */}
          <div>
            <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1.5">
              Full Name (Nama Lengkap)
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="nama"
                type="text"
                value={form.nama}
                onChange={(e) => updateField('nama', e.target.value)}
                placeholder="Dr. Ahmad Suryadi"
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder="Min 8 chars"
                  className="w-full pl-10 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-gray-400"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  placeholder="Repeat"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-gray-400"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
          </div>

          {/* Institution */}
          <div>
            <label htmlFor="instansi" className="block text-sm font-medium text-gray-700 mb-1.5">
              Institution (Instansi)
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="instansi"
                type="text"
                value={form.instansi}
                onChange={(e) => updateField('instansi', e.target.value)}
                placeholder="Rumah Sakit Harapan Kita"
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Province + City */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="provinsi" className="block text-sm font-medium text-gray-700 mb-1.5">
                Province (Provinsi)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="provinsi"
                  type="text"
                  value={form.provinsi}
                  onChange={(e) => updateField('provinsi', e.target.value)}
                  placeholder="DKI Jakarta"
                  className={inputClass}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="kota" className="block text-sm font-medium text-gray-700 mb-1.5">
                City (Kota)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="kota"
                  type="text"
                  value={form.kota}
                  onChange={(e) => updateField('kota', e.target.value)}
                  placeholder="Jakarta Pusat"
                  className={inputClass}
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2"
          >
            Create account
          </Button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
