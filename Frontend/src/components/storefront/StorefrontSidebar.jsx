import { Search, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStorePath } from '../../hooks/useStorePath';
import EditableText from './EditableText';
import './StorefrontSidebar.css';

const StorefrontSidebar = ({ config, brandColor, categories = [], onSearch, searchQuery, componentId }) => {
    const title = config?.title || 'Categories';
    const showCategories = config?.showCategories !== false;
    const storePath = useStorePath();

    return (
        <aside className="storefront-sidebar">
            <div className="sidebar-section search-section">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => onSearch?.(e.target.value)}
                    />
                </div>
            </div>

            {showCategories && (
                <div className="sidebar-section categories-section">
                    <EditableText
                        componentId={componentId}
                        field="title"
                        value={title}
                        tag="h3"
                        className="sidebar-title"
                        placeholder="Categories Title"
                    />
                    <ul className="category-list">
                        <li className={`category-item ${!window.location.pathname.includes('/category/') ? 'active' : ''}`}>
                            <Link to={`${storePath}/products`} className="category-link">All Products</Link>
                        </li>
                        {categories.map((category, index) => (
                            <li key={category._id || category.id || index} className="category-item">
                                <Link to={`${storePath}/category/${category._id || category.id}`} className="category-link">
                                    {category.name || category}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

        </aside>
    );
};

export default StorefrontSidebar;
