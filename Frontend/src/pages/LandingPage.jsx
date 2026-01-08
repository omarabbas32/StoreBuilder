import React from 'react';
import { Link } from 'react-router-dom';
import { Store, ShoppingBag, Palette, Zap } from 'lucide-react';
import Button from '../components/ui/Button';
import './LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-page">
            {/* Navigation Bar */}
            <nav className="landing-nav">
                <div className="container">
                    <div className="nav-content">
                        <div className="nav-brand">
                            <Store size={32} />
                            <span>Storely</span>
                        </div>
                        <div className="nav-links">
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register">
                                <Button>Get Started</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <h1>Build Your Dream Online Store</h1>
                        <p className="hero-subtitle">
                            Create, customize, and manage your e-commerce store with ease.
                            No coding required.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/register">
                                <Button size="lg">Start Free Trial</Button>
                            </Link>
                            <Link to="/login">
                                <Button size="lg" variant="secondary">Sign In</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="container">
                    <h2 className="section-title">Why Choose Storely?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <ShoppingBag size={40} />
                            </div>
                            <h3>Easy Product Management</h3>
                            <p>Add, edit, and organize your products with our intuitive dashboard.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <Palette size={40} />
                            </div>
                            <h3>Customizable Themes</h3>
                            <p>Choose from beautiful pre-made themes or create your own unique design.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <Zap size={40} />
                            </div>
                            <h3>Lightning Fast</h3>
                            <p>Built with modern technology for blazing-fast performance.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <Store size={40} />
                            </div>
                            <h3>Multi-Store Support</h3>
                            <p>Manage multiple stores from a single dashboard.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="about">
                <div className="container">
                    <div className="about-content">
                        <h2>About Storely</h2>
                        <p>
                            Storely is a modern e-commerce platform designed to empower entrepreneurs
                            and small businesses. We believe that everyone should have access to
                            professional-grade tools to build and grow their online presence.
                        </p>
                        <p>
                            Our platform combines powerful features with an intuitive interface,
                            making it easy for anyone to create a beautiful online store. Whether
                            you're selling physical products, digital goods, or services, Storely
                            has everything you need to succeed.
                        </p>
                        <div className="about-stats">
                            <div className="stat">
                                <h3>1000+</h3>
                                <p>Active Stores</p>
                            </div>
                            <div className="stat">
                                <h3>50K+</h3>
                                <p>Products Listed</p>
                            </div>
                            <div className="stat">
                                <h3>99.9%</h3>
                                <p>Uptime</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="container">
                    <h2>Ready to Start Selling?</h2>
                    <p>Join thousands of successful store owners on Storely</p>
                    <Link to="/register">
                        <Button size="lg">Create Your Store Now</Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="container">
                    <p>&copy; 2026 Storely. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
