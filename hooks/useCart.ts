import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  orderDetails?: string
}

interface CartStore {
  items: CartItem[]
  orderType: 'dine-in' | 'takeaway'
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (menuItemId: string) => void
  updateQuantity: (menuItemId: string, quantity: number) => void
  updateNote: (menuItemId: string, note: string) => void
  setOrderType: (type: 'dine-in' | 'takeaway') => void
  clearCart: () => void
  total: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      orderType: 'dine-in',
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.menuItemId === item.menuItemId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.menuItemId === item.menuItemId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: 1 }] }
        }),
      removeItem: (menuItemId) =>
        set((state) => ({ items: state.items.filter((i) => i.menuItemId !== menuItemId) })),
      updateQuantity: (menuItemId, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((i) => i.menuItemId !== menuItemId)
            : state.items.map((i) =>
                i.menuItemId === menuItemId ? { ...i, quantity } : i
              ),
        })),
      updateNote: (menuItemId, note) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, orderDetails: note } : i
          ),
        })),
      setOrderType: (type) => set({ orderType: type }),
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'chaidham-cart' }
  )
)