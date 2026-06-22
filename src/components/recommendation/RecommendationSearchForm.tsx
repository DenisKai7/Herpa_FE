'use client';

import React from 'react';
import { Search } from 'lucide-react';
import type { Persona } from '@/types/persona';

interface RecommendationSearchFormProps {
  complaint: string;
  setComplaint: (text: string) => void;
  persona: Persona;
  setPersona: (p: Persona) => void;
  onSearch: (complaintText: string, personaVal: Persona) => void;
  isLoading: boolean;
}

export function RecommendationSearchForm({
  complaint,
  setComplaint,
  persona,
  setPersona,
  onSearch,
  isLoading,
}: RecommendationSearchFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(complaint, persona);
  };

  return (
    <div className="w-full max-w-lg space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            rows={4}
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            placeholder="Contoh: batuk berdahak dan tenggorokan gatal..."
            className="w-full p-4 text-sm bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition-all placeholder:text-gray-400 leading-relaxed shadow-sm resize-none text-gray-800 dark:text-gray-200"
            required
            minLength={3}
            maxLength={1000}
          />
          <div className="absolute right-3 bottom-3 text-xs text-gray-400 font-medium">
            {complaint.length}/1000
          </div>
        </div>

        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Persona tampilan
          <select
            value={persona}
            onChange={(e) => setPersona(e.target.value as Persona)}
            className="mt-2 w-full rounded-xl border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm normal-case tracking-normal text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/40"
          >
            <option value="umum">Umum</option>
            <option value="pelajar">Pelajar</option>
            <option value="peneliti">Peneliti</option>
            <option value="tenaga_medis">Tenaga medis</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-bold text-sm uppercase tracking-wider transition-all duration-200 shadow-md shadow-green-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Search className="h-4 w-4" />
          Analisis Gejala & Cari Ramuan
        </button>
      </form>

      <div className="space-y-3 pt-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Keluhan Populer</span>
        <div className="flex flex-wrap gap-2.5">
          {[
            { label: 'Batuk Berdahak', text: 'batuk berdahak dan tenggorokan gatal selama dua hari' },
            { label: 'Asam Lambung / Maag', text: 'perut terasa perih ringan dan kembung setelah makan' },
            { label: 'Mual Ringan', text: 'mual ringan tanpa muntah darah atau nyeri dada' },
          ].map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => setComplaint(chip.text)}
              className="text-xs font-semibold px-4 py-2 bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 hover:border-green-400 dark:hover:border-green-800 rounded-full transition-colors cursor-pointer text-gray-700 dark:text-gray-300"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
