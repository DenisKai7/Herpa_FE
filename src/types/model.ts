// --- Model mode types ---

export type ModelMode = 'fast-medium' | 'thinking-high';

export interface ModelModeOption {
  label: string;
  value: ModelMode;
  description?: string;
}

export const MODEL_MODE_OPTIONS: ModelModeOption[] = [
  { label: 'Fast Medium', value: 'fast-medium', description: 'Respons cepat dengan kualitas baik' },
  { label: 'Thinking High', value: 'thinking-high', description: 'Analisis mendalam dengan kualitas tinggi' },
];

// Legacy alias mapping for backward compatibility
export const MODEL_MODE_ALIAS: Record<string, ModelMode> = {
  fast: 'fast-medium',
  thinking: 'thinking-high',
  'fast-medium': 'fast-medium',
  'thinking-high': 'thinking-high',
  'thinking-hard': 'thinking-high', // deprecated alias
};

export function resolveModelMode(raw?: string | null): ModelMode {
  if (!raw) return 'fast-medium';
  return MODEL_MODE_ALIAS[raw] ?? 'fast-medium';
}
