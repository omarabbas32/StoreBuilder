import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Palette, Box, Store, LogOut } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import './AdminLayout.css';

const AdminLayout = () => {
    const navigate = useNavigate();
    const { user, clearAuth } = useAuthStore();

    const handleLogout = () => {
        clearAuth();
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: Palette, label: 'Themes', path: '/admin/themes' },
        { icon: Box, label: 'Components', path: '/admin/components' },
        { icon: Store, label: 'Stores', path: '/admin/stores' },
    ];

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <h2>Storely Admin</h2>
                    <p className="text-muted">{user?.email}</p>
                </div>

                <nav className="admin-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="admin-nav-item"
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <button onClick={handleLogout} className="admin-logout">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </aside>

            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
