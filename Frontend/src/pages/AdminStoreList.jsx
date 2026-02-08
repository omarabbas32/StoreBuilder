import React, { useEffect, useState } from 'react';
import { Store, User, ExternalLink, Search } from 'lucide-react';
import adminService from '../services/adminService';
import Card from '../components/ui/Card';
import PageLoader from '../components/ui/PageLoader';
import './AdminStoreList.css';

const AdminStoreList = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        setLoading(true);
        const result = await adminService.getAllStores();
        if (result.success) {
            setStores(result.data || []);
            setError(null);
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    const filteredStores = stores.filter(store =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="admin-stores">
                <div className="admin-stores-header">
                    <div>
                        <h1>Store Management</h1>
                        <p className="text-muted">View and manage all stores created on the platform</p>
                    </div>
                </div>
                <PageLoader type="cards" count={3} />
            </div>
        );
    }

    return (
        <div className="admin-stores">
            <div className="admin-stores-header">
                <div>
                    <h1>Store Management</h1>
                    <p className="text-muted">View and manage all stores created on the platform</p>
                </div>
                <div className="search-bar">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search stores..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {filteredStores.length === 0 ? (
                <Card className="empty-state">
                    <Store size={48} />
                    <h3>No stores found</h3>
                    <p>The platform doesn't have any stores yet, or your search didn't match any results.</p>
                </Card>
            ) : (
                <div className="stores-grid">
                    {filteredStores.map(store => (
                        <Card key={store.id} className="store-card">
                            <div className="store-card-header">
                                <div className="store-type-icon">
                                    <Store size={24} />
                                </div>
                                <div className="store-status active">Active</div>
                            </div>

                            <div className="store-info">
                                <h3>{store.name}</h3>
                                <p className="store-slug">
                                    <ExternalLink size={14} />
                                    storely.com/{store.slug}
                                </p>
                                <p className="store-description text-muted">
                                    {store.description || 'No description provided.'}
                                </p>
                            </div>

                            <div className="store-card-footer">
                                <div className="store-owner">
                                    <User size={16} />
                                    <span>Owner: {store.owner_id.substring(0, 8)}...</span>
                                </div>
                                <div className="store-meta">
                                    <span>Created: {new Date(store.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminStoreList;
