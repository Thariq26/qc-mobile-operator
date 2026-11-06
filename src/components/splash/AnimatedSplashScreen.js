import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useTheme } from '../../context/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('screen');

/**
 * AnimatedSplashScreen
 * Splash screen adaptif tema (Dark & Light Mode):
 * - Jika pengguna memakai Tema Terang (Light Mode): Background #F8FAFC, teks gelap #0F172A, subtitle #2563EB.
 * - Jika pengguna memakai Tema Gelap (Dark Mode): Background #090D16 / #0B0F17, teks putih #FFFFFF, subtitle #38BDF8.
 * 
 * Hanya menampilkan 3 elemen utama yang terpusat secara praktis & dinamis:
 * 1. Icon Splash (animasi floating mengapung)
 * 2. Nama App: MONIDA
 * 3. Subtitle: MONITORING & DEFECT ANALYSIS
 */
export const AnimatedSplashScreen = ({ onFinish, isAuthReady = true }) => {
  const { colors, isDark } = useTheme();

  // Nilai animasi dengan native driver 60 FPS
  const logoScale = useRef(new Animated.Value(0.65)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoFloatY = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(14)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(10)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;

  const minTimePassed = useRef(false);
  const authReadyRef = useRef(isAuthReady);
  const isExiting = useRef(false);

  useEffect(() => {
    authReadyRef.current = isAuthReady;
    if (minTimePassed.current && isAuthReady && !isExiting.current) {
      triggerExit();
    }
  }, [isAuthReady]);

  const triggerExit = () => {
    if (isExiting.current) return;
    isExiting.current = true;

    Animated.parallel([
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(exitScale, {
        toValue: 1.05,
        duration: 350,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onFinish) {
        onFinish();
      }
    });
  };

  useEffect(() => {
    let isMounted = true;

    // 1. Lepas splash bawaan sistem segera agar transisi animasi langsung terlihat
    SplashScreen.hideAsync().catch(() => {});

    // 2. Animasi Floating Loop (mengapung halus naik-turun) pada Logo
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloatY, {
          toValue: -6,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoFloatY, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 3. Rangkaian Animasi Masuk (Entrance Choreography)
    Animated.parallel([
      // Logo Masuk (Pegas elastis halus)
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 42,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Judul MONIDA Masuk
      Animated.sequence([
        Animated.delay(180),
        Animated.parallel([
          Animated.timing(titleOpacity, {
            toValue: 1,
            duration: 420,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(titleTranslateY, {
            toValue: 0,
            duration: 420,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
      // Subtitle Monitoring & Defect Analysis Masuk
      Animated.sequence([
        Animated.delay(320),
        Animated.parallel([
          Animated.timing(subtitleOpacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(subtitleTranslateY, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start(() => {
      if (isMounted) {
        floatLoop.start();
      }
    });

    // 4. Timer durasi splash yang praktis dan responsif (~1.9 detik)
    const exitTimer = setTimeout(() => {
      minTimePassed.current = true;
      if (authReadyRef.current && isMounted && !isExiting.current) {
        triggerExit();
      }
    }, 1900);

    return () => {
      isMounted = false;
      clearTimeout(exitTimer);
      floatLoop.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          opacity: exitOpacity,
          transform: [{ scale: exitScale }],
        },
      ]}
      pointerEvents={isExiting.current ? 'none' : 'auto'}
    >
      <View style={styles.centerContent}>
        {/* 1. Icon Splash dengan Efek Dinamis Mengapung */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: logoOpacity,
              transform: [
                { scale: logoScale },
                { translateY: logoFloatY },
              ],
            },
          ]}
        >
          <Animated.Image
            source={require('../../../assets/logo-brand.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* 2. Nama App: MONIDA (Warna dinamis sesuai tema) */}
        <Animated.Text
          style={[
            styles.brandTitle,
            {
              color: isDark ? '#FFFFFF' : '#0F172A',
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            },
          ]}
        >
          MONIDA
        </Animated.Text>

        {/* 3. Subtitle: MONITORING & DEFECT ANALYSIS (Warna aksen dinamis sesuai tema) */}
        <Animated.Text
          style={[
            styles.brandSubtitle,
            {
              color: isDark ? '#38BDF8' : '#2563EB',
              opacity: subtitleOpacity,
              transform: [{ translateY: subtitleTranslateY }],
            },
          ]}
        >
          MONITORING & DEFECT ANALYSIS
        </Animated.Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    minHeight: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoWrapper: {
    width: 145,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 140,
    height: 174,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
  },
});
