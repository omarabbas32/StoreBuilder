import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, DollarSign, TrendingUp, Plus, Store as StoreIcon } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PageLoader from '../components/ui/PageLoader';
import GettingStartedChecklist from '../components/dashboard/GettingStartedChecklist';
import AIAssistant from '../components/dashboard/AIAssistant';
import storeService from '../services/storeService';
import productService from '../services/productService';
import orderService from '../services/orderService';
import categoryService from '../services/categoryService';
import useAuthStore from '../store/authStore';
import './UserDashboard.css';

const UserDashboard = () => {
    const navigate = useNavigate();
    const { store, setStore } = useAuthStore();
    const [stores, setStores] = useState([]);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        revenue: 0,
    });
    const [totalCategories, setTotalCategories] = useState(0);
    const [loading, setLoading] = useState(true);
    const hasRedirectedRef = useRef(false);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        setLoading(true);
        const storesResult = await storeService.getMyStores();

        if (storesResult.success && storesResult.data?.length > 0) {
            setStores(storesResult.data);

            // Set the first store as active if none is selected
            const storeId = store?.id || store?._id;
            const storeFromApi = storeId
                ? storesResult.data.find((s) => (s.id || s._id) === storeId)
                : null;
            const activeStore = storeFromApi || storesResult.data[0] || store;
            if (activeStore) {
                setStore(activeStore);

                setLoading(false);
                await loadStoreStats(activeStore.id);
            }
        }

        setLoading(false);
    };

    const loadStoreStats = async (storeId) => {
        const [productsResult, ordersResult, categoriesResult] = await Promise.all([
            productService.getProducts(storeId),
            orderService.getStoreOrders(storeId),
            categoryService.getAll(storeId)
        ]);

        let totalProducts = 0;
        let totalOrders = 0;
        let revenue = 0;

        if (productsResult.success) {
            totalProducts = productsResult.pagination?.total || productsResult.data?.length || 0;
        }

        if (ordersResult.success) {
            totalOrders = ordersResult.pagination?.total || ordersResult.data?.length || 0;
            revenue = ordersResult.data?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;
        }

        if (categoriesResult.success) {
            setTotalCategories(categoriesResult.data?.length || 0);
        }

        setStats({
            totalProducts,
            totalOrders,
            revenue: revenue.toFixed(2),
        });
    };

    const handleStoreSwitch = async (selectedStore) => {
        setStore(selectedStore);
        await loadStoreStats(selectedStore.id);
    };

    if (loading) {
        return (
            <div className="user-dashboard">
                <div className="dashboard-header">
                    <div>
                        <h1>Store Overview</h1>
                        <p className="text-muted">Manage your online stores</p>
                    </div>
                </div>
                <PageLoader type="cards" count={4} />
            </div>
        );
    }

    if (stores.length === 0) {
        return (
            <div className="user-dashboard">
                <Card className="welcome-card">
                    <h1>Welcome to Storely!</h1>
                    <p className="text-muted">You don't have a store yet. Create one to get started.</p>
                    <Button onClick={() => navigate('/create-store')}>Create Your First Store</Button>
                </Card>
            </div>
        );
    }

    const statCards = [
        {
            icon: Package,
            label: 'Products',
            value: stats.totalProducts,
            color: 'primary',
        },
        {
            icon: ShoppingCart,
            label: 'Orders',
            value: stats.totalOrders,
            color: 'accent',
        },
        {
            icon: DollarSign,
            label: 'Revenue',
            value: `$${stats.revenue}`,
            color: 'success',
        },
        {
            icon: TrendingUp,
            label: 'Growth',
            value: '+0%',
            color: 'info',
        },
    ];

    return (
        <div className="user-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Store Overview</h1>
                    <p className="text-muted">Manage your online stores</p>
                </div>
                <Button onClick={() => navigate('/create-store')}>
                    <Plus size={20} />
                    Create New Store
                </Button>
            </div>

            {/* Getting Started Checklist */}
            {(stats.totalProducts === 0 || stats.totalOrders === 0) && (
                <GettingStartedChecklist
                    totalProducts={stats.totalProducts}
                    totalCategories={totalCategories}
                />
            )}

            {/* Store Selector */}
            {stores.length > 1 && (
                <Card className="store-selector">
                    <h3>Your Stores</h3>
                    <div className="stores-grid">
                        {stores.map((s) => (
                            <div
                                key={s.id}
                                className={`store-card ${store?.id === s.id ? 'active' : ''}`}
                                onClick={() => handleStoreSwitch(s)}
                            >
                                <StoreIcon size={24} />
                                <div>
                                    <h4>{s.name}</h4>
                                    <p className="text-muted">{s.slug}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <div className="stats-grid">
                {statCards.map((stat) => (
                    <Card key={stat.label} className="stat-card">
                        <div className={`stat-icon stat-icon-${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">{stat.label}</p>
                            <h2 className="stat-value">{stat.value}</h2>
                        </div>
                    </Card>
                ))}
            </div>

            <AIAssistant />
        </div>
    );
};

export default UserDashboard;
