import React, { useState, useEffect } from 'react';
import { X, Search, Check, Layout } from 'lucide-react';
import themeService from '../../services/themeService';
import Button from './Button';
import './TemplatePicker.css';

const TemplatePicker = ({ onSelect, onClose, currentConfig }) => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchTemplates = async () => {
            setLoading(true);
            try {
                const result = await themeService.getAll();
                if (result.success) {
                    setTemplates(result.data);
                }
            } catch (error) {
                console.error('Error fetching templates:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTemplates();
    }, []);

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="modal-overlay">
            <div className="template-picker-modal">
                <div className="modal-header">
                    <div className="header-title">
                        <Layout size={20} />
                        <h3>Choose a Template</h3>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="search-bar-container">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="templates-grid-container">
                    {loading ? (
                        <div className="loading-state">Loading templates...</div>
                    ) : (
                        <div className="templates-grid">
                            {filteredTemplates.map(template => (
                                <div key={template.id} className="template-card">
                                    <div className="template-preview">
                                        {template.screenshot_url ? (
                                            <img src={template.screenshot_url} alt={template.name} />
                                        ) : (
                                            <div className="placeholder-preview">
                                                <Layout size={40} />
                                                <span>No Preview</span>
                                            </div>
                                        )}
                                        <div className="template-overlay">
                                            <Button
                                                size="sm"
                                                onClick={() => onSelect(template)}
                                            >
                                                Apply Design
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="template-info">
                                        <h4>{template.name}</h4>
                                        <p>{template.description || 'Custom template design'}</p>
                                    </div>
                                </div>
                            ))}
                            {filteredTemplates.length === 0 && !loading && (
                                <div className="empty-state">No templates found matching your search.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TemplatePicker;
