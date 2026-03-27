import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  emoji: string;
  quantity: number;
  specialInstructions?: string;
}

interface CartStore {
  items: CartItem[];
  orderType: "pickup" | "dine-in";
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateInstructions: (id: string, instructions: string) => void;
  setOrderType: (type: "pickup" | "dine-in") => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      orderType: "pickup",
      cartOpen: false,

      setCartOpen: (open) => set({ cartOpen: open }),

      addItem: (item) => {
        const existing = get().items.find((i) => i._id === item._id);
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          }));
        } else {
          set((state) => ({
            items: [...state.items, { ...item, quantity: 1 }],
          }));
        }
      },

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i._id !== id),
        })),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i._id === id ? { ...i, quantity } : i
          ),
        }));
      },

      updateInstructions: (id, instructions) =>
        set((state) => ({
          items: state.items.map((i) =>
            i._id === id ? { ...i, specialInstructions: instructions } : i
          ),
        })),

      setOrderType: (type) => set({ orderType: type }),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "chaidham-cart",
      partialize: (state) => ({
        items: state.items,
        orderType: state.orderType,
      }),
    }
  )
);