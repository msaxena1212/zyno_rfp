'use client';
import { useState, useEffect } from 'react';

import { useToast } from '@/components/Toast';

export default function CompliancePage() {
    const toast = useToast();
    const handleAction = (action) => toast.info(action + ' feature coming soon');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/compliance').then(r => r.json()).then(d => { setData(d.data || d); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const items = Array.isArray(data) ? data : [];

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left"><h1>Compliance & Audit Trail</h1><p className="page-header-subtitle">Complete audit log with AI anomaly detection and compliance monitoring</p></div>
                <div className="page-header-actions"><button className="btn btn-secondary" onClick={() => handleAction('Export Audit Log')}>Export Audit Log</button></div>
            </div>

            <div className="ai-insights-section">
                <div className="ai-insight-card danger">
                    <div className="ai-insight-icon">🛡️</div>
                    <div className="ai-insight-content">
                        <div className="ai-insight-header"><span className="ai-insight-title">Compliance Alert</span><span className="ai-insight-badge">AI</span></div>
                        <p className="ai-insight-message">AI detected an unusual pattern: 3 POs over ₹10L were approved without competitive bidding in the last 7 days. This may violate procurement policy PP-2024-04. Recommend audit review.</p>
                    </div>
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Audit Events</div><div className="stat-card-value">{items.length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Violations</div><div className="stat-card-value">{items.filter(i => i.severity === 'High').length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Compliant</div><div className="stat-card-value">{items.filter(i => i.type === 'Compliance Check' && i.result === 'Pass').length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Under Review</div><div className="stat-card-value">{items.filter(i => i.status === 'Under Review').length}</div></div></div>
            </div>

            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead><tr><th>Event #</th><th>Timestamp</th><th>User</th><th>Action</th><th>Module</th><th>Document</th><th>Severity</th><th>Status</th></tr></thead>
                    <tbody>
                        {items.map(event => (
                            <tr key={event.id}>
                                <td><span className="data-table-id">{event.id}</span></td>
                                <td className="text-sm">{event.timestamp}</td>
                                <td>{event.user}</td>
                                <td>{event.action}</td>
                                <td><span className="tag tag-blue">{event.module}</span></td>
                                <td>{event.documentId || '—'}</td>
                                <td><span className={`badge badge-${event.severity === 'High' ? 'critical' : event.severity === 'Medium' ? 'pending' : 'active'}`}><span className="badge-dot"></span>{event.severity}</span></td>
                                <td><span className={`badge badge-${event.status === 'Resolved' ? 'completed' : event.status === 'Under Review' ? 'review' : 'draft'}`}><span className="badge-dot"></span>{event.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
