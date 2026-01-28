import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import './Breadcrumbs.css';

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Map specific paths to human-readable names
    const pathMap = {
        'dashboard': 'Dashboard',
        'products': 'Products',
        'categories': 'Categories',
        'customize': 'Customize',
        'templates': 'Templates',
        'orders': 'Orders'
    };

    return (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol>
                <li>
                    <Link to="/dashboard" className="breadcrumb-item">
                        <Home size={14} />
                    </Link>
                </li>
                {pathnames.map((value, index) => {
                    // Skip 'dashboard' if it's the first element since we have the Home icon
                    if (value === 'dashboard' && index === 0) return null;

                    const last = index === pathnames.length - 1;
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const label = pathMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

                    return (
                        <li key={to}>
                            <ChevronRight size={14} className="breadcrumb-separator" />
                            {last ? (
                                <span className="breadcrumb-item active">{label}</span>
                            ) : (
                                <Link to={to} className="breadcrumb-item">
                                    {label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
