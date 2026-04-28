import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface SettingsState {
  whatsappNumber: string;
  deliveryFees: { [key: string]: number };
  paymentMethods: string[];
  isLoading: boolean;
  
  fetchSettings: () => Promise<void>;
  setWhatsappNumber: (val: string) => Promise<void>;
  setDeliveryFee: (neighborhood: string, fee: number) => Promise<void>;
  setPaymentMethods: (methods: string[]) => Promise<void>;
  updateAllFees: (fees: { [key: string]: number }) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  whatsappNumber: '5521990062956',
  deliveryFees: {},
  paymentMethods: ['PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'],
  isLoading: true,

  fetchSettings: async () => {
    try {
      set({ isLoading: true });
      
      // Fetch general settings
      const { data: generalData } = await supabase
        .from('store_settings')
        .select('whatsapp_number, payment_methods')
        .eq('id', 1)
        .single();

      // Fetch delivery fees
      const { data: feesData } = await supabase
        .from('delivery_fees')
        .select('neighborhood, fee');

      const feesObj: { [key: string]: number } = {};
      feesData?.forEach(f => {
        feesObj[f.neighborhood] = Number(f.fee);
      });

      set({
        whatsappNumber: generalData?.whatsapp_number || get().whatsappNumber,
        paymentMethods: generalData?.payment_methods || get().paymentMethods,
        deliveryFees: feesObj,
        isLoading: false
      });
    } catch (err) {
      console.error('Erro ao buscar configurações:', err);
      set({ isLoading: false });
    }
  },

  setWhatsappNumber: async (val) => {
    set({ whatsappNumber: val });
    try {
      await supabase
        .from('store_settings')
        .update({ whatsapp_number: val })
        .eq('id', 1);
    } catch (err) {
      console.error('Erro ao atualizar WhatsApp:', err);
    }
  },

  setDeliveryFee: async (neighborhood, fee) => {
    set((state) => ({
      deliveryFees: { ...state.deliveryFees, [neighborhood]: fee }
    }));
    try {
      await supabase
        .from('delivery_fees')
        .upsert({ neighborhood, fee })
        .eq('neighborhood', neighborhood);
    } catch (err) {
      console.error('Erro ao atualizar taxa:', err);
    }
  },

  updateAllFees: async (fees) => {
    set({ deliveryFees: fees });
    try {
      const updates = Object.entries(fees).map(([neighborhood, fee]) => ({
        neighborhood,
        fee
      }));
      await supabase.from('delivery_fees').upsert(updates);
    } catch (err) {
      console.error('Erro ao atualizar todas as taxas:', err);
    }
  },

  setPaymentMethods: async (methods) => {
    set({ paymentMethods: methods });
    try {
      await supabase
        .from('store_settings')
        .update({ payment_methods: methods })
        .eq('id', 1);
    } catch (err) {
      console.error('Erro ao atualizar métodos de pagamento:', err);
    }
  },
}));
