import { Platform } from 'react-native';

export const typography = {
  fontFamily: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'sans-serif',
  }),

  // Font sizes in px
  sizes: {
    kpi: 22,
    screenHeading: 16,
    cardHeading: 14,
    body: 12,
    caption: 11,
    micro: 10,
    tabLabel: 9,
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
    kpi: 28,
    screenHeading: 22,
    cardHeading: 20,
    body: 18,
    caption: 16,
    micro: 14,
    tabLabel: 12,
  },

  // Pre-composed typography styles
  styles: {
    displayKpi: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '900',
      letterSpacing: -0.5,
    },
    headingScreen: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '700',
      letterSpacing: 0.1,
    },
    headingCard: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600',
      letterSpacing: 0.1,
    },
    bodyRegular: {
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '400',
      letterSpacing: 0.2,
    },
    bodyBold: {
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '700',
    },
    captionBold: {
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    microBadge: {
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '700',
      letterSpacing: 0.4,
    },
    tabLabel: {
      fontSize: 9,
      lineHeight: 12,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
  },
};

export default typography;
