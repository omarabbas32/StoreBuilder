import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import themeService from '../services/themeService';
import useAuthStore from '../store/authStore';
import './MyTemplates.css';

const MyTemplates = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadTemplates = async () => {
            setLoading(true);
            const result = await themeService.getAll();
            if (!result.success) {
                setError(result.error || 'Failed to load templates.');
                setLoading(false);
                return;
            }
            setTemplates(result.data || []);
            setLoading(false);
        };
        loadTemplates();
    }, []);

    const userId = user?.id || user?._id;
    const myTemplates = useMemo(() => {
        if (!userId) return [];
        return templates.filter((template) => template.user_id === userId);
    }, [templates, userId]);

    return (
        <div className="my-templates">
            <div className="templates-header">
                <div>
                    <h1>My Templates</h1>
                    <p className="text-muted">Templates you saved from the store customizer.</p>
                </div>
                <Button onClick={() => navigate('/dashboard/customize')}>
                    Create New Template
                </Button>
            </div>

            {loading && <p>Loading templates...</p>}
            {error && <p className="templates-error">{error}</p>}

            {!loading && !error && myTemplates.length === 0 && (
                <div className="templates-empty">
                    <p className="text-muted">No templates yet. Save one from the Store Designer.</p>
                    <Button variant="secondary" onClick={() => navigate('/dashboard/customize')}>
                        Go to Store Designer
                    </Button>
                </div>
            )}

            {!loading && !error && myTemplates.length > 0 && (
                <div className="templates-grid">
                    {myTemplates.map((template) => (
                        <Card key={template.id} className="template-card">
                            {template.screenshot_url ? (
                                <img
                                    src={template.screenshot_url}
                                    alt={template.name}
                                    className="template-preview"
                                />
                            ) : (
                                <div className="template-preview placeholder">
                                    <span>No preview</span>
                                </div>
                            )}
                            <div className="template-info">
                                <h3>{template.name}</h3>
                                {template.description && (
                                    <p className="text-muted">{template.description}</p>
                                )}
                                {template.created_at && (
                                    <p className="template-date">
                                        Saved {new Date(template.created_at).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyTemplates;
