import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set, get) => ({
            // State
            user: null,
            store: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,

            // Actions
            setAuth: (user, token) => {
                set({
                    user,
                    token,
                    isAuthenticated: true,
                });
                // Also store in localStorage for API client
                localStorage.setItem('auth_token', token);
            },

            clearAuth: () => {
                set({
                    user: null,
                    store: null,
                    token: null,
                    isAuthenticated: false,
                });
                localStorage.removeItem('auth_token');
            },

            setStore: (store) => {
                set({ store });
            },

            updateUser: (userData) => {
                set((state) => ({
                    user: { ...state.user, ...userData },
                }));
            },

            setLoading: (isLoading) => {
                set({ isLoading });
            },

            // Check if user has specific role
            hasRole: (role) => {
                const { user } = get();
                return user?.role === role;
            },

            // Check if user is admin
            isAdmin: () => {
                const { user } = get();
                return user?.role === 'admin';
            },
        }),
        {
            name: 'auth-storage', // localStorage key
            partialize: (state) => ({
                user: state.user,
                store: state.store,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAuthStore;
