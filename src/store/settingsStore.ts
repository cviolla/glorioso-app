import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  whatsappNumber: string;
  deliveryFee5: number;
  deliveryFee7: number;
  paymentMethods: string[];
  setWhatsappNumber: (val: string) => void;
  setDeliveryFees: (f5: number, f7: number) => void;
  setPaymentMethods: (methods: string[]) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      whatsappNumber: '5521990062956',
      deliveryFee5: 5.00,
      deliveryFee7: 7.00,
      paymentMethods: ['PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'],
      setWhatsappNumber: (val) => set({ whatsappNumber: val }),
      setDeliveryFees: (f5, f7) => set({ deliveryFee5: f5, deliveryFee7: f7 }),
      setPaymentMethods: (methods) => set({ paymentMethods: methods }),
    }),
    {
      name: 'glorioso-settings-storage',
    }
  )
);
