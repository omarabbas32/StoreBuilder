import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Settings, ArrowRight } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import './StoreCreationMode.css';

const StoreCreationMode = () => {
    const navigate = useNavigate();

    return (
        <div className="store-creation-mode">
            <div className="mode-container">
                <div className="mode-header">
                    <h1>Choose Your Path</h1>
                    <p className="subtitle">Select how you'd like to build your new store</p>
                </div>

                <div className="mode-grid">
                    {/* AI Option */}
                    <Card className="mode-card ai-card" onClick={() => navigate('/onboarding/ai')}>
                        <div className="card-icon">
                            <Sparkles size={40} className="icon-sparkle" />
                        </div>
                        <div className="card-content">
                            <h2>AI Assistant</h2>
                            <p>Perfect for beginners. Just chat with our AI and we'll handle the setup, configuration and initial design for you.</p>
                            <ul className="feature-list">
                                <li>✨ Conversational setup</li>
                                <li>✨ Automatic theme selection</li>
                                <li>✨ Generated initial content</li>
                            </ul>
                        </div>
                        <div className="card-footer">
                            <span className="cta-text">Start with AI</span>
                            <ArrowRight size={20} />
                        </div>
                    </Card>

                    {/* Manual Option */}
                    <Card className="mode-card manual-card" onClick={() => navigate('/create-store/manual')}>
                        <div className="card-icon">
                            <Settings size={40} className="icon-settings" />
                        </div>
                        <div className="card-content">
                            <h2>Manual Setup</h2>
                            <p>For those who want full control from the start. A quick step-by-step guide to get your store up and running.</p>
                            <ul className="feature-list">
                                <li>⚙️ Detailed configuration</li>
                                <li>⚙️ Greater customization</li>
                                <li>⚙️ Fast & predictable</li>
                            </ul>
                        </div>
                        <div className="card-footer">
                            <span className="cta-text">Continue Manually</span>
                            <ArrowRight size={20} />
                        </div>
                    </Card>
                </div>

                <div className="mode-back">
                    <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default StoreCreationMode;
