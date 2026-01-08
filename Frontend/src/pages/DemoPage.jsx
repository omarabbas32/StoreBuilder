import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import './DemoPage.css';

const DemoPage = () => {
    const navigate = useNavigate();
    const [activeDemo, setActiveDemo] = useState(null);

    const demos = [
        {
            id: 'multi-tenant',
            title: 'Multi-Tenant System',
            description: 'Each user has their own isolated store. Login with different accounts to see separate stores.',
            steps: [
                'Register as User A → Create "Shop A"',
                'Logout and register as User B → Create "Shop B"',
                'Login as User A → See only "Shop A"',
                'Login as User B → See only "Shop B"'
            ]
        },
        {
            id: 'customization',
            title: 'Store Customization',
            description: 'Customize your store with themes, colors, and components.',
            steps: [
                'Go to Dashboard → Customize',
                'Select Sydney theme',
                'Enable Hero, Highlight, Product Grid sections',
                'Upload images for each section',
                'Choose brand color',
                'Save and view your storefront'
            ]
        },
        {
            id: 'subdomain',
            title: 'Subdomain Access',
            description: 'Access stores via subdomains (e.g., mystore.localhost:5173)',
            steps: [
                'Create a store with slug "mystore"',
                'Access via localhost:5173/mystore OR',
                'Access via mystore.localhost:5173',
                'Both routes show the same storefront'
            ]
        },
        {
            id: 'products',
            title: 'Product Management',
            description: 'Add products with Cloudinary image uploads.',
            steps: [
                'Go to Dashboard → Products',
                'Click "Add Product"',
                'Upload product image (drag & drop)',
                'Fill in name, description, price, stock',
                'Drag to reorder products',
                'View on storefront'
            ]
        }
    ];

    return (
        <div className="demo-page">
            <div className="demo-header">
                <h1>🎨 Storely Platform Demo</h1>
                <p>Explore the features of your multi-tenant e-commerce platform</p>
                <div className="demo-actions">
                    <Button onClick={() => navigate('/register')}>Get Started</Button>
                    <Button variant="secondary" onClick={() => navigate('/login')}>Login</Button>
                </div>
            </div>

            <div className="demo-grid">
                {demos.map(demo => (
                    <Card
                        key={demo.id}
                        className={`demo-card ${activeDemo === demo.id ? 'active' : ''}`}
                        onClick={() => setActiveDemo(activeDemo === demo.id ? null : demo.id)}
                    >
                        <h3>{demo.title}</h3>
                        <p>{demo.description}</p>
                        {activeDemo === demo.id && (
                            <div className="demo-steps">
                                <h4>Steps:</h4>
                                <ol>
                                    {demo.steps.map((step, idx) => (
                                        <li key={idx}>{step}</li>
                                    ))}
                                </ol>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            <div className="demo-features">
                <h2>✨ Key Features</h2>
                <div className="features-grid">
                    <div className="feature">
                        <span className="feature-icon">🏪</span>
                        <h4>Multi-Tenant</h4>
                        <p>Each user gets their own isolated store</p>
                    </div>
                    <div className="feature">
                        <span className="feature-icon">🎨</span>
                        <h4>Customizable</h4>
                        <p>Themes, colors, layouts, components</p>
                    </div>
                    <div className="feature">
                        <span className="feature-icon">🌐</span>
                        <h4>Subdomain Support</h4>
                        <p>yourstore.domain.com</p>
                    </div>
                    <div className="feature">
                        <span className="feature-icon">📦</span>
                        <h4>Product Management</h4>
                        <p>Image uploads, drag-and-drop ordering</p>
                    </div>
                    <div className="feature">
                        <span className="feature-icon">🛒</span>
                        <h4>Shopping Cart</h4>
                        <p>Session-based cart system</p>
                    </div>
                    <div className="feature">
                        <span className="feature-icon">🔒</span>
                        <h4>Secure</h4>
                        <p>JWT authentication, data isolation</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemoPage;
