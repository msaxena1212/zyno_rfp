'use client';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/Toast';
import { updateItem } from '@/lib/api';

export default function ApprovalsPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const toast = useToast();

    const fetchData = useCallback(() => {
        fetch('/api/approvals').then(r => r.json()).then(d => { setData(d.data || d); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const items = Array.isArray(data) ? data : [];
    const pending = items.filter(a => a.status === 'Pending');

    const handleAction = async (approval, newStatus) => {
        try {
            await updateItem('approvals', approval.id, { status: newStatus });
            toast.success(`${approval.id} ${newStatus.toLowerCase()}`);
            setSelected(null);
            fetchData();
        } catch (e) { toast.error('Failed to update approval'); }
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left"><h1>Approval Workflows</h1><p className="page-header-subtitle">Route and monitor procurement approvals with SLA tracking</p></div>
            </div>

            <div className="stats-row">
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Total</div><div className="stat-card-value">{items.length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Pending</div><div className="stat-card-value" style={{ color: '#F59E0B' }}>{pending.length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Approved</div><div className="stat-card-value" style={{ color: '#10B981' }}>{items.filter(a => a.status === 'Approved').length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Rejected</div><div className="stat-card-value" style={{ color: '#EF4444' }}>{items.filter(a => a.status === 'Rejected').length}</div></div></div>
            </div>

            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead><tr><th>Approval #</th><th>Document</th><th>Type</th><th>Requester</th><th>Amount</th><th>Approver</th><th>Submitted</th><th>SLA</th><th>Status</th></tr></thead>
                    <tbody>
                        {items.map(apr => (
                            <tr key={apr.id} className="clickable" onClick={() => setSelected(apr)}>
                                <td><span className="data-table-id">{apr.id}</span></td>
                                <td>{apr.documentId}</td>
                                <td><span className="tag tag-blue">{apr.type}</span></td>
                                <td>{apr.requester}</td>
                                <td style={{ fontWeight: 600 }}>₹{((apr.amount || 0) / 100000).toFixed(1)}L</td>
                                <td>{apr.approver}</td>
                                <td>{apr.submittedDate}</td>
                                <td>
                                    {apr.status === 'Pending' && (
                                        <span className={`tag ${apr.slaDays <= 1 ? 'tag-red' : 'tag-green'}`}>
                                            {apr.slaDays}d remaining
                                        </span>
                                    )}
                                    {apr.status !== 'Pending' && <span className="text-sm text-muted">—</span>}
                                </td>
                                <td><span className={`badge badge-${apr.status === 'Approved' ? 'approved' : apr.status === 'Rejected' ? 'rejected' : 'pending'}`}><span className="badge-dot"></span>{apr.status}</span></td>
                            </tr>
                        ))}
                        {items.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No approvals found</td></tr>}
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
                                <div className="detail-section-title">Approval Details</div>
                                <div className="detail-field"><span className="detail-field-label">Document</span><span className="detail-field-value">{selected.documentId}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Type</span><span className="detail-field-value">{selected.type}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Requester</span><span className="detail-field-value">{selected.requester}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Amount</span><span className="detail-field-value" style={{ fontWeight: 700 }}>₹{((selected.amount || 0)).toLocaleString('en-IN')}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Approver</span><span className="detail-field-value">{selected.approver}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Status</span><span className="detail-field-value"><span className={`badge badge-${selected.status === 'Approved' ? 'approved' : selected.status === 'Rejected' ? 'rejected' : 'pending'}`}><span className="badge-dot"></span>{selected.status}</span></span></div>
                            </div>
                            <div className="detail-section">
                                <div className="detail-section-title">Workflow Steps</div>
                                <div className="timeline">
                                    {(selected.steps || []).map((step, i) => (
                                        <div className="timeline-item" key={i}>
                                            <div className={`timeline-dot${step.completed ? ' success' : step.current ? ' active' : ''}`}></div>
                                            <div className="timeline-content">
                                                <div className="timeline-title">{step.name} — {step.approver}</div>
                                                <div className="timeline-meta">{step.completed ? `Completed ${step.completedDate}` : step.current ? 'Awaiting action' : 'Upcoming'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="detail-panel-footer" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
                            {selected.status === 'Pending' && (
                                <>
                                    <button className="btn btn-danger" onClick={() => handleAction(selected, 'Rejected')}>Reject</button>
                                    <button className="btn btn-success" onClick={() => handleAction(selected, 'Approved')}>Approve</button>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
