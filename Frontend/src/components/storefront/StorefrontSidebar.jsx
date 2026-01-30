import { Search, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStorePath } from '../../hooks/useStorePath';
import './StorefrontSidebar.css';

const StorefrontSidebar = ({ config, brandColor, categories = [] }) => {
    const title = config?.title || 'Categories';
    const showCategories = config?.showCategories !== false;
    const storePath = useStorePath();

    return (
        <aside className="storefront-sidebar">
            <div className="sidebar-section search-section">
                <div className="search-box">
                    <Search size={18} />
                    <input type="text" placeholder="Search products..." />
                </div>
            </div>

            {showCategories && (
                <div className="sidebar-section categories-section">
                    <h3 className="sidebar-title">{title}</h3>
                    <ul className="category-list">
                        <li className="category-item active">
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
