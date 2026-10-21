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
import { SpringButton } from './SpringButton';
import { typography } from '../../theme/typography';

/**
 * LogoutConfirmModal: Industrial Safety Confirmation Dialog for QC Operator
 * Prevents accidental session termination on the plant floor.
 */
export const LogoutConfirmModal = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
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
          {/* Header Close Button */}
          <View style={styles.topBar}>
            <View
              style={[
                styles.iconBadge,
                {
                  backgroundColor: colors.critical + '1A',
                  borderColor: colors.critical + '55',
                },
              ]}
            >
              <LogOut size={22} color={colors.critical} />
            </View>

            <Pressable
              onPress={onClose}
              disabled={isLoggingOut}
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

          {/* Title & Description */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Konfirmasi Logout
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Apakah Anda yakin ingin mengakhiri sesi kerja handheld QC saat ini?
          </Text>

          {/* Active Session Info Box */}
          <View
            style={[
              styles.sessionBox,
              {
                backgroundColor: colors.cardSubtle,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.sessionItem}>
              <UserCheck size={16} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.sessionText, { color: colors.textPrimary }]}>
                Operator: <Text style={{ fontWeight: '800' }}>{user?.fullName || 'Budi Santoso'} ({user?.role || 'QC Inspector'})</Text>
              </Text>
            </View>

            <View style={styles.sessionItem}>
              <Building2 size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
              <Text style={[styles.sessionText, { color: colors.textSecondary }]}>
                PT Galaxy Mandiri Perkasa
              </Text>
            </View>
          </View>

          {/* Warning Note */}
          <View
            style={[
              styles.warningBanner,
              {
                backgroundColor: colors.warning + '14',
                borderColor: colors.warning + '44',
              },
            ]}
          >
            <AlertTriangle size={16} color={colors.warning} style={{ marginRight: 8 }} />
            <Text style={[styles.warningText, { color: colors.warning }]}>
              Pastikan input NG defect & target produksi telah disimpan sebelum keluar.
            </Text>
          </View>

          {/* Buttons */}
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

            <View style={{ flex: 1 }}>
              <SpringButton
                title={isLoggingOut ? 'Mengakhiri Sesi...' : 'Ya, Logout'}
                onPress={handleConfirmLogout}
                disabled={isLoggingOut}
                variant="critical"
                icon={
                  isLoggingOut ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <LogOut size={18} color="#FFFFFF" />
                  )
                }
              />
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    elevation: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.screenTitle - 2,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  description: {
    fontSize: typography.sizes.body - 1,
    lineHeight: 20,
    marginBottom: 16,
  },
  sessionBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 8,
    marginBottom: 14,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionText: {
    fontSize: typography.sizes.caption,
    fontWeight: '500',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 20,
  },
  warningText: {
    fontSize: typography.sizes.micro,
    fontWeight: '700',
    flex: 1,
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelButton: {
    height: 52,
    paddingHorizontal: 22,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: typography.sizes.body,
    fontWeight: '700',
  },
});

export default LogoutConfirmModal;
