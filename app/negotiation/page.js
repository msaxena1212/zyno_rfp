'use client';
import { useState, useEffect } from 'react';

import { useToast } from '@/components/Toast';

export default function NegotiationPage() {
    const toast = useToast();
    const handleAction = (action) => toast.info(action + ' feature coming soon');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        fetch('/api/negotiation').then(r => r.json()).then(d => { setData(d.data || d); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
    const items = Array.isArray(data) ? data : [];

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left"><h1>Online Negotiation</h1><p className="page-header-subtitle">AI-assisted negotiation with BATNA analysis and counter-offer suggestions</p></div>
                <div className="page-header-actions"><button className="btn btn-primary" onClick={() => handleAction('+ Start Negotiation')}>+ Start Negotiation</button></div>
            </div>

            <div className="ai-insights-section">
                <div className="ai-insight-card">
                    <div className="ai-insight-icon">🤝</div>
                    <div className="ai-insight-content">
                        <div className="ai-insight-header"><span className="ai-insight-title">BATNA Analysis</span><span className="ai-insight-badge">AI</span></div>
                        <p className="ai-insight-message">For NEG-00001 (Steel rate), your BATNA is ₹11,200/MT (alternative: ChemFlow). AI suggests counter-offering ₹11,000/MT — 83% probability of acceptance based on market rates.</p>
                    </div>
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Total</div><div className="stat-card-value">{items.length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">In Progress</div><div className="stat-card-value">{items.filter(n => n.status === 'In Progress').length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Pending</div><div className="stat-card-value">{items.filter(n => n.status === 'Pending Response').length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Completed</div><div className="stat-card-value">{items.filter(n => n.status === 'Completed').length}</div></div></div>
            </div>

            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead><tr><th>Neg #</th><th>Title</th><th>Vendor</th><th>Rounds</th><th>Current Offer</th><th>Target</th><th>Gap</th><th>Status</th></tr></thead>
                    <tbody>
                        {items.map(neg => {
                            const gap = neg.currentOffer && neg.targetPrice ? ((neg.currentOffer - neg.targetPrice) / neg.targetPrice * 100).toFixed(1) : 0;
                            return (
                                <tr key={neg.id} className="clickable" onClick={() => setSelected(neg)}>
                                    <td><span className="data-table-id">{neg.id}</span></td>
                                    <td className="truncate" style={{ maxWidth: 200 }}>{neg.title}</td>
                                    <td style={{ fontWeight: 500 }}>{neg.vendor}</td>
                                    <td>{neg.rounds}</td>
                                    <td style={{ fontWeight: 600 }}>₹{(neg.currentOffer || 0).toLocaleString('en-IN')} {neg.unit}</td>
                                    <td>₹{(neg.targetPrice || 0).toLocaleString('en-IN')} {neg.unit}</td>
                                    <td><span className={`tag ${gap <= 5 ? 'tag-green' : gap <= 10 ? 'tag-orange' : 'tag-red'}`}>{gap}% gap</span></td>
                                    <td><span className={`badge badge-${neg.status === 'In Progress' ? 'in-progress' : neg.status === 'Completed' ? 'completed' : 'pending'}`}><span className="badge-dot"></span>{neg.status}</span></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {selected && (
                <>
                    <div className="detail-panel-overlay" onClick={() => setSelected(null)}></div>
                    <div className="detail-panel">
                        <div className="detail-panel-header"><h2>{selected.id}</h2><button className="modal-close" onClick={() => setSelected(null)}>×</button></div>
                        <div className="detail-panel-body">
                            <div className="detail-section">
                                <div className="detail-section-title">Negotiation Details</div>
                                <div className="detail-field"><span className="detail-field-label">Title</span><span className="detail-field-value">{selected.title}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Vendor</span><span className="detail-field-value">{selected.vendor}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Rounds</span><span className="detail-field-value">{selected.rounds}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Current Offer</span><span className="detail-field-value" style={{ fontWeight: 700 }}>₹{(selected.currentOffer || 0).toLocaleString('en-IN')} {selected.unit}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Target Price</span><span className="detail-field-value" style={{ fontWeight: 700, color: '#10B981' }}>₹{(selected.targetPrice || 0).toLocaleString('en-IN')} {selected.unit}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Start Date</span><span className="detail-field-value">{selected.startDate}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Last Activity</span><span className="detail-field-value">{selected.lastActivity}</span></div>
                            </div>
                            <div className="detail-section">
                                <div className="detail-section-title">AI Counter-Offer Suggestion</div>
                                <div className="ai-insight-card" style={{ marginBottom: 0 }}>
                                    <div className="ai-insight-icon">💰</div>
                                    <div className="ai-insight-content"><p className="ai-insight-message">Based on market analysis, counter-offer ₹{Math.round((selected.targetPrice + selected.currentOffer) / 2).toLocaleString('en-IN')} {selected.unit} (midpoint). Probability of acceptance: {selected.rounds >= 3 ? '78%' : '65%'}. Alternative vendors available at ₹{Math.round(selected.currentOffer * 0.97).toLocaleString('en-IN')} {selected.unit}.</p></div>
                                </div>
                            </div>
                        </div>
                        <div className="detail-panel-footer" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}><button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>{selected.status === 'In Progress' && <button className="btn btn-primary" onClick={() => handleAction('💬 Send Counter-Offer')}>💬 Send Counter-Offer</button>}</div>
                    </div>
                </>
            )}
        </div>
    );
}
