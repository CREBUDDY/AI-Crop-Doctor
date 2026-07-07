import { create } from 'zustand';
import type { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  role: string | null;
  isGuest: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setUserRole: (role: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: true,
  role: null,
  isGuest: false,
  setUser: (user) => set({ user, isGuest: user?.isAnonymous ?? false }),
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ loading: isLoading }),
  setUserRole: (role) => set({ role }),
  logout: () => set({ user: null, token: null, role: null, isGuest: false })
}));
