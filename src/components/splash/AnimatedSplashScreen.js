import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');

/**
 * AnimatedSplashScreen
 * Transisi animasi mulus dari native splash screen ke UI utama menggunakan React Native Animated API.
 * Menggunakan flexbox layout terstruktur (bukan absolute coordinates bertumpuk) agar elemen
 * judul, logo, dan progress bar tidak saling tumpang-tindih di berbagai resolusi layar HP.
 */
export const AnimatedSplashScreen = ({ onFinish, isAuthReady = true }) => {
  // Nilai animasi dengan native driver
  const logoScale = useRef(new Animated.Value(0.65)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.85)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(16)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const badgeTranslateY = useRef(new Animated.Value(10)).current;
  const progressScaleX = useRef(new Animated.Value(0)).current;
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
        duration: 380,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(exitScale, {
        toValue: 1.05,
        duration: 380,
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

    // 1. Lepas native splash screen secepatnya agar animasi terlihat mulus
    SplashScreen.hideAsync().catch(() => {});

    // 2. Loop denyut cahaya lembut (ambient pulse halo) di belakang logo
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowScale, {
          toValue: 1.12,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          toValue: 0.95,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // 3. Rangkaian animasi masuk (Entrance Sequence)
    Animated.parallel([
      // Glow fade in
      Animated.timing(glowOpacity, {
        toValue: 0.45,
        duration: 600,
        useNativeDriver: true,
      }),
      // Logo scale spring & fade in
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 45,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      // Teks Judul & Subtitle
      Animated.sequence([
        Animated.delay(260),
        Animated.parallel([
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 450,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(textTranslateY, {
            toValue: 0,
            duration: 450,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
      // Badge / Tagline
      Animated.sequence([
        Animated.delay(420),
        Animated.parallel([
          Animated.timing(badgeOpacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(badgeTranslateY, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
      // Progress Bar Loading
      Animated.sequence([
        Animated.delay(320),
        Animated.timing(progressScaleX, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    pulseLoop.start();

    // 4. Timer durasi minimum splash (~2.1 detik) sebelum transisi keluar
    const timer = setTimeout(() => {
      minTimePassed.current = true;
      if (authReadyRef.current && isMounted && !isExiting.current) {
        triggerExit();
      }
    }, 2100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      pulseLoop.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: exitOpacity,
          transform: [{ scale: exitScale }],
        },
      ]}
      pointerEvents={isExiting.current ? 'none' : 'auto'}
    >
      <View style={styles.safeContainer}>
        {/* Spacer Atas untuk menjaga keseimbangan posisi tengah */}
        <View style={styles.topSpacer} />

        {/* Konten Utama di Tengah Layar */}
        <View style={styles.centerContent}>
          {/* Logo Container dengan Halo Glow */}
          <View style={styles.logoWrapper}>
            <Animated.View
              style={[
                styles.glowHalo,
                {
                  opacity: glowOpacity,
                  transform: [{ scale: glowScale }],
                },
              ]}
            />
            <Animated.Image
              source={require('../../../assets/adaptive-icon.png')}
              style={[
                styles.logoImage,
                {
                  opacity: logoOpacity,
                  transform: [{ scale: logoScale }],
                },
              ]}
              resizeMode="contain"
            />
          </View>

          {/* Teks Identitas Brand */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: textOpacity,
                transform: [{ translateY: textTranslateY }],
              },
            ]}
          >
            <Text style={styles.appTitle}>MONIDA</Text>
            <Text style={styles.companySubtitle}>
              MONITORING DEFECT ANALYSIS SYSTEM
            </Text>
          </Animated.View>

          {/* Badge Pill Instansi & Scope */}
          <Animated.View
            style={[
              styles.badgePill,
              {
                opacity: badgeOpacity,
                transform: [{ translateY: badgeTranslateY }],
              },
            ]}
          >
            <View style={styles.statusDot} />
            <Text style={styles.badgeText}>
              PT Galaxy Mandiri Perkasa • QC Mobile
            </Text>
          </Animated.View>
        </View>

        {/* Bagian Bawah: Progress Bar & Versi Aplikasi */}
        <View style={styles.bottomSection}>
          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  transform: [{ scaleX: progressScaleX }],
                },
              ]}
            />
          </View>
          <Text style={styles.versionText}>v1.1.0 • Standar Industri 4.0</Text>
        </View>
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
    backgroundColor: '#0B0F17', // Sesuai warna background splash native & dark theme
    zIndex: 99999,
  },
  safeContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 64 : 48,
    paddingBottom: Platform.OS === 'ios' ? 48 : 36,
    paddingHorizontal: 24,
  },
  topSpacer: {
    height: 20,
    width: '100%',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logoWrapper: {
    width: 170,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  glowHalo: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(59, 130, 246, 0.12)', // Subtle electric blue glow
  },
  logoImage: {
    width: 155,
    height: 155,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 14,
  },
  appTitle: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 6,
  },
  companySubtitle: {
    color: '#3B82F6', // Electric Steel Blue
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 1.4,
    textAlign: 'center',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981', // Status Emerald
    marginRight: 8,
  },
  badgeText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  bottomSection: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: 4,
  },
  progressBarTrack: {
    width: 130,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  versionText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
});
