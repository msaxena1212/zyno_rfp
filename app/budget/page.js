'use client';
import { useState, useEffect } from 'react';

import { useToast } from '@/components/Toast';

export default function BudgetPage() {
    const toast = useToast();
    const handleAction = (action) => toast.info(action + ' feature coming soon');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/budget').then(r => r.json()).then(d => { setData(d.data || d); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const items = Array.isArray(data) ? data : [];
    const totalBudget = items.reduce((s, b) => s + (b.allocated || 0), 0);
    const totalSpent = items.reduce((s, b) => s + (b.spent || 0), 0);

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left"><h1>Budget Management</h1><p className="page-header-subtitle">AI-powered spend forecasting and departmental budget tracking</p></div>
                <div className="page-header-actions"><button className="btn btn-primary" onClick={() => handleAction('+ Add Budget')}>+ Add Budget</button></div>
            </div>

            <div className="ai-insights-section">
                <div className="ai-insight-card warning">
                    <div className="ai-insight-icon">📈</div>
                    <div className="ai-insight-content">
                        <div className="ai-insight-header"><span className="ai-insight-title">Spend Forecast</span><span className="ai-insight-badge">AI</span></div>
                        <p className="ai-insight-message">Production department is trending 15% above Q1 budget pace. At current spend rate, budget will be exhausted by mid-March. Recommend reallocation from Admin (21% under-utilized).</p>
                    </div>
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Total Budget</div><div className="stat-card-value">₹{(totalBudget / 10000000).toFixed(1)}Cr</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Total Spent</div><div className="stat-card-value">₹{(totalSpent / 10000000).toFixed(1)}Cr</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Remaining</div><div className="stat-card-value">₹{((totalBudget - totalSpent) / 10000000).toFixed(1)}Cr</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Utilization</div><div className="stat-card-value">{totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%</div></div></div>
            </div>

            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead><tr><th>Dept</th><th>Category</th><th>Allocated</th><th>Spent</th><th>Remaining</th><th>Utilization</th><th>Period</th><th>Status</th></tr></thead>
                    <tbody>
                        {items.map(b => {
                            const util = b.allocated > 0 ? Math.round((b.spent / b.allocated) * 100) : 0;
                            return (
                                <tr key={b.id}>
                                    <td style={{ fontWeight: 500 }}>{b.department}</td>
                                    <td><span className="tag tag-blue">{b.category}</span></td>
                                    <td style={{ fontWeight: 600 }}>₹{((b.allocated || 0) / 100000).toFixed(0)}L</td>
                                    <td>₹{((b.spent || 0) / 100000).toFixed(0)}L</td>
                                    <td style={{ color: b.allocated - b.spent < 0 ? '#EF4444' : '#10B981' }}>₹{(((b.allocated || 0) - (b.spent || 0)) / 100000).toFixed(0)}L</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div className="progress-bar" style={{ width: 100 }}>
                                                <div className={`progress-bar-fill${util > 90 ? ' danger' : util > 75 ? ' warning' : ' success'}`} style={{ width: `${Math.min(util, 100)}%` }}></div>
                                            </div>
                                            <span className="text-xs" style={{ color: util > 90 ? '#EF4444' : util > 75 ? '#F59E0B' : '#10B981' }}>{util}%</span>
                                        </div>
                                    </td>
                                    <td>{b.period}</td>
                                    <td><span className={`badge badge-${util > 90 ? 'critical' : util > 75 ? 'warning' : 'active'}`}><span className="badge-dot"></span>{util > 90 ? 'Over Budget' : util > 75 ? 'Caution' : 'On Track'}</span></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
