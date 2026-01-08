import React from 'react';
import './SydneyHero.css';

const SydneyHero = ({ title, subtitle, image, ctaText, brandColor }) => {
    return (
        <div
            className="sydney-hero"
            style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${image || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200'})`
            }}
        >
            <div className="sydney-hero-content">
                <h1 className="sydney-hero-title">{title || 'Essentials for a cold winter'}</h1>
                <p className="sydney-hero-subtitle">{subtitle || 'Discover Autumn Winter 2026'}</p>
                {ctaText && (
                    <button
                        className="sydney-hero-cta"
                        style={{ backgroundColor: brandColor }}
                    >
                        {ctaText}
                    </button>
                )}
            </div>
        </div>
    );
};

export default SydneyHero;
