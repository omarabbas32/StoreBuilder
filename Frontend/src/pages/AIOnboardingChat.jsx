import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Loader2, CheckCircle, Circle } from 'lucide-react';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import useAuthStore from '../store/authStore';
import onboardingService from '../services/onboardingService';
import './AIOnboardingChat.css';

const AIOnboardingChat = () => {
    const navigate = useNavigate();
    const { setStore } = useAuthStore();
    const { success, error: showError } = useToast();
    const messagesEndRef = useRef(null);
    const iframeRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({
        brandColor: '#2563eb',
        enabledSections: ['hero', 'product-grid'],
        productDisplayStyle: 'grid-4',
        categoryStructure: 'flat',
    });
    const [isCreating, setIsCreating] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [isCelebration, setIsCelebration] = useState(false);
    const [aiProvider, setAiProvider] = useState('openai');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const questions = [
        { field: 'name', message: "Hi! I'm here to help you create your store. 🎉\n\nWhat would you like to name your store?", type: 'text', required: true },
        {
            field: 'storeCategory', message: "Great! What type of store are you creating?", type: 'select', required: false, options: [
                { id: 'fashion', label: 'Fashion & Apparel', emoji: '👗' },
                { id: 'electronics', label: 'Electronics', emoji: '📱' },
                { id: 'food', label: 'Food & Beverage', emoji: '🍔' },
                { id: 'services', label: 'Services', emoji: '🔧' },
                { id: 'handmade', label: 'Handmade & Crafts', emoji: '🎨' },
                { id: 'digital', label: 'Digital Products', emoji: '💾' },
                { id: 'general', label: 'General Store', emoji: '🏪' },
            ]
        },
        {
            field: 'style_preference', message: "Perfect! What style best describes your brand?", type: 'select', required: true, options: [
                { id: 'modern-minimal', label: 'Modern & Minimal', emoji: '✨' },
                { id: 'classic-elegant', label: 'Classic & Elegant', emoji: '👔' },
                { id: 'bold-playful', label: 'Bold & Playful', emoji: '🎨' },
                { id: 'professional-corporate', label: 'Professional & Corporate', emoji: '💼' },
            ]
        },
        {
            field: 'description',
            message: "What does your store sell? Describe your business briefly.",
            type: 'text',
            required: false
        },
        {
            field: 'tagline',
            message: "Give us a catchy tagline for your store.",
            type: 'text',
            required: false
        },
        {
            field: 'socialLinks',
            message: "Share your social media links (Facebook, Instagram, etc.).",
            type: 'social-links',
            required: false
        },
        {
            field: 'contactInfo',
            message: "What is your business email and phone number?",
            type: 'contact',
            required: false
        },
        {
            field: 'businessHours',
            message: "What are your typical business hours?",
            type: 'business-hours',
            required: false
        },
        { field: 'brandColor', message: "What's your brand color?", type: 'color', required: false },
        {
            field: 'enabledSections', message: "What sections do you want on your homepage?", type: 'multi-select', required: true, options: [
                { id: 'hero', label: 'Large Hero Banner', emoji: '🎯' },
                { id: 'product-grid', label: 'Product Grid', emoji: '🛍️' },
                { id: 'highlight', label: 'Highlight Section', emoji: '⭐' },
                { id: 'attributes', label: 'Trust Badges', emoji: '✅' },
            ]
        },
        {
            field: 'productDisplayStyle', message: "How should products be displayed?", type: 'select', required: true, options: [
                { id: 'grid-4', label: 'Grid (4 columns)', emoji: '▦' },
                { id: 'grid-3', label: 'Grid (3 columns)', emoji: '▦' },
                { id: 'list', label: 'List View', emoji: '☰' },
                { id: 'minimal', label: 'Minimal Cards', emoji: '▭' },
            ]
        }
    ];

    // Session saving
    useEffect(() => {
        const saved = localStorage.getItem('onboarding_draft');
        if (saved) {
            try {
                const { answers: savedAnswers, messages: savedMessages, currentQuestion: savedQ } = JSON.parse(saved);
                if (savedAnswers && savedMessages) {
                    setAnswers(savedAnswers);
                    setMessages(savedMessages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
                    setCurrentQuestion(savedQ);
                }
            } catch (e) {
                console.error("Failed to restore onboarding draft", e);
            }
        }
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('onboarding_draft', JSON.stringify({ answers, messages, currentQuestion }));
        }
    }, [answers, messages, currentQuestion]);

    const clearDraft = () => localStorage.removeItem('onboarding_draft');

    useEffect(() => {
        if (messages.length === 0) {
            addAIMessage(questions[0].message, questions[0]);
        }
    }, []);

    useEffect(() => {
        setTimeout(scrollToBottom, 100);
    }, [messages, isTyping]);

    useEffect(() => {
        if (iframeRef.current && answers) {
            const previewSettings = {
                primaryColor: answers.brandColor || '#2563eb',
                components: [
                    { id: 'navbar-1', type: 'navbar', name: 'Navigation Bar' },
                    { id: 'hero-1', type: 'hero', name: 'Hero Section' },
                    { id: 'product-grid-1', type: 'product-grid', name: 'Product Grid' },
                    { id: 'footer-1', type: 'footer', name: 'Footer' }
                ],
                componentContent: {
                    'hero-1': { title: answers.name || 'Your Store Name', subtitle: 'Discover amazing products', ctaText: 'Shop Now', layout: 'centered' }
                },
                ...answers
            };
            iframeRef.current.contentWindow?.postMessage({ type: 'STORE_UPDATE', settings: previewSettings }, window.location.origin);
        }
    }, [answers]);

    const addAIMessage = (text, question = null) => {
        setMessages((prev) => [...prev, { type: 'ai', text, question, timestamp: new Date() }]);
    };

    const addUserMessage = async (text) => {
        const newUserMessage = { type: 'user', text, timestamp: new Date() };
        setMessages((prev) => [...prev, newUserMessage]);
        await getAIResponse([...messages, newUserMessage]);
    };

    const getAIResponse = async (history) => {
        setIsTyping(true);
        // TOKEN OPTIMIZATION: Cap history to last 6 messages
        const cappedHistory = history.slice(-6);
        const groqMessages = cappedHistory.map(m => ({
            role: m.type === 'ai' ? 'assistant' : 'user',
            content: m.text
        }));

        const result = await onboardingService.aiChat(groqMessages, aiProvider);

        if (result.success) {
            addAIMessage(result.data.message);
            if (result.data.extractedAnswers) {
                const newAnswers = { ...answers, ...result.data.extractedAnswers };
                setAnswers(newAnswers);
                const nextUnfilledIndex = questions.findIndex(q => !newAnswers[q.field]);
                if (nextUnfilledIndex !== -1 && nextUnfilledIndex !== currentQuestion) {
                    setCurrentQuestion(nextUnfilledIndex);
                }
            }
            if (result.data.isComplete) setIsComplete(true);
        } else {
            addAIMessage("Sorry, I'm having a little trouble connecting to my brain. Can we try again?");
            showError(result.error);
        }
        setIsTyping(false);
    };

    const handleQuickReply = (value, label) => {
        const question = questions[currentQuestion];
        if (question.type === 'multi-select') {
            const currentSelections = answers[question.field] || [];
            const newSelections = currentSelections.includes(value)
                ? currentSelections.filter((v) => v !== value)
                : [...currentSelections, value];
            setAnswers((prev) => ({ ...prev, [question.field]: newSelections }));
        } else {
            addUserMessage(label);
            setAnswers((prev) => ({ ...prev, [question.field]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;
        const input = userInput.trim();
        setUserInput('');
        if (input.toLowerCase().includes('launch') && (isComplete || answers.name)) {
            await createStore();
            return;
        }
        await addUserMessage(input);
    };

    const handleSkip = () => {
        if (!questions[currentQuestion].required) addUserMessage('Skip');
    };

    const handleDone = () => {
        const selections = answers[questions[currentQuestion].field] || [];
        if (selections.length > 0) addUserMessage(`Done. I've selected: ${selections.join(', ')}`);
        else addAIMessage("Please select at least one option.");
    };

    const createStore = async () => {
        setIsCreating(true);
        addAIMessage("Perfect! Let me create your store now... 🚀");
        const result = await onboardingService.aiCreateStore(answers);
        if (result.success) {
            setStore(result.data);
            clearDraft();
            setIsCelebration(true);
            setIsCreating(false);
        } else {
            setIsCreating(false);
            addAIMessage(`❌ Oops! There was an error: ${result.error}`);
            showError(result.error || 'Failed to create store');
        }
    };

    const getProgress = () => {
        const required = questions.filter(q => q.required).map(q => q.field);
        const completed = required.filter(f => {
            if (Array.isArray(answers[f])) return answers[f].length > 0;
            return !!answers[f];
        }).length;

        const optional = questions.filter(q => !q.required).map(q => q.field);
        const completedOptional = optional.filter(f => {
            if (typeof answers[f] === 'object' && answers[f] !== null) return Object.values(answers[f]).some(v => !!v);
            return !!answers[f];
        }).length;

        const reqBase = 70;
        const optBase = 30;

        const reqProgress = (completed / required.length) * reqBase;
        const optProgress = optional.length > 0 ? (completedOptional / optional.length) * optBase : optBase;

        return Math.round(reqProgress + optProgress);
    };

    const currentQ = questions[currentQuestion];

    const renderConfirmationSummary = () => {
        return (
            <div className="confirmation-summary-card">
                <div className="summary-header">
                    <h3>🎉 Your Store is Ready!</h3>
                    <p>Review your information before we build your storefront.</p>
                </div>

                <div className="summary-content">
                    <div className="summary-section">
                        <h4>General Info</h4>
                        <p><strong>Name:</strong> {answers.name}</p>
                        {answers.description && <p><strong>Description:</strong> {answers.description}</p>}
                        {answers.tagline && <p><strong>Tagline:</strong> {answers.tagline}</p>}
                    </div>

                    <div className="summary-section">
                        <h4>Brand Style</h4>
                        <p><strong>Style:</strong> {answers.style_preference}</p>
                        <p><strong>Color:</strong> <span className="color-preview-circle" style={{ backgroundColor: answers.brandColor }} /> {answers.brandColor}</p>
                    </div>

                    {(answers.contactInfo || answers.socialLinks) && (
                        <div className="summary-section">
                            <h4>Connect</h4>
                            {answers.contactInfo?.contact_email && <p><strong>Email:</strong> {answers.contactInfo.contact_email}</p>}
                            {answers.socialLinks && <p><strong>Socials:</strong> {Object.keys(answers.socialLinks).length} platforms linked</p>}
                        </div>
                    )}
                </div>

                <div className="summary-footer">
                    <Button onClick={() => setIsComplete(false)} variant="secondary">Go Back</Button>
                    <Button onClick={createStore} variant="primary" disabled={isCreating} className="launch-now-btn">
                        {isCreating ? <><Loader2 className="animate-spin mr-2" size={18} /> Building...</> : 'Launch My Store 🚀'}
                    </Button>
                </div>
            </div>
        );
    };

    const renderRichInput = () => {
        if (isTyping || !currentQ || isComplete) return null;

        if (currentQ.type === 'social-links') {
            return (
                <div className="rich-input-card social-links-card">
                    <h4>Social Media Links</h4>
                    {currentQ.options.map(opt => (
                        <div key={opt.id} className="rich-input-row">
                            <label>{opt.label}</label>
                            <input
                                type="text"
                                placeholder={`Enter ${opt.label} URL`}
                                value={answers.socialLinks?.[opt.id] || ''}
                                onChange={(e) => setAnswers(prev => ({
                                    ...prev,
                                    socialLinks: { ...(prev.socialLinks || {}), [opt.id]: e.target.value }
                                }))}
                            />
                        </div>
                    ))}
                    <Button onClick={() => addUserMessage("I've added my social links.")} disabled={isCreating}>Confirm Links</Button>
                </div>
            );
        }

        if (currentQ.type === 'contact') {
            return (
                <div className="rich-input-card contact-card">
                    <h4>Contact Information</h4>
                    {currentQ.options.map(opt => (
                        <div key={opt.id} className="rich-input-row">
                            <label>{opt.label}</label>
                            <input
                                type={opt.id === 'contact_email' ? 'email' : 'text'}
                                placeholder={`Enter ${opt.label}`}
                                value={answers.contactInfo?.[opt.id] || ''}
                                onChange={(e) => setAnswers(prev => ({
                                    ...prev,
                                    contactInfo: { ...(prev.contactInfo || {}), [opt.id]: e.target.value }
                                }))}
                            />
                        </div>
                    ))}
                    <Button onClick={() => addUserMessage("I've saved my contact information.")} disabled={isCreating}>Save Contact Info</Button>
                </div>
            );
        }

        if (currentQ.type === 'business-hours') {
            return (
                <div className="rich-input-card business-hours-card">
                    <h4>Business Hours</h4>
                    <p className="hint">e.g., Mon-Fri 9am-5pm</p>
                    <textarea
                        placeholder="Describe your opening hours..."
                        value={answers.businessHours || ''}
                        onChange={(e) => setAnswers(prev => ({ ...prev, businessHours: e.target.value }))}
                        rows={3}
                    />
                    <Button onClick={() => addUserMessage(`My business hours are: ${answers.businessHours}`)} disabled={!answers.businessHours || isCreating}>Save Hours</Button>
                </div>
            );
        }

        if (currentQ.options) {
            return (
                <div className="quick-replies">
                    {currentQ.options.map((option) => (
                        <button key={option.id} className={`quick-reply ${currentQ.type === 'multi-select' && answers[currentQ.field]?.includes(option.id) ? 'selected' : ''}`} onClick={() => handleQuickReply(option.id, option.label)} disabled={isCreating}>
                            {option.emoji && <span className="emoji">{option.emoji}</span>} {option.label}
                            {currentQ.type === 'multi-select' && answers[currentQ.field]?.includes(option.id) && <CheckCircle size={16} className="check-icon" />}
                        </button>
                    ))}
                    {currentQ.type === 'multi-select' && <button className="quick-reply done-button" onClick={handleDone} disabled={isCreating}>Done</button>}
                </div>
            );
        }

        return null;
    };

    return (
        <div className="ai-onboarding-chat">
            <div className="chat-container">
                <div className="chat-main">
                    <div className="chat-header">
                        <div className="header-title">
                            <h2>Create Your Store with AI</h2>
                            <div className="provider-selector">
                                <span className="provider-label">AI Engine:</span>
                                <div className="provider-toggle">
                                    {['groq', 'openrouter', 'openai'].map(p => (
                                        <button key={p} className={`provider-btn ${aiProvider === p ? 'active' : ''}`} onClick={() => setAiProvider(p)}>{p.charAt(0).toUpperCase() + p.slice(1)}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="progress-indicator">
                            <div className="progress-bar"><div className="progress-fill" style={{ width: `${getProgress()}%` }} /></div>
                            <span className="progress-text">{getProgress()}% Complete</span>
                        </div>
                        {messages.length > 0 && <Button variant="secondary" size="sm" onClick={() => { clearDraft(); window.location.reload(); }} className="reset-btn">Reset</Button>}
                    </div>

                    <div className="chat-messages">
                        {isCelebration ? (
                            <div className="celebration-state">
                                <div className="celebration-content">
                                    <div className="celebration-icon">🎉</div>
                                    <h2>Your Store is Live!</h2>
                                    <p>Congratulations! Your store <strong>{store?.name}</strong> has been successfully created and is ready for customers.</p>
                                    <div className="celebration-actions">
                                        <Button onClick={() => navigate('/dashboard')} size="lg">Go to Dashboard</Button>
                                        <Button variant="secondary" onClick={() => window.open(`/${store?.slug}`, '_blank')} size="lg">Visit Store</Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, index) => (
                                    <div key={index} className={`message ${msg.type}`}>
                                        <div className="message-content"><p>{msg.text}</p></div>
                                    </div>
                                ))}
                                {isTyping && <div className="message ai typing"><div className="message-content"><div className="typing-indicator"><span></span><span></span><span></span></div></div></div>}
                                {isComplete ? renderConfirmationSummary() : renderRichInput()}
                            </>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-container">
                        {!isCreating && !isComplete && (
                            <form onSubmit={handleSubmit} className="chat-input-form">
                                <input
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    placeholder="Type your answer..."
                                    className="chat-input"
                                    disabled={isCreating}
                                />
                                <Button type="submit" disabled={!userInput.trim() || isCreating}><Send size={20} /></Button>
                            </form>
                        )}
                        {!currentQ?.required && !isCreating && !isComplete && <button className="skip-button" onClick={handleSkip}>Skip this question</button>}
                    </div>
                </div>

                <div className="chat-sidebar">
                    <div className="preview-pane">
                        <div className="preview-header">
                            <h3>Live Preview</h3>
                            <div className="device-indicator">
                                <div className="device-dot"></div>
                                <div className="device-dot"></div>
                                <div className="device-dot"></div>
                            </div>
                        </div>
                        <div className="preview-window">
                            <iframe
                                ref={iframeRef}
                                src="/preview-store"
                                title="Store Preview"
                                onLoad={() => {
                                    // Initial postMessage once iframe loads
                                    if (answers) {
                                        iframeRef.current.contentWindow?.postMessage({ type: 'STORE_UPDATE', settings: answers }, window.location.origin);
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="answer-summary">
                        <h3>Your Answers</h3>
                        <div className="answer-list">
                            {questions.map((q) => {
                                const hasValue = !!answers[q.field] || (typeof answers[q.field] === 'object' && answers[q.field] !== null && Object.values(answers[q.field]).some(v => !!v));
                                return (
                                    <div key={q.field} className={`answer-item ${hasValue ? 'completed' : ''}`}>
                                        {hasValue ? <CheckCircle size={16} className="check-icon" /> : <Circle size={16} className="circle-icon" />}
                                        <span className="answer-label">{q.field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                                        {hasValue && (
                                            <span className="answer-value">
                                                {typeof answers[q.field] === 'object'
                                                    ? (Array.isArray(answers[q.field]) ? answers[q.field].join(', ') : 'Configured')
                                                    : answers[q.field]}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIOnboardingChat;
