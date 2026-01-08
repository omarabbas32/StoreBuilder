import React from 'react';
import { Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import './SydneyAttributeGrid.css';

const SydneyAttributeGrid = ({ items }) => {
    const defaultItems = [
        { icon: <Truck size={32} />, title: 'Free delivery worldwide', subtitle: 'Click to learn more' },
        { icon: <RotateCcw size={32} />, title: 'Returns within 30 days', subtitle: 'Hassle-free process' },
        { icon: <ShieldCheck size={32} />, title: 'Secured payment', subtitle: 'Shop with confidence' }
    ];

    const displayItems = items || defaultItems;

    return (
        <div className="sydney-attribute-grid">
            <div className="container">
                <div className="attribute-grid-inner">
                    {displayItems.map((item, index) => (
                        <div key={index} className="attribute-item">
                            <div className="attribute-icon">{item.icon}</div>
                            <h3 className="attribute-title">{item.title}</h3>
                            <p className="attribute-subtitle">{item.subtitle}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SydneyAttributeGrid;
