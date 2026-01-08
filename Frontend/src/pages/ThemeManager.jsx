import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import adminService from '../services/adminService';
import './ThemeManager.css';

const ThemeManager = () => {
    const [themes, setThemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        screenshot_url: '',
    });

    useEffect(() => {
        loadThemes();
    }, []);

    const loadThemes = async () => {
        setLoading(true);
        const result = await adminService.getAllThemes();
        if (result.success) {
            setThemes(result.data || []);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await adminService.createTheme(formData);
        if (result.success) {
            setShowForm(false);
            setFormData({ name: '', description: '', screenshot_url: '' });
            loadThemes();
        }
    };

    return (
        <div className="theme-manager">
            <div className="page-header">
                <div>
                    <h1>Theme Management</h1>
                    <p className="text-muted">Manage themes available to store owners</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus size={20} />
                    Add Theme
                </Button>
            </div>

            {showForm && (
                <Card className="theme-form">
                    <h3>Create New Theme</h3>
                    <form onSubmit={handleSubmit}>
                        <Input
                            label="Theme Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            fullWidth
                        />
                        <Input
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            fullWidth
                        />
                        <Input
                            label="Screenshot URL"
                            value={formData.screenshot_url}
                            onChange={(e) => setFormData({ ...formData, screenshot_url: e.target.value })}
                            fullWidth
                        />
                        <div className="form-actions">
                            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Create Theme</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="themes-grid">
                {loading ? (
                    <p>Loading themes...</p>
                ) : themes.length === 0 ? (
                    <p className="text-muted">No themes yet. Create your first theme!</p>
                ) : (
                    themes.map((theme) => (
                        <Card key={theme.id} className="theme-card">
                            {theme.screenshot_url && (
                                <img src={theme.screenshot_url} alt={theme.name} className="theme-preview" />
                            )}
                            <h3>{theme.name}</h3>
                            <p className="text-muted">{theme.description}</p>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default ThemeManager;
