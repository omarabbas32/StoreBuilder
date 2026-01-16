import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import { useStorePath } from '../../hooks/useStorePath';
import './StorefrontNavbar.css';

const StorefrontNavbar = ({ config, brandColor, storeName, onCartClick, logo: propLogo }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const itemCount = useCartStore(state => state.getItemCount());
    const storePath = useStorePath();

    useState(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const logo = propLogo || config?.logo;
    const displayName = config?.storeName || storeName;
    const showCart = config?.showCart !== false;
    const menuItems = Array.isArray(config?.menuItems)
        ? config.menuItems
        : (config?.menuItems ? JSON.parse(config.menuItems) : []);

    return (
        <nav className={`storefront-navbar ${scrolled ? 'scrolled' : ''}`} style={{ '--brand-color': brandColor }}>
            <div className="navbar-container">
                <Link to={`${storePath}/`} className="navbar-brand">
                    {logo ? (
                        <img src={logo} alt={displayName} className="navbar-logo" />
                    ) : (
                        <span className="navbar-name">{displayName}</span>
                    )}
                </Link>

                <button
                    className="mobile-menu-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <div className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
                    <Link to={`${storePath}/`} className="nav-link">Home</Link>
                    <Link to={`${storePath}/products`} className="nav-link">Products</Link>
                    <Link to={`${storePath}/categories`} className="nav-link">Categories</Link>
                    {menuItems.map((item, index) => (
                        <Link key={index} to={item.url || '#'} className="nav-link">
                            {item.label}
                        </Link>
                    ))}
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
        </nav>
    );
};

export default StorefrontNavbar;
