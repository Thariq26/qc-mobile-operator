import React, { useEffect, useRef } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, AlertCircle, Info, X, ArrowRight } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';

/**
 * FloatingToast: Modern Non-Blocking Industrial Success/Alert Banner
 * 
 * Sesuai Opsi 1:
 * - Melayang di bagian atas layar dengan animasi slide & fade mulus.
 * - Otomatis hilang sendiri setelah jeda waktu tertentu (default 3.5 detik).
 * - Tidak memblokir alur kerja operator di lini produksi (non-modal).
 * - Mendukung tombol aksi opsional (misal: 'Lihat Riwayat' / 'Lihat Dashboard').
 * - Tampilan serasi dengan tema Dark Mode & Light Mode aplikasi MONIDA.
 */
export const FloatingToast = ({
  visible = false,
  title = 'Sukses Dicatat',
  message = '',
  type = 'success', // 'success' | 'error' | 'info'
  duration = 3500,
  onClose,
  actionLabel,
  onAction,
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  const topPosition = Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 20);

  useEffect(() => {
    if (visible) {
      // 1. Entrance animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 70,
          friction: 9,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // 2. Setup auto-dismiss timer
      if (timerRef.current) clearTimeout(timerRef.current);
      if (duration > 0) {
        timerRef.current = setTimeout(() => {
          handleDismiss();
        }, duration);
      }
    } else {
      handleDismiss(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible]);

  const handleDismiss = (notifyClose = true) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -90,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (notifyClose && onClose) {
        onClose();
      }
    });
  };

  if (!visible) return null;

  // Type styling
  const isSuccess = type === 'success';
  const isError = type === 'error';

  const accentColor = isSuccess ? '#10B981' : isError ? '#EF4444' : '#38BDF8';
  const badgeBg = isSuccess ? (isDark ? 'rgba(16, 185, 129, 0.18)' : '#ECFDF5') : (isDark ? 'rgba(239, 68, 68, 0.18)' : '#FEF2F2');
  const cardBg = isDark ? '#111827' : '#FFFFFF';
  const borderColor = isSuccess ? (isDark ? 'rgba(16, 185, 129, 0.4)' : '#A7F3D0') : colors.border;

  return (
    <Animated.View
      style={[
        styles.toastWrapper,
        {
          top: topPosition,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.toastContainer,
          {
            backgroundColor: cardBg,
            borderColor: borderColor,
            shadowColor: isSuccess ? '#10B981' : '#000000',
          },
        ]}
      >
        {/* Accent Bar on Left Edge */}
        <View style={[styles.accentStrip, { backgroundColor: accentColor }]} />

        {/* Icon Circle */}
        <View style={[styles.iconBox, { backgroundColor: badgeBg }]}>
          {isSuccess ? (
            <CheckCircle2 size={20} color={accentColor} strokeWidth={2.4} />
          ) : isError ? (
            <AlertCircle size={20} color={accentColor} strokeWidth={2.4} />
          ) : (
            <Info size={20} color={accentColor} strokeWidth={2.4} />
          )}
        </View>

        {/* Content Column */}
        <View style={styles.contentCol}>
          <Text style={[styles.titleText, { color: colors.textPrimary }]} numberOfLines={1}>
            {title}
          </Text>
          {!!message && (
            <Text style={[styles.messageText, { color: colors.textSecondary }]} numberOfLines={2}>
              {message}
            </Text>
          )}
        </View>

        {/* Quick Action Button (Opsional) */}
        {actionLabel && onAction && (
          <Pressable
            style={({ pressed }) => [
              styles.actionBtn,
              {
                backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#F0F9FF',
                borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : '#BAE6FD',
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() => {
              handleDismiss(false);
              onAction();
            }}
          >
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>{actionLabel}</Text>
            <ArrowRight size={13} color={colors.primary} style={{ marginLeft: 3 }} />
          </Pressable>
        )}

        {/* Manual Dismiss Button */}
        <Pressable
          style={({ pressed }) => [
            styles.closeBtn,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', opacity: pressed ? 0.6 : 1 },
          ]}
          onPress={() => handleDismiss()}
          hitSlop={8}
        >
          <X size={15} color={colors.textSecondary} />
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 99999,
    elevation: 10,
    alignItems: 'center',
  },
  toastContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.2,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  accentStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    marginRight: 10,
  },
  contentCol: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 6,
  },
  titleText: {
    fontSize: 13.5,
    fontFamily: typography.fontFamily,
    fontWeight: '700',
    lineHeight: 18,
  },
  messageText: {
    fontSize: 11.5,
    fontFamily: typography.fontFamily,
    fontWeight: '400',
    marginTop: 2,
    lineHeight: 15,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
  },
  actionBtnText: {
    fontSize: 11,
    fontFamily: typography.fontFamily,
    fontWeight: '600',
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
