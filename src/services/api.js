import axios from 'axios';
import { Platform } from 'react-native';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // Increased to 60s to allow Render free tier to wake up
  headers: { 'Content-Type': 'application/json' },
});

// Normalise error messages so callers always get err.message
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
