import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Home, Package, FolderOpen, Palette, LogOut, ExternalLink, ShoppingBag } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import './UserLayout.css';

const UserLayout = () => {
    const navigate = useNavigate();
    const { user, store, clearAuth } = useAuthStore();

    const handleLogout = () => {
        clearAuth();
        navigate('/login');
    };

    const navItems = [
        { icon: Home, label: 'Overview', path: '/dashboard' },
        { icon: Package, label: 'Products', path: '/dashboard/products' },
        { icon: FolderOpen, label: 'Categories', path: '/dashboard/categories' },
        { icon: ShoppingBag, label: 'Orders', path: '/dashboard/orders' },
        { icon: Palette, label: 'Customize', path: '/dashboard/customize' },
    ];

    const layoutStyle = {
        '--color-primary': store?.settings?.primaryColor || '#2563eb',
    };

    return (
        <div className="user-layout" style={layoutStyle}>
            <aside className="user-sidebar">
                <div className="user-sidebar-header">
                    <h2>{store?.name || 'My Store'}</h2>
                    <p className="text-muted">{user?.name}</p>
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
                        <Link
                            key={item.path}
                            to={item.path}
                            className="user-nav-item"
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <button onClick={handleLogout} className="user-logout">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </aside>

            <main className="user-main">
                <Outlet />
            </main>
        </div>
    );
};

export default UserLayout;
