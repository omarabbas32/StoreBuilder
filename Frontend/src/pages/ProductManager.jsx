import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, GripVertical, Save, ChevronLeft, ChevronRight } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import ImageUpload from "../components/ui/ImageUpload";
import MultiImageUpload from "../components/ui/MultiImageUpload";
import productService from "../services/productService";
import categoryService from "../services/categoryService";
import useAuthStore from "../store/authStore";
import { useToast } from "../components/ui/Toast";
import "../styles/empty-states.css";
import "./ProductManager.css";

const ProductManager = () => {
  const { store } = useAuthStore();
  const { success, error: showError } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageCarousel, setImageCarousel] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    images: [],
    categoryId: "",
  });

  useEffect(() => {
    if (store?.id) {
      loadData();
    }
  }, [store?.id]);

  const loadData = async () => {
    setLoading(true);
    const [productsResult, categoriesResult] = await Promise.all([
      productService.getProducts(store.id),
      categoryService.getAll(store.id)
    ]);

    if (productsResult.success) {
      setProducts(productsResult.data || []);
    }
    if (categoriesResult.success) {
      setCategories(categoriesResult.data || []);
    }
    setLoading(false);
  };

  const loadProducts = async () => {
    const result = await productService.getProducts(store.id);
    if (result.success) {
      setProducts(result.data || []);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data for submission
    const submissionData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock, 10) || 0,
      storeId: store?.id,
    };

    console.log("Submitting product data:", submissionData);

    const result = await productService.createProduct(submissionData);
    if (result.success) {
      setShowForm(false);
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        images: [],
        categoryId: "",
      });
      success("Product created successfully!");
      loadProducts();
    } else {
      showError(result.error || "Failed to create product");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await productService.deleteProduct(id);
      loadProducts();
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      stock: product.stock?.toString() || "",
      images: product.images || [],
      categoryId: product.category_id || "",
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    const submissionData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock, 10) || 0,
      storeId: store?.id,
    };

    const result = await productService.updateProduct(editingProduct.id, submissionData);
    if (result.success) {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        images: [],
        categoryId: "",
      });
      success("Product updated successfully!");
      loadProducts();
    } else {
      showError(result.error || "Failed to update product");
    }
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      images: [],
      categoryId: "",
    });
  };

  const nextImage = (productId, totalImages) => {
    const currentIndex = imageCarousel[productId] || 0;
    const nextIndex = (currentIndex + 1) % totalImages;
    setImageCarousel({ ...imageCarousel, [productId]: nextIndex });
  };

  const prevImage = (productId, totalImages) => {
    const currentIndex = imageCarousel[productId] || 0;
    const prevIndex = currentIndex === 0 ? totalImages - 1 : currentIndex - 1;
    setImageCarousel({ ...imageCarousel, [productId]: prevIndex });
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
    const productIds = products.map((p) => p.id);
    const result = await productService.reorderProducts(productIds);
    if (result.success) {
      setIsReordering(false);
      success("Product order saved successfully!");
    } else {
      showError("Failed to save product order");
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
          <p className="text-muted">
            Manage your product catalog for {store.name}
          </p>
        </div>
        <div className="header-actions">
          {isReordering && (
            <Button
              variant="success"
              onClick={saveOrder}
              className="save-order-btn"
            >
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
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              fullWidth
            />
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              fullWidth
            />
            <div className="form-row">
              <Input
                label="Price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
              />
              <Input
                label="Stock"
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: "var(--space-4)" }}>
              <label className="input-label" style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-color)' }}>Category</label>
              <select
                className="category-select"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'white',
                  fontSize: '1rem'
                }}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div
              className="form-group"
              style={{ marginBottom: "var(--space-4)" }}
            >
              <MultiImageUpload
                label="Product Images"
                value={formData.images}
                onChange={(urls) => setFormData({ ...formData, images: urls })}
                maxImages={5}
              />
            </div>
            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowForm(false)}
              >
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
          <Card className="empty-state-card">
            <div className="empty-state-icon">📦</div>
            <h3>Your Product Catalog is Empty</h3>
            <p className="text-muted">
              Start building your inventory by adding your first product.
            </p>
            <Button onClick={() => setShowForm(true)} size="lg">
              <Plus size={20} />
              Add Your First Product
            </Button>
          </Card>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="products">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {products.map((product, index) => (
                    <Draggable
                      key={product.id}
                      draggableId={product.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`draggable-wrapper ${snapshot.isDragging ? "dragging" : ""
                            }`}
                        >
                          <Card className="product-card">
                            <div
                              className="drag-handle"
                              {...provided.dragHandleProps}
                            >
                              <GripVertical size={20} />
                            </div>
                            <div className="product-image-preview">
                              {product.images && product.images.length > 0 ? (
                                <>
                                  <img
                                    src={product.images[imageCarousel[product.id] || 0]}
                                    alt={product.name}
                                    loading="lazy"
                                  />
                                  {product.images.length > 1 && (
                                    <>
                                      <button
                                        className="carousel-btn carousel-prev"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          prevImage(product.id, product.images.length);
                                        }}
                                        type="button"
                                      >
                                        <ChevronLeft size={18} />
                                      </button>
                                      <button
                                        className="carousel-btn carousel-next"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          nextImage(product.id, product.images.length);
                                        }}
                                        type="button"
                                      >
                                        <ChevronRight size={18} />
                                      </button>
                                      <div className="carousel-counter">
                                        {(imageCarousel[product.id] || 0) + 1} / {product.images.length}
                                      </div>
                                    </>
                                  )}
                                </>
                              ) : (
                                <div className="product-image-placeholder">
                                  <span>📷</span>
                                  <span>No Image</span>
                                </div>
                              )}
                            </div>
                            <div className="product-info">
                              <h3>{product.name}</h3>
                              <p className="text-muted">
                                {product.description}
                              </p>
                              <div className="product-meta">
                                <span className="product-price">
                                  ${product.price}
                                </span>
                                <span className="product-stock">
                                  Stock: {product.stock}
                                </span>
                                {product.category_id && (
                                  <span className="product-category-tag">
                                    {categories.find(c => c.id === product.category_id)?.name || 'Category'}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="product-actions">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleEditClick(product)}
                                title="Edit product"
                              >
                                <Edit size={16} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(product.id)}
                                title="Delete product"
                              >
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

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <Card className="edit-modal">
            <div className="modal-header">
              <h2>Edit Product</h2>
              <button 
                className="modal-close"
                onClick={closeEditModal}
                type="button"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="modal-form">
              <Input
                label="Product Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                fullWidth
              />
              <Input
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                fullWidth
              />
              <div className="form-row">
                <Input
                  label="Price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
                <Input
                  label="Stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: "var(--space-4)" }}>
                <label className="input-label" style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-color)' }}>Category</label>
                <select
                  className="category-select"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'white',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: "var(--space-4)" }}>
                <MultiImageUpload
                  label="Product Images"
                  value={formData.images}
                  onChange={(urls) => setFormData({ ...formData, images: urls })}
                  maxImages={5}
                />
              </div>
              <div className="form-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeEditModal}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Product</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
