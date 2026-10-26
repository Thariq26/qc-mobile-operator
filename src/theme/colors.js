/**
 * Modern Industrial Slate & Steel Blue Color Palette Tokens
 * Inspired by Linear / Vercel Enterprise Design System
 * Disciplined neutrality: borders, surfaces, and typography are neutral & high-contrast.
 * Semantic colors (Red, Green, Amber) are used strictly as indicators, not as background/border fills.
 */

export const darkColors = {
  background: '#090D16',       // Obsidian Slate Void
  card: '#0F172A',             // Dark Slate Card
  cardSubtle: '#1E293B',       // Elevated Slate Surface
  border: '#1E293B',           // Subtle Crisp Border
  borderFocused: '#3B82F6',    // Electric Steel Blue
  borderSubtle: 'rgba(148, 163, 184, 0.12)',
  textPrimary: '#F8FAFC',      // Crisp Pure White
  textSecondary: '#94A3B8',    // Cool Slate Secondary
  textMuted: '#64748B',        // Muted Gray
  primary: '#3B82F6',          // Electric Steel Blue
  primaryHover: '#2563EB',     // Deep Steel Blue
  primarySubtle: 'rgba(59, 130, 246, 0.12)',
  critical: '#EF4444',         // Status Red
  criticalSubtle: 'rgba(239, 68, 68, 0.12)',
  warning: '#F59E0B',          // Status Amber
  warningSubtle: 'rgba(245, 158, 11, 0.12)',
  success: '#10B981',          // Status Emerald
  successSubtle: 'rgba(16, 185, 129, 0.12)',
  aiAccent: '#6366F1',         // AI Indigo
  aiAccentLight: '#818CF8',    // AI Indigo Light
  purple: '#8B5CF6',
  navBackground: '#0F172A',
  backdrop: 'rgba(0, 0, 0, 0.78)',
  skeleton: '#1E293B',
  neutralPillBg: 'rgba(148, 163, 184, 0.10)',
  neutralPillBorder: 'rgba(148, 163, 184, 0.18)',
};

export const lightColors = {
  background: '#F8FAFC',       // Clean Slate Canvas
  card: '#FFFFFF',             // Pure White Card
  cardSubtle: '#F1F5F9',       // Cool Slate Neutral
  border: '#E2E8F0',           // Crisp Light Border
  borderFocused: '#2563EB',    // Cobalt Precision Blue
  borderSubtle: '#F1F5F9',
  textPrimary: '#0F172A',      // Rich Graphite Black
  textSecondary: '#475569',    // Neutral Slate Secondary
  textMuted: '#94A3B8',        // Light Muted Slate
  primary: '#2563EB',          // Precision Cobalt Blue
  primaryHover: '#1D4ED8',     // Deep Blue
  primarySubtle: 'rgba(37, 99, 235, 0.08)',
  critical: '#EF4444',         // Status Red
  criticalSubtle: 'rgba(239, 68, 68, 0.08)',
  warning: '#F59E0B',          // Status Amber
  warningSubtle: 'rgba(245, 158, 11, 0.08)',
  success: '#10B981',          // Status Emerald
  successSubtle: 'rgba(16, 185, 129, 0.08)',
  aiAccent: '#4F46E5',         // AI Indigo
  aiAccentLight: '#6366F1',
  purple: '#7C3AED',
  navBackground: '#FFFFFF',
  backdrop: 'rgba(15, 23, 42, 0.5)',
  skeleton: '#E2E8F0',
  neutralPillBg: '#F1F5F9',
  neutralPillBorder: '#E2E8F0',
};

export default {
  dark: darkColors,
  light: lightColors,
};
