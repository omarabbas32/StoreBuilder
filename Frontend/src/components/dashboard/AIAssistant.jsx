import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, X, Maximize2, Minimize2, Check, AlertCircle, RefreshCw, Trash2, Zap, Image as ImageIcon, Loader } from 'lucide-react';
import onboardingService from '../../services/onboardingService';
import apiClient from '../../services/api';
import { toast } from 'react-hot-toast';
import './AIAssistant.css';

const STORAGE_KEY = 'storely_ai_chat_history';

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return [{ role: 'assistant', content: "Hello! I'm your Storely AI Assistant. I can help you update your store, add products, or change settings. What's on your mind?" }];
            }
        }
        return [{ role: 'assistant', content: "Hello! I'm your Storely AI Assistant. I can help you update your store, add products, or change settings. What's on your mind?" }];
    });
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pendingActions, setPendingActions] = useState([]); // Array of { id, action }
    const [retryCountdown, setRetryCountdown] = useState(0);
    const [showHistory, setShowHistory] = useState(false);
    const [aiProvider, setAiProvider] = useState(localStorage.getItem('ai_provider') || 'gemini');
    const [isSuccess, setIsSuccess] = useState(false);
    const messagesEndRef = useRef(null);

    // Draggability State
    const [position, setPosition] = useState(() => {
        const saved = localStorage.getItem('storely_ai_assistant_pos');
        return saved ? JSON.parse(saved) : { x: window.innerWidth - 300, y: window.innerHeight - 80 };
    });
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    // Persist provider selection
    useEffect(() => {
        localStorage.setItem('ai_provider', aiProvider);
    }, [aiProvider]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Persist conversation to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }, [messages]);

    const clearHistory = () => {
        localStorage.removeItem(STORAGE_KEY);
        setMessages([{ role: 'assistant', content: "Chat cleared. How can I help you today?" }]);
        setActionHistory([]);
        toast.success('Chat history cleared');
    };

    // Drag Handlers
    const handleDragStart = (e) => {
        if (e.button !== 0) return;
        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialX: position.x,
            initialY: position.y
        };
        e.preventDefault();
    };

    useEffect(() => {
        const handleDragMove = (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - dragRef.current.startX;
            const deltaY = e.clientY - dragRef.current.startY;
            const newX = dragRef.current.initialX + deltaX;
            const newY = dragRef.current.initialY + deltaY;
            const boundedX = Math.max(0, Math.min(newX, window.innerWidth - 60));
            const boundedY = Math.max(0, Math.min(newY, window.innerHeight - 60));
            setPosition({ x: boundedX, y: boundedY });
        };

        const handleDragEnd = () => {
            if (isDragging) {
                setIsDragging(false);
                localStorage.setItem('storely_ai_assistant_pos', JSON.stringify(position));
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
        };
    }, [isDragging, position]);

    const [actionHistory, setActionHistory] = useState([]);

    const DESTRUCTIVE_ACTIONS = ['DELETE_STORE', 'DELETE_PRODUCT', 'DELETE_CATEGORY'];
    const ALLOWED_ACTIONS = new Set([
        'UPDATE_STORE', 'CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT', 'LIST_PRODUCTS', 'BULK_UPDATE_PRODUCTS',
        'CREATE_CATEGORY', 'UPDATE_CATEGORY', 'DELETE_CATEGORY',
        'GET_STORE_STATS', 'UPDATE_COMPONENT_CONTENT', 'SEARCH_IMAGES', 'GENERATE_IMAGE'
    ]);

    const getActionMessage = (actionType) => {
        const messages = {
            'UPDATE_STORE': 'Updating your store settings',
            'CREATE_PRODUCT': 'Creating a new product',
            'UPDATE_PRODUCT': 'Updating product details',
            'DELETE_PRODUCT': 'Removing product',
            'CREATE_CATEGORY': 'Creating a new category',
            'UPDATE_CATEGORY': 'Updating category',
            'DELETE_CATEGORY': 'Removing category',
            'UPDATE_COMPONENT_CONTENT': 'Updating page content',
            'SEARCH_IMAGES': 'Searching for images',
            'GENERATE_IMAGE': 'Generating AI image',
            'GET_STORE_STATS': 'Fetching store analytics',
            'LIST_PRODUCTS': 'Loading products',
            'BULK_UPDATE_PRODUCTS': 'Updating multiple products'
        };
        return messages[actionType] || actionType;
    };

    const executeAction = async (action) => {
        const executionRecord = {
            timestamp: new Date().toISOString(),
            action,
            result: null
        };

        try {
            if (!action?.method || !action?.url || !action?.type) {
                throw new Error('Invalid action format: Missing method, URL, or type');
            }

            if (!ALLOWED_ACTIONS.has(action.type)) {
                throw new Error(`Unauthorized action type: ${action.type}`);
            }

            if (DESTRUCTIVE_ACTIONS.includes(action.type)) {
                console.warn(`[AIAssistant] Executing destructive action: ${action.type}`);
            }

            const { method, url, data } = action;

            if (data && JSON.stringify(data).toLowerCase().includes("url here") ||
                data && JSON.stringify(data).toLowerCase().includes("example.com")) {
                toast.error("Action contains placeholder data. Please ask AI for real content.");
                throw new Error("Action blocked: Contains placeholder data");
            }

            const userFriendlyMessage = getActionMessage(action.type);
            setMessages(prev => [...prev, { role: 'system', content: `${userFriendlyMessage}...` }]);

            const response = await apiClient({
                method: method.toLowerCase(),
                url: url,
                data: data
            });

            if (response.success) {
                executionRecord.result = { success: true, data: response.data, error: response.error };
                const successMessage = getActionMessage(action.type);
                toast.success(`${successMessage} completed!`);
                setIsSuccess(true);
                setTimeout(() => setIsSuccess(false), 1000);

                if (action.type !== 'GENERATE_IMAGE' && action.type !== 'SEARCH_IMAGES') {
                    setMessages(prev => [...prev, { role: 'assistant', content: `✅ ${successMessage} completed successfully!` }]);
                }

                if (action.type === 'UPDATE_STORE' || action.type === 'UPDATE_COMPONENT_CONTENT') {
                    window.dispatchEvent(new CustomEvent('storely-store-update'));
                }
            } else {
                throw new Error(response.error || 'Unknown API error');
            }
        } catch (error) {
            executionRecord.result = { success: false, error: error.message };
            const errorMessage = error.response?.data?.message || error.message || "Execution failed";
            toast.error(`Action failed: ${errorMessage}`);
            setMessages(prev => [...prev, { role: 'assistant', content: `I tried to perform that action but it failed: ${errorMessage}` }]);
        } finally {
            if (action.type === 'SEARCH_IMAGES' || action.type === 'GENERATE_IMAGE') {
                setMessages(prev => prev.map(m => {
                    if (m.role === 'assistant' && m.actions) {
                        const hasAction = m.actions.some(a => a.id === action.id);
                        if (hasAction) {
                            return {
                                ...m,
                                actions: m.actions.map(a => a.id === action.id ? { ...a, results: executionRecord.result?.data, error: executionRecord.result?.error } : a)
                            };
                        }
                    }
                    return m;
                }));
            }
            setPendingActions(prev => prev.filter(a => a.id !== action.id));
            setActionHistory(prev => [...prev, executionRecord]);
        }
    };

    const handleSend = async (e, manualInput = null) => {
        if (e) e.preventDefault();
        const textToSend = manualInput || input;
        if (!textToSend.trim() || isLoading) return;

        const userMessage = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const history = messages.concat(userMessage);
            const response = await onboardingService.assistantChat(history, aiProvider);

            if (response.success && response.data) {
                const innerResult = response.data;
                if (innerResult.success === false) {
                    throw new Error(innerResult.error || "AI Service Error");
                }

                const aiPayload = innerResult.data || innerResult;
                const aiMessage = { role: 'assistant', content: aiPayload.message };
                const actions = aiPayload.actions || (aiPayload.action ? [aiPayload.action] : []);

                if (actions.length > 0) {
                    const mappedActions = actions.map((a, idx) => ({ ...a, id: `${Date.now()}-${idx}` }));
                    aiMessage.actions = mappedActions;
                    const autoExecuteTypes = ['GENERATE_IMAGE', 'SEARCH_IMAGES', 'LIST_PRODUCTS', 'GET_STORE_STATS'];
                    mappedActions.forEach(act => {
                        if (autoExecuteTypes.includes(act.type)) {
                            executeAction(act);
                        } else {
                            setPendingActions(prev => [...prev, act]);
                        }
                    });
                }
                setMessages(prev => [...prev, aiMessage]);
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Connection failed";
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${errorMsg}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const result = await onboardingService.uploadLogo(file);
            if (result.success) {
                handleSend(null, `[Uploaded Image] ${result.data.url}`);
            } else {
                toast.error(result.error || "Failed to upload image");
            }
        } catch (error) {
            toast.error("Error uploading image");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const toggleOpen = () => {
        if (isOpen) {
            setIsMinimized(false);
            setIsOpen(false);
        } else {
            setIsOpen(true);
        }
    };

    const handleClose = () => {
        setIsMinimized(false);
        setIsOpen(false);
    };

    if (!isOpen) {
        return (
            <button
                className={`ai-assistant-trigger ${isDragging ? 'dragging' : ''}`}
                onClick={() => !isDragging && toggleOpen()}
                onMouseDown={handleDragStart}
                style={{
                    position: 'fixed',
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: 'none',
                    bottom: 'auto',
                    right: 'auto'
                }}
            >
                <Bot size={24} />
                <span>AI Assistant</span>
            </button>
        );
    }

    return (
        <div
            className={`ai-assistant-window ${isMinimized ? 'minimized' : ''} ${isSuccess ? 'success-animation' : ''} ${isDragging ? 'dragging' : ''}`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                position: 'fixed',
                bottom: 'auto',
                right: 'auto'
            }}
        >
            <div
                className="ai-assistant-header"
                onMouseDown={handleDragStart}
                onClick={() => isMinimized && !isDragging && setIsMinimized(false)}
                style={{ cursor: isMinimized ? 'pointer' : 'move', userSelect: 'none' }}
            >
                <div className="header-info">
                    <Bot size={20} />
                    <h3>Storely AI</h3>
                    {!isMinimized && (
                        <select
                            value={aiProvider}
                            onChange={(e) => setAiProvider(e.target.value)}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                marginLeft: '10px',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid #ddd',
                                fontSize: '12px',
                                cursor: 'pointer',
                                background: '#f8f9fa'
                            }}
                        >
                            <option value="gemini">⚡ Gemini</option>
                            <option value="openai">🤖 GPT-4</option>
                            <option value="groq">🚀 Groq</option>
                        </select>
                    )}
                </div>
                <div className="header-actions">
                    {!isMinimized && (
                        <button onClick={(e) => { e.stopPropagation(); clearHistory(); }} onMouseDown={(e) => e.stopPropagation()} title="Clear history">
                            <Trash2 size={16} />
                        </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} onMouseDown={(e) => e.stopPropagation()}>
                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleClose(); }} onMouseDown={(e) => e.stopPropagation()}>
                        <X size={16} />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    <div className="ai-assistant-messages">
                        {messages.map((m, i) => (
                            <div key={i} className={`message ${m.role}`}>
                                <div className="message-content">{m.content}</div>
                                {m.role === 'assistant' && m.actions && (
                                    <div className="multi-actions-container">
                                        {m.actions.map((act) => {
                                            const isPending = pendingActions.some(pa => pa.id === act.id);
                                            const hasResults = act.results && act.results.length > 0;

                                            // Only show the card if it's pending OR if it has results to show
                                            if (!isPending && !hasResults) return null;

                                            return (
                                                <div key={act.id} className="action-confirmation">
                                                    <div className="action-details">
                                                        <strong>{getActionMessage(act.type)}</strong>
                                                        {act.type === 'UPDATE_STORE' && <p>Update store identity & settings</p>}
                                                        {act.type === 'CREATE_PRODUCT' && <p>New Product: <strong>{act.data.name}</strong> - ${act.data.price}</p>}
                                                        {act.type === 'UPDATE_COMPONENT_CONTENT' && <p>Update {act.url.split('/').pop()} content</p>}

                                                        {act.results && (
                                                            <div className="image-search-results">
                                                                <p>{act.type === 'GENERATE_IMAGE' ? 'AI Generated Visuals:' : 'Suggested Images:'}</p>
                                                                {act.error === 'REPLICATE_NO_CREDIT' && (
                                                                    <p className="ai-warning" style={{ fontSize: '0.75rem', color: '#f59e0b', margin: '4px 0 12px 0' }}>
                                                                        ⚠️ AI generation is in high demand (Out of credits). Showing high-quality design alternatives.
                                                                    </p>
                                                                )}
                                                                <div className="results-grid">
                                                                    {act.results.map((res, ridx) => (
                                                                        <div key={ridx} className="search-result-item" onClick={() => {
                                                                            const assetType = act.type === 'GENERATE_IMAGE' ? 'header image' : 'logo';
                                                                            handleSend(null, `Use this ${assetType}: ${res.url}`);
                                                                        }}>
                                                                            <img src={res.thumbnail} alt={res.title} />
                                                                            {act.type === 'GENERATE_IMAGE' && <div className="ai-badge">AI</div>}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {!['UPDATE_STORE', 'CREATE_PRODUCT', 'UPDATE_COMPONENT_CONTENT', 'SEARCH_IMAGES', 'GENERATE_IMAGE'].includes(act.type) && isPending && (
                                                            <pre>{JSON.stringify(act.data || {}, null, 2)}</pre>
                                                        )}
                                                    </div>

                                                    {isPending && (
                                                        <div className="confirmation-buttons">
                                                            <button className="confirm-btn" onClick={() => executeAction(act)}><Check size={14} /> Confirm</button>
                                                            <button className="cancel-btn" onClick={() => setPendingActions(prev => prev.filter(a => a.id !== act.id))}><X size={14} /> Skip</button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message assistant loading">
                                <Bot className="spin" size={18} />
                                <span>Generating Magic...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="quick-chips">
                        {["Update store info", "Add a new product", "Change brand color", "Update footer about us"].map((chip, idx) => (
                            <button key={idx} className="chip" onClick={() => handleSend(null, chip)}>{chip}</button>
                        ))}
                    </div>

                    <form className="ai-assistant-input" onSubmit={handleSend}>
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileUpload} />
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading || isUploading}>
                            {isUploading ? <Loader className="spin" size={18} /> : <ImageIcon size={18} />}
                        </button>
                        <input type="text" placeholder="Ask me to do something..." value={input} onChange={(e) => setInput(e.target.value)} disabled={isLoading} />
                        <button type="submit" disabled={isLoading || !input.trim()}><Send size={18} /></button>
                    </form>
                </>
            )}
        </div>
    );
};

export default AIAssistant;
