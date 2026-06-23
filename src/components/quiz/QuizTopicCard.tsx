import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuizLevel, QuizTopic } from '@/types/quiz';
import { QuizLevelChips } from './QuizLevelChips';

interface QuizTopicCardProps {
  topic: QuizTopic;
  index: number;
  onStartLevel: (topic: QuizTopic, level: QuizLevel) => void;
}

export function getQuizTopicIcon(icon?: string | null, title?: string) {
  const key = (icon || title || '').toLowerCase();

  if (key.includes('atom')) return '⚛️';
  if (key.includes('periodik')) return '📊';
  if (key.includes('ikatan')) return '🔗';
  if (key.includes('stoikiometri')) return '⚖️';
  if (key.includes('larutan')) return '🧪';
  if (key.includes('asam')) return '🧫';
  if (key.includes('termo')) return '🔥';
  if (key.includes('elektro')) return '⚡';
  if (key.includes('organik')) return '🧬';
  if (key.includes('herbal')) return '🌿';
  if (key.includes('toksikologi')) return '☠️';
  if (key.includes('analisis')) return '🔬';
  if (key.includes('flask')) return '🧪';

  return '📘';
}

function getStatusLabel(status?: string) {
  switch (status) {
    case 'completed':
      return 'Selesai';
    case 'in_progress':
      return 'Sedang Dikerjakan';
    case 'locked':
      return 'Terkunci';
    default:
      return 'Tersedia';
  }
}

export function QuizTopicCard({ topic, index, onStartLevel }: QuizTopicCardProps) {
  const levels = topic.levels ?? [];
  const progress = topic.progress_percent ?? topic.progress ?? 0;
  const isCompleted = topic.status === 'completed';
  const isProgressing = topic.status === 'in_progress';

  return (
    <div
      className={cn(
        'relative rounded-2xl border bg-white p-5 transition-all duration-300 dark:bg-gray-900',
        isCompleted
          ? 'border-emerald-200 bg-emerald-50/10 dark:border-emerald-900 dark:bg-emerald-950/10'
          : isProgressing
          ? 'border-blue-200 bg-blue-50/10 dark:border-blue-900 dark:bg-blue-950/10'
          : 'border-gray-200 dark:border-gray-800'
      )}
    >
      <div className="absolute top-4 left-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-2xl shadow-inner dark:bg-gray-800">
        <span className="text-3xl">{getQuizTopicIcon(topic.icon, topic.title)}</span>
      </div>

      <div className="absolute top-5 right-5 h-8 w-8">
        <svg className="h-full w-full" viewBox="0 0 36 36">
          <path className="text-gray-200 dark:text-gray-700" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <path className={isCompleted ? 'text-emerald-500' : 'text-blue-500'} strokeWidth="3.5" strokeDasharray={`${progress}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-gray-600 dark:text-gray-300">
          {progress}%
        </div>
      </div>

      <div className="mt-14 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider">Topik {index + 1}</span>
        <h4 className="text-base font-bold leading-tight text-gray-950 dark:text-gray-50">{topic.title}</h4>
        <p className="line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{topic.description}</p>
      </div>

      <div className="mt-4 space-y-3 border-t border-gray-100 pt-4 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            {getStatusLabel(topic.status)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
            Pilih Level <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
        <QuizLevelChips levels={levels} onSelectLevel={(level) => onStartLevel(topic, level)} />
      </div>
    </div>
  );
}
