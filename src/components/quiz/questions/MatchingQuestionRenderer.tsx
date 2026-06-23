import type { QuizSessionQuestion } from '@/hooks/useQuizStore';
import { cn } from '@/lib/utils';

export type MatchingItem = { key: string; text: string };

export type ParsedMatchingQuestion = {
  instruction: string;
  leftItems: MatchingItem[];
  rightItems: MatchingItem[];
};

type MetadataShape = {
  left_items?: unknown;
  right_items?: unknown;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function cleanText(value: unknown) {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

function getInstruction(prompt: string) {
  return /istilah\s*:|definisi\s*:/i.test(prompt) ? 'Cocokkan istilah berikut dengan definisinya.' : (prompt.trim() || 'Cocokkan istilah berikut dengan definisinya.');
}

function isOnlyKey(text: string, key: string) {
  return text.trim().toLowerCase() === key.trim().toLowerCase();
}

function normalizeItems(value: unknown): MatchingItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      if (typeof item === 'string') {
        const match = item.match(/^\s*([A-Z]|\d+)\s*[.)-]?\s*(.+)$/i);
        return { key: match?.[1] ?? String(index + 1), text: (match?.[2] ?? item).trim() };
      }
      const record = asRecord(item);
      if (!record) return null;
      const key = cleanText(record.key ?? record.id ?? record.label ?? String(index + 1));
      const text = cleanText(record.text ?? record.value ?? record.name ?? record.label);
      if (!key || !text) return null;
      return { key, text };
    })
    .filter(Boolean) as MatchingItem[];
}

function parseSectionItems(section: string, expectedKey: 'letter' | 'number') {
  const marker = expectedKey === 'letter' ? /(?:^|[;\n])\s*([A-Z])\s*[.)]\s*/gi : /(?:^|[;\n])\s*(\d+)\s*[.)]\s*/g;
  const matches = Array.from(section.matchAll(marker));
  return matches
    .map((match, index) => {
      const start = (match.index ?? 0) + match[0].length;
      const end = matches[index + 1]?.index ?? section.length;
      return {
        key: match[1].trim(),
        text: section.slice(start, end).replace(/^[;\s]+|[;\s]+$/g, '').replace(/\s+/g, ' '),
      };
    })
    .filter((item) => item.key && item.text);
}

function parsePrompt(prompt: string): Partial<ParsedMatchingQuestion> {
  const raw = prompt.replace(/\s+/g, ' ').trim();
  const match = raw.match(/^(.*?)istilah\s*:\s*(.*?)\s*definisi\s*:\s*(.*)$/i);
  if (!match) return { instruction: raw };

  return {
    instruction: match[1].trim() || 'Cocokkan istilah berikut dengan definisinya.',
    leftItems: parseSectionItems(match[2], 'letter'),
    rightItems: parseSectionItems(match[3], 'number'),
  };
}

export function parseMatchingQuestion(question: QuizSessionQuestion): ParsedMatchingQuestion {
  const metadata = asRecord(question.metadata) as MetadataShape | null;
  const leftFromMeta = normalizeItems(metadata?.left_items ?? question.matching_left_items);
  const rightFromMeta = normalizeItems(metadata?.right_items ?? question.matching_right_items);

  if (leftFromMeta.length && rightFromMeta.length) {
    return {
      instruction: getInstruction(question.question),
      leftItems: leftFromMeta,
      rightItems: rightFromMeta,
    };
  }

  const parsedPrompt = parsePrompt(question.question);
  if (parsedPrompt.leftItems?.length && parsedPrompt.rightItems?.length) {
    return {
      instruction: parsedPrompt.instruction || 'Cocokkan istilah berikut dengan definisinya.',
      leftItems: parsedPrompt.leftItems,
      rightItems: parsedPrompt.rightItems,
    };
  }

  if (question.matching_pairs?.length) {
    const leftItems = question.matching_pairs.map((pair, index) => {
      const left = asRecord(pair.left);
      const key = left ? cleanText(left.key ?? left.id ?? left.label ?? String.fromCharCode(65 + index)) : String.fromCharCode(65 + index);
      const text = left ? cleanText(left.text ?? left.value ?? left.name) : cleanText(pair.left);
      return { key, text };
    });
    const rightItems = question.matching_pairs.map((pair, index) => {
      const right = asRecord(pair.right);
      const key = right ? cleanText(right.key ?? right.id ?? right.label ?? String(index + 1)) : String(index + 1);
      const text = right ? cleanText(right.text ?? right.value ?? right.name) : cleanText(pair.right);
      return { key, text };
    });

    if (leftItems.every((item) => item.text && !isOnlyKey(item.text, item.key)) && rightItems.every((item) => item.text && !isOnlyKey(item.text, item.key))) {
      return { instruction: 'Cocokkan istilah berikut dengan definisinya.', leftItems, rightItems };
    }
  }

  return {
    instruction: 'Data matching belum lengkap. Periksa metadata soal.',
    leftItems: [],
    rightItems: [],
  };
}

