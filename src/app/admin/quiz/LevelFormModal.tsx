'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { QuizLevel, QuizModule } from '@/types/admin';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { module_id: string; title: string; level_number?: number; passing_score?: number; xp_reward?: number }) => Promise<boolean>;
  level?: QuizLevel | null;
  modules: QuizModule[];
}

export default function LevelFormModal({ isOpen, onClose, onSubmit, level, modules }: Props) {
  const [moduleId, setModuleId] = useState('');
  const [title, setTitle] = useState('');
  const [levelNumber, setLevelNumber] = useState(1);
  const [passingScore, setPassingScore] = useState(70);
  const [xpReward, setXpReward] = useState(100);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (level) {
        setModuleId(level.module_id);
        setTitle(level.title);
        setLevelNumber(level.level_number);
        setPassingScore(level.passing_score);
        setXpReward(level.xp_reward);
      } else {
        setModuleId(modules[0]?.id || '');
        setTitle('');
        setLevelNumber(1);
        setPassingScore(70);
        setXpReward(100);
      }
    }
  }, [isOpen, level, modules]);

  const handleSubmit = async () => {
    if (!moduleId || !title.trim()) return;
    setSubmitting(true);
    try {
      const ok = await onSubmit({
        module_id: moduleId,
        title: title.trim(),
        level_number: levelNumber,
        passing_score: passingScore,
        xp_reward: xpReward,
      });
      if (ok) onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={level ? 'Edit Level' : 'Create Level'} className="max-w-lg">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Module</p>
          <select
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="">Pilih Module</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Title</p>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Level title"
            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Level Number</p>
            <input
              type="number"
              value={levelNumber}
              onChange={(e) => setLevelNumber(Number(e.target.value))}
              min={1}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Passing Score</p>
            <input
              type="number"
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
              min={0}
              max={100}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">XP Reward</p>
            <input
              type="number"
              value={xpReward}
              onChange={(e) => setXpReward(Number(e.target.value))}
              min={0}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant="primary" size="sm" isLoading={submitting} onClick={handleSubmit} disabled={!moduleId || !title.trim()}>
            {level ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
