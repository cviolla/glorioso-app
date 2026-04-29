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

      if (error) {
        console.error('[StoreStatus] Erro ao buscar status:', error.message);
        set({ isLoading: false });
        return;
      }

      if (data) {
        set({ 
          isManualOpen: data.is_manual_open,
          isLoading: false 
        });
      }
    } catch (err) {
      console.error('Erro catastrófico ao buscar status:', err);
      set({ isLoading: false });
    }
  },

  setManualOpen: async (isOpen) => {
    const previousState = get().isManualOpen;
    console.log(`[Store] Tentando mudar status para: ${isOpen ? 'ABERTO' : 'FECHADO'}`);
    
    // Atualização otimista imediata para a UI ficar fluida
    set({ isManualOpen: isOpen });
    
    try {
      // Usamos upsert para garantir que a linha ID=1 exista
      const { error } = await supabase
        .from('store_config')
        .upsert({ id: 1, is_manual_open: isOpen });

      if (error) {
        console.error('Erro Supabase (Upsert Status):', error);
        // Reverter em caso de erro
        set({ isManualOpen: previousState });
        throw error;
      } else {
        console.log('[Store] Status persistido com sucesso no Supabase');
      }
    } catch (err: any) {
      console.error('Erro catastrófico ao persistir status:', err);
      set({ isManualOpen: previousState });
      throw err;
    }
  },

  getIsOpen: () => {
    return get().isManualOpen;
  }
}));