function answerToRecord(answer: unknown): Record<string, string> {
  if (!answer) return {};
  if (typeof answer === 'string') {
    try {
      const parsed = JSON.parse(answer);
      return answerToRecord(parsed);
    } catch {
      return {};
    }
  }
  const record = asRecord(answer);
  if (!record) return {};
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, cleanText(value)]));
}

function formatPairs(answer: unknown, leftItems: MatchingItem[], rightItems: MatchingItem[]) {
  const answerMap = answerToRecord(answer);
  const leftByKey = new Map(leftItems.map((item) => [item.key, item.text]));
  const rightByKey = new Map(rightItems.map((item) => [item.key, item.text]));
  return Object.entries(answerMap).map(([leftKey, rightKey]) => {
    const leftText = leftByKey.get(leftKey);
    const rightText = rightByKey.get(rightKey);
    const left = leftText ? `${leftKey}. ${leftText}` : leftKey;
    const right = rightText ? `${rightKey}. ${rightText}` : rightKey;
    return `${left} → ${right}`;
  });
}

export function formatCorrectAnswer(correctAnswer: unknown, leftItems: MatchingItem[], rightItems: MatchingItem[], formattedCorrectAnswer?: string | string[]) {
  if (Array.isArray(formattedCorrectAnswer) && formattedCorrectAnswer.length) return formattedCorrectAnswer.join('\n');
  if (typeof formattedCorrectAnswer === 'string' && formattedCorrectAnswer.trim()) return formattedCorrectAnswer;
  const pairs = formatPairs(correctAnswer, leftItems, rightItems);
  if (pairs.length) return pairs.join('\n');
  return cleanText(correctAnswer) || '-';
}

export function formatUserMatchingAnswer(userAnswer: unknown, leftItems: MatchingItem[], rightItems: MatchingItem[]) {
  const pairs = formatPairs(userAnswer, leftItems, rightItems);
  if (pairs.length) return pairs.join('\n');
  return cleanText(userAnswer) || '-';
}

interface Props {
  question: QuizSessionQuestion;
  matchingAnswer: Record<string, string>;
  onMatchingChange: (key: string, value: string) => void;
  submitResult?: unknown;
  disabled?: boolean;
}

export function MatchingQuestionRenderer({ question, matchingAnswer, onMatchingChange, disabled }: Props) {
  const { instruction, leftItems, rightItems } = parseMatchingQuestion(question);
  const correctAnswer = answerToRecord(question.correct_answer);

  if (!leftItems.length || !rightItems.length) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
        Data matching belum lengkap. Periksa metadata soal.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-200">
        {instruction || 'Cocokkan istilah berikut dengan definisinya.'}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-gray-400">Daftar Istilah</h3>
          <div className="space-y-3">
            {leftItems.map((item) => (
              <div key={item.key} className="flex items-start gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-950/60">
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700 dark:bg-blue-950 dark:text-blue-300">{item.key}</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-gray-400">Daftar Definisi</h3>
          <div className="space-y-3">
            {rightItems.map((item) => (
              <div key={item.key} className="flex items-start gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-950/60">
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{item.key}</span>
                <span className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Area Jawaban</h3>
        {leftItems.map((leftItem) => {
          const selectedValue = matchingAnswer[leftItem.key] ?? '';
          const correctValue = correctAnswer[leftItem.key];
          const isPairCorrect = disabled && correctValue ? selectedValue === correctValue : undefined;
          const selectedRight = rightItems.find((item) => item.key === selectedValue);

          return (
            <div
              key={leftItem.key}
              className={cn(
                'grid grid-cols-1 gap-3 rounded-2xl border p-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.2fr)] md:items-center',
                disabled && correctValue
                  ? isPairCorrect
                    ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                    : 'border-rose-200 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/20'
                  : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950/30'
              )}
            >
              <div className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100">
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">{leftItem.key}</span>
                {leftItem.text}
              </div>
              <span className="hidden text-xs font-black text-gray-300 md:block">→</span>
              <div className="space-y-1.5">
                <select
                  disabled={disabled}
                  value={selectedValue}
                  onChange={(event) => onMatchingChange(leftItem.key, event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:focus:border-blue-500 dark:focus:ring-blue-950"
                >
                  <option value="">Pilih definisi</option>
                  {rightItems.map((rightItem) => (
                    <option key={rightItem.key} value={rightItem.key}>
                      {rightItem.key}. {rightItem.text}
                    </option>
                  ))}
                </select>
                {selectedRight && <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{leftItem.key}. {leftItem.text} → {selectedRight.key}. {selectedRight.text}</p>}
                {disabled && correctValue && !isPairCorrect && <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Koreksi: {correctValue}. {rightItems.find((item) => item.key === correctValue)?.text ?? ''}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
