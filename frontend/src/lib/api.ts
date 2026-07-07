import axios from 'axios';
import { auth } from './firebase';

const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const defaultApiUrl = `http://${host}:8000`;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || defaultApiUrl;
const apiPrefix = import.meta.env.VITE_API_V1_PREFIX || '/api/v1';

export const api = axios.create({
  baseURL: `${apiBaseUrl}${apiPrefix}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically add the Firebase JWT token
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
