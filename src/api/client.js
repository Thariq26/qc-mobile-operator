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

// Response Interceptor for Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('Session expired or unauthorized request');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
