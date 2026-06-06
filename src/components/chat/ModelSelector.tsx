'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AiMode, ModelOption } from '@/types';
import { MODEL_OPTIONS_BY_MODE } from '@/types';

interface ModelSelectorProps {
  aiMode: AiMode;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export function ModelSelector({ aiMode, selectedModel, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const options = MODEL_OPTIONS_BY_MODE[aiMode];
  const isDisabled = options.length <= 1;

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = options.find((o) => o.value === selectedModel) || options[0];

  return (
    <div ref={ref} className="relative shrink-0 self-end pb-0.5">
      <button
        type="button"
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        disabled={isDisabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select AI model"
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 border',
          isDisabled
            ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-default'
            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300 cursor-pointer'
        )}
      >
        <Cpu className="h-3.5 w-3.5" />
        <span className="max-w-[120px] truncate">{currentOption.label}</span>
        {!isDisabled && (
          <ChevronDown
            className={cn(
              'h-3 w-3 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && !isDisabled && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            role="listbox"
            aria-label="AI model options"
            className="absolute bottom-full mb-2 right-0 z-50 min-w-[220px] rounded-xl bg-white border border-gray-200 shadow-lg py-1 overflow-hidden"
          >
            {options.map((option: ModelOption) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === selectedModel}
                onClick={() => {
                  onModelChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors cursor-pointer text-left',
                  option.value === selectedModel
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <Cpu className="h-3.5 w-3.5 shrink-0" />
                <span>{option.label}</span>
                {option.value === selectedModel && (
                  <span className="ml-auto text-blue-500 text-[10px]">&#10003;</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
