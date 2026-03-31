import { Platform } from 'react-native';
import Constants from 'expo-constants';

// API Configuration
// Tự động detect môi trường và chọn IP phù hợp

// Cấu hình IP cho từng môi trường
const CONFIG = {
  // IP máy tính của bạn (dùng cho physical device)
  COMPUTER_IP: '192.168.88.156',
  // Port của backend server
  PORT: 8080,
};

const getApiBaseUrl = (): string => {
  // Ưu tiên URL production (ví dụ https://order-food-1.onrender.com) — tạo file .env:
  // EXPO_PUBLIC_API_BASE_URL=https://order-food-1.onrender.com
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, '');
  if (fromEnv) {
    return fromEnv;
  }

  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'android') {
      // Android Emulator sử dụng 10.0.2.2 để truy cập localhost của host
      // Physical device sử dụng IP thật
      const isEmulator = !Constants.isDevice;
      if (isEmulator) {
        return `http://10.0.2.2:${CONFIG.PORT}`;
      }
      return `http://${CONFIG.COMPUTER_IP}:${CONFIG.PORT}`;
    } else if (Platform.OS === 'ios') {
      // iOS Simulator: sử dụng IP máy tính thay vì localhost
      // Physical device cũng sử dụng IP thật
      // Note: localhost không hoạt động đáng tin cậy trên iOS Simulator
      return `http://${CONFIG.COMPUTER_IP}:${CONFIG.PORT}`;
    }
  }

  // Production hoặc fallback
  // TODO: Thay bằng URL production API của bạn
  return `http://${CONFIG.COMPUTER_IP}:${CONFIG.PORT}`;
};

export const API_BASE_URL = getApiBaseUrl();

// Request timeout (ms)
export const API_TIMEOUT = 15000;

// Helper function để convert image URL từ localhost sang IP thật
export const fixImageUrl = (url: string): string => {
  if (!url) return '';
  // Replace cả localhost và 127.0.0.1
  return url
    .replace('http://localhost:8080', API_BASE_URL)
    .replace('http://127.0.0.1:8080', API_BASE_URL);
};

// Fetch với timeout
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number = API_TIMEOUT
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - Không thể kết nối đến server');
    }
    throw error;
  }
};

// Log API URL chỉ trong development
if (__DEV__) {
  console.log('API Base URL:', API_BASE_URL);
  console.log('Platform:', Platform.OS);
  console.log('Is Device:', Constants.isDevice);
}
