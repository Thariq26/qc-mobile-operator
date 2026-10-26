import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBaseUrl } from './endpoints';

const TOKEN_KEY = '@qc_auth_token';

const getToken = async () => {
  try {
    if (Platform.OS !== 'web') {
      const secureToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (secureToken) return secureToken;
    }
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return await AsyncStorage.getItem(TOKEN_KEY);
  }
};

export const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Dynamic Base URL Resolution & Auth Header Interceptor
apiClient.interceptors.request.use(
  async (config) => {
    config.baseURL = getBaseUrl();

    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let onUnauthorizedHandler = null;

export const setOnUnauthorized = (handler) => {
  onUnauthorizedHandler = handler;
};

// Response Interceptor for Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Only trigger auto logout on 401 if request is NOT login
    const isLoginRequest = error.config?.url && error.config.url.includes('/api/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      console.warn('Session expired or unauthorized request (401)');
      if (typeof onUnauthorizedHandler === 'function') {
        onUnauthorizedHandler();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
