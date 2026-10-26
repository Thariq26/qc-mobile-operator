import { Platform } from 'react-native';

export const typography = {
  fontFamily: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'sans-serif',
  }),

  // Font sizes in px - Optimized for factory workers & presbyopia readability (no micro fonts < 12px)
  sizes: {
    kpi: 28,            // Hero numbers (e.g. 1.250 pcs, 98.4%) - clearly visible from arm's length
    h1: 22,             // Top page titles
    h2: 19,             // Section headers
    h3: 17,             // Card headings & prominent subheaders
    screenHeading: 19,  // Screen headers
    cardHeading: 16,    // Machine names, card titles
    body: 14,           // Standard readable body text, form values
    caption: 13,        // Subtitles, secondary notes, dates, filters
    micro: 12,          // Badges, chips, indicators (NO font under 12px!)
    tabLabel: 12,       // Nav/tab labels
  },

  // Font weights
  weights: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
    black: '900',
  },

  // Line heights
  lineHeights: {
    kpi: 34,
    h1: 28,
    h2: 24,
    h3: 22,
    screenHeading: 24,
    cardHeading: 22,
    body: 20,
    caption: 18,
    micro: 16,
    tabLabel: 16,
  },

  // Pre-composed typography styles
  styles: {
    displayKpi: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '900',
      letterSpacing: -0.5,
    },
    headingScreen: {
      fontSize: 19,
      lineHeight: 24,
      fontWeight: '700',
      letterSpacing: 0.1,
    },
    headingCard: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '700',
      letterSpacing: 0.1,
    },
    bodyRegular: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400',
      letterSpacing: 0.2,
    },
    bodyBold: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '700',
    },
    captionBold: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    microBadge: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '700',
      letterSpacing: 0.4,
    },
    tabLabel: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
  },
};

export default typography;
