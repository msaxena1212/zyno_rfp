'use client';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/Toast';
import { createItem, updateItem, deleteItem } from '@/lib/api';

export default function VendorsPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selected, setSelected] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    const [form, setForm] = useState({ name: '', category: '', contact: '', email: '', phone: '', city: '', gstin: '' });

    const fetchData = useCallback(() => {
        fetch('/api/vendors').then(r => r.json()).then(d => { setData(d.data || d); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filtered = (Array.isArray(data) ? data : []).filter(v => {
        const matchSearch = !search || JSON.stringify(v).toLowerCase().includes(search.toLowerCase());
        const matchStatus = !statusFilter || v.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const stats = {
        total: filtered.length,
        active: filtered.filter(v => v.status === 'Active').length,
        avgRating: (filtered.reduce((s, v) => s + (v.rating || 0), 0) / (filtered.length || 1)).toFixed(1),
        totalSpend: filtered.reduce((s, v) => s + (v.totalSpend || 0), 0),
    };

    const handleCreate = async () => {
        if (!form.name.trim() || !form.category) { toast.error('Name and Category are required'); return; }
        setSaving(true);
        try {
            await createItem('vendors', {
                ...form,
                status: 'Active',
                rating: 0,
                onTimeDelivery: 0,
                qualityScore: 0,
                totalSpend: 0,
                complianceIssues: 0,
                yearsActive: 0,
            });
            toast.success(`Vendor "${form.name}" added successfully`);
            setShowForm(false);
            setForm({ name: '', category: '', contact: '', email: '', phone: '', city: '', gstin: '' });
            fetchData();
        } catch (e) { toast.error('Failed to add vendor'); }
        setSaving(false);
    };

    const handleStatusChange = async (vendor, newStatus) => {
        try {
            await updateItem('vendors', vendor.id, { status: newStatus });
            toast.success(`${vendor.name} status changed to ${newStatus}`);
            setSelected(null);
            fetchData();
        } catch (e) { toast.error('Failed to update status'); }
    };

    const handleDelete = async (vendor) => {
        try {
            await deleteItem('vendors', vendor.id);
            toast.success(`${vendor.name} removed`);
            setSelected(null);
            setConfirmDelete(null);
            fetchData();
        } catch (e) { toast.error('Failed to delete vendor'); }
    };

    const handleExport = () => {
        if (filtered.length === 0) { toast.info('No data to export'); return; }
        const headers = ['ID', 'Name', 'Category', 'City', 'Rating', 'On-Time %', 'Quality %', 'Spend', 'Status'];
        const rows = filtered.map(v => [v.id, v.name, v.category, v.city, v.rating, v.onTimeDelivery, v.qualityScore, v.totalSpend, v.status]);
        const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `vendors-${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url);
        toast.success(`Exported ${filtered.length} vendors`);
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left"><h1>Vendor Management</h1><p className="page-header-subtitle">Manage vendors, track performance, and assess risk</p></div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary" onClick={handleExport}>Export CSV</button>
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Vendor</button>
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Total Vendors</div><div className="stat-card-value">{stats.total}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Active</div><div className="stat-card-value" style={{ color: '#10B981' }}>{stats.active}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Avg Rating</div><div className="stat-card-value">{stats.avgRating}/5</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Total Spend</div><div className="stat-card-value">₹{(stats.totalSpend / 100000).toFixed(1)}L</div></div></div>
            </div>

            <div className="data-table-wrapper">
                <div className="data-table-toolbar">
                    <div className="data-table-toolbar-left">
                        <div className="data-table-search"><span className="data-table-search-icon">⌕</span><input placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                        <div className="data-table-filter">
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="">All Status</option><option>Active</option><option>Under Review</option><option>Blacklisted</option></select>
                        </div>
                    </div>
                    <div className="data-table-toolbar-right"><span className="text-sm text-muted">{filtered.length} vendors</span></div>
                </div>
                <table className="data-table">
                    <thead><tr><th>ID</th><th>Vendor Name</th><th>Category</th><th>City</th><th>Rating</th><th>On-Time</th><th>Quality</th><th>Spend</th><th>Status</th></tr></thead>
                    <tbody>
                        {filtered.map(v => (
                            <tr key={v.id} className="clickable" onClick={() => setSelected(v)}>
                                <td><span className="data-table-id">{v.id}</span></td>
                                <td style={{ fontWeight: 500 }}>{v.name}</td>
                                <td><span className="tag tag-blue">{v.category}</span></td>
                                <td>{v.city}</td>
                                <td>{v.rating}/5</td>
                                <td><span className={`tag ${v.onTimeDelivery >= 90 ? 'tag-green' : v.onTimeDelivery >= 80 ? 'tag-orange' : 'tag-red'}`}>{v.onTimeDelivery}%</span></td>
                                <td>{v.qualityScore}%</td>
                                <td>₹{((v.totalSpend || 0) / 100000).toFixed(1)}L</td>
                                <td><span className={`badge badge-${v.status === 'Active' ? 'active' : v.status === 'Blacklisted' ? 'rejected' : 'review'}`}><span className="badge-dot"></span>{v.status}</span></td>
                            </tr>
                        ))}
                        {filtered.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No vendors found</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Detail Panel */}
            {selected && (
                <>
                    <div className="detail-panel-overlay" onClick={() => setSelected(null)}></div>
                    <div className="detail-panel">
                        <div className="detail-panel-header"><h2>{selected.name}</h2><button className="modal-close" onClick={() => setSelected(null)}>×</button></div>
                        <div className="detail-panel-body">
                            <div className="detail-section">
                                <div className="detail-section-title">Vendor Details</div>
                                <div className="detail-field"><span className="detail-field-label">ID</span><span className="detail-field-value">{selected.id}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Category</span><span className="detail-field-value">{selected.category}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Contact</span><span className="detail-field-value">{selected.contact}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Email</span><span className="detail-field-value">{selected.email}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Phone</span><span className="detail-field-value">{selected.phone}</span></div>
                                <div className="detail-field"><span className="detail-field-label">City</span><span className="detail-field-value">{selected.city}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Active Since</span><span className="detail-field-value">{selected.yearsActive} years</span></div>
                            </div>
                            <div className="detail-section">
                                <div className="detail-section-title">Performance Metrics</div>
                                <div style={{ display: 'grid', gap: 12 }}>
                                    <div><span className="text-sm text-muted">Rating</span><div className="progress-bar" style={{ marginTop: 4 }}><div className="progress-bar-fill" style={{ width: `${(selected.rating / 5) * 100}%` }}></div></div><span className="text-xs">{selected.rating}/5</span></div>
                                    <div><span className="text-sm text-muted">On-Time Delivery</span><div className="progress-bar" style={{ marginTop: 4 }}><div className={`progress-bar-fill${selected.onTimeDelivery >= 90 ? ' success' : ' warning'}`} style={{ width: `${selected.onTimeDelivery}%` }}></div></div><span className="text-xs">{selected.onTimeDelivery}%</span></div>
                                    <div><span className="text-sm text-muted">Quality Score</span><div className="progress-bar" style={{ marginTop: 4 }}><div className={`progress-bar-fill${selected.qualityScore >= 90 ? ' success' : ' warning'}`} style={{ width: `${selected.qualityScore}%` }}></div></div><span className="text-xs">{selected.qualityScore}%</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="detail-panel-footer" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(selected)}>Delete</button>
                            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
                            {selected.status === 'Active' && <button className="btn btn-warning" onClick={() => handleStatusChange(selected, 'Under Review')}>Mark Under Review</button>}
                            {selected.status === 'Under Review' && (
                                <>
                                    <button className="btn btn-danger" onClick={() => handleStatusChange(selected, 'Blacklisted')}>Blacklist</button>
                                    <button className="btn btn-success" onClick={() => handleStatusChange(selected, 'Active')}>Reactivate</button>
                                </>
                            )}
                            {selected.status === 'Blacklisted' && <button className="btn btn-primary" onClick={() => handleStatusChange(selected, 'Under Review')}>Move to Review</button>}
                        </div>
                    </div>
                </>
            )}

            {/* Add Vendor Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2>Add Vendor</h2><button className="modal-close" onClick={() => setShowForm(false)}>×</button></div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Vendor Name <span className="required">*</span></label><input className="form-input" placeholder="Company name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">Category <span className="required">*</span></label>
                                    <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                        <option value="">Select Category</option><option>Raw Materials</option><option>IT Services</option><option>Chemicals</option><option>Packaging</option><option>Logistics</option><option>Office Supplies</option><option>Equipment</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Contact Person</label><input className="form-input" placeholder="Full name" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="vendor@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" placeholder="+91 98765..." value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">City</label><input className="form-input" placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
                            </div>
                            <div className="form-group"><label className="form-label">GSTIN</label><input className="form-input" placeholder="GSTIN number" value={form.gstin} onChange={e => setForm({ ...form, gstin: e.target.value })} /></div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>{saving ? 'Adding...' : 'Add Vendor'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {confirmDelete && (
                <div className="confirm-overlay" onClick={() => setConfirmDelete(null)}>
                    <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
                        <h3>Remove {confirmDelete.name}?</h3>
                        <p>This will permanently remove this vendor from the system. This action cannot be undone.</p>
                        <div className="confirm-dialog-actions">
                            <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => handleDelete(confirmDelete)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
