import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface DeliveryFeeEntry {
  fee: number;
  is_active: boolean;
}

interface SettingsState {
  whatsappNumber: string;
  deliveryFees: { [key: string]: DeliveryFeeEntry };
  paymentMethods: string[];
  isLoading: boolean;
  
  fetchSettings: () => Promise<void>;
  setWhatsappNumber: (val: string) => Promise<void>;
  setDeliveryFee: (neighborhood: string, fee: number) => Promise<void>;
  removeDeliveryFee: (neighborhood: string) => Promise<void>;
  setPaymentMethods: (methods: string[]) => Promise<void>;
  updateAllFees: (fees: { [key: string]: DeliveryFeeEntry }) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  whatsappNumber: '5521990062956',
  deliveryFees: {},
  paymentMethods: ['PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro', 'Voucher'],
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

      // Fetch delivery fees (with optional is_active column)
      const { data: feesData } = await supabase
        .from('delivery_fees')
        .select('neighborhood, fee, is_active');

      const feesObj: { [key: string]: DeliveryFeeEntry } = {};
      feesData?.forEach(f => {
        feesObj[f.neighborhood] = {
          fee: Number(f.fee),
          is_active: f.is_active !== undefined ? Boolean(f.is_active) : true
        };
      });

      let methods = generalData?.payment_methods || get().paymentMethods;
      if (Array.isArray(methods) && !methods.includes('Voucher')) {
        methods = [...methods, 'Voucher'];
      }

      set({
        whatsappNumber: generalData?.whatsapp_number || get().whatsappNumber,
        paymentMethods: methods,
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
      deliveryFees: { 
        ...state.deliveryFees, 
        [neighborhood]: { fee, is_active: state.deliveryFees[neighborhood]?.is_active ?? true }
      }
    }));
    try {
      await supabase
        .from('delivery_fees')
        .upsert({ neighborhood, fee }, { onConflict: 'neighborhood' });
    } catch (err) {
      console.error('Erro ao atualizar taxa:', err);
    }
  },

  removeDeliveryFee: async (neighborhood) => {
    set((state) => {
      const newFees = { ...state.deliveryFees };
      delete newFees[neighborhood];
      return { deliveryFees: newFees };
    });
    try {
      await supabase
        .from('delivery_fees')
        .delete()
        .eq('neighborhood', neighborhood);
    } catch (err) {
      console.error('Erro ao remover taxa:', err);
    }
  },

  updateAllFees: async (fees) => {
    set({ deliveryFees: fees });
    try {
      // 1. Get current fees in DB
      const { data: currentDbFees } = await supabase.from('delivery_fees').select('neighborhood');
      const dbNeighborhoods = currentDbFees?.map(f => f.neighborhood) || [];
      
      // 2. Identify which ones to delete
      const neighborhoodsToKeep = Object.keys(fees);
      const neighborhoodsToDelete = dbNeighborhoods.filter(n => !neighborhoodsToKeep.includes(n));

      // 3. Perform deletions if any
      if (neighborhoodsToDelete.length > 0) {
        await supabase.from('delivery_fees').delete().in('neighborhood', neighborhoodsToDelete);
      }

      // 4. Perform upserts with is_active
      const updates = Object.entries(fees).map(([neighborhood, entry]) => ({
        neighborhood,
        fee: entry.fee,
        is_active: entry.is_active
      }));
      if (updates.length > 0) {
        await supabase.from('delivery_fees').upsert(updates, { onConflict: 'neighborhood' });
      }
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
