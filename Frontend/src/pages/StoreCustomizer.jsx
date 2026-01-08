import { useEffect, useState } from 'react';
import { Palette, Box, Check, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ImageUpload from '../components/ui/ImageUpload';
import storeService from '../services/storeService';
import useAuthStore from '../store/authStore';
import './StoreCustomizer.css';

const StoreCustomizer = () => {
    const { store, setStore } = useAuthStore();
    const [themes, setThemes] = useState([]);
    const [components, setComponents] = useState([]);
    const [selectedTheme, setSelectedTheme] = useState(null);
    const [selectedComponents, setSelectedComponents] = useState([]);
    const [componentContent, setComponentContent] = useState({});
    const [primaryColor, setPrimaryColor] = useState('#2563eb');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCustomizationOptions();
    }, []);

    useEffect(() => {
        if (store?.settings) {
            setSelectedTheme(store.settings.themeId || null);
            setSelectedComponents(store.settings.componentIds || []);
            setPrimaryColor(store.settings.primaryColor || '#2563eb');
            setComponentContent(store.settings.componentContent || {});
        }
    }, [store]);

    const loadCustomizationOptions = async () => {
        setLoading(true);

        const [themesResult, componentsResult] = await Promise.all([
            storeService.getThemes(),
            storeService.getComponents(),
        ]);

        if (themesResult.success) {
            setThemes(themesResult.data || []);
        }

        if (componentsResult.success) {
            setComponents(componentsResult.data || []);
        }

        setLoading(false);
    };

    const handleThemeSelect = (themeId) => {
        setSelectedTheme(themeId);
    };

    const handleComponentToggle = (componentId) => {
        setSelectedComponents((prev) =>
            prev.includes(componentId)
                ? prev.filter((id) => id !== componentId)
                : [...prev, componentId]
        );
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(selectedComponents);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setSelectedComponents(items);
    };

    const handleContentChange = (componentId, field, value) => {
        setComponentContent(prev => ({
            ...prev,
            [componentId]: {
                ...prev[componentId],
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        const settings = {
            themeId: selectedTheme,
            componentIds: selectedComponents,
            primaryColor: primaryColor,
            componentContent: componentContent
        };

        const result = await storeService.updateStore(store.id, {
            settings: settings
        });

        if (result.success) {
            setStore(result.data);
            alert('Store customization saved!');
        } else {
            alert('Failed to save customization: ' + result.error);
        }
    };

    if (loading) {
        return <div className="store-customizer"><p>Loading customization options...</p></div>;
    }

    return (
        <div className="store-customizer">
            <div className="customizer-header">
                <h1>Customize Your Store</h1>
                <p className="text-muted">Select a theme and components for your store</p>
            </div>

            {/* Themes Section */}
            <section className="customizer-section">
                <div className="section-header">
                    <Palette size={24} />
                    <h2>Choose a Theme</h2>
                </div>

                {themes.length === 0 ? (
                    <Card>
                        <p className="text-muted">No themes available yet. Contact admin to add themes.</p>
                    </Card>
                ) : (
                    <div className="themes-grid">
                        {themes.map((theme) => (
                            <Card
                                key={theme.id}
                                className={`theme-option ${selectedTheme === theme.id ? 'selected' : ''}`}
                                onClick={() => handleThemeSelect(theme.id)}
                            >
                                {theme.screenshot_url && (
                                    <img src={theme.screenshot_url} alt={theme.name} className="theme-preview" />
                                )}
                                <div className="theme-info">
                                    <h3>{theme.name}</h3>
                                    <p className="text-muted">{theme.description}</p>
                                </div>
                                {selectedTheme === theme.id && (
                                    <div className="selected-badge">
                                        <Check size={16} />
                                        Selected
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            {/* Navbar, Footer & Sidebar Section */}
            <section className="customizer-section">
                <div className="section-header">
                    <Box size={24} />
                    <h2>Store Navigation & Footer</h2>
                </div>
                <div className="fixed-components-grid">
                    {components.filter(c => ['navigation', 'footer', 'sidebar'].includes(c.type)).map(component => (
                        <Card key={component.id} className="fixed-component-card">
                            <div className="component-toggle-header">
                                <div className="component-info">
                                    <h3>{component.name}</h3>
                                    <p className="text-muted">{component.description}</p>
                                </div>
                                <div className="toggle-action">
                                    <Button
                                        variant={selectedComponents.includes(component.id) ? 'primary' : 'secondary'}
                                        onClick={() => handleComponentToggle(component.id)}
                                    >
                                        {selectedComponents.includes(component.id) ? 'Enabled' : 'Disabled'}
                                    </Button>
                                </div>
                            </div>

                            {selectedComponents.includes(component.id) && component.content_schema?.fields && (
                                <div className="component-fields-editor mt-4">
                                    <div className="fields-grid">
                                        {component.content_schema.fields.map(field => (
                                            <div key={field.name} className="field-item">
                                                <label>{field.label}</label>
                                                {field.type === 'textarea' ? (
                                                    <textarea
                                                        value={componentContent[component.id]?.[field.name] || ''}
                                                        onChange={(e) => handleContentChange(component.id, field.name, e.target.value)}
                                                        className="field-textarea"
                                                    />
                                                ) : field.type === 'image' ? (
                                                    <ImageUpload
                                                        value={componentContent[component.id]?.[field.name] || ''}
                                                        onChange={(url) => handleContentChange(component.id, field.name, url)}
                                                        label={field.label}
                                                    />
                                                ) : field.type === 'checkbox' ? (
                                                    <div className="checkbox-field">
                                                        <input
                                                            type="checkbox"
                                                            checked={componentContent[component.id]?.[field.name] === true}
                                                            onChange={(e) => handleContentChange(component.id, field.name, e.target.checked)}
                                                            id={`field-${component.id}-${field.name}`}
                                                        />
                                                        <label htmlFor={`field-${component.id}-${field.name}`}>Enabled</label>
                                                    </div>
                                                ) : (
                                                    <input
                                                        type={field.type || 'text'}
                                                        value={componentContent[component.id]?.[field.name] || ''}
                                                        onChange={(e) => handleContentChange(component.id, field.name, e.target.value)}
                                                        className="field-input"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            </section>

            {/* Components Section */}
            <section className="customizer-section">
                <div className="section-header">
                    <Box size={24} />
                    <h2>Add & Order Components</h2>
                </div>

                {components.length === 0 ? (
                    <Card>
                        <p className="text-muted">No components available yet. Contact admin to add components.</p>
                    </Card>
                ) : (
                    <div className="components-management">
                        <div className="available-components">
                            <h3>Available Sections</h3>
                            <div className="components-grid-toggle">
                                {components
                                    .filter(c => !['navigation', 'footer', 'sidebar'].includes(c.type))
                                    .map((component) => (
                                        <div
                                            key={component.id}
                                            className={`component-toggle-item ${selectedComponents.includes(component.id) ? 'active' : ''}`}
                                            onClick={() => handleComponentToggle(component.id)}
                                        >
                                            <div className="component-toggle-info">
                                                <span className="component-name">{component.name}</span>
                                            </div>
                                            {selectedComponents.includes(component.id) && <Check size={16} />}
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {selectedComponents.filter(id => {
                            const c = components.find(comp => comp.id === id);
                            return c && !['navigation', 'footer', 'sidebar'].includes(c.type);
                        }).length > 0 && (
                                <div className="active-components-reorder">
                                    <h3>Store Layout (Drag to Reorder)</h3>
                                    <DragDropContext onDragEnd={handleDragEnd}>
                                        <Droppable droppableId="components">
                                            {(provided) => (
                                                <div
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                    className="components-list-dnd"
                                                >
                                                    {selectedComponents
                                                        .filter(id => {
                                                            const c = components.find(comp => comp.id === id);
                                                            return c && !['navigation', 'footer', 'sidebar'].includes(c.type);
                                                        })
                                                        .map((componentId, index) => {
                                                            const component = components.find(c => c.id === componentId);
                                                            if (!component) return null;

                                                            return (
                                                                <Draggable key={component.id} draggableId={component.id.toString()} index={index}>
                                                                    {(provided, snapshot) => (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            className={`component-config-card-dnd ${snapshot.isDragging ? 'dragging' : ''}`}
                                                                        >
                                                                            <div className="component-card-header">
                                                                                <div {...provided.dragHandleProps} className="drag-handle">
                                                                                    <GripVertical size={20} />
                                                                                </div>
                                                                                <div className="component-info">
                                                                                    <h3>{component.name}</h3>
                                                                                    <span className="component-type">{component.type}</span>
                                                                                </div>
                                                                                <button
                                                                                    className="remove-component-btn"
                                                                                    onClick={() => handleComponentToggle(component.id)}
                                                                                >
                                                                                    Remove
                                                                                </button>
                                                                            </div>

                                                                            {component.content_schema?.fields && (
                                                                                <div className="component-fields-editor">
                                                                                    <div className="fields-grid">
                                                                                        {component.content_schema.fields.map(field => (
                                                                                            <div key={field.name} className="field-item">
                                                                                                <label>{field.label}</label>
                                                                                                {field.type === 'textarea' ? (
                                                                                                    <textarea
                                                                                                        value={componentContent[component.id]?.[field.name] || ''}
                                                                                                        onChange={(e) => handleContentChange(component.id, field.name, e.target.value)}
                                                                                                        className="field-textarea"
                                                                                                    />
                                                                                                ) : field.type === 'image' ? (
                                                                                                    <ImageUpload
                                                                                                        value={componentContent[component.id]?.[field.name] || ''}
                                                                                                        onChange={(url) => handleContentChange(component.id, field.name, url)}
                                                                                                        label={field.label}
                                                                                                    />
                                                                                                ) : (
                                                                                                    <input
                                                                                                        type={field.type || 'text'}
                                                                                                        value={componentContent[component.id]?.[field.name] || ''}
                                                                                                        onChange={(e) => handleContentChange(component.id, field.name, e.target.value)}
                                                                                                        className="field-input"
                                                                                                    />
                                                                                                )}
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            );
                                                        })}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                </div>
                            )}
                    </div>
                )}
            </section>

            {/* Color Section */}
            <section className="customizer-section">
                <div className="section-header">
                    <Palette size={24} />
                    <h2>Brand Color</h2>
                </div>
                <Card className="color-picker-card">
                    <p className="text-muted">Choose your store's primary brand color</p>
                    <div className="color-options">
                        {['#B59F66', '#2563eb', '#7c3aed', '#db2777', '#dc2626', '#ea580c', '#16a34a', '#0891b2', '#111827'].map(color => (
                            <div
                                key={color}
                                className={`color-circle ${primaryColor === color ? 'selected' : ''}`}
                                style={{ backgroundColor: color }}
                                onClick={() => setPrimaryColor(color)}
                            >
                                {primaryColor === color && <Check size={16} color="white" />}
                            </div>
                        ))}
                        <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="custom-color-input"
                        />
                    </div>
                </Card>
            </section>

            {/* Save Button */}
            <div className="customizer-actions">
                <Button onClick={handleSave} size="lg">
                    Save Customization
                </Button>
            </div>
        </div>
    );
};

export default StoreCustomizer;
