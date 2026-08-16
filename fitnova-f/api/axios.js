import axios from 'axios';

import AsyncStorage from '@react-native-async-storage/async-storage';

const API = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://fitnova-b.vercel.app/api',
});

API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
