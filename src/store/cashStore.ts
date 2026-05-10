import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface CashSession {
  id: string;
  opened_at: string;
  closed_at: string | null;
}

interface CashStoreState {
  currentSession: CashSession | null;
  isLoading: boolean;
  fetchCurrentSession: () => Promise<void>;
  openCashSession: () => Promise<void>;
  closeCashSession: () => Promise<void>;
}

export const useCashStore = create<CashStoreState>((set, get) => ({
  currentSession: null,
  isLoading: true,

  fetchCurrentSession: async () => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from('cash_sessions')
        .select('*')
        .is('closed_at', null)
        .order('opened_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        // Se a tabela não existir ainda, apenas engole o erro e retorna nulo
        if (error.code === 'PGRST205') {
          console.warn('Tabela cash_sessions não existe. Por favor, rode o SQL no Supabase.');
        } else {
          console.error('Erro ao buscar sessão do caixa:', error);
        }
        set({ currentSession: null, isLoading: false });
        return;
      }

      set({ currentSession: data || null, isLoading: false });
    } catch (err) {
      console.error('Erro geral ao buscar caixa:', err);
      set({ isLoading: false });
    }
  },

  openCashSession: async () => {
    try {
      const { data, error } = await supabase
        .from('cash_sessions')
        .insert([{ opened_at: new Date().toISOString() }])
        .select()
        .single();
        
      if (error) throw error;
      set({ currentSession: data });
    } catch (err) {
      console.error('Erro ao abrir o caixa:', err);
      alert('Erro ao abrir o caixa. Verifique se você rodou o SQL de criação da tabela no Supabase.');
      throw err;
    }
  },

  closeCashSession: async () => {
    const session = get().currentSession;
    if (!session) return;
    try {
      const { data, error } = await supabase
        .from('cash_sessions')
        .update({ closed_at: new Date().toISOString() })
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;
      set({ currentSession: null }); 
    } catch (err) {
      console.error('Erro ao fechar o caixa:', err);
      throw err;
    }
  }
}));
