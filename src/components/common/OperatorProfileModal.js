import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  Platform,
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
  Clock,
  ShieldCheck,
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
 * Menghitung shift kerja aktif secara real-time berdasarkan jam operasional pabrik.
 */
const getCurrentShiftInfo = () => {
  const hour = new Date().getHours();
  if (hour >= 7 && hour < 15) {
    return { name: 'Shift 1', time: '07:00 – 15:00 WIB', color: '#10B981' };
  } else if (hour >= 15 && hour < 23) {
    return { name: 'Shift 2', time: '15:00 – 23:00 WIB', color: '#3B82F6' };
  } else {
    return { name: 'Shift 3', time: '23:00 – 07:00 WIB', color: '#8B5CF6' };
  }
};

/**
 * OperatorProfileModal: Profil Pengguna & Pengaturan Cepat
 * Praktis, Responsif (Tablet Landscape & Mobile Portrait), & Dinamis.
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

  // Mode tablet jika lebar layar >= 600 (seperti tablet landscape pada gambar)
  const isTablet = width >= 600;
  const currentShift = getCurrentShiftInfo();

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
      animationType={isTablet ? 'fade' : 'slide'}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.overlay,
          isTablet ? styles.overlayCentered : styles.overlayBottom,
          { backgroundColor: colors.backdrop },
        ]}
      >
        <Pressable style={styles.backdropTouch} onPress={onClose} />

        <View
          style={[
            styles.cardContainer,
            isTablet ? styles.cardTablet : styles.cardMobile,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Drag Handle Bar untuk Mobile Phone */}
          {!isTablet && (
            <View style={styles.handleContainer}>
              <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
            </View>
          )}

          {/* 1. Integrated Header with Avatar & Details */}
          <View style={styles.headerSection}>
            <View style={styles.headerRow}>
              {/* Avatar dengan Online Active Badge */}
              <View style={styles.avatarWrapper}>
                <View style={[styles.avatarBox, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarText}>
                    {getUserInitials(user?.fullName || user?.username)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.onlineStatusDot,
                    {
                      backgroundColor: '#10B981',
                      borderColor: colors.card,
                    },
                  ]}
                />
              </View>

              {/* Detail Identitas Pengguna */}
              <View style={styles.userMetaCol}>
                <View style={styles.nameBadgeRow}>
                  <Text
                    style={[styles.fullNameText, { color: colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {user?.fullName || user?.username || 'User'}
                  </Text>
                  <BadgeCheck size={18} color={colors.primary} style={styles.verifiedIcon} />
                </View>

                <View style={styles.roleChipsRow}>
                  <View
                    style={[
                      styles.roleChip,
                      {
                        backgroundColor: colors.primary + '18',
                        borderColor: colors.primary + '35',
                      },
                    ]}
                  >
                    <Text style={[styles.roleChipText, { color: colors.primary }]}>
                      {roleLabel}
                    </Text>
                  </View>

                  {user?.username && (
                    <Text style={[styles.usernameText, { color: colors.textSecondary }]}>
                      @{user.username}
                    </Text>
                  )}
                </View>

                <View style={styles.plantRow}>
                  <Building2 size={13} color={colors.textMuted} style={{ marginRight: 5 }} />
                  <Text
                    style={[styles.plantText, { color: colors.textMuted }]}
                    numberOfLines={1}
                  >
                    PT Galaxy Mandiri Perkasa • Stamping Plant
                  </Text>
                </View>
              </View>

              {/* Tombol Tutup X */}
              <Pressable
                onPress={onClose}
                hitSlop={12}
                accessibilityLabel="Tutup profil"
                style={({ pressed }) => [
                  styles.closeBtn,
                  {
                    backgroundColor: colors.cardSubtle,
                    borderColor: colors.border,
                  },
                  pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
                ]}
              >
                <X size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* 2. Dynamic Real-time Status Strip (Shift Kerja & Sesi) */}
            <View style={styles.statusGridRow}>
              {/* Tile Shift Aktif */}
              <View
                style={[
                  styles.statusTile,
                  {
                    backgroundColor: colors.cardSubtle,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={[styles.tileIconBox, { backgroundColor: currentShift.color + '1A' }]}>
                  <Clock size={15} color={currentShift.color} />
                </View>
                <View style={styles.tileTextCol}>
                  <Text style={[styles.tileLabel, { color: colors.textMuted }]}>
                    Shift Kerja Aktif
                  </Text>
                  <Text
                    style={[styles.tileValue, { color: colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {currentShift.name} ({currentShift.time.split(' ')[0]})
                  </Text>
                </View>
              </View>

              {/* Tile Status Sesi */}
              <View
                style={[
                  styles.statusTile,
                  {
                    backgroundColor: colors.cardSubtle,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={[styles.tileIconBox, { backgroundColor: '#10B9811A' }]}>
                  <ShieldCheck size={15} color="#10B981" />
                </View>
                <View style={styles.tileTextCol}>
                  <Text style={[styles.tileLabel, { color: colors.textMuted }]}>
                    Status Sesi
                  </Text>
                  <Text
                    style={[styles.tileValue, { color: '#10B981' }]}
                    numberOfLines={1}
                  >
                    Terotentikasi • Online
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Section Divider */}
          <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />

          {/* 3. Pengaturan & Keamanan Group */}
          <View style={styles.sectionBody}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
              PENGATURAN & KEAMANAN
            </Text>

            {/* A. Menu Ubah Kata Sandi */}
            <Pressable
              onPress={() => {
                onClose();
                onOpenChangePassword();
              }}
              style={({ pressed }) => [
                styles.actionMenuCard,
                {
                  backgroundColor: colors.cardSubtle,
                  borderColor: colors.border,
                },
                pressed && { opacity: 0.8, backgroundColor: colors.border + '50' },
              ]}
            >
              <View style={[styles.menuIconBox, { backgroundColor: colors.primary + '18' }]}>
                <KeyRound size={18} color={colors.primary} />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
                  Ubah Kata Sandi
                </Text>
                <Text style={[styles.menuDesc, { color: colors.textSecondary }]}>
                  Perbarui kata sandi login akun Anda secara berkala
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </Pressable>

            {/* B. Segmented Dynamic Theme Selector */}
            <View
              style={[
                styles.themeSelectorCard,
                {
                  backgroundColor: colors.cardSubtle,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.themeInfoRow}>
                <View
                  style={[
                    styles.menuIconBox,
                    {
                      backgroundColor: isDark
                        ? colors.warning + '18'
                        : colors.primary + '18',
                    },
                  ]}
                >
                  {isDark ? (
                    <Moon size={18} color={colors.warning} />
                  ) : (
                    <Sun size={18} color={colors.primary} />
                  )}
                </View>
                <View style={styles.menuTextCol}>
                  <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
                    Tema Tampilan
                  </Text>
                  <Text style={[styles.menuDesc, { color: colors.textSecondary }]}>
                    {isDark
                      ? 'Mode Gelap aktif (Nyaman di mata lini pabrik)'
                      : 'Mode Terang aktif (Tampilan Clean Slate)'}
                  </Text>
                </View>
              </View>

              {/* Segmented Selector Buttons: Terang | Gelap */}
              <View
                style={[
                  styles.themeSegmentContainer,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Pressable
                  onPress={() => setTheme('light')}
                  style={[
                    styles.segmentOption,
                    !isDark && [
                      styles.segmentOptionActive,
                      {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ],
                  ]}
                >
                  <Sun
                    size={14}
                    color={!isDark ? '#FFFFFF' : colors.textMuted}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.segmentText,
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
                    styles.segmentOption,
                    isDark && [
                      styles.segmentOptionActive,
                      {
                        backgroundColor: '#1E293B',
                        borderColor: colors.warning + '60',
                      },
                    ],
                  ]}
                >
                  <Moon
                    size={14}
                    color={isDark ? colors.warning : colors.textMuted}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.segmentText,
                      { color: isDark ? colors.warning : colors.textSecondary },
                      isDark && { fontWeight: '800' },
                    ]}
                  >
                    Gelap
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* 4. Action Button: Logout Sesi */}
            <Pressable
              onPress={() => {
                onClose();
                onOpenLogout();
              }}
              style={({ pressed }) => [
                styles.logoutBtn,
                {
                  backgroundColor: colors.critical + '10',
                  borderColor: colors.critical + '35',
                },
                pressed && {
                  opacity: 0.85,
                  backgroundColor: colors.critical + '20',
                  transform: [{ scale: 0.99 }],
                },
              ]}
            >
              <LogOut size={17} color={colors.critical} style={{ marginRight: 8 }} />
              <Text style={[styles.logoutBtnText, { color: colors.critical }]}>
                Logout Sesi {isOperatorProduksi ? 'Operator' : 'Pengguna'}
              </Text>
            </Pressable>

            {/* 5. App Footer Meta */}
            <View style={styles.footerRow}>
              <Smartphone size={12} color={colors.textMuted} style={{ marginRight: 5 }} />
              <Text style={[styles.footerText, { color: colors.textMuted }]}>
                MONIDA Quality Control System • v1.1.0 (GMP Plant)
              </Text>
            </View>
          </View>
        </View>
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
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
  },
  cardTablet: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 22,
  },
  cardMobile: {
    width: '100%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 4,
  },
  dragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
  },
  headerSection: {
    paddingBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatarBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  onlineStatusDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
  },
  userMetaCol: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullNameText: {
    fontSize: typography.sizes.cardHeading,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  verifiedIcon: {
    marginLeft: 6,
  },
  roleChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  roleChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  roleChipText: {
    fontSize: typography.sizes.micro - 0.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  usernameText: {
    fontSize: typography.sizes.micro + 0.5,
    fontWeight: '600',
  },
  plantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  plantText: {
    fontSize: typography.sizes.micro,
    fontWeight: '500',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  statusGridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusTile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  tileIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },
  tileTextCol: {
    flex: 1,
  },
  tileLabel: {
    fontSize: typography.sizes.micro - 1,
    fontWeight: '600',
    marginBottom: 1,
  },
  tileValue: {
    fontSize: typography.sizes.micro + 0.5,
    fontWeight: '800',
  },
  sectionDivider: {
    height: 1,
    marginBottom: 14,
  },
  sectionBody: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginBottom: 2,
    paddingHorizontal: 2,
  },
  actionMenuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: typography.sizes.body - 1,
    fontWeight: '700',
  },
  menuDesc: {
    fontSize: typography.sizes.micro + 0.5,
    marginTop: 2,
    lineHeight: 16,
  },
  themeSelectorCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  themeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeSegmentContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    gap: 6,
  },
  segmentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentOptionActive: {
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  segmentText: {
    fontSize: typography.sizes.micro + 1,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 13,
    borderWidth: 1,
    marginTop: 4,
  },
  logoutBtnText: {
    fontSize: typography.sizes.body - 1,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    paddingBottom: 2,
  },
  footerText: {
    fontSize: typography.sizes.micro - 0.5,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export default OperatorProfileModal;
