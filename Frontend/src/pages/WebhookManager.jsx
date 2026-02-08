import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    RefreshCw,
    Send,
    Activity,
    Shield,
    Link as LinkIcon,
    CheckCircle,
    XCircle,
    Copy,
    ChevronDown,
    ChevronUp,
    Settings,
    Bell
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import webhookService from '../services/webhookService';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import PageLoader from '../components/ui/PageLoader';
import './WebhookManager.css';

const WebhookManager = () => {
    const [webhooks, setWebhooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        url: '',
        events: ['order.created', 'stock.low']
    });
    const [expandedWebhook, setExpandedWebhook] = useState(null);
    const [logs, setLogs] = useState({});
    const [logsLoading, setLogsLoading] = useState({});

    useEffect(() => {
        fetchWebhooks();
    }, []);

    const fetchWebhooks = async () => {
        setLoading(true);
        try {
            const response = await webhookService.getAll();
            setWebhooks(response.data || []);
        } catch (error) {
            toast.error('Failed to load webhooks');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await webhookService.create(formData);
            setWebhooks([...webhooks, response.data]);
            setShowForm(false);
            setFormData({ url: '', events: ['order.created', 'stock.low'] });
            toast.success('Webhook created. Make sure to save your secret!');
            // Expand the new webhook to show the secret
            setExpandedWebhook(response.data.id);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create webhook');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this webhook?')) return;
        try {
            await webhookService.delete(id);
            setWebhooks(webhooks.filter(w => w.id !== id));
            toast.success('Webhook deleted');
        } catch (error) {
            toast.error('Failed to delete webhook');
        }
    };

    const handleToggleActive = async (webhook) => {
        try {
            const response = await webhookService.update(webhook.id, {
                is_active: !webhook.is_active
            });
            setWebhooks(webhooks.map(w => w.id === webhook.id ? response.data : w));
            toast.success(`Webhook ${!webhook.is_active ? 'enabled' : 'disabled'}`);
        } catch (error) {
            toast.error('Failed to update webhook');
        }
    };

    const handleTest = async (id) => {
        try {
            await webhookService.sendTest(id);
            toast.success('Test webhook sent');
        } catch (error) {
            toast.error('Failed to send test webhook');
        }
    };

    const handleRegenerateSecret = async (id) => {
        if (!window.confirm('Deleting the current secret will break existing integrations. Regenerate anyway?')) return;
        try {
            const response = await webhookService.regenerateSecret(id);
            setWebhooks(webhooks.map(w => w.id === id ? { ...w, secret: response.data.secret } : w));
            toast.success('Secret regenerated');
        } catch (error) {
            toast.error('Failed to regenerate secret');
        }
    };

    const fetchLogs = async (id) => {
        setLogsLoading(prev => ({ ...prev, [id]: true }));
        try {
            const response = await webhookService.getLogs(id);
            setLogs(prev => ({ ...prev, [id]: response.data }));
        } catch (error) {
            toast.error('Failed to load logs');
        } finally {
            setLogsLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    const toggleExpand = (id) => {
        if (expandedWebhook === id) {
            setExpandedWebhook(null);
        } else {
            setExpandedWebhook(id);
            if (!logs[id]) {
                fetchLogs(id);
            }
        }
    };

    const copyToClipboard = (text, message = 'Copied to clipboard') => {
        navigator.clipboard.writeText(text);
        toast.success(message);
    };

    if (loading) return <PageLoader type="list" />;

    return (
        <div className="webhook-manager">
            <header className="webhook-header">
                <div>
                    <h1>Webhook Notifications</h1>
                    <p>Receive real-time notifications for store events.</p>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    variant={showForm ? "outline" : "primary"}
                    className="add-webhook-btn"
                >
                    {showForm ? <XCircle size={20} /> : <Plus size={20} />}
                    {showForm ? "Cancel" : "Add Webhook"}
                </Button>
            </header>

            {showForm && (
                <Card className="webhook-form-card">
                    <form onSubmit={handleCreate}>
                        <h3>New Webhook Subscription</h3>
                        <div className="form-group">
                            <Input
                                label="Endpoint URL"
                                placeholder="https://your-api.com/webhooks"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                required
                                icon={<LinkIcon size={18} />}
                            />
                            <p className="field-help">Events will be sent as POST requests to this URL.</p>
                        </div>

                        <div className="form-group">
                            <label className="checkbox-label-group">Select Events</label>
                            <div className="checkbox-grid">
                                <label className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        checked={formData.events.includes('order.created')}
                                        onChange={(e) => {
                                            const newEvents = e.target.checked
                                                ? [...formData.events, 'order.created']
                                                : formData.events.filter(ev => ev !== 'order.created');
                                            setFormData({ ...formData, events: newEvents });
                                        }}
                                    />
                                    <span>New Orders (order.created)</span>
                                </label>
                                <label className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        checked={formData.events.includes('stock.low')}
                                        onChange={(e) => {
                                            const newEvents = e.target.checked
                                                ? [...formData.events, 'stock.low']
                                                : formData.events.filter(ev => ev !== 'stock.low');
                                            setFormData({ ...formData, events: newEvents });
                                        }}
                                    />
                                    <span>Low Stock (stock.low)</span>
                                </label>
                            </div>
                        </div>

                        <div className="form-actions">
                            <Button type="submit" variant="primary">Create Subscription</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="webhooks-list">
                {webhooks.length === 0 ? (
                    <div className="empty-state">
                        <Bell size={48} />
                        <h3>No webhooks configured</h3>
                        <p>Create a webhook to receive real-time notifications in your own applications.</p>
                        <Button onClick={() => setShowForm(true)} variant="outline">Create your first webhook</Button>
                    </div>
                ) : (
                    webhooks.map(webhook => (
                        <div key={webhook.id} className={`webhook-item-wrapper ${expandedWebhook === webhook.id ? 'expanded' : ''}`}>
                            <Card className="webhook-item">
                                <div className="webhook-main">
                                    <div className="webhook-status">
                                        <div className={`status-dot ${webhook.is_active ? 'active' : 'inactive'}`} />
                                    </div>
                                    <div className="webhook-info">
                                        <div className="webhook-url-row">
                                            <span className="webhook-url">{webhook.url}</span>
                                            {webhook.is_active ?
                                                <span className="badge success">Active</span> :
                                                <span className="badge secondary">Inactive</span>
                                            }
                                        </div>
                                        <div className="webhook-meta">
                                            <span>{webhook.events.join(', ')}</span>
                                            <span className="dot-separator">•</span>
                                            <span>Created {new Date(webhook.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="webhook-actions">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleTest(webhook.id)}
                                            title="Send Test"
                                        >
                                            <Send size={16} />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleToggleActive(webhook)}
                                            title={webhook.is_active ? "Disable" : "Enable"}
                                        >
                                            {webhook.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-danger"
                                            onClick={() => handleDelete(webhook.id)}
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => toggleExpand(webhook.id)}
                                            title="Details"
                                        >
                                            {expandedWebhook === webhook.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </Button>
                                    </div>
                                </div>

                                {expandedWebhook === webhook.id && (
                                    <div className="webhook-details">
                                        <div className="details-section">
                                            <div className="section-header">
                                                <Shield size={16} />
                                                <h4>Security</h4>
                                            </div>
                                            <div className="secret-box">
                                                <p className="secret-label">Webhook Secret (HMAC signature key)</p>
                                                <div className="secret-value-row">
                                                    <code>{webhook.secret || '••••••••••••••••••••••••••••••••'}</code>
                                                    <div className="secret-actions">
                                                        {webhook.secret && (
                                                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(webhook.secret, 'Secret copied!')}>
                                                                <Copy size={16} />
                                                            </Button>
                                                        )}
                                                        <Button size="sm" variant="ghost" onClick={() => handleRegenerateSecret(webhook.id)}>
                                                            <RefreshCw size={16} />
                                                        </Button>
                                                    </div>
                                                </div>
                                                {!webhook.secret && <p className="secret-warning">Secret is only shown once during creation for security. Regenerate if lost.</p>}
                                            </div>
                                        </div>

                                        <div className="details-section">
                                            <div className="section-header">
                                                <Activity size={16} />
                                                <h4>Recent Deliveries</h4>
                                                <Button size="xs" variant="ghost" className="refresh-logs" onClick={() => fetchLogs(webhook.id)}>
                                                    <RefreshCw size={14} className={logsLoading[webhook.id] ? 'spin' : ''} />
                                                </Button>
                                            </div>

                                            <div className="logs-list">
                                                {logsLoading[webhook.id] ? (
                                                    <div className="logs-loading">Loading logs...</div>
                                                ) : logs[webhook.id]?.length > 0 ? (
                                                    logs[webhook.id].map(log => (
                                                        <div key={log.id} className="log-item">
                                                            <div className="log-status">
                                                                {log.status_code >= 200 && log.status_code < 300 ?
                                                                    <CheckCircle size={14} className="text-success" /> :
                                                                    <XCircle size={14} className="text-danger" />
                                                                }
                                                                <span className={log.status_code >= 200 && log.status_code < 300 ? 'text-success' : 'text-danger'}>
                                                                    {log.status_code || 'Err'}
                                                                </span>
                                                            </div>
                                                            <div className="log-event">{log.event}</div>
                                                            <div className="log-time">{new Date(log.created_at).toLocaleTimeString()}</div>
                                                            {log.response && <div className="log-error" title={log.response}>{log.response}</div>}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="no-logs">No delivery history yet.</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default WebhookManager;
