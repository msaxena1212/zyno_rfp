'use client';
import { useState, useEffect } from 'react';

import { useToast } from '@/components/Toast';

export default function ReverseShippingPage() {
    const toast = useToast();
    const handleAction = (action) => toast.info(action + ' feature coming soon');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        fetch('/api/reverse-shipping').then(r => r.json()).then(d => { setData(d.data || d); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const items = Array.isArray(data) ? data : [];

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left"><h1>Reverse Shipping</h1><p className="page-header-subtitle">Manage returns for GRN-rejected items with AI logistics optimization</p></div>
                <div className="page-header-actions"><button className="btn btn-primary" onClick={() => handleAction('+ New Return')}>+ New Return</button></div>
            </div>

            <div className="ai-insights-section">
                <div className="ai-insight-card warning">
                    <div className="ai-insight-icon">🚛</div>
                    <div className="ai-insight-content">
                        <div className="ai-insight-header"><span className="ai-insight-title">Shipping Optimization</span><span className="ai-insight-badge">AI</span></div>
                        <p className="ai-insight-message">RS-00001 and RS-00003 are both returning items to Mumbai-area vendors. AI suggests combining shipments on Feb 25th to save ₹8,500 in logistics costs.</p>
                    </div>
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Total Returns</div><div className="stat-card-value">{items.length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">In Transit</div><div className="stat-card-value">{items.filter(r => r.status === 'In Transit').length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Returned</div><div className="stat-card-value">{items.filter(r => r.status === 'Returned').length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Credit Pending</div><div className="stat-card-value">₹{(items.filter(r => r.creditStatus !== 'Credited').reduce((s, r) => s + (r.creditAmount || 0), 0) / 100000).toFixed(1)}L</div></div></div>
            </div>

            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead><tr><th>Return #</th><th>GRN Ref</th><th>Vendor</th><th>Reason</th><th>Qty</th><th>Credit Amount</th><th>Pickup Date</th><th>Status</th></tr></thead>
                    <tbody>
                        {items.map(rs => (
                            <tr key={rs.id} className="clickable" onClick={() => setSelected(rs)}>
                                <td><span className="data-table-id">{rs.id}</span></td>
                                <td>{rs.grnId}</td>
                                <td style={{ fontWeight: 500 }}>{rs.vendor}</td>
                                <td><span className="tag tag-orange">{rs.reason}</span></td>
                                <td>{rs.qty} {rs.unit}</td>
                                <td style={{ fontWeight: 600 }}>₹{(rs.creditAmount || 0).toLocaleString('en-IN')}</td>
                                <td>{rs.pickupDate || '—'}</td>
                                <td><span className={`badge badge-${rs.status === 'Returned' ? 'completed' : rs.status === 'In Transit' ? 'in-progress' : 'pending'}`}><span className="badge-dot"></span>{rs.status}</span></td>
                            </tr>
                        ))}
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
                                <div className="detail-section-title">Return Details</div>
                                <div className="detail-field"><span className="detail-field-label">GRN Reference</span><span className="detail-field-value">{selected.grnId}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Vendor</span><span className="detail-field-value">{selected.vendor}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Item</span><span className="detail-field-value">{selected.itemName}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Reason</span><span className="detail-field-value">{selected.reason}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Quantity</span><span className="detail-field-value">{selected.qty} {selected.unit}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Credit Amount</span><span className="detail-field-value" style={{ fontWeight: 700 }}>₹{(selected.creditAmount || 0).toLocaleString('en-IN')}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Credit Status</span><span className="detail-field-value"><span className={`badge badge-${selected.creditStatus === 'Credited' ? 'approved' : 'pending'}`}><span className="badge-dot"></span>{selected.creditStatus}</span></span></div>
                            </div>
                        </div>
                        <div className="detail-panel-footer" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}><button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button></div>
                    </div>
                </>
            )}
        </div>
    );
}
