'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Send, Bot, User, Sparkles, Zap, MessageSquare } from 'lucide-react';
import '@/styles/assistant.scss';

type Message = { role: 'user' | 'assistant'; content: string };

export default function AssistantPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const getAccessToken = () => {
        const cookies = document.cookie.split('; ');
        const tokenCookie = cookies.find(row => row.startsWith('access_token='));
        return tokenCookie ? tokenCookie.split('=')[1] : null;
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = getAccessToken();
                const res = await fetch('/api/ai/history', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.messages && data.messages.length > 0) {
                        setMessages(data.messages);
                    } else {
                        // Default welcome message if no history
                        setMessages([{
                            role: 'assistant',
                            content: 'Hi! I\'m your AI learning assistant. I have all your previous context. What would you like to study today?'
                        }]);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch history', error);
            } finally {
                setInitializing(false);
            }
        };

        fetchHistory();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages((prev: Message[]) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const token = getAccessToken();
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: input,
                    course_id: null
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || 'Failed to get response from AI');
            }

            setMessages((prev: Message[]) => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error: any) {
            console.error('Chat failed', error);
            toast.error(error.message || 'Connection error');
            setMessages((prev: Message[]) => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting to my brain right now. Please check your connection and try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="assistant-page">
            <div className="page-header">
                <div className="flex justify-between items-center">
                    <div>
                        <h1>AI Learning Assistant</h1>
                        <p>Your persistent academic companion, powered by Gemini 2.5</p>
                    </div>
                    <div className="flex items-center gap-sm">
                        <div className="badge badge-primary">
                            <Sparkles size={14} style={{ marginRight: '4px' }} />
                            Persistent History
                        </div>
                        <div className="glow-dot" title="AI Worker Online" />
                    </div>
                </div>
            </div>

            <div className="chat-wrapper">
                <div className="chat-messages">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`chat-bubble ${msg.role}`}>
                            {msg.role === 'assistant' && (
                                <div className="bot-ai-tag">
                                    <div className="ai-dot" />
                                    <Bot size={14} />
                                    <span>SmartEdu AI</span>
                                </div>
                            )}
                            {msg.role === 'user' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', justifyContent: 'flex-end', opacity: 0.7 }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>You</span>
                                    <User size={14} />
                                </div>
                            )}
                            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                        </div>
                    ))}
                    {loading && (
                        <div className="chat-bubble assistant">
                            <div className="bot-ai-tag">
                                <div className="ai-dot" />
                                <Bot size={14} />
                                <span>Thinking...</span>
                            </div>
                            <div className="typing-indicator">
                                <span />
                                <span />
                                <span />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-container">
                    <div className="input-wrapper">
                        <input
                            className="input-premium"
                            placeholder="Ask anything about your courses..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            disabled={loading || initializing}
                        />
                    </div>
                    <button
                        className="btn-send"
                        onClick={sendMessage}
                        disabled={loading || !input.trim() || initializing}
                        title="Send Message"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div className="card-glass" style={{ flex: 1, padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={16} />
                    <span>Total memories stored: {messages.length}</span>
                </div>
                <div className="card-glass" style={{ flex: 1, padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={16} />
                    <span>Latency: ~1.2s (Fast)</span>
                </div>
            </div>
        </div>
    );
}
