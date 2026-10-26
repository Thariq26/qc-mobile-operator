import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { ShieldCheck, Lock, User, Eye, EyeOff, Sun, Moon, Check } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { SpringButton } from '../../components/common/SpringButton';
import { LoginErrorModal } from '../../components/common/LoginErrorModal';
import { getApiHost } from '../../api/endpoints';
import { typography } from '../../theme/typography';

const REMEMBER_KEY = '@qc_remember_me';
const USERNAME_KEY = '@qc_remember_username';
const PASSWORD_KEY = '@qc_remember_password';

// Storage helper terenkripsi untuk menyimpan kredensial operator
const secureSave = async (key, value) => {
  try {
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  } catch {
    await AsyncStorage.setItem(key, value);
  }
};

const secureGet = async (key) => {
  try {
    if (Platform.OS !== 'web') {
      const val = await SecureStore.getItemAsync(key);
      if (val !== null && val !== undefined) return val;
    }
    return await AsyncStorage.getItem(key);
  } catch {
    return await AsyncStorage.getItem(key);
  }
};

const secureDelete = async (key) => {
  try {
    if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync(key);
    }
    await AsyncStorage.removeItem(key);
  } catch {
    await AsyncStorage.removeItem(key);
  }
};

export const LoginScreen = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Error Pop-up Modal State
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorData, setErrorData] = useState(null);

  // Input Refs for smooth auto-focus upon closing error modal
  const usernameInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // Muat kredensial tersimpan saat pertama kali membuka aplikasi
  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const isRemembered = await secureGet(REMEMBER_KEY);
        if (isRemembered === 'true' || isRemembered === null) {
          // Default aktif atau jika user sebelumnya memilih Ingat Saya
          setRememberMe(true);
          const savedUser = await secureGet(USERNAME_KEY);
          const savedPass = await secureGet(PASSWORD_KEY);
          if (savedUser) setUsername(savedUser);
          if (savedPass) setPassword(savedPass);
        } else {
          setRememberMe(false);
        }
      } catch (err) {
        console.warn('Gagal memuat kredensial tersimpan:', err);
      }
    };

    loadSavedCredentials();
  }, []);

  const showError = (payload) => {
    setErrorData(payload);
    setErrorModalVisible(true);
    setErrorMessage(payload.message || payload.title || 'Gagal masuk');
  };

  const handleLogin = async () => {
    // 1. Validasi form kosong di sisi klien sebelum menembak jaringan
    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser && !trimmedPass) {
      showError({
        type: 'EMPTY_FIELDS',
        title: 'Kredensial Belum Lengkap',
        message: 'Username dan kata sandi operator wajib diisi sebelum masuk ke terminal QC.',
      });
      return;
    }

    if (!trimmedUser) {
      showError({
        type: 'EMPTY_USERNAME',
        title: 'Username Belum Diisi',
        message: 'Harap masukkan Username Operator sebelum melanjutkan.',
      });
      return;
    }

    if (!trimmedPass) {
      showError({
        type: 'EMPTY_PASSWORD',
        title: 'Kata Sandi Belum Diisi',
        message: 'Harap masukkan kata sandi akun operator Anda.',
      });
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      await login(trimmedUser, password);

      // Simpan atau hapus kredensial berdasarkan pilihan Ingat Saya
      if (rememberMe) {
        await secureSave(REMEMBER_KEY, 'true');
        await secureSave(USERNAME_KEY, trimmedUser);
        await secureSave(PASSWORD_KEY, password);
      } else {
        await secureSave(REMEMBER_KEY, 'false');
        await secureDelete(USERNAME_KEY);
        await secureDelete(PASSWORD_KEY);
      }
    } catch (err) {
      showError({
        type: err.type || 'GENERAL',
        title: err.title || 'Gagal Masuk',
        message: err.message || 'Kredensial tidak valid di database. Periksa kembali username dan kata sandi.',
        host: err.host || getApiHost(),
        username: trimmedUser,
        status: err.status,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Right Theme Toggle */}
        <View style={styles.topBar}>
          <Pressable
            onPress={toggleTheme}
            style={({ pressed }) => [
              styles.themeToggle,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            {isDark ? (
              <Moon size={18} color={colors.warning} />
            ) : (
              <Sun size={18} color={colors.primary} />
            )}
          </Pressable>
        </View>

        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={[styles.logoIconContainer, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
            <ShieldCheck size={44} color={colors.primary} />
          </View>
          <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
            QC DEFECT MONITORING
          </Text>
          <Text style={[styles.companySubtitle, { color: colors.primary }]}>
            PT GALAXY MANDIRI PERKASA
          </Text>
          <Text style={[styles.appDesc, { color: colors.textSecondary }]}>
            Handheld Operasional QC Inspector Lantai Produksi
          </Text>
        </View>

        {/* Error Alert Banner */}
        {errorMessage ? (
          <Pressable
            onPress={() => setErrorModalVisible(true)}
            style={[styles.errorBanner, { backgroundColor: colors.critical + '1A', borderColor: colors.critical }]}
          >
            <Text style={[styles.errorText, { color: colors.critical }]}>
              {errorMessage}
            </Text>
          </Pressable>
        ) : null}

        {/* Input Form */}
        <View style={styles.formContainer}>
          {/* Username Field */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              USERNAME OPERATOR
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.card,
                  borderColor: focusedField === 'username' ? colors.borderFocused : colors.border,
                },
              ]}
            >
              <User size={20} color={focusedField === 'username' ? colors.primary : colors.textMuted} style={styles.fieldIcon} />
              <TextInput
                ref={usernameInputRef}
                value={username}
                onChangeText={setUsername}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                returnKeyType="next"
                placeholder="Username"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                style={[styles.textInput, { color: colors.textPrimary }]}
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              KATA SANDI
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.card,
                  borderColor: focusedField === 'password' ? colors.borderFocused : colors.border,
                },
              ]}
            >
              <Lock size={20} color={focusedField === 'password' ? colors.primary : colors.textMuted} style={styles.fieldIcon} />
              <TextInput
                ref={passwordInputRef}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                onSubmitEditing={handleLogin}
                returnKeyType="go"
                placeholder="Masukkan kata sandi"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                style={[styles.textInput, { color: colors.textPrimary }]}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={12}
                style={styles.eyeBtn}
              >
                {showPassword ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </Pressable>
            </View>
          </View>

          {/* Remember Me Checklist / Checkbox */}
          <Pressable
            onPress={() => setRememberMe((prev) => !prev)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.rememberMeContainer}
            accessible={true}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: rememberMe }}
            accessibilityLabel="Ingat Akun Saya"
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: rememberMe ? colors.primary : colors.border,
                  backgroundColor: rememberMe ? colors.primary : colors.card,
                },
              ]}
            >
              {rememberMe ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}
            </View>
            <View style={styles.rememberMeTextWrapper}>
              <Text style={[styles.rememberMeTitle, { color: colors.textPrimary }]}>
                Ingat Akun Saya
              </Text>
            </View>
          </Pressable>

          {/* Submit Spring Button */}
          <SpringButton
            title="Masuk ke Terminal"
            variant="primary"
            size="large"
            loading={loading}
            onPress={handleLogin}
            style={{ width: '100%', marginTop: 8 }}
          />
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Sistem Mutu ISO 9001:2015 • Shop Floor Control v2.4
          </Text>
        </View>
      </ScrollView>

      {/* Pop-up Modal Khusus Error Login Handheld */}
      <LoginErrorModal
        visible={errorModalVisible}
        onClose={() => {
          setErrorModalVisible(false);
          if (errorData?.type === 'EMPTY_USERNAME' || errorData?.type === 'USER_NOT_FOUND') {
            usernameInputRef.current?.focus();
          } else if (errorData?.type === 'EMPTY_PASSWORD' || errorData?.type === 'WRONG_CREDENTIALS') {
            passwordInputRef.current?.focus();
          }
        }}
        errorData={errorData}
        onShowPassword={() => {
          setShowPassword(true);
          passwordInputRef.current?.focus();
        }}
        onRetry={handleLogin}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  topBar: {
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    marginBottom: 8,
  },
  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: typography.sizes.screenHeading + 4,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  companySubtitle: {
    fontSize: typography.sizes.body,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 3,
  },
  appDesc: {
    fontSize: typography.sizes.caption,
    marginTop: 6,
    textAlign: 'center',
  },
  errorBanner: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    fontSize: typography.sizes.caption,
    fontWeight: '700',
    textAlign: 'center',
  },

  formContainer: {
    width: '100%',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  fieldIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: typography.sizes.body + 2,
    fontWeight: '600',
  },
  eyeBtn: {
    padding: 6,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 2,
    marginBottom: 8,
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rememberMeTextWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  rememberMeTitle: {
    fontSize: typography.sizes.caption,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  rememberMeSubtitle: {
    fontSize: typography.sizes.micro,
    marginTop: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: typography.sizes.micro,
    fontWeight: '600',
  },
});

export default LoginScreen;
