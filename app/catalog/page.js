'use client';
import { useState, useEffect } from 'react';

import { useToast } from '@/components/Toast';

export default function CatalogPage() {
    const toast = useToast();
    const handleAction = (action) => toast.info(action + ' feature coming soon');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('');

    useEffect(() => {
        fetch('/api/catalog').then(r => r.json()).then(d => { setData(d.data || d); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const items = (Array.isArray(data) ? data : []).filter(i => {
        const matchSearch = !search || JSON.stringify(i).toLowerCase().includes(search.toLowerCase());
        const matchCat = !catFilter || i.category === catFilter;
        return matchSearch && matchCat;
    });
    const categories = [...new Set((Array.isArray(data) ? data : []).map(i => i.category))];

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left"><h1>Catalog Management</h1><p className="page-header-subtitle">AI auto-categorized item master with smart pricing history</p></div>
                <div className="page-header-actions"><button className="btn btn-secondary" onClick={() => handleAction(' Import CSV')}> Import CSV</button><button className="btn btn-primary" onClick={() => handleAction('+ Add Item')}>+ Add Item</button></div>
            </div>

            <div className="ai-insights-section">
                <div className="ai-insight-card">
                    <div className="ai-insight-icon">🏷️</div>
                    <div className="ai-insight-content">
                        <div className="ai-insight-header"><span className="ai-insight-title">Auto-Categorization</span><span className="ai-insight-badge">AI</span></div>
                        <p className="ai-insight-message">AI auto-categorized 3 recently added items: "Industrial Valve DN50" → Pipes & Fittings, "Nitrile Work Gloves" → Safety Equipment, "3-Phase Motor 5HP" → Electrical Components. Review and confirm categories.</p>
                    </div>
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Total Items</div><div className="stat-card-value">{(Array.isArray(data) ? data : []).length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Categories</div><div className="stat-card-value">{categories.length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Approved</div><div className="stat-card-value">{(Array.isArray(data) ? data : []).filter(i => i.approved).length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Contract Linked</div><div className="stat-card-value">{(Array.isArray(data) ? data : []).filter(i => i.contractLinked).length}</div></div></div>
            </div>

            <div className="data-table-wrapper">
                <div className="data-table-toolbar">
                    <div className="data-table-toolbar-left">
                        <div className="data-table-search"><span className="data-table-search-icon">⌕</span><input placeholder="Search catalog..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}><option value="">All Categories</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
                    </div>
                    <div className="data-table-toolbar-right"><span className="text-sm text-muted">{items.length} items</span></div>
                </div>
                <table className="data-table">
                    <thead><tr><th>Code</th><th>Item Name</th><th>Category</th><th>UOM</th><th>HSN</th><th>Last Price</th><th>Preferred Vendor</th><th>Status</th></tr></thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id}>
                                <td><span className="data-table-id">{item.itemCode}</span></td>
                                <td style={{ fontWeight: 500 }}>{item.name}</td>
                                <td><span className="tag tag-blue">{item.category}</span></td>
                                <td>{item.uom}</td>
                                <td className="text-sm">{item.hsn || '—'}</td>
                                <td style={{ fontWeight: 600 }}>₹{(item.lastPrice || 0).toLocaleString('en-IN')}</td>
                                <td>{item.preferredVendor || '—'}</td>
                                <td><span className={`badge badge-${item.approved ? 'active' : 'pending'}`}><span className="badge-dot"></span>{item.approved ? 'Approved' : 'Pending'}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
