import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import ThemeManager from './pages/ThemeManager';
import UserLayout from './components/layout/UserLayout';
import UserDashboard from './pages/UserDashboard';
import ProductManager from './pages/ProductManager';
import CategoryManager from './pages/CategoryManager';
import StoreCustomizer from './pages/StoreCustomizer';
import ProtectedRoute from './components/common/ProtectedRoute';
import useAuthStore from './store/authStore';

import AdminStoreList from './pages/AdminStoreList';
import Storefront from './pages/Storefront';
import ProductDetail from './pages/ProductDetail';
import DemoPage from './pages/DemoPage';
import Checkout from './pages/Checkout';
import OrderManagement from './pages/OrderManagement';
import OnboardingWizard from './pages/OnboardingWizard';
import AIOnboardingChat from './pages/AIOnboardingChat';
import StoreCreationWizard from './pages/StoreCreationWizard';
import StoreCreationMode from './pages/StoreCreationMode';
import CategoriesPage from './pages/CategoriesPage';
import CategoryProductsPage from './pages/CategoryProductsPage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import MyTemplates from './pages/MyTemplates';

// Placeholder components
const ComponentManager = () => <div style={{ padding: '2rem' }}><h1>Component Manager</h1><p>Coming soon...</p></div>;
const UnauthorizedPage = () => (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Unauthorized</h1>
        <p>You don't have permission to access this page.</p>
    </div>
);

import { getSubdomain } from './utils/subdomain';

function App() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const subdomain = getSubdomain();

    // If we have a subdomain, render the storefront directly
    if (subdomain) {
        return (
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                    <Route path="/" element={<Storefront slug={subdomain} />} />
                    <Route path="/products" element={<ProductsPage slug={subdomain} />} />
                    <Route path="/categories" element={<CategoriesPage slug={subdomain} />} />
                    <Route path="/category/:categoryId" element={<CategoryProductsPage slug={subdomain} />} />
                    <Route path="/product/:productId" element={<ProductDetail />} />
                    <Route path="/cart" element={<CartPage slug={subdomain} />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-success" element={<OrderSuccessPage slug={subdomain} />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <Toaster position="top-right" />
            </BrowserRouter>
        );
    }

    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
                    <Route path="templates" element={<MyTemplates />} />
                    <Route path="orders" element={<OrderManagement />} />
                </Route>

                {/* Store Creation & Onboarding - Protected but outside dashboard layout */}
                <Route
                    path="/create-store"
                    element={
                        <ProtectedRoute>
                            <StoreCreationMode />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/create-store/manual"
                    element={
                        <ProtectedRoute>
                            <StoreCreationWizard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/onboarding/:storeId"
                    element={
                        <ProtectedRoute>
                            <OnboardingWizard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/onboarding/ai/:storeId?"
                    element={
                        <ProtectedRoute>
                            <AIOnboardingChat />
                        </ProtectedRoute>
                    }
                />

                {/* Demo Page */}
                <Route path="/demo" element={<DemoPage />} />

                {/* AI Onboarding Preview */}
                <Route path="/onboarding/preview" element={<Storefront />} />

                {/* Checkout Page */}
                <Route path="/checkout" element={<Checkout />} />



                {/* Default/Landing Page */}
                <Route
                    path="/"
                    element={
                        isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />
                    }
                />

                {/* Store storefront routes */}
                <Route path="/s/:slug" element={<Storefront />} />
                <Route path="/s/:slug/products" element={<ProductsPage />} />
                <Route path="/s/:slug/category/:categoryId" element={<CategoryProductsPage />} />
                <Route path="/s/:slug/product/:productId" element={<ProductDetail />} />
                <Route path="/preview/:slug" element={<Storefront />} />
                <Route path="/preview/:slug/products" element={<ProductsPage />} />
                <Route path="/preview/:slug/category/:categoryId" element={<CategoryProductsPage />} />
                <Route path="/preview/:slug/product/:productId" element={<ProductDetail />} />
                <Route path="/:slug" element={<Storefront />} />
                <Route path="/:slug/products" element={<ProductsPage />} />
                <Route path="/:slug/category/:categoryId" element={<CategoryProductsPage />} />
                <Route path="/:slug/product/:productId" element={<ProductDetail />} />
                <Route path="/product/:productId" element={<ProductDetail />} />
            </Routes>
            <Toaster position="top-right" />
        </BrowserRouter>
    );
}

export default App;
