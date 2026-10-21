import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import {
  Sun,
  Moon,
  Wifi,
  KeyRound,
  LogOut,
  ChevronDown,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { typography } from '../../theme/typography';
import { ChangePasswordModal } from './ChangePasswordModal';
import { LogoutConfirmModal } from './LogoutConfirmModal';
import { OperatorProfileModal } from './OperatorProfileModal';

/**
 * AppHeader: Industrial Automotive QC Header
 * Features:
 * - Direct Change Password & Logout functions on top header
 * - Breathing status ticker (pulsing opacity dot)
 * - Operator profile & shift context card with 'QC' visual badge
 * - Tactile glove-friendly action targets (>= 48x48px effective hit area)
 * - Dual-theme toggle switch with smooth rotation animation
 */
export const AppHeader = ({ isOffline = false }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  // Modal States
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  // Breathing dot animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Theme switch rotation animation
  const rotateAnim = useRef(new Animated.Value(isDark ? 0 : 1)).current;

  useEffect(() => {
    // Breathing pulse loop for ONLINE ticker
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.25,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, [pulseAnim]);

  useEffect(() => {
    Animated.spring(rotateAnim, {
      toValue: isDark ? 0 : 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [isDark, rotateAnim]);

  const rotationInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {/* Top Banner if Offline */}
      {isOffline && (
        <View style={[styles.offlineBanner, { backgroundColor: colors.warning }]}>
          <Wifi size={14} color="#000000" style={{ marginRight: 6 }} />
          <Text style={styles.offlineText}>
            Mode Offline — Data tersimpan di memori perangkat
          </Text>
        </View>
      )}

      <View style={styles.contentRow}>
        {/* Left: QC Blue Avatar Badge + Operator Info (Interactive) */}
        <Pressable
          onPress={() => setProfileModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Buka Profil Operator"
          style={({ pressed }) => [
            styles.brandContainer,
            pressed && { opacity: 0.8 },
          ]}
        >
          {/* Blue 'QC' Badge matching industrial plant floor specification */}
          <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoBadgeText}>QC</Text>
          </View>

          <View style={styles.titleColumn}>
            <View style={styles.companyRow}>
              <Text
                style={[styles.companyName, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                PT GALAXY MANDIRI
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text
                style={[styles.operatorText, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {user?.fullName || 'Budi Santoso'} • {user?.role || 'QC Inspector'}
              </Text>
              <ChevronDown size={13} color={colors.textMuted} style={{ marginLeft: 2 }} />
            </View>
          </View>
        </Pressable>

        {/* Right Actions: Status Ticker, Change Password, Logout, Theme */}
        <View style={styles.rightActions}>
          {/* Breathing Status Pill Badge */}
          <View
            style={[
              styles.statusTicker,
              { backgroundColor: colors.cardSubtle, borderColor: colors.border },
            ]}
          >
            <Animated.View
              style={[
                styles.breathingDot,
                {
                  backgroundColor: isOffline ? colors.warning : colors.success,
                  opacity: pulseAnim,
                },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: isOffline ? colors.warning : colors.success },
              ]}
            >
              {isOffline ? 'OFFLINE' : 'ONLINE'}
            </Text>
          </View>

          {/* 1. Tombol Ubah Kata Sandi (Change Password) */}
          <Pressable
            onPress={() => setChangePasswordVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Ubah Kata Sandi Akun QC"
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            style={({ pressed }) => [
              styles.actionIconButton,
              {
                backgroundColor: colors.cardSubtle,
                borderColor: colors.border,
              },
              pressed && {
                opacity: 0.75,
                transform: [{ scale: 0.92 }],
                backgroundColor: colors.primary + '20',
              },
            ]}
          >
            <KeyRound size={17} color={colors.primary} />
          </Pressable>

          {/* 2. Tombol Logout (Keluar Sesi) */}
          <Pressable
            onPress={() => setLogoutConfirmVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Logout Sesi QC"
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            style={({ pressed }) => [
              styles.actionIconButton,
              {
                backgroundColor: colors.critical + '14',
                borderColor: colors.critical + '44',
              },
              pressed && {
                opacity: 0.75,
                transform: [{ scale: 0.92 }],
                backgroundColor: colors.critical + '30',
              },
            ]}
          >
            <LogOut size={17} color={colors.critical} />
          </Pressable>

          {/* 3. Theme Switcher Button */}
          <Pressable
            onPress={toggleTheme}
            accessibilityRole="button"
            accessibilityLabel="Ganti tema warna aplikasi"
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            style={({ pressed }) => [
              styles.actionIconButton,
              {
                backgroundColor: colors.cardSubtle,
                borderColor: colors.border,
              },
              pressed && { opacity: 0.75, transform: [{ scale: 0.92 }] },
            ]}
          >
            <Animated.View style={{ transform: [{ rotate: rotationInterpolate }] }}>
              {isDark ? (
                <Moon size={16} color={colors.warning} />
              ) : (
                <Sun size={16} color={colors.primary} />
              )}
            </Animated.View>
          </Pressable>
        </View>
      </View>

      {/* Modal 1: Change Password */}
      <ChangePasswordModal
        visible={changePasswordVisible}
        onClose={() => setChangePasswordVisible(false)}
      />

      {/* Modal 2: Logout Confirmation Dialog */}
      <LogoutConfirmModal
        visible={logoutConfirmVisible}
        onClose={() => setLogoutConfirmVisible(false)}
      />

      {/* Modal 3: Operator Profile Drawer */}
      <OperatorProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        onOpenChangePassword={() => setChangePasswordVisible(true)}
        onOpenLogout={() => setLogoutConfirmVisible(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 38,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  offlineText: {
    fontSize: typography.sizes.micro,
    fontWeight: '700',
    color: '#000000',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    elevation: 3,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  logoBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  titleColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyName: {
    fontSize: typography.sizes.cardHeading - 1,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  operatorText: {
    fontSize: typography.sizes.caption - 0.5,
    fontWeight: '500',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusTicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  breathingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusText: {
    fontSize: typography.sizes.micro - 0.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  actionIconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppHeader;
