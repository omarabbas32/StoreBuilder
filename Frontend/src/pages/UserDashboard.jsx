import { useEffect, useState } from 'react';
import { Package, ShoppingCart, DollarSign, TrendingUp, Plus, Store as StoreIcon } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import storeService from '../services/storeService';
import productService from '../services/productService';
import orderService from '../services/orderService';
import useAuthStore from '../store/authStore';
import './UserDashboard.css';

const UserDashboard = () => {
    const { store, setStore } = useAuthStore();
    const [stores, setStores] = useState([]);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        revenue: 0,
    });
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
    });

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        setLoading(true);
        const storesResult = await storeService.getMyStores();

        if (storesResult.success && storesResult.data?.length > 0) {
            setStores(storesResult.data);

            // Set the first store as active if none is selected
            if (!store) {
                const firstStore = storesResult.data[0];
                setStore(firstStore);
                await loadStoreStats(firstStore.id);
            } else {
                await loadStoreStats(store.id);
            }
        }

        setLoading(false);
    };

    const loadStoreStats = async (storeId) => {
        const [productsResult, ordersResult] = await Promise.all([
            productService.getProducts(storeId),
            orderService.getStoreOrders(storeId)
        ]);

        let totalProducts = 0;
        let totalOrders = 0;
        let revenue = 0;

        if (productsResult.success) {
            totalProducts = productsResult.data?.length || 0;
        }

        if (ordersResult.success) {
            totalOrders = ordersResult.data?.length || 0;
            revenue = ordersResult.data?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;
        }

        setStats({
            totalProducts,
            totalOrders,
            revenue: revenue.toFixed(2),
        });
    };

    const handleCreateStore = async (e) => {
        e.preventDefault();
        const result = await storeService.createStore(formData);
        if (result.success) {
            setShowCreateForm(false);
            setFormData({ name: '', slug: '', description: '' });
            loadDashboard();
        }
    };

    const handleStoreSwitch = async (selectedStore) => {
        setStore(selectedStore);
        await loadStoreStats(selectedStore.id);
    };

    if (loading) {
        return <div className="user-dashboard"><p>Loading...</p></div>;
    }

    if (stores.length === 0) {
        return (
            <div className="user-dashboard">
                <Card className="welcome-card">
                    <h1>Welcome to Storely!</h1>
                    <p className="text-muted">You don't have a store yet. Create one to get started.</p>
                    <Button onClick={() => setShowCreateForm(true)}>Create Your First Store</Button>
                </Card>

                {showCreateForm && (
                    <Card className="create-store-form">
                        <h3>Create New Store</h3>
                        <form onSubmit={handleCreateStore}>
                            <Input
                                label="Store Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                fullWidth
                            />
                            <Input
                                label="Store Slug (URL)"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                                placeholder="my-awesome-store"
                                required
                                fullWidth
                            />
                            <Input
                                label="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                fullWidth
                            />
                            <div className="form-actions">
                                <Button type="button" variant="secondary" onClick={() => setShowCreateForm(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Create Store</Button>
                            </div>
                        </form>
                    </Card>
                )}
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
                <Button onClick={() => setShowCreateForm(true)}>
                    <Plus size={20} />
                    Create New Store
                </Button>
            </div>

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

            {showCreateForm && (
                <Card className="create-store-form">
                    <h3>Create New Store</h3>
                    <form onSubmit={handleCreateStore}>
                        <Input
                            label="Store Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            fullWidth
                        />
                        <Input
                            label="Store Slug (URL)"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                            placeholder="my-awesome-store"
                            required
                            fullWidth
                        />
                        <Input
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            fullWidth
                        />
                        <div className="form-actions">
                            <Button type="button" variant="secondary" onClick={() => setShowCreateForm(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Create Store</Button>
                        </div>
                    </form>
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
        </div>
    );
};

export default UserDashboard;
