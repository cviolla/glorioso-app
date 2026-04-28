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
    
    // Se não estiver no modo automático, retorna o status manual imediatamente
    if (!isAutoMode) return isManualOpen;

    // Lógica de Modo Automático (Horário de Brasília)
    try {
      // Usar Intl.DateTimeFormat para obter a hora atual em SP de forma robusta
      const formatter = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        weekday: 'long',
        hour12: false
      });

      const parts = formatter.formatToParts(new Date());
      const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
      const weekdayPart = parts.find(p => p.type === 'weekday')?.value || '';
      
      // Mapeamento de dias para evitar problemas de localização
      // No pt-BR, segunda-feira contém "segunda"
      const isMonday = weekdayPart.toLowerCase().includes('segunda');

      // Fechado às segundas
      if (isMonday) return false;
      
      // Aberto das 15:00 às 23:59 (00:00)
      return hour >= 15 && hour < 24;
    } catch (err) {
      console.error('Fallback de data acionado:', err);
      // Fallback básico usando hora local se o Intl falhar
      const hour = new Date().getHours();
      return hour >= 15 && hour < 24;
    }
  }
}));
