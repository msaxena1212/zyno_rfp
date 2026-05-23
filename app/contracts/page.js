'use client';
import { useState, useEffect } from 'react';

import { useToast } from '@/components/Toast';

export default function ContractsPage() {
    const toast = useToast();
    const handleAction = (action) => toast.info(action + ' feature coming soon');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        fetch('/api/contracts').then(r => r.json()).then(d => { setData(d.data || d); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const items = (Array.isArray(data) ? data : []).filter(c => !search || JSON.stringify(c).toLowerCase().includes(search.toLowerCase()));

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left"><h1>Contract Management</h1><p className="page-header-subtitle">AI-powered contract risk analysis and renewal tracking</p></div>
                <div className="page-header-actions"><button className="btn btn-primary" onClick={() => handleAction('+ New Contract')}>+ New Contract</button></div>
            </div>

            <div className="ai-insights-section">
                <div className="ai-insight-card warning">
                    <div className="ai-insight-icon">📄</div>
                    <div className="ai-insight-content">
                        <div className="ai-insight-header"><span className="ai-insight-title">Contract Renewal Alert</span><span className="ai-insight-badge">AI</span></div>
                        <p className="ai-insight-message">CON-00004 (Safety Equipment AMC) has expired and needs renewal. CON-00001 and CON-00002 expire within 2 months — renewal process should begin now to avoid supply disruption.</p>
                    </div>
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Total Contracts</div><div className="stat-card-value">{items.length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Active</div><div className="stat-card-value">{items.filter(c => c.status === 'Active').length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Expired</div><div className="stat-card-value">{items.filter(c => c.status === 'Expired').length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Total Value</div><div className="stat-card-value">₹{(items.reduce((s, c) => s + (c.value || 0), 0) / 10000000).toFixed(1)}Cr</div></div></div>
            </div>

            <div className="data-table-wrapper">
                <div className="data-table-toolbar"><div className="data-table-toolbar-left"><div className="data-table-search"><span className="data-table-search-icon">⌕</span><input placeholder="Search contracts..." value={search} onChange={e => setSearch(e.target.value)} /></div></div></div>
                <table className="data-table">
                    <thead><tr><th>Contract #</th><th>Title</th><th>Vendor</th><th>Start</th><th>End</th><th>Value</th><th>Auto-Renew</th><th>Status</th></tr></thead>
                    <tbody>
                        {items.map(con => {
                            const daysLeft = Math.ceil((new Date(con.endDate) - new Date()) / (1000 * 60 * 60 * 24));
                            return (
                                <tr key={con.id} className="clickable" onClick={() => setSelected(con)}>
                                    <td><span className="data-table-id">{con.contractNumber}</span></td>
                                    <td className="truncate" style={{ maxWidth: 220 }}>{con.title}</td>
                                    <td style={{ fontWeight: 500 }}>{con.vendor}</td>
                                    <td>{con.startDate}</td>
                                    <td>
                                        <div>{con.endDate}</div>
                                        {daysLeft > 0 && daysLeft < 90 && <span className="text-xs" style={{ color: '#F59E0B' }}>({daysLeft}d left)</span>}
                                        {daysLeft <= 0 && <span className="text-xs" style={{ color: '#EF4444' }}>(Expired)</span>}
                                    </td>
                                    <td style={{ fontWeight: 600 }}>₹{((con.value || 0) / 100000).toFixed(0)}L</td>
                                    <td>{con.autoRenewal ? <span className="tag tag-green">Yes</span> : <span className="tag tag-orange">No</span>}</td>
                                    <td><span className={`badge badge-${con.status === 'Active' ? 'active' : 'rejected'}`}><span className="badge-dot"></span>{con.status}</span></td>
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
                        <div className="detail-panel-header"><h2>{selected.contractNumber}</h2><button className="modal-close" onClick={() => setSelected(null)}>×</button></div>
                        <div className="detail-panel-body">
                            <div className="detail-section">
                                <div className="detail-section-title">Contract Details</div>
                                <div className="detail-field"><span className="detail-field-label">Title</span><span className="detail-field-value">{selected.title}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Vendor</span><span className="detail-field-value">{selected.vendor}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Category</span><span className="detail-field-value">{selected.category}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Value</span><span className="detail-field-value" style={{ fontWeight: 700 }}>₹{((selected.value || 0) / 100000).toFixed(0)}L</span></div>
                                <div className="detail-field"><span className="detail-field-label">Period</span><span className="detail-field-value">{selected.startDate} → {selected.endDate}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Auto Renewal</span><span className="detail-field-value">{selected.autoRenewal ? 'Yes' : 'No'}</span></div>
                            </div>
                            <div className="detail-section">
                                <div className="detail-section-title">AI Risk Analysis</div>
                                <div className="ai-insight-card" style={{ marginBottom: 0 }}>
                                    <div className="ai-insight-icon">🛡️</div>
                                    <div className="ai-insight-content"><p className="ai-insight-message">{selected.status === 'Active' ? `Risk Level: ${Math.ceil((new Date(selected.endDate) - new Date()) / (1000 * 60 * 60 * 24)) < 90 ? 'Medium — contract expiring soon.' : 'Low — contract is within validity.'} ${!selected.autoRenewal ? 'Manual renewal required — plan ahead.' : 'Auto-renewal is enabled.'}` : 'Contract has expired. Immediate action needed for renewal or alternative sourcing.'}</p></div>
                                </div>
                            </div>
                        </div>
                        <div className="detail-panel-footer" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}><button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>{selected.status === 'Expired' && <button className="btn btn-primary" onClick={() => handleAction('🔄 Initiate Renewal')}>🔄 Initiate Renewal</button>}</div>
                    </div>
                </>
            )}
        </div>
    );
}
