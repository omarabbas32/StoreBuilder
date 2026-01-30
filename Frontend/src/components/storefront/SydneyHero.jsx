import { formatImageUrl } from '../../utils/imageUtils';
import './SydneyHero.css';

const SydneyHero = ({
    title,
    subtitle,
    image,
    ctaText,
    brandColor,
    useGradient = false,
    gradientStart = '#2563eb',
    gradientEnd = '#7c3aed',
    gradientType = 'linear',
    gradientAngle = '135deg'
}) => {
    const getBackgroundStyle = () => {
        const overlay = 'rgba(0,0,0,0.3)';
        const defaultImage = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200';

        if (useGradient) {
            const gradient = gradientType === 'linear'
                ? `linear-gradient(${gradientAngle}, ${gradientStart}, ${gradientEnd})`
                : `radial-gradient(circle, ${gradientStart}, ${gradientEnd})`;
            return { backgroundImage: gradient };
        }

        return {
            backgroundImage: `linear-gradient(${overlay}, ${overlay}), url(${formatImageUrl(image) || defaultImage})`
        };
    };

    return (
        <div className="sydney-hero" style={getBackgroundStyle()}>
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
