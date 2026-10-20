import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Observe, ObserveRoot } from 'expo-observe';
import { ObserveNavigationContainer } from 'expo-observe/integrations/react-navigation';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';

// 1. Configure EAS Observe at module scope before any screen mounts
Observe.configure({
  integrations: {
    'react-navigation': true,
  },
});

function ErrorFallbackScreen({ error, resetError }) {
  return (
    <View style={fallbackStyles.container}>
      <Text style={fallbackStyles.title}>Terjadi Kendala Sistem</Text>
      <Text style={fallbackStyles.message}>
        Aplikasi mengalami kesalahan saat memuat tampilan. Silakan coba kembali.
      </Text>
      {resetError && (
        <Pressable style={fallbackStyles.button} onPress={resetError}>
          <Text style={fallbackStyles.buttonText}>Muat Ulang</Text>
        </Pressable>
      )}
    </View>
  );
}

const fallbackStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#0B0F17',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});

function NavigationWrapper() {
  const { colors, isDark } = useTheme();

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.card,
      text: colors.textPrimary,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <ObserveNavigationContainer theme={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
      <AppNavigator />
    </ObserveNavigationContainer>
  );
}

export default function App() {
  return (
    <ObserveRoot errorBoundaryFallback={<ErrorFallbackScreen />}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <NavigationWrapper />
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ObserveRoot>
  );
}
