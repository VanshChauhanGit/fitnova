import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

import API from '../api/axios';

const useAuthStore = create((set) => ({
  user: null,

  token: null,

  loading: false,

  // REGISTER
  register: async (name, username, email, password) => {
    try {
      set({ loading: true });

      const res = await API.post('/auth/register', {
        name,
        username,
        email,
        password,
      });

      console.log(res.data);

      await AsyncStorage.setItem('token', res.data.token);

      const { token, ...user } = res.data;

      set({
        user,
        token,
        loading: false,
      });

      return {
        success: true,
      };
    } catch (error) {
      set({ loading: false });

      return {
        success: false,
        message: error.response?.data?.message,
      };
    }
  },

  // LOGIN
  login: async (email, password) => {
    try {
      set({ loading: true });

      const res = await API.post('/auth/login', {
        email,
        password,
      });

      await AsyncStorage.setItem('token', res.data.token);

      const { token, ...user } = res.data;

      set({
        user,
        token,
        loading: false,
      });

      return {
        success: true,
      };
    } catch (error) {
      set({ loading: false });

      return {
        success: false,
        message: error.response?.data?.message,
      };
    }
  },

  // LOAD USER
  loadUser: async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) return;

      const res = await API.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({
        user: res.data,
        token,
      });
    } catch (error) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
        set({ user: null, token: null });
      } else {
        console.log('loadUser error:', error.response?.data || error.message);
      }
    }
  },

  // LOGOUT
  logout: async () => {
    await AsyncStorage.removeItem('token');

    set({
      user: null,
      token: null,
    });
  },

  completeProfile: async (data) => {
    try {
      const token = await AsyncStorage.getItem('token');

      const res = await API.put('/users/profile', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(res.data);

      set({
        user: res.data,
      });

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message,
      };
    }
  },

  updateProfile: async (data) => {
    try {
      set({ loading: true });

      const token = await AsyncStorage.getItem('token');

      const res = await API.put('/users/profile', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({
        user: res.data,
        loading: false,
      });

      return {
        success: true,
      };
    } catch (error) {
      set({ loading: false });

      return {
        success: false,
        message: error.response?.data?.message,
      };
    }
  },
}));

export default useAuthStore;
