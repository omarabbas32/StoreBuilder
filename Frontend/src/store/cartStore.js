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
                const productId = product.id || product._id;
                const existingItem = items.find(item => (item.id || item._id) === productId);

                if (existingItem) {
                    set({
                        items: items.map(item =>
                            (item.id || item._id) === productId
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        )
                    });
                } else {
                    // Ensure the stored item has a consistent 'id' property
                    set({
                        items: [...items, {
                            ...product,
                            id: productId, // Normalize id
                            quantity
                        }]
                    });
                }
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                } else {
                    set({
                        items: get().items.map(item =>
                            (item.id || item._id) === productId ? { ...item, quantity } : item
                        )
                    });
                }
            },

            removeItem: (productId) => {
                set({ items: get().items.filter(item => (item.id || item._id) !== productId) });
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
