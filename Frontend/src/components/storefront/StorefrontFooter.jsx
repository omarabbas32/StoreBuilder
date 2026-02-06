import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone } from 'lucide-react';
import './StorefrontFooter.css';

const StorefrontFooter = ({ config, brandColor, storeName, socialLinks = {} }) => {
    const copyrightText = config?.copyrightText || config?.copyright || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`;
    const aboutText = config?.aboutText;
    const aboutLinksRaw = config?.aboutLinks;
    const facebookUrl = config?.facebookUrl || socialLinks.facebook;
    const instagramUrl = config?.instagramUrl || socialLinks.instagram;
    const twitterUrl = config?.twitterUrl || socialLinks.twitter;
    const linkedinUrl = config?.linkedinUrl || socialLinks.linkedin;
    const tiktokUrl = config?.tiktokUrl || socialLinks.tiktok;
    const email = config?.email;
    const phone = config?.phone;
    const showSocial = config?.showSocial !== false;
    const socialColor = config?.socialColor || brandColor;
    const footerBg = config?.backgroundColor;

    const parseLinks = (value) => {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch (error) {
                return [];
            }
        }
        return [];
    };

    const aboutLinks = parseLinks(aboutLinksRaw);
    const safeAboutLinks = aboutLinks.filter((link) => link?.label && link?.url);
    const hasAboutSection = Boolean(aboutText) || safeAboutLinks.length > 0;
    const hasSocialLinks = showSocial && (facebookUrl || instagramUrl || twitterUrl || linkedinUrl || tiktokUrl);

    return (
        <footer
            className="storefront-footer"
            style={{
                '--brand-color': brandColor,
                '--footer-bg': footerBg,
                '--footer-social-color': socialColor,
            }}
        >
            <div className="footer-container">
                <div className="footer-content">
                    {hasAboutSection && (
                        <div className="footer-section">
                            <h3>About Us</h3>
                            {aboutText && <p>{aboutText}</p>}
                            {safeAboutLinks.length > 0 && (
                                <ul className="footer-links">
                                    {safeAboutLinks.map((link, index) => {
                                        const isExternal = /^https?:\/\//i.test(link.url);
                                        return (
                                            <li key={`${link.label}-${index}`}>
                                                <a
                                                    className="footer-link"
                                                    href={link.url}
                                                    {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                                >
                                                    {link.label}
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
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

                    {hasSocialLinks && (
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
                                {linkedinUrl && (
                                    <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="social-link">
                                        <Linkedin size={20} />
                                    </a>
                                )}
                                {tiktokUrl && (
                                    <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="social-link">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
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
