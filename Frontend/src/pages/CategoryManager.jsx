import { useEffect, useState } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import categoryService from '../services/categoryService';
import useAuthStore from '../store/authStore';
import { useToast } from '../components/ui/Toast';
import './CategoryManager.css';

const CategoryManager = () => {
    const { store } = useAuthStore();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        store_id: store?.id || '',
    });
    const { success, error: showError } = useToast();

    useEffect(() => {
        if (store?.id) {
            loadCategories();
            setFormData(prev => ({ ...prev, store_id: store.id }));
        }
    }, [store?.id]);

    const loadCategories = async () => {
        setLoading(true);
        const result = await categoryService.getAll(store.id);
        if (result.success) {
            setCategories(result.data || []);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await categoryService.create({ ...formData, store_id: store.id });
        if (result.success) {
            success('Category created successfully!');
            setFormData({ name: '', slug: '', description: '', store_id: store.id });
            setShowForm(false);
            loadCategories();
        } else {
            showError(result.error);
        }
    };

    return (
        <div className="category-manager">
            <div className="page-header">
                <div>
                    <h1>Categories</h1>
                    <p className="text-muted">Manage product categories for your store</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus size={20} />
                    Add Category
                </Button>
            </div>

            {showForm && (
                <Card className="category-form">
                    <h3>Create New Category</h3>
                    <form onSubmit={handleSubmit}>
                        <Input
                            label="Category Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            fullWidth
                        />
                        <Input
                            label="Slug"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                            placeholder="electronics-gear"
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
                            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Create Category</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="categories-grid">
                {loading ? (
                    <p>Loading categories...</p>
                ) : categories.length === 0 ? (
                    <Card>
                        <p className="text-muted">No categories yet. Create your first one!</p>
                    </Card>
                ) : (
                    categories.map((category) => (
                        <Card key={category.id} className="category-card">
                            <div className="category-icon">
                                <Tag size={24} />
                            </div>
                            <div className="category-info">
                                <h3>{category.name}</h3>
                                <p className="text-muted">{category.description || 'No description'}</p>
                                <span className="category-slug">{category.slug}</span>
                            </div>
                            <div className="category-actions">
                                <Button size="sm" variant="ghost">
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default CategoryManager;
