import { useColorScheme } from 'react-native';

export type Palette = {
  background: string;
  surface: string;
  border: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  secondary: string;
  text: string;
  muted: string;
  error: string;
  errorSoft: string;
  tabBar: string;
};

const light: Palette = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  primary: '#6366F1',
  primarySoft: '#E0E7FF',
  onPrimary: '#FFFFFF',
  secondary: '#8B5CF6',
  text: '#0F172A',
  muted: '#64748B',
  error: '#DC2626',
  errorSoft: '#FEE2E2',
  tabBar: '#FDFBF8',
};

const dark: Palette = {
  background: '#0B1120',
  surface: '#111827',
  border: '#334155',
  primary: '#6366F1',
  primarySoft: '#312E81',
  onPrimary: '#FFFFFF',
  secondary: '#8B5CF6',
  text: '#F8FAFC',
  muted: '#94A3B8',
  error: '#F87171',
  errorSoft: '#450A0A',
  tabBar: '#1C1817',
};

export const radius = { sm: 12, md: 16, lg: 18, xl: 24, xxl: 28, pill: 999 } as const;

export const accent = {
  indigo: '#6366F1',
  sky: '#0EA5E9',
  emerald: '#10B981',
  amber: '#F59E0B',
} as const;

export const statusColors: Record<string, string> = {
  completed: '#059669',
  confirmed: '#4F46E5',
  'checked-in': '#0891B2',
  cancelled: '#E11D48',
};

export function usePalette(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

/** Appends an alpha channel (0..1) to a #RRGGBB color. */
export function withAlpha(hex: string, alpha: number): string {
  const value = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${value}`;
}
