import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            sessionId: null,

            initializeSession: () => {
                if (!get().sessionId) {
                    set({ sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` });
                }
            },

            addItem: (product, quantity = 1) => {
                const items = get().items;
                const existingItem = items.find(item => item.id === product.id);

                if (existingItem) {
                    set({
                        items: items.map(item =>
                            item.id === product.id
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        )
                    });
                } else {
                    set({ items: [...items, { ...product, quantity }] });
                }
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                } else {
                    set({
                        items: get().items.map(item =>
                            item.id === productId ? { ...item, quantity } : item
                        )
                    });
                }
            },

            removeItem: (productId) => {
                set({ items: get().items.filter(item => item.id !== productId) });
            },

            clearCart: () => {
                set({ items: [] });
            },

            getTotal: () => {
                return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
            },

            getItemCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            }
        }),
        {
            name: 'cart-storage',
        }
    )
);

export default useCartStore;
