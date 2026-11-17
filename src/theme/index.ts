import { useColorScheme, type TextStyle } from 'react-native';

/**
 * Tokens mirror the OdivonProBeauty web app (src/styles.css, Odivon UI design system):
 * slate canvas, white / #1E293B cards, indigo primary and Plus Jakarta Sans.
 */
export type Palette = {
  background: string;
  surface: string;
  surfaceSoft: string;
  border: string;
  divider: string;
  primary: string;
  primaryStrong: string;
  primarySoft: string;
  onPrimary: string;
  secondary: string;
  text: string;
  muted: string;
  error: string;
  errorSoft: string;
  tabBar: string;
  backdrop: string;
  dark: boolean;
};

const light: Palette = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSoft: '#F1F5F9',
  border: '#E2E8F0',
  divider: '#F1F5F9',
  primary: '#6366F1',
  primaryStrong: '#4F46E5',
  primarySoft: '#EEF2FF',
  onPrimary: '#FFFFFF',
  secondary: '#8B5CF6',
  text: '#0F172A',
  muted: '#64748B',
  error: '#E11D48',
  errorSoft: '#FFF1F2',
  tabBar: '#FFFFFF',
  backdrop: 'rgba(15,23,42,0.5)',
  dark: false,
};

const dark: Palette = {
  background: '#0B1120',
  surface: '#1E293B',
  surfaceSoft: '#172033',
  border: '#334155',
  divider: '#293548',
  primary: '#818CF8',
  primaryStrong: '#6366F1',
  primarySoft: '#1E1B4B',
  onPrimary: '#FFFFFF',
  secondary: '#A78BFA',
  text: '#F8FAFC',
  muted: '#94A3B8',
  error: '#FB7185',
  errorSoft: '#4C0519',
  tabBar: '#111827',
  backdrop: 'rgba(2,6,23,0.7)',
  dark: true,
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, pill: 999 } as const;

/** Plus Jakarta Sans faces, loaded in the root layout. Android needs one family per weight. */
export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

/** Type scale from the web design system. */
export const type = {
  kpi: { fontFamily: fonts.extrabold, fontSize: 30, letterSpacing: -0.8, lineHeight: 34 },
  title: { fontFamily: fonts.extrabold, fontSize: 22, letterSpacing: -0.4 },
  section: { fontFamily: fonts.extrabold, fontSize: 17, letterSpacing: -0.2 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21 },
  bodyStrong: { fontFamily: fonts.bold, fontSize: 15 },
  caption: { fontFamily: fonts.semibold, fontSize: 12 },
  overline: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase' },
} satisfies Record<string, TextStyle>;

/** Primary gradient used on filled buttons and the hero panel (indigo → purple). */
export const gradients = {
  primary: ['#6366F1', '#7C3AED'] as const,
  hero: ['#4F46E5', '#8B5CF6', '#D946EF'] as const,
};

export type Tone = 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple' | 'slate';

type ToneColors = { fg: string; bg: string; border: string };

const tonesLight: Record<Tone, ToneColors> = {
  indigo: { fg: '#4338CA', bg: '#EEF2FF', border: '#C7D2FE' },
  emerald: { fg: '#047857', bg: '#ECFDF5', border: '#A7F3D0' },
  amber: { fg: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  rose: { fg: '#BE123C', bg: '#FFF1F2', border: '#FECDD3' },
  sky: { fg: '#0369A1', bg: '#F0F9FF', border: '#BAE6FD' },
  purple: { fg: '#7E22CE', bg: '#FAF5FF', border: '#E9D5FF' },
  slate: { fg: '#475569', bg: '#F1F5F9', border: '#E2E8F0' },
};

const tonesDark: Record<Tone, ToneColors> = {
  indigo: { fg: '#A5B4FC', bg: 'rgba(30,27,75,0.6)', border: 'rgba(99,102,241,0.35)' },
  emerald: { fg: '#6EE7B7', bg: 'rgba(2,44,34,0.6)', border: 'rgba(16,185,129,0.35)' },
  amber: { fg: '#FCD34D', bg: 'rgba(69,26,3,0.6)', border: 'rgba(245,158,11,0.35)' },
  rose: { fg: '#FDA4AF', bg: 'rgba(76,5,25,0.6)', border: 'rgba(244,63,94,0.35)' },
  sky: { fg: '#7DD3FC', bg: 'rgba(8,47,73,0.6)', border: 'rgba(14,165,233,0.35)' },
  purple: { fg: '#D8B4FE', bg: 'rgba(59,7,100,0.6)', border: 'rgba(168,85,247,0.35)' },
  slate: { fg: '#CBD5E1', bg: 'rgba(51,65,85,0.5)', border: '#334155' },
};

export function useTones(): Record<Tone, ToneColors> {
  return useColorScheme() === 'dark' ? tonesDark : tonesLight;
}

/** Appointment status → semantic tone, same mapping as the web calendar. */
export const statusTones: Record<string, Tone> = {
  pending: 'amber',
  confirmed: 'indigo',
  'checked-in': 'sky',
  'in-progress': 'purple',
  completed: 'emerald',
  cancelled: 'rose',
  'no-show': 'rose',
  rescheduled: 'slate',
  active: 'emerald',
  inactive: 'slate',
  frozen: 'sky',
};

export function usePalette(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

/** Soft card shadow from the web (`--shadow`). */
export function cardShadow(palette: Palette) {
  return palette.dark
    ? {}
    : {
        shadowColor: '#0F172A',
        shadowOpacity: 0.06,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 2,
      };
}

/** Appends an alpha channel (0..1) to a #RRGGBB color. */
export function withAlpha(hex: string, alpha: number): string {
  const value = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${value}`;
}
