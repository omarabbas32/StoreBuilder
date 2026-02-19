import { ShoppingCart, Menu, X, Search, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import authService from '../../services/authService';
import { useStorePath } from '../../hooks/useStorePath';
import { formatImageUrl } from '../../utils/imageUtils';
import EditableText from './EditableText';
import './StorefrontNavbar.css';

const StorefrontNavbar = ({ config, brandColor, storeName, onCartClick, logo: propLogo, onSearch, searchQuery, componentId }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const itemCount = useCartStore(state => state.addItem ? state.getItemCount() : 0);
    const storePath = useStorePath();
    const { isAuthenticated, logout: logoutUserState } = useAuthStore();

    const handleLogout = async () => {
        await authService.logout();
        logoutUserState();
        window.location.href = `${storePath}/login`;
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const FALLBACK_LOGO = 'https://placehold.co/150x50/3b82f6/ffffff/STORELY';
    const logo = propLogo || config?.logo;
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
                        <EditableText
                            componentId={componentId}
                            field="storeName"
                            value={displayName}
                            tag="span"
                            className="navbar-name"
                            placeholder="Store Name"
                        />
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

                    <div className="navbar-auth">
                        {isAuthenticated ? (
                            <div className="nav-dropdown-wrapper">
                                <button className="account-button" title="My Account">
                                    <User size={24} />
                                </button>
                                <div className="nav-dropdown auth-dropdown">
                                    <Link to={`${storePath}/profile`} className="dropdown-item">My Profile</Link>
                                    <Link to={`${storePath}/orders`} className="dropdown-item">My Orders</Link>
                                    <button
                                        onClick={handleLogout}
                                        className="dropdown-item logout-link"
                                        style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer' }}
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link to={`${storePath}/login`} className="account-button" title="Login">
                                <User size={24} />
                            </Link>
                        )}
                    </div>
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
