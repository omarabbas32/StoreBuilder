import React from 'react';
import './SydneyHighlight.css';

const SydneyHighlight = ({ title, description, image, miniImage, brandColor }) => {
    return (
        <div className="sydney-highlight">
            <div className="sydney-highlight-image-wrapper">
                <img
                    src={image || 'https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?auto=format&fit=crop&q=80&w=800'}
                    alt={title}
                    className="sydney-highlight-main-img"
                />
            </div>
            <div className="sydney-highlight-content">
                <h2 className="sydney-highlight-title">{title || 'Luxury Knitwear'}</h2>
                <p className="sydney-highlight-description">
                    {description || 'This soft lambswool jumper is knitted in Scotland, using yarn from one of the world oldest spinners based in Fife.'}
                </p>
                <div className="sydney-highlight-footer">
                    <button className="sydney-highlight-link" style={{ color: brandColor, borderBottomColor: brandColor }}>
                        Shop Now
                    </button>
                    <div className="sydney-highlight-mini-wrapper">
                        <img
                            src={miniImage || 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=200'}
                            alt="Preview"
                            className="sydney-highlight-mini-img"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SydneyHighlight;
