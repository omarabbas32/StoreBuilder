import React from 'react';
import './StorefrontHero.css';

const StorefrontHero = ({
    title,
    subtitle,
    brandColor,
    storeName,
    description,
    image,
    ctaText,
    ctaLink,
    layout = 'centered',
    useGradient = false,
    gradientStart = '#2563eb',
    gradientEnd = '#7c3aed',
    gradientType = 'linear',
    gradientAngle = '135deg'
}) => {
    const getBackgroundStyle = () => {
        if (useGradient) {
            const gradient = gradientType === 'linear'
                ? `linear-gradient(${gradientAngle}, ${gradientStart}, ${gradientEnd})`
                : `radial-gradient(circle, ${gradientStart}, ${gradientEnd})`;
            return { backgroundImage: gradient };
        }

        if (image) {
            return {
                backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            };
        }

        return {
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        };
    };

    return (
        <section
            className={`storefront-hero ${image || useGradient ? 'has-bg' : ''} layout-${layout}`}
            style={{
                '--hero-brand-color': brandColor,
                ...getBackgroundStyle()
            }}
        >
            <div className="hero-background">
                {!image && (
                    <>
                        <div className="glass-blob blob-1"></div>
                        <div className="glass-blob blob-2"></div>
                        <div className="glass-blob blob-3"></div>
                    </>
                )}
            </div>

            <div className="storefront-hero-content container">
                <div className="hero-text-content">
                    <h1 className="hero-title">
                        {title || `Premium Collection by ${storeName} `}
                    </h1>
                    <p className="hero-subtitle">
                        {subtitle || description || 'Discover our curated selection of high-quality products designed for your lifestyle.'}
                    </p>
                    <div className="hero-actions">
                        <button
                            className="hero-cta"
                            style={{ backgroundColor: brandColor }}
                            onClick={() => ctaLink && (window.location.href = ctaLink)}
                        >
                            {ctaText || 'Shop Collection'}
                            <span className="btn-shine"></span>
                        </button>
                        <button className="hero-secondary-cta">
                            Explore Categories
                        </button>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="visual-card">
                        <div className="card-glass-effect"></div>
                        {image ? (
                            <img src={image} alt="Hero Visual" className="hero-visual-img" />
                        ) : (
                            <div className="visual-icon">✨</div>
                        )}
                        <div className="visual-badge">New Arrival</div>
                    </div>
                </div>
            </div>

            <div className="hero-scroll-indicator">
                <div className="mouse">
                    <div className="wheel"></div>
                </div>
                <span>Scroll to explore</span>
            </div>
        </section>
    );
};

export default StorefrontHero;
