import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoreStatusState {
  isAutoMode: boolean;
  isManualOpen: boolean;
  toggleAutoMode: () => void;
  setManualOpen: (isOpen: boolean) => void;
  getIsOpen: () => boolean;
}

export const useStoreStatusStore = create<StoreStatusState>()(
  persist(
    (set, get) => ({
      isAutoMode: true,
      isManualOpen: false,
      toggleAutoMode: () => set((state) => ({ isAutoMode: !state.isAutoMode })),
      setManualOpen: (isOpen) => set({ isManualOpen: isOpen }),
      getIsOpen: () => {
        const { isAutoMode, isManualOpen } = get();
        if (!isAutoMode) return isManualOpen;

        // Auto mode logic (Brasília Time)
        try {
          const date = new Date();
          const options = { timeZone: "America/Sao_Paulo", hour12: false };
          const brTimeStr = date.toLocaleString("en-US", options);
          const brDate = new Date(brTimeStr);
          
          const day = brDate.getDay(); // 0 = Sunday, 1 = Monday, ...
          const hour = brDate.getHours();

          // Closed on Mondays
          if (day === 1) return false;
          
          // Open from 15:00 to 23:59
          return hour >= 15 && hour < 24;
        } catch (e) {
          // Fallback if timezone logic fails
          const hour = new Date().getHours();
          return hour >= 15 && hour < 24;
        }
      }
    }),
    {
      name: 'store-status-storage',
    }
  )
);
