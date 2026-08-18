import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      hydrate: async () => {
        const { token } = get();
        if (!token) return;
        try {
          set({ isLoading: true });
          const { user } = await authAPI.getMe();
          set({ user, isAuthenticated: true });
        } catch {
          set({ token: null, user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (data) => {
        const res = await authAPI.register(data);
        if (res.requiresVerification) return res;
        localStorage.setItem('ielts_token', res.token);
        if (res.refreshToken) localStorage.setItem('ielts_refresh_token', res.refreshToken);
        set({ token: res.token, user: res.user, isAuthenticated: true });
        return res;
      },

      login: async (email, password) => {
        const res = await authAPI.login({ email, password });
        if (res.requiresVerification) return res;
        localStorage.setItem('ielts_token', res.token);
        if (res.refreshToken) localStorage.setItem('ielts_refresh_token', res.refreshToken);
        set({ token: res.token, user: res.user, isAuthenticated: true });
        return res;
      },

      googleLogin: async (idToken) => {
        const res = await authAPI.googleLogin(idToken);
        localStorage.setItem('ielts_token', res.token);
        if (res.refreshToken) localStorage.setItem('ielts_refresh_token', res.refreshToken);
        set({ token: res.token, user: res.user, isAuthenticated: true });
        return res;
      },

      completeGoogleAuth: async (token, refreshToken) => {
        localStorage.setItem('ielts_token', token);
        if (refreshToken) localStorage.setItem('ielts_refresh_token', refreshToken);
        set({ token, isAuthenticated: true, user: null });
        try {
          const { user } = await authAPI.getMe();
          set({ user, isAuthenticated: true });
          return user;
        } catch {
          set({ user: null, isAuthenticated: false });
          return null;
        }
      },

      logout: async () => {
        try { await authAPI.logout(); } catch (_) {}
        localStorage.removeItem('ielts_token');
        localStorage.removeItem('ielts_refresh_token');
        set({ token: null, user: null, isAuthenticated: false });
      },

      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
    }),
    {
      name: 'ielts-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

export default useAuthStore;
