import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const GoogleOAuthCallback = () => {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const token = searchParams.get('token');
                const userParam = searchParams.get('user');
                const role = searchParams.get('role');
                const errorParam = searchParams.get('error');

                if (errorParam) {
                    setError(decodeURIComponent(errorParam));
                    setLoading(false);
                    return;
                }

                if (!token || !userParam) {
                    setError('No token or user data received');
                    setLoading(false);
                    return;
                }

                // Parse user data from URL
                const user = JSON.parse(decodeURIComponent(userParam));

                // Store auth in store
                setAuth(user, token);

                // Redirect to appropriate dashboard
                setTimeout(() => {
                    if (role === 'owner') {
                        navigate('/dashboard', { replace: true });
                    } else {
                        navigate('/dashboard', { replace: true });
                    }
                }, 1000);
            } catch (err) {
                console.error('OAuth callback error:', err);
                setError(err.message || 'Authentication failed');
                setLoading(false);
            }
        };

        handleCallback();
    }, [searchParams, navigate, setAuth]);

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh',
            backgroundColor: '#f5f5f5'
        }}>
            {loading && !error && (
                <>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid #f0f0f0',
                        borderTop: '4px solid #007bff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                    }} />
                    <p style={{ marginTop: '20px', fontSize: '18px', color: '#666' }}>
                        Completing sign in...
                    </p>
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </>
            )}

            {error && (
                <>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
                    <h1 style={{ color: '#d32f2f', marginBottom: '10px' }}>Authentication Failed</h1>
                    <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Back to Login
                    </button>
                </>
            )}
        </div>
    );
};

export default GoogleOAuthCallback;
