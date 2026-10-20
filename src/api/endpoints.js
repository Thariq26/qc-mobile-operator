import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Host IP Configuration:
 * - Auto-detect from Expo hostUri on physical phone / Expo Go
 * - Fallback to machine's active Wi-Fi LAN IP (192.168.1.44)
 */
const getHostFromExpo = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    return hostUri.split(':')[0];
  }
  return null;
};

const DEFAULT_HOST = getHostFromExpo() || (Platform.OS === 'android' ? '192.168.1.44' : 'localhost');

// We can override host via environment or runtime helper
let currentHost = DEFAULT_HOST;
let cloudBackendUrl =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.cloudBackendUrl ||
  null;
let geminiApiKey =
  process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
  Constants.expoConfig?.extra?.geminiApiKey ||
  '';

export const setApiHost = (newHost) => {
  if (newHost) {
    currentHost = newHost;
  }
};

export const setCloudBackendUrl = (url) => {
  cloudBackendUrl = url;
};

export const getCloudBackendUrl = () => cloudBackendUrl;

export const setGeminiApiKey = (key) => {
  geminiApiKey = key;
};

export const getGeminiApiKey = () => geminiApiKey;

export const getApiHost = () => currentHost;

export const getBaseUrl = () => {
  if (cloudBackendUrl) {
    return `${cloudBackendUrl.replace(/\/+$/, '')}/api`;
  }
  return `http://${currentHost}:8080/api`;
};

export const getN8nWebhookUrl = () => `http://${currentHost}:5678/webhook/qc-ai-chat`;
export const getFastApiUrl = () => `http://${currentHost}:8000`;

export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',

  // Dashboard
  DASHBOARD_SUMMARY: '/dashboard/summary',
  DASHBOARD_PARETO: '/dashboard/pareto',
  DASHBOARD_DAILY_PROD: '/dashboard/daily-production',
  DASHBOARD_COMPLAINTS_SUMMARY: '/dashboard/complaints-summary',
  DASHBOARD_COMPLAINTS_PARETO: '/dashboard/complaints-pareto',

  // Master Data
  PARTS: '/parts',
  DEFECTS: '/defects',
  MACHINES: '/machines',

  // Defect / NG Transactions
  NG_DATA: '/ng-data',
  UPLOAD_PHOTO: '/upload',

  // Customer Complaints
  COMPLAINTS: '/complaints',

  // Production Transactions
  PRODUCTION: '/production',
  PRODUCTION_BATCH: '/production/batch',

  // AI & Machine Learning (Spring Boot Bridge to FastAPI)
  AI_PREDICT_ACTION: '/ai/predict-action',
  AI_GET_CONTEXT: '/ai/get-context',

  // User Profile & Security
  UPDATE_PROFILE: '/users/update-profile',
};

export default ENDPOINTS;
