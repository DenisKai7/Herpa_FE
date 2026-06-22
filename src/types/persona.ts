// --- Persona types ---

export type Persona = 'umum' | 'pelajar' | 'peneliti' | 'tenaga_medis';

export interface PersonaOption {
  label: string;
  value: Persona;
  description?: string;
}

export const PERSONA_OPTIONS: PersonaOption[] = [
  { label: 'Umum', value: 'umum', description: 'Bahasa sederhana untuk masyarakat umum' },
  { label: 'Pelajar', value: 'pelajar', description: 'Penjelasan edukatif untuk pelajar' },
  { label: 'Peneliti', value: 'peneliti', description: 'Detail teknis untuk peneliti' },
  { label: 'Tenaga Medis', value: 'tenaga_medis', description: 'Informasi klinis untuk tenaga medis' },
];

export function resolvePersona(raw?: string | null): Persona {
  if (!raw) return 'umum';
  const valid: Persona[] = ['umum', 'pelajar', 'peneliti', 'tenaga_medis'];
  return valid.includes(raw as Persona) ? (raw as Persona) : 'umum';
}

export function getPersonaLabel(persona: Persona): string {
  return PERSONA_OPTIONS.find((p) => p.value === persona)?.label ?? 'Umum';
}
