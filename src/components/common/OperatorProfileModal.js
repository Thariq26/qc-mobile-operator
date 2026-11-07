import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  Platform,
  Animated,
  useWindowDimensions,
} from 'react-native';
import {
  KeyRound,
  LogOut,
  Moon,
  Sun,
  Building2,
  X,
  BadgeCheck,
  ChevronRight,
  Smartphone,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { typography } from '../../theme/typography';

const getUserInitials = (name) => {
  if (!name) return 'QC';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

/**
 * OperatorProfileModal: Profil Pengguna & Pengaturan Akun
 * Desain Praktis, Kompak, Dinamis, & Animasi Spring 60 FPS yang Sangat Halus.
 */
export const OperatorProfileModal = ({
  visible,
  onClose,
  onOpenChangePassword,
  onOpenLogout,
}) => {
  const { colors, isDark, setTheme } = useTheme();
  const { user, isOperatorProduksi, isStaffQc, isAdmin } = useAuth();
  const { width } = useWindowDimensions();

  const isTablet = width >= 600;

  // Nilai animasi untuk transisi buka-tutup yang sangat halus (Physics-based Spring)
  const slideAnim = useRef(new Animated.Value(350)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(isTablet ? 0.94 : 1)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(isTablet ? 40 : 350);
      backdropAnim.setValue(0);
      if (isTablet) scaleAnim.setValue(0.92);

      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 24,
          stiffness: 260,
          mass: 0.8,
          useNativeDriver: true,
        }),
        isTablet
          ? Animated.spring(scaleAnim, {
              toValue: 1,
              damping: 22,
              stiffness: 260,
              useNativeDriver: true,
            })
          : Animated.delay(0),
      ]).start();
    }
  }, [visible, isTablet]);

  const handleSmoothClose = (callback) => {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: isTablet ? 30 : 350,
        duration: 180,
        useNativeDriver: true,
      }),
      isTablet
        ? Animated.timing(scaleAnim, {
            toValue: 0.94,
            duration: 180,
            useNativeDriver: true,
          })
        : Animated.delay(0),
    ]).start(() => {
      onClose();
      if (callback) callback();
    });
  };

  const roleLabel = isOperatorProduksi
    ? 'Operator Produksi'
    : isStaffQc
    ? 'Staff QC'
    : isAdmin
    ? 'Administrator'
    : user?.role || 'QC Inspector';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => handleSmoothClose()}
    >
      <View
        style={[
          styles.overlay,
          isTablet ? styles.overlayCentered : styles.overlayBottom,
        ]}
      >
        {/* Backdrop dengan Fade Halus */}
        <Animated.View
          style={[
            styles.backdropTouch,
            {
              backgroundColor: colors.backdrop,
              opacity: backdropAnim,
            },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => handleSmoothClose()} />
        </Animated.View>

        {/* Modal Card dengan Slide & Spring Halus */}
        <Animated.View
          style={[
            styles.cardContainer,
            isTablet ? styles.cardTablet : styles.cardMobile,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              transform: isTablet
                ? [{ translateY: slideAnim }, { scale: scaleAnim }]
                : [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Drag Handle Bar untuk Ponsel */}
          {!isTablet && (
            <View style={styles.handleContainer}>
              <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
            </View>
          )}

          {/* 1. Profil Pengguna (Kompak & Bersih) */}
          <View style={styles.profileRow}>
            {/* Avatar Inisial */}
            <View style={[styles.avatarBox, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {getUserInitials(user?.fullName || user?.username)}
              </Text>
            </View>

            {/* Informasi Nama & Peran */}
            <View style={styles.profileDetailsCol}>
              <View style={styles.nameRow}>
                <Text
                  style={[styles.userNameText, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {user?.fullName || user?.username || 'User'}
                </Text>
                <BadgeCheck size={16} color={colors.primary} style={{ marginLeft: 5 }} />
              </View>

              <View style={styles.roleRow}>
                <View
                  style={[
                    styles.roleBadge,
                    {
                      backgroundColor: colors.primary + '18',
                      borderColor: colors.primary + '30',
                    },
                  ]}
                >
                  <Text style={[styles.roleBadgeText, { color: colors.primary }]}>
                    {roleLabel}
                  </Text>
                </View>

                {user?.username && (
                  <Text style={[styles.usernameText, { color: colors.textSecondary }]}>
                    @{user.username}
                  </Text>
                )}
              </View>

              <View style={styles.companyRow}>
                <Building2 size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
                <Text style={[styles.companyText, { color: colors.textMuted }]} numberOfLines={1}>
                  PT Galaxy Mandiri Perkasa
                </Text>
              </View>
            </View>

            {/* Tombol Tutup X */}
            <Pressable
              onPress={() => handleSmoothClose()}
              hitSlop={10}
              accessibilityLabel="Tutup profil"
              style={({ pressed }) => [
                styles.closeButton,
                {
                  backgroundColor: colors.cardSubtle,
                  borderColor: colors.border,
                },
                pressed && { opacity: 0.65 },
              ]}
            >
              <X size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Garis Pemisah Tipis */}
          <View style={[styles.headerDivider, { backgroundColor: colors.border }]} />

          {/* 2. Pengaturan & Keamanan (Grouped List Rapi & Praktis) */}
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            PENGATURAN & KEAMANAN
          </Text>

          <View
            style={[
              styles.groupedSettingsCard,
              {
                backgroundColor: colors.cardSubtle,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Menu 1: Ubah Kata Sandi */}
            <Pressable
              onPress={() => {
                handleSmoothClose(() => {
                  onOpenChangePassword();
                });
              }}
              style={({ pressed }) => [
                styles.menuRow,
                pressed && { backgroundColor: colors.border + '50' },
              ]}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: colors.primary + '18' }]}>
                <KeyRound size={17} color={colors.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuTitleText, { color: colors.textPrimary }]}>
                  Ubah Kata Sandi
                </Text>
                <Text style={[styles.menuDescText, { color: colors.textSecondary }]}>
                  Perbarui kata sandi login akun Anda
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </Pressable>

            {/* Garis Pembatas Antar Menu */}
            <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

            {/* Menu 2: Tema Tampilan (Dinamis & Terintegrasi) */}
            <View style={styles.menuRow}>
              <View
                style={[
                  styles.menuIconCircle,
                  {
                    backgroundColor: isDark
                      ? colors.warning + '18'
                      : colors.primary + '18',
                  },
                ]}
              >
                {isDark ? (
                  <Moon size={17} color={colors.warning} />
                ) : (
                  <Sun size={17} color={colors.primary} />
                )}
              </View>

              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuTitleText, { color: colors.textPrimary }]}>
                  Tema Tampilan
                </Text>
                <Text style={[styles.menuDescText, { color: colors.textSecondary }]}>
                  {isDark ? 'Mode Gelap (Obsidian)' : 'Mode Terang (Clean Slate)'}
                </Text>
              </View>

              {/* Segmented Switch Cepat (Terang | Gelap) */}
              <View
                style={[
                  styles.themePillSwitch,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Pressable
                  onPress={() => setTheme('light')}
                  style={[
                    styles.themePillBtn,
                    !isDark && [
                      styles.themePillBtnActive,
                      { backgroundColor: colors.primary },
                    ],
                  ]}
                >
                  <Sun
                    size={13}
                    color={!isDark ? '#FFFFFF' : colors.textMuted}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.themePillBtnText,
                      { color: !isDark ? '#FFFFFF' : colors.textSecondary },
                      !isDark && { fontWeight: '800' },
                    ]}
                  >
                    Terang
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setTheme('dark')}
                  style={[
                    styles.themePillBtn,
                    isDark && [
                      styles.themePillBtnActive,
                      { backgroundColor: '#1E293B' },
                    ],
                  ]}
                >
                  <Moon
                    size={13}
                    color={isDark ? colors.warning : colors.textMuted}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.themePillBtnText,
                      { color: isDark ? colors.warning : colors.textSecondary },
                      isDark && { fontWeight: '800' },
                    ]}
                  >
                    Gelap
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* 3. Tombol Logout (Proporsional & Ergonomis) */}
          <Pressable
            onPress={() => {
              handleSmoothClose(() => {
                onOpenLogout();
              });
            }}
            style={({ pressed }) => [
              styles.logoutButton,
              {
                backgroundColor: colors.critical + '10',
                borderColor: colors.critical + '30',
              },
              pressed && {
                backgroundColor: colors.critical + '20',
                opacity: 0.85,
              },
            ]}
          >
            <LogOut size={16} color={colors.critical} style={{ marginRight: 8 }} />
            <Text style={[styles.logoutButtonText, { color: colors.critical }]}>
              Logout Sesi {isOperatorProduksi ? 'Operator' : 'Pengguna'}
            </Text>
          </Pressable>

          {/* 4. Footer Mini */}
          <View style={styles.footerRow}>
            <Smartphone size={11} color={colors.textMuted} style={{ marginRight: 4 }} />
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              MONIDA Quality Control System • v1.1.0
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  overlayCentered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlayBottom: {
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  cardContainer: {
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
  },
  cardTablet: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
  },
  cardMobile: {
    width: '100%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderBottomWidth: 0,
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 32 : 18,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 6,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  avatarBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  profileDetailsCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userNameText: {
    fontSize: typography.sizes.body + 1,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 5,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: typography.sizes.micro - 0.5,
    fontWeight: '700',
  },
  usernameText: {
    fontSize: typography.sizes.micro + 0.5,
    fontWeight: '600',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  companyText: {
    fontSize: typography.sizes.micro - 0.5,
    fontWeight: '500',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  headerDivider: {
    height: 1,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: typography.sizes.micro - 0.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  groupedSettingsCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rowDivider: {
    height: 1,
    marginLeft: 50,
  },
  menuIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },
  menuTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  menuTitleText: {
    fontSize: typography.sizes.body - 1.5,
    fontWeight: '700',
  },
  menuDescText: {
    fontSize: typography.sizes.micro,
    marginTop: 1,
  },
  themePillSwitch: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    padding: 2,
    gap: 4,
  },
  themePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 6,
  },
  themePillBtnActive: {
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
  },
  themePillBtnText: {
    fontSize: typography.sizes.micro,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutButtonText: {
    fontSize: typography.sizes.body - 1,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: typography.sizes.micro - 1,
    fontWeight: '600',
  },
});

export default OperatorProfileModal;
