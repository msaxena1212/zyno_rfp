'use client';
import { useState, useEffect } from 'react';

import { useToast } from '@/components/Toast';

export default function GRNPage() {
    const toast = useToast();
    const handleAction = (action) => toast.info(action + ' feature coming soon');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/grn').then(r => r.json()).then(d => { setData(d.data || d); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const filtered = (Array.isArray(data) ? data : []).filter(g => !search || JSON.stringify(g).toLowerCase().includes(search.toLowerCase()));

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left"><h1>Goods Receipt Note</h1><p className="page-header-subtitle">Inspect and verify received goods with AI quality predictions</p></div>
                <div className="page-header-actions"><button className="btn btn-primary" onClick={() => handleAction('+ New GRN')}>+ New GRN</button></div>
            </div>

            <div className="ai-insights-section">
                <div className="ai-insight-card warning">
                    <div className="ai-insight-icon">📊</div>
                    <div className="ai-insight-content">
                        <div className="ai-insight-header"><span className="ai-insight-title">Quality Prediction</span><span className="ai-insight-badge">AI</span></div>
                        <p className="ai-insight-message">Based on vendor history, GRN-00003 (MRO Spares Global) has a 13% chance of partial rejection. Recommend thorough inspection for bearings.</p>
                    </div>
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Total GRNs</div><div className="stat-card-value">{filtered.length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Accepted</div><div className="stat-card-value">{filtered.filter(g => g.status === 'Accepted').length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Pending Inspection</div><div className="stat-card-value">{filtered.filter(g => g.status === 'Pending Inspection').length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Rejected</div><div className="stat-card-value">{filtered.filter(g => g.status === 'Rejected').length}</div></div></div>
            </div>

            <div className="data-table-wrapper">
                <div className="data-table-toolbar">
                    <div className="data-table-toolbar-left"><div className="data-table-search"><span className="data-table-search-icon">⌕</span><input placeholder="Search GRNs..." value={search} onChange={e => setSearch(e.target.value)} /></div></div>
                </div>
                <table className="data-table">
                    <thead><tr><th>GRN #</th><th>PO Ref</th><th>Vendor</th><th>Date</th><th>Inspected By</th><th>Items</th><th>Status</th></tr></thead>
                    <tbody>
                        {filtered.map(g => (
                            <tr key={g.id} className="clickable" onClick={() => setSelected(g)}>
                                <td><span className="data-table-id">{g.id}</span></td>
                                <td>{g.poId}</td>
                                <td style={{ fontWeight: 500 }}>{g.vendor}</td>
                                <td>{g.date}</td>
                                <td>{g.inspectedBy || '—'}</td>
                                <td>{(g.items || []).length} items</td>
                                <td><span className={`badge badge-${g.status === 'Accepted' ? 'approved' : g.status === 'Rejected' ? 'rejected' : g.status === 'Pending Inspection' ? 'pending' : 'review'}`}><span className="badge-dot"></span>{g.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selected && (
                <>
                    <div className="detail-panel-overlay" onClick={() => setSelected(null)}></div>
                    <div className="detail-panel">
                        <div className="detail-panel-header"><h2>{selected.id} — GRN</h2><button className="modal-close" onClick={() => setSelected(null)}>×</button></div>
                        <div className="detail-panel-body">
                            <div className="detail-section">
                                <div className="detail-section-title">Receipt Details</div>
                                <div className="detail-field"><span className="detail-field-label">PO Reference</span><span className="detail-field-value">{selected.poId}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Vendor</span><span className="detail-field-value">{selected.vendor}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Date</span><span className="detail-field-value">{selected.date}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Inspected By</span><span className="detail-field-value">{selected.inspectedBy || 'Pending'}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Status</span><span className="detail-field-value"><span className={`badge badge-${selected.status === 'Accepted' ? 'approved' : 'pending'}`}><span className="badge-dot"></span>{selected.status}</span></span></div>
                            </div>
                            <div className="detail-section">
                                <div className="detail-section-title">Received Items</div>
                                <table className="data-table"><thead><tr><th>Item</th><th>Ordered</th><th>Received</th><th>Accepted</th><th>Status</th></tr></thead>
                                    <tbody>{(selected.items || []).map((item, i) => (<tr key={i}><td>{item.name}</td><td>{item.orderedQty}</td><td>{item.receivedQty}</td><td>{item.acceptedQty}</td><td><span className={`badge badge-${item.status === 'Accepted' ? 'approved' : item.status === 'Partial' ? 'partial' : 'pending'}`}><span className="badge-dot"></span>{item.status}</span></td></tr>))}</tbody>
                                </table>
                            </div>
                        </div>
                        <div className="detail-panel-footer" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}><button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>{selected.status === 'Rejected' && <button className="btn btn-danger" onClick={() => handleAction('🔄 Initiate Return')}>🔄 Initiate Return</button>}</div>
                    </div>
                </>
            )}
        </div>
    );
}
