import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Baseline lebar layar handphone standar (375px - acuan iPhone & modern Android)
const BASE_WIDTH = 375;

/**
 * moderateScale (ms):
 * Penskalaan font responsif yang otomatis menyesuaikan dimensi layar handphone pengguna.
 * Dilengkapi faktor peredam (damping factor = 0.4) agar:
 * - Pada layar HP kecil (320px - 360px): teks mengecil sedikit (~1px) sehingga layout tidak terpotong.
 * - Pada layar HP besar (412px - 440px): teks membesar sedikit (~1.5px) sehingga nyaman dibaca.
 * - Menjaga keterbacaan untuk pekerja senior (presbiopia) dengan batasan proporsional.
 */
export const moderateScale = (size, factor = 0.4) => {
  const shortDimension = SCREEN_WIDTH < SCREEN_HEIGHT ? SCREEN_WIDTH : SCREEN_HEIGHT;
  const scale = shortDimension / BASE_WIDTH;
  const scaledSize = size + (size * scale - size) * factor;
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
};

const ms = moderateScale;

export const typography = {
  fontFamily: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'sans-serif',
  }),

  // Font sizes yang otomatis menyesuaikan ukuran layar handphone pengguna
  sizes: {
    kpi: ms(28),            // Hero numbers (e.g. 1.250 pcs, 98.4%) - clearly visible from arm's length
    h1: ms(22),             // Top page titles
    h2: ms(19),             // Section headers
    h3: ms(17),             // Card headings & prominent subheaders
    screenHeading: ms(19),  // Screen headers
    cardHeading: ms(16),    // Machine names, card titles
    body: ms(14),           // Standard readable body text, form values
    caption: ms(13),        // Subtitles, secondary notes, dates, filters
    micro: ms(12),          // Badges, chips, indicators
    tabLabel: ms(12),       // Nav/tab labels
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

  // Responsive line heights
  lineHeights: {
    kpi: ms(34),
    h1: ms(28),
    h2: ms(24),
    h3: ms(22),
    screenHeading: ms(24),
    cardHeading: ms(22),
    body: ms(20),
    caption: ms(18),
    micro: ms(16),
    tabLabel: ms(16),
  },

  // Export helper penskalaan
  moderateScale: ms,

  // Pre-composed typography styles
  styles: {
    displayKpi: {
      fontSize: ms(28),
      lineHeight: ms(34),
      fontWeight: '900',
      letterSpacing: -0.5,
    },
    headingScreen: {
      fontSize: ms(19),
      lineHeight: ms(24),
      fontWeight: '700',
      letterSpacing: 0.1,
    },
    headingCard: {
      fontSize: ms(16),
      lineHeight: ms(22),
      fontWeight: '700',
      letterSpacing: 0.1,
    },
    bodyRegular: {
      fontSize: ms(14),
      lineHeight: ms(20),
      fontWeight: '400',
      letterSpacing: 0.2,
    },
    bodyBold: {
      fontSize: ms(14),
      lineHeight: ms(20),
      fontWeight: '700',
    },
    captionBold: {
      fontSize: ms(13),
      lineHeight: ms(18),
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    microBadge: {
      fontSize: ms(12),
      lineHeight: ms(16),
      fontWeight: '700',
      letterSpacing: 0.4,
    },
    tabLabel: {
      fontSize: ms(12),
      lineHeight: ms(16),
      fontWeight: '600',
      letterSpacing: 0.3,
    },
  },
};

export default typography;
