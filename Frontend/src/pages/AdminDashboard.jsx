import { useEffect, useState } from 'react';
import { Store, Package, Palette, Box } from 'lucide-react';
import Card from '../components/ui/Card';
import PageLoader from '../components/ui/PageLoader';
import adminService from '../services/adminService';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalStores: 0,
        totalProducts: 0,
        totalThemes: 0,
        totalComponents: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        const result = await adminService.getDashboardStats();
        if (result.success) {
            setStats(result.data);
        }
        setLoading(false);
    };

    const statCards = [
        {
            icon: Store,
            label: 'Total Stores',
            value: stats.totalStores || 0,
            color: 'primary',
        },
        {
            icon: Package,
            label: 'Total Products',
            value: stats.totalProducts || 0,
            color: 'accent',
        },
        {
            icon: Palette,
            label: 'Themes',
            value: stats.totalThemes || 0,
            color: 'success',
        },
        {
            icon: Box,
            label: 'Components',
            value: stats.totalComponents || 0,
            color: 'info',
        },
    ];

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>Dashboard Overview</h1>
                <p className="text-muted">Welcome to Storely Admin Panel</p>
            </div>

            {loading ? (
                <PageLoader type="cards" count={4} />
            ) : (
                <div className="stats-grid">
                    {statCards.map((stat) => (
                        <Card key={stat.label} className="stat-card">
                            <div className={`stat-icon stat-icon-${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <div className="stat-content">
                                <p className="stat-label">{stat.label}</p>
                                <h2 className="stat-value">
                                    {stat.value}
                                </h2>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
