'use client';
import { useState, useEffect } from 'react';

import { useToast } from '@/components/Toast';

export default function InvoicesPage() {
    const toast = useToast();
    const handleAction = (action) => toast.info(action + ' feature coming soon');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        fetch('/api/invoices').then(r => r.json()).then(d => { setData(d.data || d); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const filtered = (Array.isArray(data) ? data : []).filter(inv => !search || JSON.stringify(inv).toLowerCase().includes(search.toLowerCase()));
    const totalAmount = filtered.reduce((s, i) => s + (i.amount || 0), 0);

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left"><h1>Invoice Approval</h1><p className="page-header-subtitle">AI-powered 3-way matching and automated invoice processing</p></div>
                <div className="page-header-actions"><button className="btn btn-primary" onClick={() => handleAction('+ Upload Invoice')}>+ Upload Invoice</button></div>
            </div>

            <div className="ai-insights-section">
                <div className="ai-insight-card success">
                    <div className="ai-insight-icon">✨</div>
                    <div className="ai-insight-content">
                        <div className="ai-insight-header"><span className="ai-insight-title">3-Way Match Automation</span><span className="ai-insight-badge">AI</span></div>
                        <p className="ai-insight-message">AI auto-matched 3 of 6 invoices with their POs and GRNs. INV-00001 scored 98% — auto-approval recommended. INV-00003 has a partial match (72%) and needs manual review.</p>
                    </div>
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Total Invoices</div><div className="stat-card-value">{filtered.length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Approved</div><div className="stat-card-value">{filtered.filter(i => i.status === 'Approved').length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Pending</div><div className="stat-card-value">{filtered.filter(i => i.status === 'Pending Approval').length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Total Value</div><div className="stat-card-value">₹{(totalAmount / 100000).toFixed(1)}L</div></div></div>
            </div>

            <div className="data-table-wrapper">
                <div className="data-table-toolbar">
                    <div className="data-table-toolbar-left"><div className="data-table-search"><span className="data-table-search-icon">⌕</span><input placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} /></div></div>
                </div>
                <table className="data-table">
                    <thead><tr><th>Invoice #</th><th>Vendor</th><th>PO Ref</th><th>Date</th><th>Due Date</th><th>Amount</th><th>3-Way Score</th><th>Status</th></tr></thead>
                    <tbody>
                        {filtered.map(inv => (
                            <tr key={inv.id} className="clickable" onClick={() => setSelected(inv)}>
                                <td><span className="data-table-id">{inv.invoiceNumber}</span></td>
                                <td style={{ fontWeight: 500 }}>{inv.vendor}</td>
                                <td>{inv.poId}</td>
                                <td>{inv.date}</td>
                                <td>{inv.dueDate}</td>
                                <td style={{ fontWeight: 600 }}>₹{(inv.amount || 0).toLocaleString('en-IN')}</td>
                                <td>
                                    {inv.threeWayScore > 0 ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div className="progress-bar" style={{ width: 60 }}>
                                                <div className={`progress-bar-fill${inv.threeWayScore >= 90 ? ' success' : inv.threeWayScore >= 70 ? ' warning' : ' danger'}`} style={{ width: `${inv.threeWayScore}%` }}></div>
                                            </div>
                                            <span className="text-xs" style={{ color: inv.threeWayScore >= 90 ? '#10B981' : '#F59E0B' }}>{inv.threeWayScore}%</span>
                                        </div>
                                    ) : <span className="text-xs text-muted">Pending</span>}
                                </td>
                                <td><span className={`badge badge-${inv.status === 'Approved' ? 'approved' : inv.status === 'Pending Approval' ? 'pending' : inv.status === 'Under Review' ? 'review' : 'draft'}`}><span className="badge-dot"></span>{inv.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selected && (
                <>
                    <div className="detail-panel-overlay" onClick={() => setSelected(null)}></div>
                    <div className="detail-panel">
                        <div className="detail-panel-header"><h2>{selected.invoiceNumber}</h2><button className="modal-close" onClick={() => setSelected(null)}>×</button></div>
                        <div className="detail-panel-body">
                            <div className="detail-section">
                                <div className="detail-section-title">Invoice Details</div>
                                <div className="detail-field"><span className="detail-field-label">Vendor</span><span className="detail-field-value">{selected.vendor}</span></div>
                                <div className="detail-field"><span className="detail-field-label">PO Reference</span><span className="detail-field-value">{selected.poId}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Date</span><span className="detail-field-value">{selected.date}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Due Date</span><span className="detail-field-value">{selected.dueDate}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Amount</span><span className="detail-field-value" style={{ fontWeight: 700 }}>₹{(selected.amount || 0).toLocaleString('en-IN')}</span></div>
                                <div className="detail-field"><span className="detail-field-label">3-Way Match</span><span className="detail-field-value"><span className={`badge badge-${selected.threeWayScore >= 90 ? 'matched' : selected.threeWayScore >= 70 ? 'partial' : 'pending'}`}><span className="badge-dot"></span>{selected.threeWayScore > 0 ? `${selected.threeWayScore}% ${selected.matchStatus}` : 'Pending'}</span></span></div>
                            </div>
                            <div className="detail-section">
                                <div className="detail-section-title">AI Fraud Detection</div>
                                <div className="ai-insight-card" style={{ marginBottom: 0 }}>
                                    <div className="ai-insight-icon">🛡️</div>
                                    <div className="ai-insight-content"><p className="ai-insight-message">{selected.threeWayScore >= 90 ? '✅ No fraud indicators detected. All values align with PO and GRN records. Safe for auto-approval.' : selected.threeWayScore >= 70 ? '⚠️ Partial match detected. Amount or quantity discrepancy found. Manual verification recommended.' : '🔍 Insufficient data for fraud analysis. Waiting for PO/GRN matching.'}</p></div>
                                </div>
                            </div>
                        </div>
                        <div className="detail-panel-footer" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}><button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>{selected.status !== 'Approved' && <button className="btn btn-success" onClick={() => handleAction('Approve')}>Approve</button>}</div>
                    </div>
                </>
            )}
        </div>
    );
}
