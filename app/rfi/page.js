'use client';
import { useState, useEffect } from 'react';

import { useToast } from '@/components/Toast';

export default function RFIPage() {
    const toast = useToast();
    const handleAction = (action) => toast.info(action + ' feature coming soon');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        fetch('/api/rfi').then(r => r.json()).then(d => { setData(d.data || d); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const filtered = (Array.isArray(data) ? data : []).filter(i => !search || JSON.stringify(i).toLowerCase().includes(search.toLowerCase()));

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left"><h1>Request for Information</h1><p className="page-header-subtitle">Send inquiries to vendors with AI-recommended supplier matching</p></div>
                <div className="page-header-actions"><button className="btn btn-primary" onClick={() => handleAction('+ New RFI')}>+ New RFI</button></div>
            </div>

            <div className="ai-insights-section">
                <div className="ai-insight-card">
                    <div className="ai-insight-icon">🔍</div>
                    <div className="ai-insight-content">
                        <div className="ai-insight-header"><span className="ai-insight-title">Vendor Recommendation</span><span className="ai-insight-badge">AI</span></div>
                        <p className="ai-insight-message">For RFI-00003 (aluminum alloy), AI suggests adding Stallion Steel Corp as they have a 91% on-time delivery rate for raw materials and competitive pricing history.</p>
                    </div>
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Total RFIs</div><div className="stat-card-value">{filtered.length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Open</div><div className="stat-card-value">{filtered.filter(r => r.status === 'Open').length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Responses</div><div className="stat-card-value">{filtered.reduce((s, r) => s + (r.responses || 0), 0)}</div></div></div>
            </div>

            <div className="data-table-wrapper">
                <div className="data-table-toolbar"><div className="data-table-toolbar-left"><div className="data-table-search"><span className="data-table-search-icon">⌕</span><input placeholder="Search RFIs..." value={search} onChange={e => setSearch(e.target.value)} /></div></div></div>
                <table className="data-table">
                    <thead><tr><th>RFI #</th><th>Title</th><th>Category</th><th>Date</th><th>Due Date</th><th>Sent To</th><th>Responses</th><th>Status</th></tr></thead>
                    <tbody>
                        {filtered.map(rfi => (
                            <tr key={rfi.id} className="clickable" onClick={() => setSelected(rfi)}>
                                <td><span className="data-table-id">{rfi.id}</span></td>
                                <td className="truncate" style={{ maxWidth: 250 }}>{rfi.title}</td>
                                <td><span className="tag tag-blue">{rfi.category}</span></td>
                                <td>{rfi.date}</td>
                                <td>{rfi.dueDate}</td>
                                <td>{(rfi.sentTo || []).length} vendors</td>
                                <td style={{ fontWeight: 600 }}>{rfi.responses}</td>
                                <td><span className={`badge badge-${rfi.status === 'Open' ? 'open' : 'closed'}`}><span className="badge-dot"></span>{rfi.status}</span></td>
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
                                <div className="detail-section-title">RFI Details</div>
                                <div className="detail-field"><span className="detail-field-label">Title</span><span className="detail-field-value">{selected.title}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Category</span><span className="detail-field-value">{selected.category}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Date</span><span className="detail-field-value">{selected.date}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Due Date</span><span className="detail-field-value">{selected.dueDate}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Status</span><span className="detail-field-value"><span className={`badge badge-${selected.status === 'Open' ? 'open' : 'closed'}`}><span className="badge-dot"></span>{selected.status}</span></span></div>
                                <div className="detail-field"><span className="detail-field-label">Responses</span><span className="detail-field-value">{selected.responses}</span></div>
                            </div>
                        </div>
                        <div className="detail-panel-footer" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}><button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>{selected.status === 'Open' && <button className="btn btn-primary" onClick={() => handleAction('📤 Send Reminder')}>📤 Send Reminder</button>}</div>
                    </div>
                </>
            )}
        </div>
    );
}
