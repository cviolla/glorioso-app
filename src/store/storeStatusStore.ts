import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface StoreStatusState {
  isManualOpen: boolean;
  isLoading: boolean;
  setManualOpen: (isOpen: boolean) => Promise<void>;
  fetchStatus: () => Promise<void>;
  getIsOpen: () => boolean;
}

export const useStoreStatusStore = create<StoreStatusState>((set, get) => ({
  isManualOpen: false,
  isLoading: true,

  fetchStatus: async () => {
    try {
      const { data, error } = await supabase
        .from('store_config')
        .select('is_manual_open')
        .eq('id', 1)
        .single();

      if (data && !error) {
        set({ 
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

  setManualOpen: async (isOpen) => {
    const previousState = get().isManualOpen;
    console.log(`[Store] Mudando status para: ${isOpen ? 'ABERTO' : 'FECHADO'}`);
    
    // Atualização otimista imediata
    set({ isManualOpen: isOpen });
    
    try {
      const { error } = await supabase
        .from('store_config')
        .upsert({ id: 1, is_manual_open: isOpen })
        .select();

      if (error) {
        console.error('Erro Supabase (Controle Manual):', error);
        // Reverter em caso de erro
        set({ isManualOpen: previousState });
      } else {
        console.log('[Store] Status atualizado com sucesso no Supabase');
      }
    } catch (err) {
      console.error('Erro catastrófico (Controle Manual):', err);
      set({ isManualOpen: previousState });
    }
  },

  getIsOpen: () => {
    return get().isManualOpen;
  }
}));
