'use client';
import { useState, useEffect } from 'react';

import { useToast } from '@/components/Toast';

export default function AccountsPayablePage() {
    const toast = useToast();
    const handleAction = (action) => toast.info(action + ' feature coming soon');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        fetch('/api/accounts-payable').then(r => r.json()).then(d => { setData(d.data || d); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const items = (Array.isArray(data) ? data : []).filter(i => !search || JSON.stringify(i).toLowerCase().includes(search.toLowerCase()));
    const totalPayable = items.reduce((s, i) => s + (i.amount || 0), 0);
    const overdue = items.filter(i => i.status === 'Overdue');

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left"><h1>Accounts Payable</h1><p className="page-header-subtitle">AI-optimized payment scheduling and early payment discount detection</p></div>
                <div className="page-header-actions"><button className="btn btn-secondary" onClick={() => handleAction('Export CSV')}>Export CSV</button><button className="btn btn-primary" onClick={() => handleAction('+ Record Payment')}>+ Record Payment</button></div>
            </div>

            <div className="ai-insights-section">
                <div className="ai-insight-card success">
                    <div className="ai-insight-icon">💎</div>
                    <div className="ai-insight-content">
                        <div className="ai-insight-header"><span className="ai-insight-title">Early Payment Discount</span><span className="ai-insight-badge">AI</span></div>
                        <p className="ai-insight-message">Pay AP-00002 (₹15.7L to Stallion Steel) within 5 days to avail 2% early payment discount — save ₹31,400. Current cash flow supports early payment.</p>
                        <div className="ai-insight-actions"><button className="btn btn-sm btn-success">Apply Discount</button></div>
                    </div>
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Total Payables</div><div className="stat-card-value">{items.length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Overdue</div><div className="stat-card-value">{overdue.length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Due This Week</div><div className="stat-card-value">{items.filter(i => i.status === 'Due Soon').length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Total Payable</div><div className="stat-card-value">₹{(totalPayable / 100000).toFixed(1)}L</div></div></div>
            </div>

            <div className="data-table-wrapper">
                <div className="data-table-toolbar"><div className="data-table-toolbar-left"><div className="data-table-search"><span className="data-table-search-icon">⌕</span><input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /></div></div></div>
                <table className="data-table">
                    <thead><tr><th>AP #</th><th>Invoice</th><th>Vendor</th><th>Due Date</th><th>Amount</th><th>Discount</th><th>Payment Mode</th><th>Status</th></tr></thead>
                    <tbody>
                        {items.map(ap => (
                            <tr key={ap.id} className="clickable" onClick={() => setSelected(ap)}>
                                <td><span className="data-table-id">{ap.id}</span></td>
                                <td>{ap.invoiceRef}</td>
                                <td style={{ fontWeight: 500 }}>{ap.vendor}</td>
                                <td style={{ color: ap.status === 'Overdue' ? '#EF4444' : 'inherit' }}>{ap.dueDate}</td>
                                <td style={{ fontWeight: 600 }}>₹{(ap.amount || 0).toLocaleString('en-IN')}</td>
                                <td>{ap.earlyPayDiscount ? <span className="tag tag-green">{ap.earlyPayDiscount}%</span> : '—'}</td>
                                <td>{ap.paymentMode || '—'}</td>
                                <td><span className={`badge badge-${ap.status === 'Paid' ? 'completed' : ap.status === 'Overdue' ? 'rejected' : ap.status === 'Due Soon' ? 'pending' : 'draft'}`}><span className="badge-dot"></span>{ap.status}</span></td>
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
                                <div className="detail-section-title">Payment Details</div>
                                <div className="detail-field"><span className="detail-field-label">Invoice</span><span className="detail-field-value">{selected.invoiceRef}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Vendor</span><span className="detail-field-value">{selected.vendor}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Amount</span><span className="detail-field-value" style={{ fontWeight: 700 }}>₹{(selected.amount || 0).toLocaleString('en-IN')}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Due Date</span><span className="detail-field-value">{selected.dueDate}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Payment Mode</span><span className="detail-field-value">{selected.paymentMode || 'Not set'}</span></div>
                                {selected.earlyPayDiscount && <div className="detail-field"><span className="detail-field-label">Early Pay Discount</span><span className="detail-field-value" style={{ color: '#10B981', fontWeight: 600 }}>{selected.earlyPayDiscount}% (Save ₹{Math.round(selected.amount * selected.earlyPayDiscount / 100).toLocaleString('en-IN')})</span></div>}
                            </div>
                        </div>
                        <div className="detail-panel-footer" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}><button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>{selected.status !== 'Paid' && <button className="btn btn-success" onClick={() => handleAction('💳 Process Payment')}>💳 Process Payment</button>}</div>
                    </div>
                </>
            )}
        </div>
    );
}
