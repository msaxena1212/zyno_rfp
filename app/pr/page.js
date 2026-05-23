'use client';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/Toast';
import { createItem, updateItem, deleteItem } from '@/lib/api';
import { IconCheck, IconClock, IconFile, IconX, IconTruck } from '@/components/Icons';

export default function PurchaseRequisitionPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selected, setSelected] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    // Enhanced Form State
    const [form, setForm] = useState({
        title: '',
        department: '',
        project: '',
        location: '',
        priority: 'Medium',
        requiredDate: '',
        justification: '',
        items: [{ name: '', qty: 1, unitPrice: 0 }],
        notes: ''
    });

    // Mock Budget Data
    const departmentBudgets = {
        'IT': { total: 5000000, spent: 3200000 },
        'Production': { total: 12000000, spent: 8500000 },
        'Admin': { total: 1500000, spent: 600000 },
        'EHS': { total: 1000000, spent: 250000 },
        'Maintenance': { total: 4000000, spent: 3800000 },
        'Projects': { total: 25000000, spent: 12000000 }
    };

    const fetchData = useCallback(() => {
        fetch('/api/pr').then(r => r.json()).then(d => { setData(d.data || d); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const statuses = ['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Ordered', 'Delivered'];

    // Derived state for filtering
    const filtered = (Array.isArray(data) ? data : []).filter(pr => {
        const matchSearch = !search || JSON.stringify(pr).toLowerCase().includes(search.toLowerCase());
        const matchStatus = !statusFilter || pr.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const stats = {
        total: (Array.isArray(data) ? data : []).length,
        pending: (Array.isArray(data) ? data : []).filter(p => p.status === 'Pending Approval').length,
        approved: (Array.isArray(data) ? data : []).filter(p => p.status === 'Approved' || p.status === 'Ordered').length,
        rejected: (Array.isArray(data) ? data : []).filter(p => p.status === 'Rejected').length,
    };

    // ---------- CRUD Operations ----------

    const handleCreatePR = async () => {
        if (!form.title.trim() || !form.department) {
            toast.error('Please fill in Title and Department');
            return;
        }
        const validItems = form.items.filter(i => i.name.trim() && i.qty > 0);
        if (validItems.length === 0) {
            toast.error('Add at least one line item');
            return;
        }
        setSaving(true);
        try {
            const totalAmount = validItems.reduce((s, i) => s + (i.qty * i.unitPrice), 0);
            await createItem('pr', {
                ...form,
                requestedBy: 'Arjun Kumar', // Mock user
                date: new Date().toISOString().split('T')[0],
                status: 'Draft',
                items: validItems,
                totalAmount,
                timeline: [{ status: 'Draft', date: new Date().toISOString(), by: 'Arjun Kumar' }]
            });
            toast.success('Purchase Requisition created successfully');
            setShowForm(false);
            setForm({ title: '', department: '', project: '', location: '', priority: 'Medium', requiredDate: '', justification: '', items: [{ name: '', qty: 1, unitPrice: 0 }], notes: '' });
            fetchData();
        } catch (e) {
            toast.error('Failed to create PR: ' + e.message);
        }
        setSaving(false);
    };

    const handleStatusChange = async (pr, newStatus) => {
        try {
            const updatedTimeline = [...(pr.timeline || []), { status: newStatus, date: new Date().toISOString(), by: 'System' }];
            await updateItem('pr', pr.id, { status: newStatus, timeline: updatedTimeline });
            toast.success(`PR ${pr.id} moved to ${newStatus}`);

            // Optimistic update for Details View
            if (selected && selected.id === pr.id) {
                setSelected({ ...selected, status: newStatus, timeline: updatedTimeline });
            }
            fetchData();
        } catch (e) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (pr) => {
        try {
            await deleteItem('pr', pr.id);
            toast.success(`PR ${pr.id} deleted`);
            setSelected(null);
            setConfirmDelete(null);
            fetchData();
        } catch (e) {
            toast.error('Failed to delete PR');
        }
    };

    // Form helpers
    const updateItem2 = (index, field, value) => {
        const newItems = [...form.items];
        newItems[index] = { ...newItems[index], [field]: field === 'qty' || field === 'unitPrice' ? Number(value) : value };
        setForm({ ...form, items: newItems });
    };
    const addItem = () => setForm({ ...form, items: [...form.items, { name: '', qty: 1, unitPrice: 0 }] });
    const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });

    // Budget Calculation
    const selectedBudget = form.department ? departmentBudgets[form.department] : null;
    const currentPrTotal = form.items.reduce((s, i) => s + (i.qty * i.unitPrice), 0);
    const budgetRemaining = selectedBudget ? selectedBudget.total - selectedBudget.spent - currentPrTotal : 0;
    const budgetColor = budgetRemaining < 0 ? '#EF4444' : budgetRemaining < (selectedBudget?.total * 0.1) ? '#F59E0B' : '#10B981';

    // Timeline Steps for Visual Stepper
    const steps = ['Draft', 'Pending Approval', 'Approved', 'Ordered', 'Delivered'];

    // Helper to get active step index
    const getStepIndex = (status) => {
        if (status === 'Rejected') return 1; // Rejected is visually a terminal state at Pending level usually
        return steps.indexOf(status) > -1 ? steps.indexOf(status) : 0;
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Purchase Requisitions</h1>
                    <p className="page-header-subtitle">Create and manage purchase requests</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary" onClick={() => toast.info('Export coming soon')}>Export CSV</button>
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}><span style={{ marginRight: 4, fontSize: '1.1em' }}>+</span> New PR</button>
                </div>
            </div>

            {/* Clickable Stats for Quick Filtering */}
            <div className="stats-row">
                <div className={`stat-card clickable ${statusFilter === '' ? 'active-filter' : ''}`} onClick={() => setStatusFilter('')}>
                    <div className="stat-card-content">
                        <div className="stat-card-label">Total PRs</div>
                        <div className="stat-card-value">{stats.total}</div>
                    </div>
                </div>
                <div className={`stat-card clickable ${statusFilter === 'Pending Approval' ? 'active-filter' : ''}`} onClick={() => setStatusFilter('Pending Approval')}>
                    <div className="stat-card-content">
                        <div className="stat-card-label">Pending Your Action</div>
                        <div className="stat-card-value" style={{ color: '#F59E0B' }}>{stats.pending}</div>
                    </div>
                </div>
                <div className={`stat-card clickable ${statusFilter === 'Approved' ? 'active-filter' : ''}`} onClick={() => setStatusFilter('Approved')}>
                    <div className="stat-card-content">
                        <div className="stat-card-label">Approved</div>
                        <div className="stat-card-value" style={{ color: '#10B981' }}>{stats.approved}</div>
                    </div>
                </div>
                <div className={`stat-card clickable ${statusFilter === 'Rejected' ? 'active-filter' : ''}`} onClick={() => setStatusFilter('Rejected')}>
                    <div className="stat-card-content">
                        <div className="stat-card-label">Rejected</div>
                        <div className="stat-card-value" style={{ color: '#EF4444' }}>{stats.rejected}</div>
                    </div>
                </div>
            </div>

            <div className="data-table-wrapper">
                <div className="data-table-toolbar">
                    <div className="data-table-toolbar-left">
                        <div className="data-table-search">
                            <span className="data-table-search-icon">⌕</span>
                            <input placeholder="Search PRs..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div className="data-table-filter">
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                <option value="">All Statuses</option>
                                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="data-table-toolbar-right"><span className="text-sm text-muted">{filtered.length} records</span></div>
                </div>
                <table className="data-table">
                    <thead><tr><th>PR #</th><th>Title</th><th>Department</th><th>Project</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                    <tbody>
                        {filtered.map(pr => (
                            <tr key={pr.id} className="clickable" onClick={() => setSelected(pr)}>
                                <td><span className="data-table-id">{pr.id}</span></td>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 500 }}>{pr.title}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{pr.requestedBy}</span>
                                </div>
                                <td><span className="tag tag-blue">{pr.department}</span></td>
                                <td>{pr.project || '—'}</td>
                                <td>{pr.date}</td>
                                <td style={{ fontWeight: 600 }}>₹{(pr.totalAmount || 0).toLocaleString('en-IN')}</td>
                                <td><span className={`badge badge-${(pr.status || '').toLowerCase().replace(/\s+/g, '-')}`}><span className="badge-dot"></span>{pr.status}</span></td>
                            </tr>
                        ))}
                        {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No requisitions found matching your filters.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Detail Panel */}
            {selected && (
                <>
                    <div className="detail-panel-overlay" onClick={() => setSelected(null)}></div>
                    <div className="detail-panel">
                        <div className="detail-panel-header">
                            <div>
                                <h2 style={{ marginBottom: 4 }}>{selected.title}</h2>
                                <span className="text-sm text-muted">{selected.id} • Created by {selected.requestedBy} on {selected.date}</span>
                            </div>
                            <button className="modal-close" onClick={() => setSelected(null)}>×</button>
                        </div>
                        <div className="detail-panel-body">
                            {/* Visual Stepper */}
                            <div className="pr-stepper">
                                {steps.map((step, i) => {
                                    const currentIndex = getStepIndex(selected.status);
                                    let stepClass = 'pr-step';
                                    if (selected.status === 'Rejected') {
                                        if (step === 'Draft') stepClass += ' completed';
                                        if (step === 'Pending Approval') stepClass += ' error';
                                    } else {
                                        if (i < currentIndex) stepClass += ' completed';
                                        if (i === currentIndex) stepClass += ' active';
                                    }

                                    return (
                                        <div key={step} className={stepClass}>
                                            <div className="pr-step-circle">{i + 1}</div>
                                            <div className="pr-step-label">{step}</div>
                                            {i < steps.length - 1 && <div className="pr-step-line"></div>}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="detail-grid">
                                <div className="detail-section">
                                    <div className="detail-section-title">Details</div>
                                    <div className="detail-row"><span className="label">Department</span> <span>{selected.department}</span></div>
                                    <div className="detail-row"><span className="label">Project</span> <span>{selected.project || 'N/A'}</span></div>
                                    <div className="detail-row"><span className="label">Location</span> <span>{selected.location || 'Main Warehouse'}</span></div>
                                    <div className="detail-row"><span className="label">Priority</span> <span className={`badge badge-${selected.priority?.toLowerCase() || 'medium'}`}>{selected.priority}</span></div>
                                </div>
                                <div className="detail-section">
                                    <div className="detail-section-title">Summary</div>
                                    <div className="detail-row"><span className="label">Total Amount</span> <span style={{ fontWeight: 700 }}>₹{(selected.totalAmount || 0).toLocaleString('en-IN')}</span></div>
                                    <div className="detail-row"><span className="label">Required By</span> <span>{selected.requiredDate || 'ASAP'}</span></div>
                                </div>
                            </div>

                            {selected.justification && (
                                <div className="detail-section" style={{ marginTop: 24 }}>
                                    <div className="detail-section-title">Justification</div>
                                    <p className="detail-text">{selected.justification}</p>
                                </div>
                            )}

                            <div className="detail-section" style={{ marginTop: 24 }}>
                                <div className="detail-section-title">Items</div>
                                <table className="data-table">
                                    <thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
                                    <tbody>
                                        {(selected.items || []).map((item, i) => (
                                            <tr key={i}><td>{item.name}</td><td>{item.qty}</td><td>₹{(item.unitPrice || 0).toLocaleString('en-IN')}</td><td style={{ fontWeight: 600 }}>₹{(item.qty * item.unitPrice).toLocaleString('en-IN')}</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="detail-panel-footer">
                            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
                            {selected.status === 'Draft' ? (
                                <>
                                    <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(selected)}>Delete</button>
                                    <button className="btn btn-primary" onClick={() => handleStatusChange(selected, 'Pending Approval')}>Submit for Approval</button>
                                </>
                            ) : selected.status === 'Pending Approval' ? (
                                <>
                                    <button className="btn btn-danger" onClick={() => handleStatusChange(selected, 'Rejected')}>Reject</button>
                                    <button className="btn btn-success" onClick={() => handleStatusChange(selected, 'Approved')}>Approve</button>
                                </>
                            ) : selected.status === 'Approved' ? (
                                <button className="btn btn-primary" onClick={() => handleStatusChange(selected, 'Ordered')}>Create PO</button>
                            ) : null}
                        </div>
                    </div>
                </>
            )}

            {/* Create PR Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2>New Purchase Requisition</h2><button className="modal-close" onClick={() => setShowForm(false)}>×</button></div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Title <span className="required">*</span></label>
                                    <input className="form-input" placeholder="e.g. Q3 Office Supplies" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Department <span className="required">*</span></label>
                                    <select className="form-select" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                                        <option value="">Select Department</option>
                                        <option>IT</option><option>Production</option><option>Admin</option><option>EHS</option><option>Maintenance</option><option>Projects</option>
                                    </select>
                                </div>
                            </div>

                            {selectedBudget && (
                                <div className="budget-alert" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: 10, borderRadius: 6, marginBottom: 16, display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                    <span><strong>{form.department} Budget:</strong> ₹{(selectedBudget.total / 100000).toFixed(1)}L allocated</span>
                                    <span style={{ color: budgetColor, fontWeight: 600 }}>Remaining: ₹{budgetRemaining.toLocaleString('en-IN')}</span>
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Project</label>
                                    <select className="form-select" value={form.project} onChange={e => setForm({ ...form, project: e.target.value })}>
                                        <option value="">Select Project (Optional)</option>
                                        <option>Factory Expansion</option><option>Office Renovation</option><option>IT Overhaul 2026</option><option>Safety Compliance</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Delivery Location</label>
                                    <input className="form-input" placeholder="e.g. Block B, Warehouse 2" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Priority</label>
                                    <select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                                        <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Required Date</label>
                                    <input className="form-input" type="date" value={form.requiredDate} onChange={e => setForm({ ...form, requiredDate: e.target.value })} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Justification</label>
                                <textarea className="form-textarea" placeholder="Why is this purchase necessary?" value={form.justification} onChange={e => setForm({ ...form, justification: e.target.value })}></textarea>
                            </div>

                            {/* Line Items */}
                            <div className="line-items-section">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <label className="form-label" style={{ margin: 0 }}>Line Items <span className="required">*</span></label>
                                    <button className="btn btn-sm btn-secondary" onClick={addItem} type="button">+ Add Item</button>
                                </div>
                                <div className="line-items-header" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, fontSize: '0.8rem', fontWeight: 600, color: '#64748B', marginBottom: 4, padding: '0 4px' }}>
                                    <span>Item</span><span>Qty</span><span>Unit Price</span><span></span>
                                </div>
                                {form.items.map((item, i) => (
                                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                                        <input className="form-input" placeholder="Item Name" value={item.name} onChange={e => updateItem2(i, 'name', e.target.value)} />
                                        <input className="form-input" type="number" placeholder="1" min="1" value={item.qty} onChange={e => updateItem2(i, 'qty', e.target.value)} />
                                        <input className="form-input" type="number" placeholder="0.00" min="0" value={item.unitPrice} onChange={e => updateItem2(i, 'unitPrice', e.target.value)} />
                                        {form.items.length > 1 && <button className="btn btn-sm btn-ghost" onClick={() => removeItem(i)} style={{ color: '#EF4444' }}><IconX size={16} /></button>}
                                    </div>
                                ))}
                                <div style={{ textAlign: 'right', fontSize: '1rem', fontWeight: 600, color: '#1E293B', marginTop: 12 }}>
                                    Total: ₹{form.items.reduce((s, i) => s + (i.qty * i.unitPrice), 0).toLocaleString('en-IN')}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleCreatePR} disabled={saving}>{saving ? 'Creating...' : 'Submit PR'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {confirmDelete && (
                <div className="confirm-overlay" onClick={() => setConfirmDelete(null)}>
                    <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
                        <h3>Delete PR?</h3>
                        <p>Are you sure you want to delete <strong>{confirmDelete.title}</strong>? This action cannot be undone.</p>
                        <div className="confirm-dialog-actions">
                            <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => handleDelete(confirmDelete)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .active-filter {
                    border: 2px solid var(--primary-500);
                    background-color: var(--primary-50);
                }
                .clickable { cursor: pointer; transition: all 0.2s; }
                .clickable:hover { transform: translateY(-2px); }
                
                .pr-stepper {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 24px;
                    padding: 0 10px;
                    position: relative;
                }
                .pr-step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                    flex: 1;
                    opacity: 0.5;
                }
                .pr-step.active, .pr-step.completed { opacity: 1; }
                .pr-step-circle {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: #E2E8F0;
                    color: #64748B;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 700;
                    margin-bottom: 8px;
                    z-index: 2;
                }
                .pr-step.active .pr-step-circle {
                    background: var(--primary-600);
                    color: white;
                    box-shadow: 0 0 0 4px var(--primary-100);
                }
                .pr-step.completed .pr-step-circle {
                    background: var(--success);
                    color: white;
                }
                .pr-step.error .pr-step-circle {
                    background: var(--danger);
                    color: white;
                }
                .pr-step-label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-align: center;
                }
                .pr-step-line {
                    position: absolute;
                    top: 14px;
                    left: 50%;
                    width: 100%;
                    height: 2px;
                    background: #E2E8F0;
                    z-index: 1;
                }
                .pr-step.completed .pr-step-line {
                    background: var(--success);
                }
                
                .detail-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    font-size: 0.9rem;
                }
                .label { color: #64748B; }
                .detail-text {
                    font-size: 0.9rem;
                    line-height: 1.5;
                    color: #334155;
                    background: #F8FAFC;
                    padding: 12px;
                    border-radius: 6px;
                }
            `}</style>
        </div>
    );
}
