import React, { useState, useEffect } from 'react';
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
import { ShieldCheck, Lock, User, Eye, EyeOff, Sun, Moon } from 'lucide-react-native';
import { useObserve } from 'expo-observe';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { SpringButton } from '../../components/common/SpringButton';
import { typography } from '../../theme/typography';

export const LoginScreen = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { login } = useAuth();
  const { markInteractive } = useObserve();

  useEffect(() => {
    markInteractive();
  }, [markInteractive]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Harap masukkan Username dan Password!');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      await login(username.trim(), password);
    } catch (err) {
      setErrorMessage(
        err.message || 'Gagal masuk. Periksa kembali username dan kata sandi.'
      );
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
          <View style={[styles.errorBanner, { backgroundColor: colors.critical + '1A', borderColor: colors.critical }]}>
            <Text style={[styles.errorText, { color: colors.critical }]}>
              {errorMessage}
            </Text>
          </View>
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
                value={username}
                onChangeText={setUsername}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
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
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
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


          {/* Submit Spring Button */}
          <SpringButton
            title="Masuk ke Terminal QC"
            variant="primary"
            size="large"
            loading={loading}
            onPress={handleLogin}
            style={{ width: '100%', marginTop: 12 }}
          />
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Sistem Mutu ISO 9001:2015 • Shop Floor Control v2.4
          </Text>
        </View>
      </ScrollView>
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
