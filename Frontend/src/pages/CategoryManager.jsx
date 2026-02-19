import { useEffect, useState } from 'react';
import { Plus, Trash2, Tag, Edit } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import PageLoader from '../components/ui/PageLoader';
import ImageUpload from '../components/ui/ImageUpload';
import categoryService from '../services/categoryService';
import useAuthStore from '../store/authStore';
import { useToast } from '../components/ui/Toast';
import '../styles/empty-states.css';
import './CategoryManager.css';

const CategoryManager = () => {
    const { store } = useAuthStore();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        imageUrl: '',
        storeId: store?.id || '',
    });
    const { success, error: showError } = useToast();

    useEffect(() => {
        if (store?.id) {
            loadCategories();
            setFormData(prev => ({ ...prev, storeId: store.id }));
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

    const handleFormToggle = () => {
        setShowForm(!showForm);
        if (!showForm) {
            setFormData({ name: '', slug: '', description: '', imageUrl: '', storeId: store.id });
        }
    };

    const handleEditClick = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name || '',
            slug: category.slug || '',
            description: category.description || '',
            imageUrl: category.imageUrl || '',
            storeId: store.id
        });
    };

    const closeEditModal = () => {
        setEditingCategory(null);
        setFormData({ name: '', slug: '', description: '', imageUrl: '', storeId: store.id });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await categoryService.create({ ...formData, storeId: store.id });
        if (result.success) {
            success('Category created successfully!');
            setFormData({ name: '', slug: '', description: '', imageUrl: '', storeId: store.id });
            setShowForm(false);
            loadCategories();
        } else {
            showError(result.error);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const result = await categoryService.update(editingCategory.id, formData);
        if (result.success) {
            success('Category updated successfully!');
            closeEditModal();
            loadCategories();
        } else {
            showError(result.error);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this category? All products in this category will become uncategorized.')) {
            const result = await categoryService.delete(id);
            if (result.success) {
                success('Category deleted successfully!');
                loadCategories();
            } else {
                showError(result.error);
            }
        }
    };

    return (
        <div className="category-manager">
            <div className="page-header">
                <div>
                    <h1>Categories</h1>
                    <p className="text-muted">Manage product categories for your store</p>
                </div>
                <Button onClick={handleFormToggle}>
                    <Plus size={20} />
                    {showForm ? 'Cancel' : 'Add Category'}
                </Button>
            </div>

            {showForm && (
                <Card className="category-form">
                    <h3>Create New Category</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-info">
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
                            </div>
                            <div className="form-image">
                                <ImageUpload
                                    label="Category Image"
                                    value={formData.imageUrl}
                                    onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                                />
                            </div>
                        </div>
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
                    <PageLoader type="list" />
                ) : categories.length === 0 ? (
                    <Card className="empty-state-card">
                        <div className="empty-state-icon">🏷️</div>
                        <h3>No Categories Yet</h3>
                        <p className="text-muted">Categorize your products to help customers find what they need.</p>
                        <Button onClick={() => setShowForm(true)} size="lg">
                            <Plus size={20} />
                            Add Your First Category
                        </Button>
                    </Card>
                ) : (
                    categories.map((category) => (
                        <Card key={category.id} className="category-card">
                            <div className="category-image">
                                {category.imageUrl ? (
                                    <img src={category.imageUrl} alt={category.name} />
                                ) : (
                                    <Tag size={24} />
                                )}
                            </div>
                            <div className="category-info">
                                <h3>{category.name}</h3>
                                <p className="text-muted">{category.description || 'No description'}</p>
                                <span className="category-slug">{category.slug}</span>
                            </div>
                            <div className="category-actions">
                                <Button size="sm" variant="ghost" onClick={() => handleEditClick(category)}>
                                    <Edit size={16} />
                                </Button>
                                <Button size="sm" variant="ghost" className="delete-btn" onClick={() => handleDelete(category.id)}>
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Edit Category Modal */}
            {editingCategory && (
                <div className="modal-overlay" onClick={closeEditModal}>
                    <Card className="edit-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Category</h2>
                            <button className="modal-close" onClick={closeEditModal}>✕</button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="modal-form">
                            <div className="form-grid">
                                <div className="form-info">
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
                                        required
                                        fullWidth
                                    />
                                    <Input
                                        label="Description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        fullWidth
                                    />
                                </div>
                                <div className="form-image">
                                    <ImageUpload
                                        label="Category Image"
                                        value={formData.imageUrl}
                                        onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <Button type="button" variant="secondary" onClick={closeEditModal}>
                                    Cancel
                                </Button>
                                <Button type="submit">Update Category</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default CategoryManager;
