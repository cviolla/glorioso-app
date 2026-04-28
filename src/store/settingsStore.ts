import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  whatsappNumber: string;
  deliveryFees: { [key: string]: number };
  paymentMethods: string[];
  setWhatsappNumber: (val: string) => void;
  setDeliveryFee: (neighborhood: string, fee: number) => void;
  setPaymentMethods: (methods: string[]) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      whatsappNumber: '5521990062956',
      deliveryFees: {
        'Santa Cruz da Serra': 6.00,
        'Santa Cruz': 6.00,
        'Jardim Rotsen': 6.00,
        'Jardim Anhangá': 5.00,
        'Parque Paulista': 5.00,
        'Barro Branco': 5.00,
        'Parque Equitativa': 5.00,
        'Nova Campinas': 4.00,
        'Chácaras Rio-Petrópolis': 5.00,
        'Outros': 7.00
      },
      paymentMethods: ['PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'],
      setWhatsappNumber: (val) => set({ whatsappNumber: val }),
      setDeliveryFee: (neighborhood, fee) => set((state) => ({
        deliveryFees: { ...state.deliveryFees, [neighborhood]: fee }
      })),
      setPaymentMethods: (methods) => set({ paymentMethods: methods }),
    }),
    {
      name: 'glorioso-settings-storage',
    }
  )
);
