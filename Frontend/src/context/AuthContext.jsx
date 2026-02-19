import React, { createContext, useContext } from 'react';
import useAuthStore from '../store/authStore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const { user, token, isAuthenticated, setAuth, clearAuth, updateUser, setLoading } = useAuthStore();

    const value = {
        user,
        token,
        isAuthenticated,
        setAuth,
        clearAuth,
        updateUser,
        setLoading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        // Fallback to Zustand store directly if not wrapped in provider
        return useAuthStore();
    }
    return context;
};

export default AuthContext;
