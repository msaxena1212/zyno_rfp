'use client';
import { useState, useEffect } from 'react';

import { useToast } from '@/components/Toast';

export default function InventoryPage() {
    const toast = useToast();
    const handleAction = (action) => toast.info(action + ' feature coming soon');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        fetch('/api/inventory').then(r => r.json()).then(d => { setData(d.data || d); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const filtered = (Array.isArray(data) ? data : []).filter(i => !search || JSON.stringify(i).toLowerCase().includes(search.toLowerCase()));
    const lowStock = filtered.filter(i => i.quantity <= i.reorderLevel);
    const critical = filtered.filter(i => i.quantity <= (i.reorderLevel * 0.3));

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left"><h1>Inventory Management</h1><p className="page-header-subtitle">AI-powered reorder predictions and demand forecasting</p></div>
                <div className="page-header-actions"><button className="btn btn-secondary" onClick={() => handleAction('Export CSV')}>Export CSV</button><button className="btn btn-primary" onClick={() => handleAction('+ Add Item')}>+ Add Item</button></div>
            </div>

            <div className="ai-insights-section">
                <div className="ai-insight-card danger">
                    <div className="ai-insight-icon">📦</div>
                    <div className="ai-insight-content">
                        <div className="ai-insight-header"><span className="ai-insight-title">Inventory Alert</span><span className="ai-insight-badge">AI</span></div>
                        <p className="ai-insight-message">{lowStock.length} items are below reorder level. {critical.length} items are critically low: Machine Lubricant (3 left, ~0.5 day supply), SKF Bearing (8 left, ~2 days). Immediate procurement recommended.</p>
                        <div className="ai-insight-actions"><button className="btn btn-sm btn-primary">Auto-Generate PRs</button></div>
                    </div>
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Total Items</div><div className="stat-card-value">{filtered.length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Adequate Stock</div><div className="stat-card-value">{filtered.length - lowStock.length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Low Stock</div><div className="stat-card-value">{lowStock.length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Critical</div><div className="stat-card-value">{critical.length}</div></div></div>
            </div>

            <div className="data-table-wrapper">
                <div className="data-table-toolbar">
                    <div className="data-table-toolbar-left"><div className="data-table-search"><span className="data-table-search-icon">⌕</span><input placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} /></div></div>
                </div>
                <table className="data-table">
                    <thead><tr><th>Item Code</th><th>Name</th><th>Category</th><th>Qty</th><th>Reorder Level</th><th>Stock Level</th><th>Unit Price</th><th>Location</th></tr></thead>
                    <tbody>
                        {filtered.map(item => {
                            const pct = item.reorderLevel > 0 ? Math.min(100, (item.quantity / item.reorderLevel) * 50) : 100;
                            const isLow = item.quantity <= item.reorderLevel;
                            const isCritical = item.quantity <= item.reorderLevel * 0.3;
                            return (
                                <tr key={item.id} className="clickable" onClick={() => setSelected(item)}>
                                    <td><span className="data-table-id">{item.itemCode}</span></td>
                                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                                    <td><span className="tag tag-blue">{item.category}</span></td>
                                    <td style={{ fontWeight: 600, color: isCritical ? '#EF4444' : isLow ? '#F59E0B' : '#1E293B' }}>{item.quantity}</td>
                                    <td>{item.reorderLevel}</td>
                                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div className="progress-bar" style={{ width: 80 }}><div className={`progress-bar-fill${isCritical ? ' danger' : isLow ? ' warning' : ' success'}`} style={{ width: `${pct}%` }}></div></div><span className="text-xs">{isCritical ? 'Critical' : isLow ? 'Low' : 'OK'}</span></div></td>
                                    <td>₹{(item.unitPrice || 0).toLocaleString('en-IN')}</td>
                                    <td>{item.location}</td>
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
                        <div className="detail-panel-header"><h2>{selected.name}</h2><button className="modal-close" onClick={() => setSelected(null)}>×</button></div>
                        <div className="detail-panel-body">
                            <div className="detail-section">
                                <div className="detail-section-title">Item Details</div>
                                <div className="detail-field"><span className="detail-field-label">Item Code</span><span className="detail-field-value">{selected.itemCode}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Category</span><span className="detail-field-value">{selected.category}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Location</span><span className="detail-field-value">{selected.location}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Current Qty</span><span className="detail-field-value" style={{ fontWeight: 700 }}>{selected.quantity}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Reorder Level</span><span className="detail-field-value">{selected.reorderLevel}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Unit Price</span><span className="detail-field-value">₹{(selected.unitPrice || 0).toLocaleString('en-IN')}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Last Restocked</span><span className="detail-field-value">{selected.lastRestocked}</span></div>
                            </div>
                            <div className="detail-section">
                                <div className="detail-section-title">AI Reorder Prediction</div>
                                <div className="ai-insight-card" style={{ marginBottom: 0 }}>
                                    <div className="ai-insight-icon">📊</div>
                                    <div className="ai-insight-content">
                                        <p className="ai-insight-message">Avg daily usage: {(selected.monthlyUsage / 30).toFixed(1)} units. Lead time: {selected.leadTimeDays} days. Recommended reorder qty: {Math.ceil(selected.monthlyUsage)} units ({selected.quantity <= selected.reorderLevel ? 'Order NOW — stock below reorder point!' : `~${Math.floor((selected.quantity - selected.reorderLevel) / (selected.monthlyUsage / 30))} days until reorder needed.`})</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="detail-panel-footer" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}><button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>{selected.quantity <= selected.reorderLevel && <button className="btn btn-primary" onClick={() => handleAction('🛒 Create PR')}>🛒 Create PR</button>}</div>
                    </div>
                </>
            )}
        </div>
    );
}
