import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartAddon = {
  name: string;
  price: number;
};

export type CartItem = {
  cartItemId: string; // Unique ID for the specific cart entry
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
  addons?: CartAddon[];
};

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity' | 'cartItemId'>) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        // Generate a signature for comparison
        const addonsSignature = item.addons?.map(a => a.name).sort().join('|') || '';
        const variantSignature = item.variant || '';
        
        // Check if exact same product + variant + addons exists
        const existingItemIndex = state.items.findIndex(i => 
          i.id === item.id && 
          (i.variant || '') === variantSignature &&
          (i.addons?.map(a => a.name).sort().join('|') || '') === addonsSignature
        );

        if (existingItemIndex >= 0) {
          const newItems = [...state.items];
          newItems[existingItemIndex].quantity += 1;
          return { items: newItems };
        }
        
        const cartItemId = crypto.randomUUID();
        return { items: [...state.items, { ...item, quantity: 1, cartItemId }] };
      }),
      removeItem: (cartItemId) => set((state) => ({
        items: state.items.filter(i => i.cartItemId !== cartItemId)
      })),
      updateQuantity: (cartItemId, delta) => set((state) => {
        return {
          items: state.items.map(i => {
            if (i.cartItemId === cartItemId) {
              const newQuantity = i.quantity + delta;
              return { ...i, quantity: newQuantity > 0 ? newQuantity : 1 }; // Prevents 0 quantity
            }
            return i;
          })
        };
      }),
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      totalPrice: () => get().items.reduce((acc, item) => {
        const itemTotal = item.price + (item.addons?.reduce((sum, a) => sum + a.price, 0) || 0);
        return acc + (itemTotal * item.quantity);
      }, 0),
    }),
    {
      name: 'glorioso-cart-storage',
      version: 1,
    }
  )
);
