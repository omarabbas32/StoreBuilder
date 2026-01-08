import { Facebook, Instagram, Twitter, Mail, Phone } from 'lucide-react';
import './StorefrontFooter.css';

const StorefrontFooter = ({ config, brandColor, storeName }) => {
    const copyrightText = config?.copyrightText || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`;
    const aboutText = config?.aboutText;
    const facebookUrl = config?.facebookUrl;
    const instagramUrl = config?.instagramUrl;
    const twitterUrl = config?.twitterUrl;
    const email = config?.email;
    const phone = config?.phone;

    return (
        <footer className="storefront-footer" style={{ '--brand-color': brandColor }}>
            <div className="footer-container">
                <div className="footer-content">
                    {aboutText && (
                        <div className="footer-section">
                            <h3>About Us</h3>
                            <p>{aboutText}</p>
                        </div>
                    )}

                    {(email || phone) && (
                        <div className="footer-section">
                            <h3>Contact</h3>
                            {email && (
                                <div className="footer-contact-item">
                                    <Mail size={16} />
                                    <a href={`mailto:${email}`}>{email}</a>
                                </div>
                            )}
                            {phone && (
                                <div className="footer-contact-item">
                                    <Phone size={16} />
                                    <a href={`tel:${phone}`}>{phone}</a>
                                </div>
                            )}
                        </div>
                    )}

                    {(facebookUrl || instagramUrl || twitterUrl) && (
                        <div className="footer-section">
                            <h3>Follow Us</h3>
                            <div className="footer-social">
                                {facebookUrl && (
                                    <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="social-link">
                                        <Facebook size={20} />
                                    </a>
                                )}
                                {instagramUrl && (
                                    <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="social-link">
                                        <Instagram size={20} />
                                    </a>
                                )}
                                {twitterUrl && (
                                    <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="social-link">
                                        <Twitter size={20} />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="footer-bottom">
                    <p>{copyrightText}</p>
                    <p className="powered-by">Powered by Storely</p>
                </div>
            </div>
        </footer>
    );
};

export default StorefrontFooter;
