import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Package, LogOut, ChevronRight, Shield } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import customerService from '../services/customerService';
import authService from '../services/authService';
import useAuthStore from '../store/authStore';
import { useStorePath } from '../hooks/useStorePath';
import './Auth.css'; // Reuse auth styles for consistency

const CustomerProfilePage = () => {
    const navigate = useNavigate();
    const storePath = useStorePath();
    const { user, logout: logoutUserState } = useAuthStore();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        const result = await customerService.getMe();
        if (result.success) {
            setProfile(result.data);
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await authService.logout();
        logoutUserState();
        navigate(`${storePath}/login`);
    };

    if (loading) return <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>Loading profile...</div>;

    return (
        <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>My Account</h1>
                    <p style={{ color: '#64748b' }}>Manage your profile and view your orders</p>
                </div>
                <Button variant="outline" onClick={handleLogout} style={{ color: '#ef4444', borderColor: '#fee2e2' }}>
                    <LogOut size={18} style={{ marginRight: '8px' }} />
                    Logout
                </Button>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <Card style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <User size={20} color="#3b82f6" />
                        Personal Information
                    </h2>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '10px' }}>
                                <User size={20} color="#3b82f6" />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Full Name</p>
                                <p style={{ fontWeight: '600' }}>{user?.name || profile?.name || 'Customer'}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '10px' }}>
                                <Mail size={20} color="#22c55e" />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Email Address</p>
                                <p style={{ fontWeight: '600' }}>{user?.email || profile?.email}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Package size={20} color="#8b5cf6" />
                            Quick Links
                        </h2>
                    </div>

                    <div style={{ display: 'grid' }}>
                        <button
                            onClick={() => navigate(`${storePath}/orders`)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1.25rem 1.5rem',
                                background: 'transparent',
                                border: 'none',
                                borderTop: '1px solid #f1f5f9',
                                width: '100%',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <Package size={20} color="#64748b" />
                                <span style={{ fontWeight: '600' }}>My Orders</span>
                            </div>
                            <ChevronRight size={18} color="#cbd5e1" />
                        </button>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1.25rem 1.5rem',
                                borderTop: '1px solid #f1f5f9',
                                color: '#94a3b8'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <Shield size={20} color="#cbd5e1" />
                                <span style={{ fontWeight: '600' }}>Account Security</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>Pro Only</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CustomerProfilePage;
