import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  productImage?: string;
}

interface OrderState {
  items: OrderItem[];
  addItem: (item: Omit<OrderItem, "quantity">) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearOrder: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item,
          ),
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      clearOrder: () => set({ items: [] }),
    }),
    {
      name: "warung-order-storage",
    },
  ),
);
