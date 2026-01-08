import { Search, ChevronRight } from 'lucide-react';
import './StorefrontSidebar.css';

const StorefrontSidebar = ({ config, brandColor, categories = [] }) => {
    const title = config?.title || 'Categories';
    const showCategories = config?.showCategories !== false;

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
                            <span className="category-link">All Products</span>
                            <ChevronRight size={16} />
                        </li>
                        {categories.map((category, index) => (
                            <li key={index} className="category-item">
                                <span className="category-link">{category}</span>
                                <ChevronRight size={16} />
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="sidebar-section filter-section">
                <h3 className="sidebar-title">Price Filter</h3>
                <div className="price-range">
                    <input type="range" min="0" max="1000" className="price-slider" style={{ accentColor: brandColor }} />
                    <div className="price-labels">
                        <span>$0</span>
                        <span>$1000</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default StorefrontSidebar;
