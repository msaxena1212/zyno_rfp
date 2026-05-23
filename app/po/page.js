'use client';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/Toast';
import { createItem, updateItem, deleteItem } from '@/lib/api';

export default function PurchaseOrderPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selected, setSelected] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    const [form, setForm] = useState({ vendor: '', prId: '', deliveryDate: '', paymentTerms: 'Net 30', items: [{ name: '', qty: 1, unitPrice: 0 }] });

    const fetchData = useCallback(() => {
        fetch('/api/po').then(r => r.json()).then(d => { setData(d.data || d); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filtered = (Array.isArray(data) ? data : []).filter(po => {
        const matchSearch = !search || JSON.stringify(po).toLowerCase().includes(search.toLowerCase());
        const matchStatus = !statusFilter || po.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const stats = {
        total: filtered.length,
        confirmed: filtered.filter(p => p.status === 'Confirmed').length,
        delivered: filtered.filter(p => p.status === 'Delivered').length,
        totalValue: filtered.reduce((s, p) => s + (p.totalAmount || 0), 0),
    };

    const handleCreate = async () => {
        if (!form.vendor.trim()) { toast.error('Vendor is required'); return; }
        const validItems = form.items.filter(i => i.name.trim() && i.qty > 0);
        if (validItems.length === 0) { toast.error('Add at least one line item'); return; }
        setSaving(true);
        try {
            const totalAmount = validItems.reduce((s, i) => s + (i.qty * i.unitPrice), 0);
            await createItem('po', {
                vendor: form.vendor,
                prId: form.prId || null,
                date: new Date().toISOString().split('T')[0],
                deliveryDate: form.deliveryDate,
                paymentTerms: form.paymentTerms,
                status: 'Pending',
                items: validItems.map(i => ({ ...i, total: i.qty * i.unitPrice })),
                totalAmount,
            });
            toast.success('Purchase Order created');
            setShowForm(false);
            setForm({ vendor: '', prId: '', deliveryDate: '', paymentTerms: 'Net 30', items: [{ name: '', qty: 1, unitPrice: 0 }] });
            fetchData();
        } catch (e) { toast.error('Failed to create PO'); }
        setSaving(false);
    };

    const handleStatusChange = async (po, newStatus) => {
        try {
            await updateItem('po', po.id, { status: newStatus });
            toast.success(`PO ${po.id} marked as ${newStatus}`);
            setSelected(null);
            fetchData();
        } catch (e) { toast.error('Failed to update status'); }
    };

    const handleDelete = async (po) => {
        try {
            await deleteItem('po', po.id);
            toast.success(`PO ${po.id} deleted`);
            setSelected(null); setConfirmDelete(null);
            fetchData();
        } catch (e) { toast.error('Failed to delete PO'); }
    };

    const handleExport = () => {
        if (filtered.length === 0) { toast.info('No data to export'); return; }
        const headers = ['PO #', 'Vendor', 'PR Ref', 'Date', 'Delivery Date', 'Amount', 'Terms', 'Status'];
        const rows = filtered.map(po => [po.id, po.vendor, po.prId || '', po.date, po.deliveryDate, po.totalAmount, po.paymentTerms, po.status]);
        const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `purchase-orders-${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url);
        toast.success(`Exported ${filtered.length} POs`);
    };

    const updateFormItem = (index, field, value) => {
        const newItems = [...form.items];
        newItems[index] = { ...newItems[index], [field]: field === 'qty' || field === 'unitPrice' ? Number(value) : value };
        setForm({ ...form, items: newItems });
    };
    const addItem = () => setForm({ ...form, items: [...form.items, { name: '', qty: 1, unitPrice: 0 }] });
    const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left"><h1>Purchase Orders</h1><p className="page-header-subtitle">Track and manage all purchase orders</p></div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary" onClick={handleExport}>Export CSV</button>
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Create PO</button>
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Total POs</div><div className="stat-card-value">{stats.total}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Confirmed</div><div className="stat-card-value" style={{ color: '#10B981' }}>{stats.confirmed}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Delivered</div><div className="stat-card-value" style={{ color: '#3B82F6' }}>{stats.delivered}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Total Value</div><div className="stat-card-value">₹{(stats.totalValue / 100000).toFixed(1)}L</div></div></div>
            </div>

            <div className="data-table-wrapper">
                <div className="data-table-toolbar">
                    <div className="data-table-toolbar-left">
                        <div className="data-table-search"><span className="data-table-search-icon">⌕</span><input placeholder="Search POs..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                        <div className="data-table-filter">
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="">All Status</option><option>Pending</option><option>Confirmed</option><option>In Transit</option><option>Delivered</option></select>
                        </div>
                    </div>
                    <div className="data-table-toolbar-right"><span className="text-sm text-muted">{filtered.length} orders</span></div>
                </div>
                <table className="data-table">
                    <thead><tr><th>PO #</th><th>Vendor</th><th>PR Ref</th><th>Date</th><th>Delivery Date</th><th>Amount</th><th>Terms</th><th>Status</th></tr></thead>
                    <tbody>
                        {filtered.map(po => (
                            <tr key={po.id} className="clickable" onClick={() => setSelected(po)}>
                                <td><span className="data-table-id">{po.id}</span></td>
                                <td style={{ fontWeight: 500 }}>{po.vendor}</td>
                                <td>{po.prId || '—'}</td>
                                <td>{po.date}</td>
                                <td>{po.deliveryDate}</td>
                                <td style={{ fontWeight: 600 }}>₹{(po.totalAmount || 0).toLocaleString('en-IN')}</td>
                                <td><span className="tag">{po.paymentTerms}</span></td>
                                <td><span className={`badge badge-${(po.status || '').toLowerCase().replace(/\s+/g, '-')}`}><span className="badge-dot"></span>{po.status}</span></td>
                            </tr>
                        ))}
                        {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No orders found</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Detail Panel */}
            {selected && (
                <>
                    <div className="detail-panel-overlay" onClick={() => setSelected(null)}></div>
                    <div className="detail-panel">
                        <div className="detail-panel-header"><h2>{selected.id} — Purchase Order</h2><button className="modal-close" onClick={() => setSelected(null)}>×</button></div>
                        <div className="detail-panel-body">
                            <div className="detail-section">
                                <div className="detail-section-title">Order Details</div>
                                <div className="detail-field"><span className="detail-field-label">Vendor</span><span className="detail-field-value">{selected.vendor}</span></div>
                                <div className="detail-field"><span className="detail-field-label">PR Reference</span><span className="detail-field-value">{selected.prId || '—'}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Order Date</span><span className="detail-field-value">{selected.date}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Delivery Date</span><span className="detail-field-value">{selected.deliveryDate}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Payment Terms</span><span className="detail-field-value">{selected.paymentTerms}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Total Amount</span><span className="detail-field-value" style={{ fontWeight: 700 }}>₹{(selected.totalAmount || 0).toLocaleString('en-IN')}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Status</span><span className="detail-field-value"><span className={`badge badge-${(selected.status || '').toLowerCase().replace(/\s+/g, '-')}`}><span className="badge-dot"></span>{selected.status}</span></span></div>
                            </div>
                            <div className="detail-section">
                                <div className="detail-section-title">Line Items</div>
                                <table className="data-table"><thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
                                    <tbody>{(selected.items || []).map((item, i) => (<tr key={i}><td>{item.name}</td><td>{item.qty}</td><td>₹{(item.unitPrice || 0).toLocaleString('en-IN')}</td><td style={{ fontWeight: 600 }}>₹{(item.total || 0).toLocaleString('en-IN')}</td></tr>))}</tbody>
                                </table>
                            </div>
                        </div>
                        <div className="detail-panel-footer" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(selected)}>Delete</button>
                            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
                            {selected.status === 'Pending' && <button className="btn btn-success" onClick={() => handleStatusChange(selected, 'Confirmed')}>Confirm PO</button>}
                            {selected.status === 'Confirmed' && <button className="btn btn-primary" onClick={() => handleStatusChange(selected, 'In Transit')}>Mark In Transit</button>}
                            {selected.status === 'In Transit' && <button className="btn btn-success" onClick={() => handleStatusChange(selected, 'Delivered')}>Mark Delivered</button>}
                        </div>
                    </div>
                </>
            )}

            {/* Create PO Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2>Create Purchase Order</h2><button className="modal-close" onClick={() => setShowForm(false)}>×</button></div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Vendor <span className="required">*</span></label><input className="form-input" placeholder="Vendor name" value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">PR Reference</label><input className="form-input" placeholder="PR-00001 (optional)" value={form.prId} onChange={e => setForm({ ...form, prId: e.target.value })} /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Delivery Date</label><input className="form-input" type="date" value={form.deliveryDate} onChange={e => setForm({ ...form, deliveryDate: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">Payment Terms</label>
                                    <select className="form-select" value={form.paymentTerms} onChange={e => setForm({ ...form, paymentTerms: e.target.value })}>
                                        <option>Net 15</option><option>Net 30</option><option>Net 45</option><option>Net 60</option><option>Advance</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginTop: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <label className="form-label" style={{ margin: 0 }}>Line Items <span className="required">*</span></label>
                                    <button className="btn btn-sm btn-ghost" onClick={addItem} type="button">+ Add Item</button>
                                </div>
                                {form.items.map((item, i) => (
                                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                                        <input className="form-input" placeholder="Item name" value={item.name} onChange={e => updateFormItem(i, 'name', e.target.value)} />
                                        <input className="form-input" type="number" placeholder="Qty" min="1" value={item.qty} onChange={e => updateFormItem(i, 'qty', e.target.value)} />
                                        <input className="form-input" type="number" placeholder="Price" min="0" value={item.unitPrice} onChange={e => updateFormItem(i, 'unitPrice', e.target.value)} />
                                        {form.items.length > 1 && <button className="btn btn-sm btn-ghost" onClick={() => removeItem(i)} style={{ color: '#EF4444' }}>×</button>}
                                    </div>
                                ))}
                                <div style={{ textAlign: 'right', fontSize: '0.8125rem', color: '#64748B', marginTop: 4 }}>
                                    Total: ₹{form.items.reduce((s, i) => s + (i.qty * i.unitPrice), 0).toLocaleString('en-IN')}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>{saving ? 'Creating...' : 'Create PO'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {confirmDelete && (
                <div className="confirm-overlay" onClick={() => setConfirmDelete(null)}>
                    <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
                        <h3>Delete {confirmDelete.id}?</h3>
                        <p>This will permanently remove this purchase order. This action cannot be undone.</p>
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
