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
  ShieldCheck,
  Building2,
  X,
  BadgeCheck,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { typography } from '../../theme/typography';

/**
 * OperatorProfileModal: Shop Floor QC Profile & Quick Actions Drawer
 */
export const OperatorProfileModal = ({
  visible,
  onClose,
  onOpenChangePassword,
  onOpenLogout,
}) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, isOperatorProduksi, isStaffQc, isAdmin } = useAuth();

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
          {/* Top Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
          </View>

          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {isOperatorProduksi
                ? 'PROFIL OPERATOR PRODUKSI'
                : isStaffQc
                ? 'PROFIL STAFF QC'
                : 'PROFIL PENGGUNA'}
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: colors.cardSubtle, borderColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <X size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Operator Identity Card */}
          <View
            style={[
              styles.profileBanner,
              {
                backgroundColor: colors.cardSubtle,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={[styles.avatarBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {isOperatorProduksi ? 'OP' : isAdmin ? 'AD' : 'QC'}
              </Text>
            </View>

            <View style={styles.profileDetails}>
              <View style={styles.nameRow}>
                <Text style={[styles.operatorName, { color: colors.textPrimary }]}>
                  {user?.fullName || user?.username || 'User'}
                </Text>
                <BadgeCheck size={16} color={colors.primary} style={{ marginLeft: 4 }} />
              </View>
              <Text style={[styles.roleSubtitle, { color: colors.textSecondary }]}>
                {isOperatorProduksi
                  ? 'Operator Produksi'
                  : isStaffQc
                  ? 'Staff QC Inspector'
                  : user?.role || 'QC Inspector'}{' '}
                • {user?.username || '-'}
              </Text>
              <View style={styles.plantRow}>
                <Building2 size={13} color={colors.textMuted} style={{ marginRight: 4 }} />
                <Text style={[styles.plantText, { color: colors.textMuted }]}>
                  PT Galaxy Mandiri Perkasa
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Menu Options */}
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
              PENGATURAN & KEAMANAN
            </Text>

            {/* Option 1: Change Password */}
            <Pressable
              onPress={() => {
                onClose();
                onOpenChangePassword();
              }}
              style={({ pressed }) => [
                styles.menuItem,
                {
                  backgroundColor: colors.cardSubtle,
                  borderColor: colors.border,
                },
                pressed && { opacity: 0.75, backgroundColor: colors.border },
              ]}
            >
              <View style={[styles.menuIconBox, { backgroundColor: colors.primary + '18' }]}>
                <KeyRound size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
                  Ubah Kata Sandi
                </Text>
                <Text style={[styles.menuDesc, { color: colors.textSecondary }]}>
                  Perbarui password login akun QC
                </Text>
              </View>
            </Pressable>

            {/* Option 2: Toggle Theme */}
            <Pressable
              onPress={toggleTheme}
              style={({ pressed }) => [
                styles.menuItem,
                {
                  backgroundColor: colors.cardSubtle,
                  borderColor: colors.border,
                },
                pressed && { opacity: 0.75, backgroundColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.menuIconBox,
                  { backgroundColor: isDark ? colors.warning + '18' : colors.primary + '18' },
                ]}
              >
                {isDark ? (
                  <Moon size={18} color={colors.warning} />
                ) : (
                  <Sun size={18} color={colors.primary} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
                  Tema Tampilan ({isDark ? 'Mode Gelap' : 'Mode Terang'})
                </Text>
                <Text style={[styles.menuDesc, { color: colors.textSecondary }]}>
                  Ketuk untuk beralih mode warna
                </Text>
              </View>
            </Pressable>

            {/* Option 3: Logout */}
            <Pressable
              onPress={() => {
                onClose();
                onOpenLogout();
              }}
              style={({ pressed }) => [
                styles.menuItem,
                {
                  backgroundColor: colors.critical + '12',
                  borderColor: colors.critical + '40',
                },
                pressed && { opacity: 0.75 },
              ]}
            >
              <View style={[styles.menuIconBox, { backgroundColor: colors.critical + '20' }]}>
                <LogOut size={18} color={colors.critical} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuTitle, { color: colors.critical }]}>
                  Logout Sesi Operator
                </Text>
                <Text style={[styles.menuDesc, { color: colors.critical + 'CC' }]}>
                  Keluar dari sesi shift dan hapus token
                </Text>
              </View>
            </Pressable>
          </View>
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    elevation: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  dragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: typography.sizes.cardHeading,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  avatarBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
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
  operatorName: {
    fontSize: typography.sizes.screenTitle - 4,
    fontWeight: '800',
  },
  roleSubtitle: {
    fontSize: typography.sizes.caption,
    fontWeight: '600',
    marginTop: 2,
  },
  plantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  plantText: {
    fontSize: typography.sizes.micro,
    fontWeight: '500',
  },
  sectionBlock: {
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: typography.sizes.body - 1,
    fontWeight: '700',
  },
  menuDesc: {
    fontSize: typography.sizes.micro,
    marginTop: 1,
  },
});

export default OperatorProfileModal;
