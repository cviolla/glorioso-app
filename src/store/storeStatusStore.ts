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
    const { isAutoMode } = get();
    const newMode = !isAutoMode;
    
    // Atualização otimista
    set({ isAutoMode: newMode });
    
    try {
      const { error } = await supabase
        .from('store_config')
        .upsert({ id: 1, is_auto_mode: newMode })
        .select();

      if (error) {
        console.error('Erro Supabase (Modo Automático):', error);
        // Reverter em caso de erro
        set({ isAutoMode: isAutoMode });
      }
    } catch (err) {
      console.error('Erro catastrófico (Modo Automático):', err);
      set({ isAutoMode: isAutoMode });
    }
  },

  setManualOpen: async (isOpen) => {
    const { isManualOpen } = get();
    
    // Atualização otimista
    set({ isManualOpen: isOpen });
    
    try {
      const { error } = await supabase
        .from('store_config')
        .upsert({ id: 1, is_manual_open: isOpen })
        .select();

      if (error) {
        console.error('Erro Supabase (Controle Manual):', error);
        // Reverter em caso de erro
        set({ isManualOpen: isManualOpen });
      }
    } catch (err) {
      console.error('Erro catastrófico (Controle Manual):', err);
      set({ isManualOpen: isManualOpen });
    }
  },

  getIsOpen: () => {
    const { isAutoMode, isManualOpen } = get();
    
    // Se não estiver no modo automático, retorna o status manual imediatamente
    if (!isAutoMode) return isManualOpen;

    // Lógica de Modo Automático (Horário de Brasília)
    try {
      // Obtém a data/hora atual no fuso de São Paulo
      const now = new Date();
      const spTimeStr = now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
      const spDate = new Date(spTimeStr);
      
      const day = spDate.getDay(); // 0 (Dom) a 6 (Sáb)
      const hour = spDate.getHours();

      // Mapeamento: 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
      // Fechado às segundas (1)
      if (day === 1) return false;
      
      // Aberto de Terça a Domingo das 15:00 às 23:59 (hora 23 incluída)
      // Como o dia vira às 00:00, usamos hour < 24 ou simplesmente >= 15
      return hour >= 15 && hour < 24;
    } catch (err) {
      console.error('Erro na lógica de horário SP:', err);
      // Fallback básico usando hora local se o fuso falhar
      const hour = new Date().getHours();
      return hour >= 15 && hour < 24;
    }
  }
}));
