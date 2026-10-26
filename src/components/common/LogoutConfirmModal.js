import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  LogOut,
  AlertTriangle,
  UserCheck,
  Building2,
  X,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { typography } from '../../theme/typography';

/**
 * LogoutConfirmModal: Industrial Safety Confirmation Dialog for QC Operator
 * Desain Praktis, Kompak, & Ergonomis
 */
export const LogoutConfirmModal = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { user, logout, isOperatorProduksi } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      onClose();
    } catch (err) {
      console.warn('Logout failed:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const roleLabel = isOperatorProduksi
    ? 'Operator Produksi'
    : user?.role === 'STAFF_QC'
    ? 'Staff QC'
    : user?.role === 'ADMIN'
    ? 'Administrator'
    : user?.role || 'QC Inspector';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!isLoggingOut) onClose();
      }}
    >
      <View style={[styles.overlay, { backgroundColor: colors.backdrop }]}>
        <Pressable
          style={styles.backdropTouch}
          onPress={() => {
            if (!isLoggingOut) onClose();
          }}
        />

        <View
          style={[
            styles.dialogCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header Terpadu: Icon + Title + Close Button */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.iconBadge,
                  {
                    backgroundColor: colors.critical + '18',
                    borderColor: colors.critical + '40',
                  },
                ]}
              >
                <LogOut size={18} color={colors.critical} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  Konfirmasi Logout
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Sesi kerja aplikasi akan diakhiri
                </Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              disabled={isLoggingOut}
              hitSlop={12}
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: colors.cardSubtle, borderColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <X size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Account Strip (Kompak & Praktis) */}
          <View
            style={[
              styles.accountCard,
              {
                backgroundColor: colors.cardSubtle,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.accountRow}>
              <UserCheck size={14} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.accountName, { color: colors.textPrimary }]} numberOfLines={1}>
                {user?.fullName || user?.username || 'User'}{' '}
                <Text style={{ color: colors.textSecondary, fontWeight: '500' }}>
                  ({roleLabel})
                </Text>
              </Text>
            </View>

            <View style={[styles.accountRow, { marginTop: 4 }]}>
              <Building2 size={12} color={colors.textMuted} style={{ marginRight: 6 }} />
              <Text style={[styles.companyText, { color: colors.textMuted }]}>
                PT Galaxy Mandiri Perkasa
              </Text>
            </View>
          </View>

          {/* Warning Banner Ringkas */}
          <View
            style={[
              styles.warningBanner,
              {
                backgroundColor: colors.warning + '14',
                borderColor: colors.warning + '35',
              },
            ]}
          >
            <AlertTriangle size={14} color={colors.warning} style={{ marginRight: 7 }} />
            <Text style={[styles.warningText, { color: colors.warning }]}>
              Pastikan seluruh laporan produksi & cacat telah tersimpan.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <Pressable
              onPress={onClose}
              disabled={isLoggingOut}
              style={({ pressed }) => [
                styles.cancelButton,
                {
                  backgroundColor: colors.cardSubtle,
                  borderColor: colors.border,
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
                Batal
              </Text>
            </Pressable>

            <Pressable
              onPress={handleConfirmLogout}
              disabled={isLoggingOut}
              style={({ pressed }) => [
                styles.confirmButton,
                { backgroundColor: colors.critical },
                pressed && { opacity: 0.85 },
                isLoggingOut && { opacity: 0.6 },
              ]}
            >
              {isLoggingOut ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <LogOut size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.confirmText}>Ya, Logout</Text>
                </>
              )}
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: typography.sizes.cardHeading,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: typography.sizes.micro,
    marginTop: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  accountCard: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountName: {
    fontSize: typography.sizes.body - 1,
    fontWeight: '700',
    flex: 1,
  },
  companyText: {
    fontSize: typography.sizes.micro - 1,
    fontWeight: '500',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  warningText: {
    fontSize: typography.sizes.micro,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 11,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: typography.sizes.body - 1,
    fontWeight: '700',
  },
  confirmButton: {
    flex: 1.3,
    height: 44,
    borderRadius: 11,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.body - 1,
    fontWeight: '800',
  },
});

export default LogoutConfirmModal;
