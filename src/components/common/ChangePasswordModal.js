import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
  ShieldCheck,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { SpringButton } from './SpringButton';
import { typography } from '../../theme/typography';

/**
 * ChangePasswordModal: Industrial Ergonomic Dialog for Updating QC Operator Credentials
 * Features:
 * - Anti-Slop: Strict validation (min 6 chars, match confirmation, difference check)
 * - Industrial Ergonomics: 48x48px hitSlop eye toggles, high-contrast inputs
 * - Live validation feedback pills
 * - Double-submission protection
 */
export const ChangePasswordModal = ({ visible, onClose }) => {
  const { colors, isDark } = useTheme();
  const { user, changePassword } = useAuth();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const resetForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    // 1. Validasi Kata Sandi Lama
    if (!oldPassword.trim()) {
      setErrorMessage('Harap masukkan kata sandi lama Anda.');
      return;
    }

    // 2. Validasi Kata Sandi Baru
    if (!newPassword.trim()) {
      setErrorMessage('Harap masukkan kata sandi baru.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Kata sandi baru minimal harus 6 karakter.');
      return;
    }

    if (newPassword === oldPassword) {
      setErrorMessage('Kata sandi baru tidak boleh sama dengan kata sandi lama.');
      return;
    }

    // 3. Validasi Konfirmasi
    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await changePassword(newPassword.trim(), oldPassword.trim());
      setSuccessMessage('Kata sandi berhasil diperbarui!');
      
      // Auto close after 1.4s
      setTimeout(() => {
        handleClose();
      }, 1400);
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message ||
        err?.message ||
        'Gagal memperbarui kata sandi. Periksa koneksi atau hubungi IT Supervisor.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isMinLength = newPassword.length >= 6;
  const isMatching = newPassword.length > 0 && newPassword === confirmPassword;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.overlay, { backgroundColor: colors.backdrop }]}
      >
        <Pressable style={styles.backdropTouch} onPress={handleClose} />

        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header Drag Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
          </View>

          {/* Modal Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <View
                style={[
                  styles.iconWrapper,
                  {
                    backgroundColor: colors.primary + '18',
                    borderColor: colors.primary + '40',
                  },
                ]}
              >
                <KeyRound size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  Ubah Kata Sandi
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Akun: {user?.fullName || user?.username || 'User'}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleClose}
              disabled={isSubmitting}
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

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollBody}
          >
            {/* Error Banner */}
            {errorMessage ? (
              <View
                style={[
                  styles.alertBanner,
                  {
                    backgroundColor: colors.critical + '18',
                    borderColor: colors.critical,
                  },
                ]}
              >
                <AlertCircle size={16} color={colors.critical} style={{ marginRight: 8 }} />
                <Text style={[styles.alertText, { color: colors.critical }]}>
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* Success Banner */}
            {successMessage ? (
              <View
                style={[
                  styles.alertBanner,
                  {
                    backgroundColor: colors.success + '18',
                    borderColor: colors.success,
                  },
                ]}
              >
                <CheckCircle2 size={16} color={colors.success} style={{ marginRight: 8 }} />
                <Text style={[styles.alertText, { color: colors.success }]}>
                  {successMessage}
                </Text>
              </View>
            ) : null}

            {/* 1. Kata Sandi Lama */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                KATA SANDI LAMA <Text style={{ color: colors.critical }}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputFieldContainer,
                  {
                    backgroundColor: colors.cardSubtle,
                    borderColor:
                      focusedField === 'old' ? colors.primary : colors.border,
                  },
                ]}
              >
                <TextInput
                  value={oldPassword}
                  onChangeText={(text) => {
                    setOldPassword(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  secureTextEntry={!showOldPassword}
                  placeholder="Masukkan kata sandi saat ini"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  onFocus={() => setFocusedField('old')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="none"
                />
                <Pressable
                  onPress={() => setShowOldPassword(!showOldPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.eyeButton}
                >
                  {showOldPassword ? (
                    <EyeOff size={18} color={colors.textSecondary} />
                  ) : (
                    <Eye size={18} color={colors.textSecondary} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* 2. Kata Sandi Baru */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                KATA SANDI BARU <Text style={{ color: colors.critical }}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputFieldContainer,
                  {
                    backgroundColor: colors.cardSubtle,
                    borderColor:
                      focusedField === 'new' ? colors.primary : colors.border,
                  },
                ]}
              >
                <TextInput
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  secureTextEntry={!showNewPassword}
                  placeholder="Minimal 6 karakter"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  onFocus={() => setFocusedField('new')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="none"
                />
                <Pressable
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.eyeButton}
                >
                  {showNewPassword ? (
                    <EyeOff size={18} color={colors.textSecondary} />
                  ) : (
                    <Eye size={18} color={colors.textSecondary} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* 3. Konfirmasi Kata Sandi Baru */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                KONFIRMASI KATA SANDI BARU <Text style={{ color: colors.critical }}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputFieldContainer,
                  {
                    backgroundColor: colors.cardSubtle,
                    borderColor:
                      focusedField === 'confirm' ? colors.primary : colors.border,
                  },
                ]}
              >
                <TextInput
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  secureTextEntry={!showConfirmPassword}
                  placeholder="Ulangi kata sandi baru"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  onFocus={() => setFocusedField('confirm')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="none"
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.eyeButton}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} color={colors.textSecondary} />
                  ) : (
                    <Eye size={18} color={colors.textSecondary} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Live Requirement Indicator Pills */}
            <View style={styles.requirementsRow}>
              <View
                style={[
                  styles.reqPill,
                  {
                    backgroundColor: isMinLength
                      ? colors.success + '1A'
                      : colors.cardSubtle,
                    borderColor: isMinLength ? colors.success : colors.border,
                  },
                ]}
              >
                {isMinLength ? (
                  <CheckCircle2 size={13} color={colors.success} style={{ marginRight: 4 }} />
                ) : (
                  <View
                    style={[
                      styles.dotIndicator,
                      { backgroundColor: colors.textMuted },
                    ]}
                  />
                )}
                <Text
                  style={[
                    styles.reqText,
                    { color: isMinLength ? colors.success : colors.textMuted },
                  ]}
                >
                  Minimal 6 Karakter
                </Text>
              </View>

              <View
                style={[
                  styles.reqPill,
                  {
                    backgroundColor: isMatching
                      ? colors.success + '1A'
                      : colors.cardSubtle,
                    borderColor: isMatching ? colors.success : colors.border,
                  },
                ]}
              >
                {isMatching ? (
                  <CheckCircle2 size={13} color={colors.success} style={{ marginRight: 4 }} />
                ) : (
                  <View
                    style={[
                      styles.dotIndicator,
                      { backgroundColor: colors.textMuted },
                    ]}
                  />
                )}
                <Text
                  style={[
                    styles.reqText,
                    { color: isMatching ? colors.success : colors.textMuted },
                  ]}
                >
                  Password Cocok
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonGroup}>
              <Pressable
                onPress={handleClose}
                disabled={isSubmitting}
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
                  title={isSubmitting ? 'Menyimpan...' : 'Simpan Kata Sandi'}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  variant="primary"
                  icon={
                    isSubmitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <ShieldCheck size={18} color="#FFFFFF" />
                    )
                  }
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '88%',
    elevation: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.3,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 16,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: typography.sizes.screenTitle - 2,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: typography.sizes.caption,
    fontWeight: '500',
    marginTop: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollBody: {
    paddingBottom: 16,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  alertText: {
    fontSize: typography.sizes.caption,
    fontWeight: '700',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  inputFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  textInput: {
    flex: 1,
    fontSize: typography.sizes.body,
    fontWeight: '600',
    paddingVertical: 0,
  },
  eyeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requirementsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    marginTop: 4,
  },
  reqPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  reqText: {
    fontSize: typography.sizes.micro - 0.5,
    fontWeight: '700',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelButton: {
    height: 52,
    paddingHorizontal: 20,
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

export default ChangePasswordModal;
