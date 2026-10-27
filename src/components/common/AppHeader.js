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
  ChevronDown,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { typography } from '../../theme/typography';
import { ChangePasswordModal } from './ChangePasswordModal';
import { LogoutConfirmModal } from './LogoutConfirmModal';
import { OperatorProfileModal } from './OperatorProfileModal';

/**
 * Dapatkan inisial 2 huruf dari nama pengguna (e.g. "Aliva Fauzi" -> "AF")
 */
const getUserInitials = (name) => {
  if (!name) return 'QC';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

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
  const { user, isOperatorProduksi, isStaffQc, isAdmin } = useAuth();

  // Modal States
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const roleLabel = isOperatorProduksi
    ? 'Operator'
    : isStaffQc
    ? 'Staff QC'
    : isAdmin
    ? 'Admin'
    : user?.role
    ? String(user.role).replace(/_/g, ' ')
    : 'QC Inspector';

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
        {/* Left: User Avatar + Name & Company Context (Interactive Profile Button) */}
        <Pressable
          onPress={() => setProfileModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Buka Profil Pengguna"
          style={({ pressed }) => [
            styles.brandContainer,
            pressed && { opacity: 0.8 },
          ]}
        >
          {/* Avatar Badge with User Initials */}
          <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoBadgeText}>
              {getUserInitials(user?.fullName || user?.username)}
            </Text>
          </View>

          <View style={styles.titleColumn}>
            <Text
              style={[styles.companyEyebrow, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              PT GALAXY MANDIRI PERKASA
            </Text>

            <View style={styles.userRow}>
              <Text
                style={[styles.userNameText, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {user?.fullName || user?.username || 'User'}
              </Text>

              <View
                style={[
                  styles.rolePill,
                  {
                    backgroundColor: isAdmin
                      ? (isDark ? 'rgba(168, 85, 247, 0.18)' : 'rgba(168, 85, 247, 0.12)')
                      : (isDark ? 'rgba(59, 130, 246, 0.18)' : 'rgba(59, 130, 246, 0.12)'),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.rolePillText,
                    {
                      color: isAdmin
                        ? (isDark ? '#C084FC' : '#7C3AED')
                        : (isDark ? '#60A5FA' : '#2563EB'),
                    },
                  ]}
                >
                  {roleLabel}
                </Text>
              </View>

              <ChevronDown size={13} color={colors.textMuted} style={{ marginLeft: 2 }} />
            </View>
          </View>
        </Pressable>

        {/* Right Actions: Status Ticker & Theme Switcher */}
        <View style={styles.rightActions}>
          {/* Breathing Status Pill Badge */}
          <View
            style={[
              styles.statusTicker,
              {
                backgroundColor: isOffline
                  ? (isDark ? 'rgba(234, 179, 8, 0.15)' : 'rgba(234, 179, 8, 0.1)')
                  : (isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)'),
                borderColor: isOffline
                  ? (isDark ? 'rgba(234, 179, 8, 0.35)' : 'rgba(234, 179, 8, 0.25)')
                  : (isDark ? 'rgba(34, 197, 94, 0.35)' : 'rgba(34, 197, 94, 0.25)'),
              },
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

          {/* Theme Switcher Button */}
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
    fontSize: 14,
    letterSpacing: 0.5,
  },
  titleColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  companyEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  userNameText: {
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.1,
    marginRight: 6,
    flexShrink: 1,
  },
  rolePill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: '700',
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
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  breathingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  actionIconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppHeader;
