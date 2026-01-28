import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, Package, FolderOpen, Palette, LogOut, ExternalLink, ShoppingBag, Layers, Menu, X, Bell, User as UserIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import Breadcrumbs from '../common/Breadcrumbs';
import './UserLayout.css';


const UserLayout = () => {
    const navigate = useNavigate();
    const { user, store, clearAuth } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        clearAuth();
        navigate('/login');
    };

    const navItems = [
        { icon: Home, label: 'Overview', path: '/dashboard', end: true },
        { icon: Package, label: 'Products', path: '/dashboard/products' },
        { icon: FolderOpen, label: 'Categories', path: '/dashboard/categories' },
        { icon: ShoppingBag, label: 'Orders', path: '/dashboard/orders' },
        { icon: Palette, label: 'Customize', path: '/dashboard/customize' },
        { icon: Layers, label: 'Templates', path: '/dashboard/templates' },
    ];

    // Close sidebar on mobile when navigating
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [window.location.pathname]);

    const layoutStyle = {
        '--color-primary': store?.settings?.primaryColor || '#2563eb',
    };


    return (
        <div className={`user-layout ${isSidebarOpen ? 'sidebar-open' : ''}`} style={layoutStyle}>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            <aside className={`user-sidebar ${isSidebarOpen ? 'show' : ''}`}>
                <div className="user-sidebar-header">
                    <div className="sidebar-brand">
                        <h2>{store?.name || 'My Store'}</h2>
                        <button className="sidebar-close" onClick={() => setIsSidebarOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>
                    {store?.slug && (
                        <a
                            href={`/${store.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="visit-store-link"
                        >
                            <ExternalLink size={14} />
                            Visit Store
                        </a>
                    )}
                </div>

                <nav className="user-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) => `user-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <button onClick={handleLogout} className="user-logout">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </aside>

            <div className="main-content-wrapper">
                <header className="user-topbar">
                    <div className="topbar-left">
                        <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>
                        <Breadcrumbs />
                    </div>
                    <div className="topbar-right">
                        <button className="topbar-icon-btn">
                            <Bell size={20} />
                        </button>
                        <div className="topbar-user">
                            <div className="user-avatar">
                                <UserIcon size={20} />
                            </div>
                            <span className="user-name-display">{user?.name}</span>
                        </div>
                    </div>
                </header>

                <main className="user-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );

};

export default UserLayout;
