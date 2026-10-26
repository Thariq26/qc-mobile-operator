import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import {
  User,
  KeyRound,
  LogOut,
  Moon,
  Sun,
  Building2,
  X,
  BadgeCheck,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { typography } from '../../theme/typography';

/**
 * OperatorProfileModal: Shop Floor QC Profile & Quick Actions Drawer
 * Desain Praktis, Kompak, & Ergonomis
 */
export const OperatorProfileModal = ({
  visible,
  onClose,
  onOpenChangePassword,
  onOpenLogout,
}) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, isOperatorProduksi, isStaffQc, isAdmin } = useAuth();

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
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: colors.backdrop }]}>
        <Pressable style={styles.backdropTouch} onPress={onClose} />

        <View
          style={[
            styles.drawerCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {/* 1. Drag Handle Bar */}
          <View style={styles.handleContainer}>
            <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
          </View>

          {/* 2. Compact Integrated Profile Header */}
          <View style={styles.profileHeaderRow}>
            <View style={[styles.avatarBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {isOperatorProduksi ? 'OP' : isAdmin ? 'AD' : 'QC'}
              </Text>
            </View>

            <View style={styles.profileDetails}>
              <View style={styles.nameRow}>
                <Text style={[styles.userName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {user?.fullName || user?.username || 'User'}
                </Text>
                <BadgeCheck size={16} color={colors.primary} style={{ marginLeft: 5 }} />
              </View>

              <View style={styles.roleUsernameRow}>
                <View
                  style={[
                    styles.rolePill,
                    { backgroundColor: colors.primary + '16', borderColor: colors.primary + '30' },
                  ]}
                >
                  <Text style={[styles.rolePillText, { color: colors.primary }]}>
                    {roleLabel}
                  </Text>
                </View>
                {user?.username ? (
                  <Text style={[styles.usernameText, { color: colors.textSecondary }]}>
                    @{user.username}
                  </Text>
                ) : null}
              </View>

              <View style={styles.plantRow}>
                <Building2 size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
                <Text style={[styles.plantText, { color: colors.textMuted }]} numberOfLines={1}>
                  PT Galaxy Mandiri Perkasa
                </Text>
              </View>
            </View>

            {/* Tombol Tutup X */}
            <Pressable
              onPress={onClose}
              hitSlop={12}
              accessibilityLabel="Tutup profil"
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: colors.cardSubtle, borderColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <X size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Divider Pemisah */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* 3. Grouped Settings Card (Praktis dalam 1 Kartu Terpadu) */}
          <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>
            PENGATURAN & KEAMANAN
          </Text>

          <View
            style={[
              styles.settingsGroupCard,
              { backgroundColor: colors.cardSubtle, borderColor: colors.border },
            ]}
          >
            {/* Ubah Kata Sandi */}
            <Pressable
              onPress={() => {
                onClose();
                onOpenChangePassword();
              }}
              style={({ pressed }) => [
                styles.settingRow,
                pressed && { backgroundColor: colors.border + '60' },
              ]}
            >
              <View style={[styles.iconBox, { backgroundColor: colors.primary + '18' }]}>
                <KeyRound size={17} color={colors.primary} />
              </View>
              <View style={styles.settingTextCol}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                  Ubah Kata Sandi
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Perbarui kata sandi login akun Anda
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </Pressable>

            {/* Garis Pemisah Tipis Antar Menu */}
            <View style={[styles.innerDivider, { backgroundColor: colors.border }]} />

            {/* Tema Tampilan with Interactive Indicator Pill */}
            <Pressable
              onPress={toggleTheme}
              style={({ pressed }) => [
                styles.settingRow,
                pressed && { backgroundColor: colors.border + '60' },
              ]}
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: isDark ? colors.warning + '18' : colors.primary + '18' },
                ]}
              >
                {isDark ? (
                  <Moon size={17} color={colors.warning} />
                ) : (
                  <Sun size={17} color={colors.primary} />
                )}
              </View>
              <View style={styles.settingTextCol}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                  Tema Tampilan
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  {isDark ? 'Mode Gelap (Obsidian) aktif' : 'Mode Terang (Clean Slate) aktif'}
                </Text>
              </View>

              {/* Status Pill Toggle */}
              <View
                style={[
                  styles.themeTogglePill,
                  {
                    backgroundColor: isDark ? colors.warning + '18' : colors.primary + '18',
                    borderColor: isDark ? colors.warning + '40' : colors.primary + '40',
                  },
                ]}
              >
                {isDark ? (
                  <Moon size={11} color={colors.warning} style={{ marginRight: 4 }} />
                ) : (
                  <Sun size={11} color={colors.primary} style={{ marginRight: 4 }} />
                )}
                <Text
                  style={[
                    styles.themeToggleText,
                    { color: isDark ? colors.warning : colors.primary },
                  ]}
                >
                  {isDark ? 'Gelap' : 'Terang'}
                </Text>
              </View>
            </Pressable>
          </View>

          {/* 4. Action Button: Logout Ringkas */}
          <Pressable
            onPress={() => {
              onClose();
              onOpenLogout();
            }}
            style={({ pressed }) => [
              styles.logoutButton,
              {
                backgroundColor: colors.critical + '12',
                borderColor: colors.critical + '35',
              },
              pressed && { opacity: 0.75, backgroundColor: colors.critical + '22' },
            ]}
          >
            <LogOut size={16} color={colors.critical} style={{ marginRight: 8 }} />
            <Text style={[styles.logoutText, { color: colors.critical }]}>
              Logout Sesi {isOperatorProduksi ? 'Operator' : 'Pengguna'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  drawerCard: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    elevation: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 12,
  },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  profileDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: typography.sizes.cardHeading,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  roleUsernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  rolePill: {
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 5,
    borderWidth: 1,
  },
  rolePillText: {
    fontSize: typography.sizes.micro - 1,
    fontWeight: '700',
  },
  usernameText: {
    fontSize: typography.sizes.micro,
    fontWeight: '600',
  },
  plantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  plantText: {
    fontSize: typography.sizes.micro - 1,
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
  divider: {
    height: 1,
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  settingsGroupCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  innerDivider: {
    height: 1,
    marginLeft: 52,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextCol: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.sizes.body - 1,
    fontWeight: '700',
  },
  settingDesc: {
    fontSize: typography.sizes.micro,
    marginTop: 1,
  },
  themeTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  themeToggleText: {
    fontSize: typography.sizes.micro,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: typography.sizes.body - 1,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

export default OperatorProfileModal;
