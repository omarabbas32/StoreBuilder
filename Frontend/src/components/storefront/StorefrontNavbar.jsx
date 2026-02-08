import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import { useStorePath } from '../../hooks/useStorePath';
import { formatImageUrl } from '../../utils/imageUtils';
import './StorefrontNavbar.css';

const StorefrontNavbar = ({ config, brandColor, storeName, onCartClick, logo: propLogo, onSearch, searchQuery }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const itemCount = useCartStore(state => state.addItem ? state.getItemCount() : 0);
    const storePath = useStorePath();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const FALLBACK_LOGO = 'https://placehold.co/150x50/3b82f6/ffffff/STORELY';
    const logo = propLogo || config?.logo || FALLBACK_LOGO;
    const displayName = config?.storeName || storeName;
    const showCart = config?.showCart !== false;
    const menuItems = Array.isArray(config?.menuItems)
        ? config.menuItems
        : (config?.menuItems ? (typeof config.menuItems === 'string' ? JSON.parse(config.menuItems) : config.menuItems) : []);

    return (
        <nav className={`storefront-navbar ${scrolled ? 'scrolled' : ''} ${searchOpen ? 'search-active' : ''}`} style={{ '--brand-color': brandColor }}>
            <div className="navbar-container">
                <Link to={`${storePath}/`} className="navbar-brand">
                    {logo ? (
                        <img src={formatImageUrl(logo)} alt={displayName} className="navbar-logo" />
                    ) : (
                        <span className="navbar-name">{displayName}</span>
                    )}
                </Link>

                <div className="navbar-actions-desktop">
                    <div className={`search-wrapper ${searchOpen ? 'open' : ''}`}>
                        <button
                            className="search-toggle"
                            onClick={() => setSearchOpen(!searchOpen)}
                            title="Search Products"
                        >
                            <Search size={22} />
                        </button>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => onSearch(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
                        <Link to={`${storePath}/`} className="nav-link">Home</Link>
                        <Link to={`${storePath}/products`} className="nav-link">Products</Link>

                        <div className="nav-dropdown-wrapper">
                            <span className="nav-link dropdown-trigger">
                                Categories
                                <svg size={14} className="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </span>
                            <div className="nav-dropdown">
                                <Link to={`${storePath}/categories`} className="dropdown-item">All Categories</Link>
                                {menuItems.map((item, index) => (
                                    <Link key={index} to={item.url || '#'} className="dropdown-item">
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <Link to={`${storePath}/cart`} className="nav-link mobile-only">Cart</Link>
                    </div>

                    {showCart && (
                        <div className="navbar-cart">
                            <button className="cart-button" onClick={onCartClick}>
                                <ShoppingCart size={24} />
                                {itemCount > 0 && (
                                    <span className="cart-badge">{itemCount}</span>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* Mobile Search Bar */}
            <div className={`mobile-search-bar ${searchOpen ? 'visible' : ''}`}>
                <div className="container">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => onSearch(e.target.value)}
                    />
                    <button onClick={() => setSearchOpen(false)} className="close-search">
                        <X size={18} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default StorefrontNavbar;
