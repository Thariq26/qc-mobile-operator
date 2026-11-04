import { Dimensions, PixelRatio, Platform, useWindowDimensions } from 'react-native';

/**
 * Responsive Design System Engine
 * Menjamin konsistensi visual dan tata letak di segala ukuran layar perangkat:
 * - Layar Compact (Android 320px - 360px: Galaxy A/M series, Redmi, Oppo, Vivo)
 * - Layar Standard (375px - 410px: iPhone 14/15/16, Galaxy S series)
 * - Layar Large / Pro Max (412px - 440px+: Galaxy S Ultra, iPhone Pro Max, Pixel Pro)
 * - Tablet & Foldable
 */

// Baseline standar acuan desain UI mobile (iPhone 14/15 & Android modern)
export const BASE_WIDTH = 375;
export const BASE_HEIGHT = 812;

/**
 * Mendapatkan dimensi layar awal
 */
const { width: INITIAL_WIDTH, height: INITIAL_HEIGHT } = Dimensions.get('window');

/**
 * scale (Ukuran Horizontal Proporsional)
 * Digunakan untuk: lebar elemen, icon, margin horizontal, padding horizontal
 */
export const scale = (size) => {
  const { width } = Dimensions.get('window');
  return (width / BASE_WIDTH) * size;
};

/**
 * verticalScale (Ukuran Vertikal Proporsional)
 * Digunakan untuk: tinggi card, jarak antar section atas-bawah
 */
export const verticalScale = (size) => {
  const { height } = Dimensions.get('window');
  return (height / BASE_HEIGHT) * size;
};

/**
 * moderateScale (Penskalaan dengan Faktor Peredam)
 * Digunakan untuk: font size, border radius, tombol
 * Mencegah ukuran mengecil terlalu ekstrem di HP sempit atau membesar berlebihan di HP raksasa.
 */
export const moderateScale = (size, factor = 0.4) => {
  const { width, height } = Dimensions.get('window');
  const shortDimension = width < height ? width : height;
  const ratio = shortDimension / BASE_WIDTH;
  const scaledSize = size + (size * ratio - size) * factor;
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
};

/**
 * wp (Width Percentage)
 * Persentase lebar layar (e.g. wp(50) = 50% dari lebar layar)
 */
export const wp = (percentage) => {
  const { width } = Dimensions.get('window');
  return (parseFloat(percentage) * width) / 100;
};

/**
 * hp (Height Percentage)
 * Persentase tinggi layar (e.g. hp(20) = 20% dari tinggi layar)
 */
export const hp = (percentage) => {
  const { height } = Dimensions.get('window');
  return (parseFloat(percentage) * height) / 100;
};

/**
 * spacing (Dynamic Spacing Helper)
 * Mengurangi padding / margin sekitar ~15% pada HP compact (<=360dp)
 * agar konten inti tidak terhimpit dan memiliki ruang bernapas seperti di iPhone.
 */
export const spacing = (size) => {
  const { width } = Dimensions.get('window');
  if (width <= 360) {
    return Math.max(4, Math.round(size * 0.82));
  }
  if (width <= 380) {
    return Math.max(6, Math.round(size * 0.92));
  }
  return size;
};

/**
 * Konstanta kategori ukuran layar
 */
export const isCompactScreen = INITIAL_WIDTH <= 360;
export const isStandardScreen = INITIAL_WIDTH > 360 && INITIAL_WIDTH < 414;
export const isLargeScreen = INITIAL_WIDTH >= 414;
export const isSmallHeight = INITIAL_HEIGHT <= 700;

/**
 * useResponsive Hook
 * Hook React untuk mendeteksi perubahan orientasi layar atau split-screen secara real-time.
 */
export const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  const shortDimension = width < height ? width : height;

  const isCompact = width <= 360;
  const isMedium = width > 360 && width < 414;
  const isLarge = width >= 414;
  const isShort = height <= 700;

  return {
    width,
    height,
    shortDimension,
    isCompact,
    isMedium,
    isLarge,
    isShort,
    scale: (size) => (width / BASE_WIDTH) * size,
    verticalScale: (size) => (height / BASE_HEIGHT) * size,
    moderateScale: (size, factor = 0.4) => {
      const ratio = shortDimension / BASE_WIDTH;
      return Math.round(PixelRatio.roundToNearestPixel(size + (size * ratio - size) * factor));
    },
    spacing: (size) => (isCompact ? Math.max(4, Math.round(size * 0.82)) : size),
    wp: (pct) => (parseFloat(pct) * width) / 100,
    hp: (pct) => (parseFloat(pct) * height) / 100,
  };
};

export default {
  scale,
  verticalScale,
  moderateScale,
  spacing,
  wp,
  hp,
  isCompactScreen,
  isStandardScreen,
  isLargeScreen,
  isSmallHeight,
  useResponsive,
};
