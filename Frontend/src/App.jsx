import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import ThemeManager from './pages/ThemeManager';
import UserLayout from './components/layout/UserLayout';
import UserDashboard from './pages/UserDashboard';
import ProductManager from './pages/ProductManager';
import StoreCustomizer from './pages/StoreCustomizer';
import ProtectedRoute from './components/common/ProtectedRoute';
import useAuthStore from './store/authStore';

import AdminStoreList from './pages/AdminStoreList';
import Storefront from './pages/Storefront';
import ProductDetail from './pages/ProductDetail';
import DemoPage from './pages/DemoPage';
import Checkout from './pages/Checkout';
import OrderManagement from './pages/OrderManagement';

// Placeholder components
const ComponentManager = () => <div style={{ padding: '2rem' }}><h1>Component Manager</h1><p>Coming soon...</p></div>;
const CategoryManager = () => <div style={{ padding: '2rem' }}><h1>Categories</h1><p>Coming soon...</p></div>;
const UnauthorizedPage = () => (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Unauthorized</h1>
        <p>You don't have permission to access this page.</p>
    </div>
);

const getSubdomain = () => {
    const hostname = window.location.hostname;
    // For local development on localhost:xxxx
    if (hostname === 'localhost') return null;

    const parts = hostname.split('.');

    // Handle localhost subdomains (e.g., store1.localhost)
    if (hostname.endsWith('.localhost')) {
        return parts.length > 1 ? parts[0] : null;
    }

    // Handle standard domains (e.g., store1.storely.com)
    if (parts.length > 2) {
        const subdomain = parts[0];
        if (subdomain === 'www') return null;
        return subdomain;
    }

    return null;
};

function App() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const subdomain = getSubdomain();

    // If we have a subdomain, render the storefront directly
    if (subdomain) {
        return (
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Storefront slug={subdomain} />} />
                    <Route path="/product/:productId" element={<ProductDetail />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
                />
                <Route
                    path="/register"
                    element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
                />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                {/* Admin routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<AdminDashboard />} />
                    <Route path="themes" element={<ThemeManager />} />
                    <Route path="components" element={<ComponentManager />} />
                    <Route path="stores" element={<AdminStoreList />} />
                </Route>

                {/* User routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <UserLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<UserDashboard />} />
                    <Route path="products" element={<ProductManager />} />
                    <Route path="categories" element={<CategoryManager />} />
                    <Route path="customize" element={<StoreCustomizer />} />
                    <Route path="orders" element={<OrderManagement />} />
                </Route>

                {/* Demo Page */}
                <Route path="/demo" element={<DemoPage />} />

                {/* Checkout Page */}
                <Route path="/checkout" element={<Checkout />} />

                {/* Default/Landing Page */}
                <Route
                    path="/"
                    element={
                        isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />
                    }
                />

                {/* Store storefront (legacy path or for non-subdomain access) */}
                <Route path="/:slug" element={<Storefront />} />
                <Route path="/product/:productId" element={<ProductDetail />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
