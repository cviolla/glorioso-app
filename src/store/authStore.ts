import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  verifiedPhone: string | null;
  isVerified: boolean;
  setVerifiedPhone: (phone: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      verifiedPhone: null,
      isVerified: false,
      setVerifiedPhone: (phone) => set({ verifiedPhone: phone, isVerified: !!phone }),
      logout: () => set({ verifiedPhone: null, isVerified: false }),
    }),
    {
      name: 'glorioso-auth-storage',
    }
  )
);
