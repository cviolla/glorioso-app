import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface StoreStatusState {
  isManualOpen: boolean;
  isLoading: boolean;
  setManualOpen: (isOpen: boolean) => Promise<void>;
  fetchStatus: () => Promise<void>;
}

export const useStoreStatusStore = create<StoreStatusState>((set, get) => ({
  isManualOpen: false,
  isLoading: true,

  fetchStatus: async () => {
    try {
      console.log('[StoreStatus] Buscando configuração no banco...');
      // Busca o primeiro registro disponível, independente do ID
      const { data, error } = await supabase
        .from('store_config')
        .select('id, is_manual_open')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('[StoreStatus] Erro ao buscar status:', error.message);
        set({ isLoading: false });
        return;
      }

      if (data) {
        console.log('[StoreStatus] Configuração encontrada:', data);
        set({ 
          isManualOpen: !!data.is_manual_open,
          isLoading: false 
        });
      } else {
        console.log('[StoreStatus] Nenhuma configuração encontrada. A loja permanecerá fechada até ser aberta no Admin.');
        set({ isLoading: false });
      }
    } catch (err) {
      console.error('[StoreStatus] Erro catastrófico:', err);
      set({ isLoading: false });
    }
  },

  setManualOpen: async (isOpen) => {
    const previousState = get().isManualOpen;
    set({ isManualOpen: isOpen });
    
    try {
      // Tenta primeiro encontrar o ID existente para atualizar o registro correto
      const { data: existing } = await supabase
        .from('store_config')
        .select('id')
        .limit(1)
        .maybeSingle();

      const targetId = existing?.id || 1;
      
      const { error } = await supabase
        .from('store_config')
        .upsert({ id: targetId, is_manual_open: isOpen });

      if (error) throw error;
      console.log(`[StoreStatus] Status ${isOpen ? 'ABERTO' : 'FECHADO'} salvo com sucesso (ID: ${targetId})`);
    } catch (err) {
      console.error('[StoreStatus] Erro ao salvar:', err);
      set({ isManualOpen: previousState });
      throw err;
    }
  }
}));
