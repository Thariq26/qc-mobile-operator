import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors } from '../theme/colors';

const THEME_STORAGE_KEY = '@qc_theme_mode';

export const ThemeContext = createContext({
  isDark: true,
  colors: darkColors,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          setIsDark(savedTheme === 'dark');
        } else {
          // Default to Dark Mode as per industrial shop floor requirement
          setIsDark(systemScheme === 'light' ? false : true);
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
        setIsDark(true);
      } finally {
        setIsLoaded(true);
      }
    };

    loadThemePreference();
  }, [systemScheme]);

  const toggleTheme = async () => {
    try {
      const nextState = !isDark;
      setIsDark(nextState);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextState ? 'dark' : 'light');
    } catch (error) {
      console.warn('Failed to persist theme:', error);
    }
  };

  const setTheme = async (mode) => {
    try {
      const nextDark = mode === 'dark';
      setIsDark(nextDark);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextDark ? 'dark' : 'light');
    } catch (error) {
      console.warn('Failed to set theme:', error);
    }
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme, setTheme, isLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
