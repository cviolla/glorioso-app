import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface StoreStatusState {
  isAutoMode: boolean;
  isManualOpen: boolean;
  isLoading: boolean;
  toggleAutoMode: () => Promise<void>;
  setManualOpen: (isOpen: boolean) => Promise<void>;
  fetchStatus: () => Promise<void>;
  getIsOpen: () => boolean;
}

export const useStoreStatusStore = create<StoreStatusState>((set, get) => ({
  isAutoMode: true,
  isManualOpen: false,
  isLoading: true,

  fetchStatus: async () => {
    try {
      const { data, error } = await supabase
        .from('store_config')
        .select('is_auto_mode, is_manual_open')
        .eq('id', 1)
        .single();

      if (data && !error) {
        set({ 
          isAutoMode: data.is_auto_mode, 
          isManualOpen: data.is_manual_open,
          isLoading: false 
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.error('Erro ao buscar status da loja:', err);
      set({ isLoading: false });
    }
  },

  toggleAutoMode: async () => {
    const newMode = !get().isAutoMode;
    set({ isAutoMode: newMode });
    
    try {
      await supabase
        .from('store_config')
        .update({ is_auto_mode: newMode })
        .eq('id', 1);
    } catch (err) {
      console.error('Erro ao atualizar modo automático:', err);
    }
  },

  setManualOpen: async (isOpen) => {
    set({ isManualOpen: isOpen });
    
    try {
      await supabase
        .from('store_config')
        .update({ is_manual_open: isOpen })
        .eq('id', 1);
    } catch (err) {
      console.error('Erro ao atualizar status manual:', err);
    }
  },

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
    } catch {
      // Fallback if timezone logic fails
      const hour = new Date().getHours();
      return hour >= 15 && hour < 24;
    }
  }
}));
