/**
 * Industrial Automotive QC Color Palette Tokens
 * Compliant with JIS/DIN Industrial Standards & Dual Theme Architecture
 * WCAG AAA Contrast (>= 7:1) for critical KPI metrics under factory illumination
 */

export const darkColors = {
  background: '#0B0F17',
  card: '#131B2E',
  cardSubtle: '#0E1424',
  border: '#1E293B',
  borderFocused: '#3B82F6',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  critical: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  aiAccent: '#4F46E5',
  aiAccentLight: '#818CF8',
  purple: '#A855F7',
  navBackground: '#0B0F17',
  backdrop: 'rgba(0, 0, 0, 0.78)',
  skeleton: '#1A2338',
};

export const lightColors = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  cardSubtle: '#F1F5F9',
  border: '#E2E8F0',
  borderFocused: '#2563EB',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  critical: '#DC2626',
  warning: '#D97706',
  success: '#059669',
  aiAccent: '#4338CA',
  aiAccentLight: '#6366F1',
  purple: '#9333EA',
  navBackground: '#FFFFFF',
  backdrop: 'rgba(15, 23, 42, 0.5)',
  skeleton: '#E2E8F0',
};

export default {
  dark: darkColors,
  light: lightColors,
};
