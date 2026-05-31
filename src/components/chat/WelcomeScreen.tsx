'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Stethoscope, FlaskConical, Leaf } from 'lucide-react';

export function WelcomeScreen() {
  const suggestions = [
    {
      icon: <Stethoscope className="h-5 w-5 text-blue-500" />,
      title: 'Medical Knowledge',
      prompt: 'Explain the mechanism of action of Metformin',
    },
    {
      icon: <Leaf className="h-5 w-5 text-green-500" />,
      title: 'Herbal Medicine',
      prompt: 'What are the medicinal properties of Curcuma longa?',
    },
    {
      icon: <FlaskConical className="h-5 w-5 text-purple-500" />,
      title: 'Chemistry',
      prompt: 'Describe the structure and function of amino acids',
    },
    {
      icon: <Sparkles className="h-5 w-5 text-amber-500" />,
      title: 'Quiz Me',
      prompt: 'Create a quiz about cardiovascular pharmacology',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center max-w-2xl"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Hello! I&apos;m MedBot AI
        </h1>
        <p className="text-base text-gray-500 mb-10 max-w-md mx-auto">
          Your intelligent assistant for medical, herbal, and chemistry education. Ask me anything or try a suggestion below.
        </p>

        {/* Suggestion Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
          {suggestions.map((suggestion, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }}
              className="flex items-start gap-3 p-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-left shadow-sm hover:shadow-md cursor-pointer group"
            >
              <div className="mt-0.5 shrink-0">{suggestion.icon}</div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-500 mb-0.5">
                  {suggestion.title}
                </p>
                <p className="text-sm text-gray-700 leading-snug group-hover:text-gray-900 transition-colors">
                  {suggestion.prompt}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
