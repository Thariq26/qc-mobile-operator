import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { BottomTabNavigator } from './BottomTabNavigator';
import { AnimatedSplashScreen } from '../components/splash/AnimatedSplashScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors, isLoaded: isThemeLoaded } = useTheme();
  const [isSplashDone, setIsSplashDone] = useState(false);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* 1. Navigator utama terpasang penuh sehingga viewport terisi 100% tanpa risiko collapse */}
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>

      {/* 2. Splash screen beranimasi menutupi layar penuh hingga animasi, auth & tema siap */}
      {!isSplashDone && (
        <AnimatedSplashScreen
          isAuthReady={!isLoading && isThemeLoaded}
          onFinish={() => setIsSplashDone(true)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default AppNavigator;
