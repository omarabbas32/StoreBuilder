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
        // Only allow left click
        if (e.button !== 0) return;

        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialX: position.x,
            initialY: position.y
        };
        e.preventDefault(); // Prevent text selection
    };

    useEffect(() => {
        const handleDragMove = (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - dragRef.current.startX;
            const deltaY = e.clientY - dragRef.current.startY;

            const newX = dragRef.current.initialX + deltaX;
            const newY = dragRef.current.initialY + deltaY;

            // Simple boundary detection
            const boundedX = Math.max(0, Math.min(newX, window.innerWidth - 60));
            const boundedY = Math.max(0, Math.min(newY, window.innerHeight - 60));

            setPosition({ x: boundedX, y: boundedY });
        };

        const handleDragEnd = () => {
            if (isDragging) {
                setIsDragging(false);
                // Save the top-left position
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
                // UNWRAP STRATEGY:
                // The API returns { success: true, data: { success: true, data: { message: "..." } } }
                // So response.data is the INNER object from the controller.
                const innerResult = response.data;

                if (innerResult.success === false) {
                    throw new Error(innerResult.error || "AI Service Error");
                }

                const aiPayload = innerResult.data || innerResult;
                const aiMessage = { role: 'assistant', content: aiPayload.message };

                // Handle both single 'action' (back-compat) and 'actions' array
                const actions = aiPayload.actions || (aiPayload.action ? [aiPayload.action] : []);

                if (actions.length > 0) {
                    aiMessage.actions = actions.map((a, idx) => ({ ...a, id: `${Date.now()}-${idx}` }));
                    // Force manual confirmation for ALL actions as requested by user
                    setPendingActions(prev => [...prev, ...aiMessage.actions]);
                }

                setMessages(prev => [...prev, aiMessage]);
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Connection failed";
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${errorMsg}` }]);

            // Handle rate limit with countdown
            if (errorMsg.includes('Rate Limit') || errorMsg.includes('busy')) {
                setRetryCountdown(30);
                const interval = setInterval(() => {
                    setRetryCountdown(prev => {
                        if (prev <= 1) {
                            clearInterval(interval);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const [actionHistory, setActionHistory] = useState([]);

    const DESTRUCTIVE_ACTIONS = ['DELETE_STORE', 'DELETE_PRODUCT', 'DELETE_CATEGORY'];
    const ALLOWED_ACTIONS = new Set([
        // Store
        'UPDATE_STORE',
        // Products
        'CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT', 'LIST_PRODUCTS', 'BULK_UPDATE_PRODUCTS',
        // Categories
        'CREATE_CATEGORY', 'UPDATE_CATEGORY', 'DELETE_CATEGORY',
        // Analytics
        'GET_STORE_STATS',
        'UPDATE_COMPONENT_CONTENT'
    ]);

    const executeAction = async (action) => {
        const executionRecord = {
            timestamp: new Date().toISOString(),
            action,
            result: null
        };

        try {
            // 1. Validate Action Structure
            if (!action?.method || !action?.url || !action?.type) {
                throw new Error('Invalid action format: Missing method, URL, or type');
            }

            // 2. Allowed Actions Check
            if (!ALLOWED_ACTIONS.has(action.type)) {
                throw new Error(`Unauthorized action type: ${action.type}`);
            }

            // 3. Confirm Destructive Actions
            if (DESTRUCTIVE_ACTIONS.includes(action.type)) {
                // If not already confirmed via UI (which calls this function), we could double-check here
                // But generally, the UI button "Confirm" is the explicit consent.
                // We add a safety log here.
                console.warn(`[AIAssistant] Executing destructive action: ${action.type}`);
            }

            const { method, url, data } = action;

            // 4. Validation for Placeholders
            if (JSON.stringify(data).toLowerCase().includes("url here") ||
                JSON.stringify(data).toLowerCase().includes("example.com")) {
                toast.error("Action contains placeholder data. Please ask AI for real content.");
                throw new Error("Action blocked: Contains placeholder data");
            }

            setMessages(prev => [...prev, { role: 'system', content: `Executing: ${action.type}...` }]);

            // 5. Execute API Call
            const response = await apiClient({
                method: method.toLowerCase(),
                url: url,
                data: data
            });

            if (response.success) {
                executionRecord.result = { success: true, data: response.data };
                toast.success(`${action.type} successful!`);
                setIsSuccess(true);
                setTimeout(() => setIsSuccess(false), 1000);
                setMessages(prev => [...prev, { role: 'assistant', content: `Done! I've successfully processed the ${action.type}. 🎉` }]);

                if (action.type === 'UPDATE_STORE' || action.type === 'UPDATE_COMPONENT_CONTENT') {
                    // Trigger live update without page reload
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
            console.error('[AIAssistant] Action Error:', error);
        } finally {
            setActionHistory(prev => [...prev, executionRecord]);
            setPendingActions(prev => prev.filter(a => a.id !== action.id));
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // Use onboardingService if available for consistency, or direct API
            const result = await onboardingService.uploadLogo(file);

            if (result.success) {
                const imageUrl = result.data.url;
                // Send the image URL to the chat context
                handleSend(null, `[Uploaded Image] ${imageUrl}`);
            } else {
                toast.error(result.error || "Failed to upload image");
            }
        } catch (error) {
            console.error('File upload error:', error);
            toast.error("Error uploading image");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const toggleOpen = () => {
        if (isOpen) {
            // Closing: Move position to where the trigger would be relative to the window
            setPosition(prev => ({
                x: prev.x + (isMinimized ? 150 : 250),
                y: prev.y + (isMinimized ? 0 : 620)
            }));
            setIsOpen(false);
        } else {
            // Opening: Move position so the window appears where the trigger was
            setPosition(prev => ({
                x: Math.max(20, prev.x - (isMinimized ? 150 : 250)),
                y: Math.max(20, prev.y - (isMinimized ? 0 : 620))
            }));
            setIsOpen(true);
        }
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
            <div className="ai-assistant-header" onMouseDown={handleDragStart} style={{ cursor: 'move', userSelect: 'none' }}>
                <div className="header-info">
                    <Bot size={20} />
                    <h3>Storely AI</h3>
                    <select
                        value={aiProvider}
                        onChange={(e) => setAiProvider(e.target.value)}
                        style={{
                            marginLeft: '10px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            fontSize: '12px',
                            cursor: 'pointer',
                            background: '#f8f9fa'
                        }}
                        title="Select AI Provider"
                    >
                        <option value="gemini">⚡ Gemini</option>
                        <option value="openai">🤖 GPT-4</option>
                        <option value="groq">🚀 Groq</option>
                    </select>
                </div>
                <div className="header-actions">
                    <button onClick={clearHistory} title="Clear chat history">
                        <Trash2 size={16} />
                    </button>
                    <button onClick={() => setIsMinimized(!isMinimized)}>
                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button onClick={() => setIsOpen(false)}>
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
                                {m.role === 'assistant' && m.actions && m.actions.some(a => pendingActions.find(pa => pa.id === a.id)) && (
                                    <div className="multi-actions-container">
                                        {m.actions.filter(a => pendingActions.find(pa => pa.id === a.id)).map((act) => (
                                            <div key={act.id} className="action-confirmation">
                                                <div className="action-details">
                                                    <strong>{act.type.replace(/_/g, ' ')}</strong>
                                                    {act.type === 'UPDATE_STORE' && (
                                                        <p>Update store identity & settings</p>
                                                    )}
                                                    {act.type === 'CREATE_PRODUCT' && (
                                                        <p>New Product: <strong>{act.data.name}</strong> - ${act.data.price}</p>
                                                    )}
                                                    {act.type === 'UPDATE_COMPONENT_CONTENT' && (
                                                        <p>Update {act.url.split('/').pop()} content</p>
                                                    )}
                                                    {!['UPDATE_STORE', 'CREATE_PRODUCT', 'UPDATE_COMPONENT_CONTENT'].includes(act.type) && (
                                                        <pre>{JSON.stringify(act.data || {}, null, 2)}</pre>
                                                    )}
                                                </div>
                                                <div className="confirmation-buttons">
                                                    <button className="confirm-btn" onClick={() => executeAction(act)}>
                                                        <Check size={14} /> Confirm
                                                    </button>
                                                    <button className="cancel-btn" onClick={() => setPendingActions(prev => prev.filter(a => a.id !== act.id))}>
                                                        <X size={14} /> Skip
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
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

                    {!isLoading && pendingActions.length === 0 && messages.length < 5 && (
                        <div className="quick-chips">
                            {[
                                "Update store info",
                                "Add a new product",
                                "Change brand color",
                                "Update footer about us"
                            ].map((chip) => (
                                <button key={chip} className="chip" onClick={() => {
                                    setInput(chip);
                                    // Submit automatically
                                    setTimeout(() => handleSend({ preventDefault: () => { } }), 50);
                                }}>
                                    {chip}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Rate Limit Notice */}
                    {retryCountdown > 0 && (
                        <div className="rate-limit-notice" style={{ padding: '10px', background: '#fff3cd', borderRadius: '8px', margin: '10px', textAlign: 'center' }}>
                            ⏳ AI is cooling down... Retry in <strong>{retryCountdown}s</strong>
                            <button onClick={() => { setRetryCountdown(0); }} style={{ marginLeft: '10px', padding: '5px 10px', cursor: 'pointer' }}>
                                Retry Now
                            </button>
                        </div>
                    )}

                    {/* Action History Panel */}
                    {actionHistory.length > 0 && (
                        <div className="action-history" style={{ padding: '10px', borderTop: '1px solid #eee' }}>
                            <button onClick={() => setShowHistory(!showHistory)} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                {showHistory ? '▼' : '▶'} Recent Actions ({actionHistory.length})
                            </button>
                            {showHistory && (
                                <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0 0' }}>
                                    {actionHistory.slice(-5).reverse().map((h, i) => (
                                        <li key={i} style={{ padding: '8px', background: h.result?.success ? '#d4edda' : '#f8d7da', borderRadius: '4px', marginBottom: '5px', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                            <span>{h.action.type}</span>
                                            <span>{h.result?.success ? '✓' : '✗'}</span>
                                            <small>{new Date(h.timestamp).toLocaleTimeString()}</small>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <form className="ai-assistant-input" onSubmit={handleSend}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleFileUpload}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading || isUploading}
                            title="Upload Image"
                            style={{ background: '#f1f5f9', color: '#64748b' }}
                        >
                            {isUploading ? <Loader className="spin" size={18} /> : <ImageIcon size={18} />}
                        </button>
                        <input
                            type="text"
                            placeholder="Ask me to do something..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !input.trim()}>
                            <Send size={18} />
                        </button>
                    </form>
                </>
            )
            }
        </div>
    );
};

export default AIAssistant;
