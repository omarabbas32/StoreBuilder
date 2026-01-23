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
        },
        {
            field: 'categoryStructure', message: "How do you want to organize your products?", type: 'select', required: true, options: [
                { id: 'flat', label: 'Flat List', emoji: '📋' },
                { id: 'hierarchical', label: 'Hierarchical', emoji: '🌳' },
            ]
        }
    ];

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
            addAIMessage("✨ Your store has been created successfully! Redirecting you to the dashboard...");
            setTimeout(() => { success('Store created successfully!'); navigate('/dashboard'); }, 2000);
        } else {
            setIsCreating(false);
            addAIMessage(`❌ Oops! There was an error: ${result.error}`);
            showError(result.error || 'Failed to create store');
        }
    };

    const getProgress = () => {
        const required = questions.filter(q => q.required).map(q => q.field);
        const completed = required.filter(f => answers[f]).length;
        return Math.round((completed / required.length) * 100);
    };

    const currentQ = questions[currentQuestion];

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
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.type}`}>
                                <div className="message-content"><p>{msg.text}</p></div>
                            </div>
                        ))}
                        {isTyping && <div className="message ai typing"><div className="message-content"><div className="typing-indicator"><span></span><span></span><span></span></div></div></div>}
                        {!isTyping && currentQ?.options && (
                            <div className="quick-replies">
                                {currentQ.options.map((option) => (
                                    <button key={option.id} className={`quick-reply ${currentQ.type === 'multi-select' && answers[currentQ.field]?.includes(option.id) ? 'selected' : ''}`} onClick={() => handleQuickReply(option.id, option.label)} disabled={isCreating}>
                                        {option.emoji && <span className="emoji">{option.emoji}</span>} {option.label}
                                        {currentQ.type === 'multi-select' && answers[currentQ.field]?.includes(option.id) && <CheckCircle size={16} className="check-icon" />}
                                    </button>
                                ))}
                                {currentQ.type === 'multi-select' && <button className="quick-reply done-button" onClick={handleDone} disabled={isCreating}>Done</button>}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-container">
                        {!currentQ?.options && !isCreating && (
                            <form onSubmit={handleSubmit} className="chat-input-form">
                                <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder={isComplete ? "Type 'launch' to start!" : "Type your answer..."} className="chat-input" disabled={isCreating} />
                                <Button type="submit" disabled={!userInput.trim() || isCreating}><Send size={20} /></Button>
                                {(isComplete || answers.name) && !isCreating && (
                                    <Button onClick={createStore} variant="primary" className="launch-btn" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', marginLeft: '0.5rem' }}>Launch Store 🚀</Button>
                                )}
                            </form>
                        )}
                        {!currentQ?.required && !isCreating && <button className="skip-button" onClick={handleSkip}>Skip this question</button>}
                    </div>
                </div>

                <div className="chat-sidebar">
                    <div className="preview-pane">
                        <div className="preview-header"><h3>Live Preview</h3><div className="device-indicator"><Circle size={12} fill="#ff5f56" stroke="none" /><Circle size={12} fill="#ffbd2e" stroke="none" /><Circle size={12} fill="#27c93f" stroke="none" /></div></div>
                        <div className="preview-window"><iframe ref={iframeRef} src="/onboarding/preview?preview=true" title="Store Preview" /></div>
                    </div>
                    <div className="answer-summary">
                        <h3>Your Answers</h3>
                        <div className="answer-list">
                            {questions.map((q) => (
                                <div key={q.field} className={`answer-item ${answers[q.field] ? 'completed' : ''}`}>
                                    {answers[q.field] ? <CheckCircle size={16} className="check-icon" /> : <Circle size={16} className="circle-icon" />}
                                    <span className="answer-label">{q.field}</span>
                                    {answers[q.field] && <span className="answer-value">{Array.isArray(answers[q.field]) ? answers[q.field].join(', ') : answers[q.field]}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIOnboardingChat;
