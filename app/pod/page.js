'use client';
import { useState, useEffect } from 'react';

import { useToast } from '@/components/Toast';

export default function PODPage() {
    const toast = useToast();
    const handleAction = (action) => toast.info(action + ' feature coming soon');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        fetch('/api/pod').then(r => r.json()).then(d => { setData(d.data || d); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const items = Array.isArray(data) ? data : [];

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left"><h1>Proof of Delivery</h1><p className="page-header-subtitle">Track delivery confirmations and signatures with AI ETA predictions</p></div>
                <div className="page-header-actions"><button className="btn btn-primary" onClick={() => handleAction('+ Record POD')}>+ Record POD</button></div>
            </div>

            <div className="ai-insights-section">
                <div className="ai-insight-card">
                    <div className="ai-insight-icon">📍</div>
                    <div className="ai-insight-content">
                        <div className="ai-insight-header"><span className="ai-insight-title">Delivery ETA</span><span className="ai-insight-badge">AI</span></div>
                        <p className="ai-insight-message">POD-00002 is in transit. Based on carrier history and distance, AI predicts delivery by Feb 20th (85% confidence). No delays expected on current route.</p>
                    </div>
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Total PODs</div><div className="stat-card-value">{items.length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Delivered</div><div className="stat-card-value">{items.filter(p => p.status === 'Delivered').length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">In Transit</div><div className="stat-card-value">{items.filter(p => p.status === 'In Transit').length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Photo Attached</div><div className="stat-card-value">{items.filter(p => p.photoAttached).length}</div></div></div>
            </div>

            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead><tr><th>POD #</th><th>PO Ref</th><th>Vendor</th><th>Carrier</th><th>Dispatch</th><th>Delivery</th><th>Signature</th><th>Status</th></tr></thead>
                    <tbody>
                        {items.map(pod => (
                            <tr key={pod.id} className="clickable" onClick={() => setSelected(pod)}>
                                <td><span className="data-table-id">{pod.id}</span></td>
                                <td>{pod.poId}</td>
                                <td style={{ fontWeight: 500 }}>{pod.vendor}</td>
                                <td>{pod.carrier}</td>
                                <td>{pod.dispatchDate}</td>
                                <td>{pod.deliveryDate || 'In Transit'}</td>
                                <td>{pod.signedBy ? <span className="tag tag-green">{pod.signedBy}</span> : <span className="tag tag-orange">Pending</span>}</td>
                                <td><span className={`badge badge-${pod.status === 'Delivered' ? 'completed' : 'in-progress'}`}><span className="badge-dot"></span>{pod.status}</span></td>
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
                                <div className="detail-section-title">Delivery Details</div>
                                <div className="detail-field"><span className="detail-field-label">PO Ref</span><span className="detail-field-value">{selected.poId}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Vendor</span><span className="detail-field-value">{selected.vendor}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Carrier</span><span className="detail-field-value">{selected.carrier}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Tracking #</span><span className="detail-field-value">{selected.trackingNumber || '—'}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Dispatch Date</span><span className="detail-field-value">{selected.dispatchDate}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Delivery Date</span><span className="detail-field-value">{selected.deliveryDate || 'In Transit'}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Signed By</span><span className="detail-field-value">{selected.signedBy || 'Pending'}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Photo Attached</span><span className="detail-field-value">{selected.photoAttached ? '📸 Yes' : 'No'}</span></div>
                            </div>
                        </div>
                        <div className="detail-panel-footer" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}><button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>{!selected.signedBy && <button className="btn btn-primary" onClick={() => handleAction('✍️ Record Signature')}>✍️ Record Signature</button>}</div>
                    </div>
                </>
            )}
        </div>
    );
}
