'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { QuizQuestion, QuizLevel } from '@/types/admin';

interface OptionRow {
  option_key: string;
  label: string;
  is_correct: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    level_id: string;
    prompt: string;
    question_type?: string;
    explanation?: string;
    difficulty?: number;
    options?: OptionRow[];
  }) => Promise<boolean>;
  question?: QuizQuestion | null;
  levels: QuizLevel[];
}

const QUESTION_TYPES = ['multiple_choice', 'true_false', 'short_answer', 'essay'];

export default function QuestionFormModal({ isOpen, onClose, onSubmit, question, levels }: Props) {
  const [levelId, setLevelId] = useState('');
  const [prompt, setPrompt] = useState('');
  const [questionType, setQuestionType] = useState('multiple_choice');
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState(1);
  const [options, setOptions] = useState<OptionRow[]>([{ option_key: 'A', label: '', is_correct: false }]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (question) {
        setLevelId(question.level_id);
        setPrompt(question.prompt);
        setQuestionType(question.question_type || 'multiple_choice');
        setExplanation(question.explanation || '');
        setDifficulty(question.difficulty || 1);
        if (question.quiz_question_options?.length) {
          setOptions(
            question.quiz_question_options
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((o) => ({ option_key: o.option_key, label: o.label, is_correct: o.is_correct }))
          );
        } else {
          setOptions([{ option_key: 'A', label: '', is_correct: false }]);
        }
      } else {
        setLevelId(levels[0]?.id || '');
        setPrompt('');
        setQuestionType('multiple_choice');
        setExplanation('');
        setDifficulty(1);
        setOptions([{ option_key: 'A', label: '', is_correct: false }]);
      }
    }
  }, [isOpen, question, levels]);

  const addOption = () => {
    const nextKey = String.fromCharCode(65 + options.length);
    setOptions([...options, { option_key: nextKey, label: '', is_correct: false }]);
  };

  const removeOption = (i: number) => {
    setOptions(options.filter((_, idx) => idx !== i));
  };

  const updateOption = (i: number, field: keyof OptionRow, value: string | boolean) => {
    const next = [...options];
    next[i] = { ...next[i], [field]: value };
    setOptions(next);
  };

  const handleSubmit = async () => {
    if (!levelId || !prompt.trim()) return;
    setSubmitting(true);
    try {
      const ok = await onSubmit({
        level_id: levelId,
        prompt: prompt.trim(),
        question_type: questionType,
        explanation: explanation.trim() || undefined,
        difficulty,
        options: questionType === 'multiple_choice' ? options.filter((o) => o.label.trim()) : undefined,
      });
      if (ok) onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={question ? 'Edit Question' : 'Create Question'} className="max-w-xl">
      <div className="space-y-4">
        {/* Level dropdown */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Level</p>
          <select
            value={levelId}
            onChange={(e) => setLevelId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="">Pilih Level</option>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>{l.title} (Level {l.level_number})</option>
            ))}
          </select>
        </div>

        {/* Prompt */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Prompt</p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Question prompt"
            rows={3}
            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
          />
        </div>

        {/* Type + Difficulty */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Question Type</p>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Difficulty (1-4)</p>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value={1}>1 - Easy</option>
              <option value={2}>2 - Medium</option>
              <option value={3}>3 - Hard</option>
              <option value={4}>4 - Expert</option>
            </select>
          </div>
        </div>

        {/* Explanation */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Explanation</p>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explanation for the correct answer"
            rows={2}
            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
          />
        </div>

        {/* Options (only for multiple_choice) */}
        {questionType === 'multiple_choice' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Options</p>
              <button
                onClick={addOption}
                className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-xs font-bold text-gray-500 w-6 text-center">{opt.option_key}</span>
                  <input
                    type="text"
                    placeholder="Option label"
                    value={opt.label}
                    onChange={(e) => updateOption(i, 'label', e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={opt.is_correct}
                      onChange={(e) => updateOption(i, 'is_correct', e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-700"
                    />
                    <span className="text-[10px] text-gray-500">Correct</span>
                  </label>
                  {options.length > 1 && (
                    <button
                      onClick={() => removeOption(i)}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant="primary" size="sm" isLoading={submitting} onClick={handleSubmit} disabled={!levelId || !prompt.trim()}>
            {question ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
