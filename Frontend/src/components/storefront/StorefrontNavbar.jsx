import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import './StorefrontNavbar.css';

const StorefrontNavbar = ({ config, brandColor, storeName, onCartClick }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const itemCount = useCartStore(state => state.getItemCount());

    const logo = config?.logo;
    const displayName = config?.storeName || storeName;
    const showCart = config?.showCart !== false;
    const menuItems = config?.menuItems ? JSON.parse(config.menuItems) : [];

    return (
        <nav className="storefront-navbar" style={{ '--brand-color': brandColor }}>
            <div className="navbar-container">
                <div className="navbar-brand">
                    {logo ? (
                        <img src={logo} alt={displayName} className="navbar-logo" />
                    ) : (
                        <span className="navbar-name">{displayName}</span>
                    )}
                </div>

                <button
                    className="mobile-menu-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <div className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
                    <Link to="/" className="nav-link">Home</Link>
                    {menuItems.map((item, index) => (
                        <Link key={index} to={item.url || '#'} className="nav-link">
                            {item.label}
                        </Link>
                    ))}
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
