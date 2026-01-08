import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, GripVertical, Save } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import ImageUpload from '../components/ui/ImageUpload';
import productService from '../services/productService';
import useAuthStore from '../store/authStore';
import './ProductManager.css';

const ProductManager = () => {
    const { store } = useAuthStore();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isReordering, setIsReordering] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        images: [],
    });

    useEffect(() => {
        if (store?.id) {
            loadProducts();
        }
    }, [store?.id]);

    const loadProducts = async () => {
        setLoading(true);
        const result = await productService.getProducts(store.id);
        if (result.success) {
            setProducts(result.data || []);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await productService.createProduct({
            ...formData,
            store_id: store.id
        });
        if (result.success) {
            setShowForm(false);
            setFormData({ name: '', description: '', price: '', stock: '', images: [] });
            loadProducts();
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this product?')) {
            await productService.deleteProduct(id);
            loadProducts();
        }
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(products);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setProducts(items);
        setIsReordering(true);
    };

    const saveOrder = async () => {
        const productIds = products.map(p => p.id);
        const result = await productService.reorderProducts(productIds);
        if (result.success) {
            setIsReordering(false);
            alert('Product order saved successfully!');
        }
    };

    if (!store) {
        return (
            <div className="product-manager">
                <Card>
                    <p>Please select or create a store first to manage products.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="product-manager">
            <div className="page-header">
                <div>
                    <h1>Products</h1>
                    <p className="text-muted">Manage your product catalog for {store.name}</p>
                </div>
                <div className="header-actions">
                    {isReordering && (
                        <Button variant="success" onClick={saveOrder} className="save-order-btn">
                            <Save size={20} />
                            Save New Order
                        </Button>
                    )}
                    <Button onClick={() => setShowForm(!showForm)}>
                        <Plus size={20} />
                        Add Product
                    </Button>
                </div>
            </div>

            {showForm && (
                <Card className="product-form">
                    <h3>Create New Product</h3>
                    <form onSubmit={handleSubmit}>
                        <Input
                            label="Product Name"
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
                        <div className="form-row">
                            <Input
                                label="Price"
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                required
                            />
                            <Input
                                label="Stock"
                                type="number"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                            <ImageUpload
                                label="Product Image"
                                value={formData.images[0] || ''}
                                onChange={(url) => setFormData({ ...formData, images: url ? [url] : [] })}
                            />
                        </div>
                        <div className="form-actions">
                            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Create Product</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="products-list">
                {loading ? (
                    <p>Loading products...</p>
                ) : products.length === 0 ? (
                    <Card>
                        <p className="text-muted">No products yet. Create your first product!</p>
                    </Card>
                ) : (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="products">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef}>
                                    {products.map((product, index) => (
                                        <Draggable key={product.id} draggableId={product.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`draggable-wrapper ${snapshot.isDragging ? 'dragging' : ''}`}
                                                >
                                                    <Card className="product-card">
                                                        <div className="drag-handle" {...provided.dragHandleProps}>
                                                            <GripVertical size={20} />
                                                        </div>
                                                        <div className="product-image-preview">
                                                            {product.images && product.images[0] ? (
                                                                <img src={product.images[0]} alt={product.name} />
                                                            ) : (
                                                                <div className="product-image-placeholder">🛍️</div>
                                                            )}
                                                        </div>
                                                        <div className="product-info">
                                                            <h3>{product.name}</h3>
                                                            <p className="text-muted">{product.description}</p>
                                                            <div className="product-meta">
                                                                <span className="product-price">${product.price}</span>
                                                                <span className="product-stock">Stock: {product.stock}</span>
                                                            </div>
                                                        </div>
                                                        <div className="product-actions">
                                                            <Button size="sm" variant="ghost">
                                                                <Edit size={16} />
                                                            </Button>
                                                            <Button size="sm" variant="ghost" onClick={() => handleDelete(product.id)}>
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </div>
                                                    </Card>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}
            </div>
        </div>
    );
};

export default ProductManager;
