'use client';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/Toast';
import { createItem, updateItem, deleteItem } from '@/lib/api';
import { IconAI, IconSearch, IconMail, IconCheck, IconPlus, IconX, IconChevronRight, IconBarChart, IconBuilding } from '@/components/Icons';

const DEFAULT_CRITERIA = [
    { name: 'Price Competitiveness', weight: 30 },
    { name: 'Technical Fit', weight: 25 },
    { name: 'Past Performance', weight: 20 },
    { name: 'Delivery Timeline', weight: 15 },
    { name: 'Value Adds', weight: 10 },
];

export default function RFPPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [agentState, setAgentState] = useState(null);
    const [form, setForm] = useState({
        title: '', category: 'General', assetClass: 'IT & Telecom', assetCategory: 'Hardware',
        item: '', quantity: '1', deliveryLocation: '', budget: '', dueDate: '', description: ''
    });
    const [formCriteria, setFormCriteria] = useState(DEFAULT_CRITERIA.map(c => ({ ...c })));
    const [discoveredVendors, setDiscoveredVendors] = useState([]);
    const [selectedVendors, setSelectedVendors] = useState([]);
    const [emailDrafts, setEmailDrafts] = useState([]);
    const [saving, setSaving] = useState(false);
    const [currentStatus, setCurrentStatus] = useState("Initializing Search...");

    // Ranking state
    const [rankingData, setRankingData] = useState(null);
    const [rankingLoading, setRankingLoading] = useState(false);
    const [rankTab, setRankTab] = useState('leaderboard');
    const [whatIfCriteria, setWhatIfCriteria] = useState(null);
    const [compareVendors, setCompareVendors] = useState([]);
    const toast = useToast();

    const fetchData = useCallback(() => {
        fetch('/api/rfp').then(r => r.json()).then(d => { setData(d.data || d); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filtered = (Array.isArray(data) ? data : []).filter(i => !search || JSON.stringify(i).toLowerCase().includes(search.toLowerCase()));

    // Load rankings when an RFP with submissions is selected
    const loadRankings = async (rfp, criteriaOverride) => {
        setRankingLoading(true);
        try {
            const body = { rfpId: rfp.id };
            if (criteriaOverride) body.criteria = criteriaOverride;
            const res = await fetch('/api/rfp/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const d = await res.json();
            setRankingData(d);
            if (!criteriaOverride && d.criteria) {
                setWhatIfCriteria(d.criteria.map(c => ({ ...c })));
            }
        } catch (e) {
            toast.error('Failed to load rankings');
        }
        setRankingLoading(false);
    };

    const handleSelectRFP = (rfp) => {
        setSelected(rfp);
        setRankTab('leaderboard');
        setCompareVendors([]);
        if (rfp.vendorResponses && rfp.vendorResponses.length > 0) {
            loadRankings(rfp);
        } else {
            setRankingData(null);
        }
    };

    const handleWhatIfChange = (index, newWeight) => {
        const updated = whatIfCriteria.map((c, i) => i === index ? { ...c, weight: newWeight } : c);
        setWhatIfCriteria(updated);
        if (selected) loadRankings(selected, updated);
    };

    const toggleCompare = (vendorId) => {
        setCompareVendors(prev =>
            prev.includes(vendorId) ? prev.filter(v => v !== vendorId) : prev.length < 5 ? [...prev, vendorId] : prev
        );
    };

    // Criteria editor helpers
    const updateCriteriaWeight = (idx, val) => {
        const updated = formCriteria.map((c, i) => i === idx ? { ...c, weight: Math.max(0, Math.min(100, parseInt(val) || 0)) } : c);
        setFormCriteria(updated);
    };
    const removeCriterion = (idx) => {
        if (formCriteria.length <= 2) return;
        setFormCriteria(formCriteria.filter((_, i) => i !== idx));
    };
    const addCriterion = () => {
        setFormCriteria([...formCriteria, { name: 'Custom Criterion', weight: 0 }]);
    };
    const criteriaTotal = formCriteria.reduce((s, c) => s + c.weight, 0);

    // AI Agent Logic
    const startDiscovery = async () => {
        if (!form.item || !form.deliveryLocation) { toast.error('Item and Location are required'); return; }
        setAgentState('searching');
        setCurrentStatus("Scouring Global Markets...");
        try {
            const res = await fetch('/api/ai-agent', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'search', payload: form })
            });
            const d = await res.json();
            if (!res.ok) { toast.error(d.error || 'Search failed'); setAgentState(null); return; }
            if (!d.vendors || d.vendors.length === 0) { toast.error('No vendors found'); setAgentState(null); return; }
            const messages = d.logs || ["Parsing listings...", "Verifying Vendors...", "Finalizing results..."];
            let idx = 0;
            const timer = setInterval(() => {
                if (idx < messages.length) { setCurrentStatus(messages[idx]); idx++; }
                else { clearInterval(timer); setDiscoveredVendors(d.vendors); setAgentState('selecting'); }
            }, 1000);
        } catch (e) { toast.error('Connection failed: ' + e.message); setAgentState(null); }
    };

    const generateDrafts = async () => {
        if (selectedVendors.length === 0) { toast.error('Pick at least one vendor'); return; }
        setAgentState('drafting');
        try {
            const res = await fetch('/api/ai-agent', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'draft_emails', payload: { rfp: form, selectedVendors } })
            });
            const d = await res.json();
            setEmailDrafts(d.drafts);
        } catch (e) { toast.error('Drafting failed'); setAgentState('selecting'); }
    };

    const finalizeRFP = async () => {
        setSaving(true);
        try {
            const newRFP = await createItem('rfp', {
                ...form, status: 'Open',
                vendors: selectedVendors.map(v => v.name), submissions: 0,
                discoverySource: 'AI Agent',
                evaluationCriteria: formCriteria.filter(c => c.weight > 0)
            });
            await fetch('/api/ai-agent', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'send_rfp', payload: { rfpId: newRFP.id, vendors: selectedVendors } })
            });
            toast.success(`RFP ${newRFP.id} dispatched successfully!`);
            setShowForm(false); setAgentState(null); fetchData();
        } catch (e) { toast.error('Failed to launch RFP'); }
        setSaving(false);
    };

    const toggleVendor = (v) => {
        if (selectedVendors.find(sv => sv.name === v.name)) {
            setSelectedVendors(selectedVendors.filter(sv => sv.name !== v.name));
        } else {
            setSelectedVendors([...selectedVendors, v]);
        }
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    const getScoreColor = (score) => {
        if (score >= 85) return '#10b981';
        if (score >= 70) return '#3b82f6';
        if (score >= 50) return '#f59e0b';
        return '#ef4444';
    };

    const getRankBadgeStyle = (rank) => {
        if (rank === 1) return { background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#fff' };
        if (rank === 2) return { background: 'linear-gradient(135deg, #94a3b8, #64748b)', color: '#fff' };
        if (rank === 3) return { background: 'linear-gradient(135deg, #d97706, #b45309)', color: '#fff' };
        return { background: '#f1f5f9', color: '#64748b' };
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Request for Proposal</h1>
                    <p className="page-header-subtitle">Intelligent vendor discovery & AI-powered bid evaluation</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}><IconAI size={18} /> Launch AI Agent</button>
                </div>
            </div>

            <div className="ai-insights-section">
                <div className="ai-insight-card info">
                    <div className="ai-insight-icon"><IconAI size={20} /></div>
                    <div className="ai-insight-content">
                        <div className="ai-insight-header"><span className="ai-insight-title">Smart Sourcing</span><span className="ai-insight-badge">AI</span></div>
                        <p className="ai-insight-message">Click any RFP with status "Under Evaluation" to view AI-powered vendor rankings, shortlist, and side-by-side comparison.</p>
                    </div>
                </div>
            </div>

            <div className="data-table-wrapper">
                <div className="data-table-toolbar">
                    <div className="data-table-toolbar-left">
                        <div className="data-table-search">
                            <span className="data-table-search-icon">⌕</span>
                            <input placeholder="Search RFPs..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>
                </div>
                <table className="data-table">
                    <thead><tr><th>RFP #</th><th>Title</th><th>Budget</th><th>Vendors</th><th>Submissions</th><th>Due Date</th><th>Status</th></tr></thead>
                    <tbody>
                        {filtered.map(rfp => (
                            <tr key={rfp.id} className="clickable" onClick={() => handleSelectRFP(rfp)}>
                                <td><span className="data-table-id">{rfp.id}</span></td>
                                <td className="truncate" style={{ maxWidth: 220 }}>{rfp.title}</td>
                                <td>₹{((rfp.budget || 0) / 100000).toFixed(1)}L</td>
                                <td>{(rfp.vendors || []).length}</td>
                                <td>
                                    {rfp.submissions > 0
                                        ? <span className="tag tag-green">{rfp.submissions} received</span>
                                        : <span className="tag">None</span>
                                    }
                                </td>
                                <td>{rfp.dueDate}</td>
                                <td><span className={`badge badge-${(rfp.status || '').toLowerCase().replace(/\s+/g, '-')}`}><span className="badge-dot"></span>{rfp.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ===== CREATE RFP MODAL ===== */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal modal-lg">
                        <div className="modal-header">
                            <h2>{agentState ? 'AI Sourcing Agent' : 'New RFP Configuration'}</h2>
                            <button className="modal-close" onClick={() => { setShowForm(false); setAgentState(null); }}>×</button>
                        </div>
                        <div className="modal-body overflow-visible">
                            {!agentState ? (
                                <div className="rfp-form-grid">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Requirement Title</label>
                                            <input className="form-input" placeholder="e.g. MacBook Pro for Engineering Team" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Asset Class</label>
                                            <select className="form-select" value={form.assetClass} onChange={e => setForm({ ...form, assetClass: e.target.value })}>
                                                <option>IT & Telecom</option><option>Manufacturing</option><option>Infrastructure</option><option>Construction</option><option>Fleet & Logistics</option><option>Services & Consulting</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Asset Category</label>
                                            <select className="form-select" value={form.assetCategory} onChange={e => setForm({ ...form, assetCategory: e.target.value })}>
                                                <option>Hardware</option><option>Software</option><option>Raw Materials</option><option>Heavy Machinery</option><option>Office Supplies</option><option>Professional Services</option><option>IT Services</option><option>Facility Management</option><option>Consulting</option><option>Logistics Services</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Target Item</label>
                                            <input className="form-input" placeholder="e.g. MacBook Pro M3 14-inch" value={form.item} onChange={e => setForm({ ...form, item: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Quantity</label>
                                            <input className="form-input" type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Delivery Location</label>
                                            <input className="form-input" placeholder="e.g. Bangalore Tech Center" value={form.deliveryLocation} onChange={e => setForm({ ...form, deliveryLocation: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Budget Range</label>
                                            <input className="form-input" placeholder="e.g. ₹20,00,000" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Due Date</label>
                                            <input className="form-input" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Description</label>
                                        <textarea className="form-textarea" rows="2" placeholder="Provide additional specs..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}></textarea>
                                    </div>

                                    {/* === CRITERIA & WEIGHTS EDITOR === */}
                                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginTop: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <div>
                                                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Evaluation Criteria & Weights</h3>
                                                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>Define how vendors will be scored. Weights should total 100%.</p>
                                            </div>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600,
                                                background: criteriaTotal === 100 ? '#ecfdf5' : '#fef2f2',
                                                color: criteriaTotal === 100 ? '#059669' : '#dc2626'
                                            }}>
                                                Total: {criteriaTotal}%
                                            </span>
                                        </div>
                                        {formCriteria.map((c, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                                                <input
                                                    style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px', fontSize: '0.875rem', background: '#fff' }}
                                                    value={c.name}
                                                    onChange={e => {
                                                        const updated = formCriteria.map((cr, idx) => idx === i ? { ...cr, name: e.target.value } : cr);
                                                        setFormCriteria(updated);
                                                    }}
                                                />
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '150px' }}>
                                                    <input type="range" min="0" max="100" value={c.weight}
                                                        style={{ flex: 1, accentColor: '#3b82f6' }}
                                                        onChange={e => updateCriteriaWeight(i, e.target.value)} />
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', minWidth: '36px', textAlign: 'right' }}>{c.weight}%</span>
                                                </div>
                                                <button onClick={() => removeCriterion(i)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                                                    title="Remove criterion">
                                                    <IconX size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        <button onClick={addCriterion} style={{
                                            background: 'none', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '8px 16px',
                                            color: '#64748b', cursor: 'pointer', fontSize: '0.8rem', width: '100%', marginTop: '4px'
                                        }}>+ Add Criterion</button>
                                    </div>

                                    <div className="ai-agent-teaser">
                                        <div className="ai-agent-teaser-icon"><IconAI size={24} /></div>
                                        <div className="ai-agent-teaser-text">
                                            <strong>AI Search Enabled</strong>
                                            <p>Our agent will discover vendors and rank them using your criteria weights.</p>
                                        </div>
                                    </div>
                                </div>
                            ) : agentState === 'searching' ? (
                                <div className="ai-search-view">
                                    <div className="ai-wave-container"><div className="ai-wave">
                                        <div className="wave-bar"></div><div className="wave-bar"></div><div className="wave-bar"></div>
                                        <div className="wave-bar"></div><div className="wave-bar"></div><div className="wave-bar"></div>
                                        <div className="wave-bar"></div><div className="wave-bar"></div><div className="wave-bar"></div>
                                    </div></div>
                                    <div className="ai-status-text">{currentStatus}</div>
                                    <div className="ai-search-overlay-logo"><IconAI size={48} /></div>
                                </div>
                            ) : agentState === 'selecting' ? (
                                <div className="agent-selection">
                                    <div className="selection-header">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h3>Discovered Companies</h3>
                                                <p>Found {discoveredVendors.length} companies matching "{form.item}"</p>
                                            </div>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                                                onClick={() => {
                                                    if (selectedVendors.length === discoveredVendors.length) {
                                                        setSelectedVendors([]);
                                                    } else {
                                                        setSelectedVendors([...discoveredVendors]);
                                                    }
                                                }}
                                            >
                                                {selectedVendors.length === discoveredVendors.length ? 'Deselect All' : 'Select All'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="vendor-list-scroll">
                                        {discoveredVendors.map((v, idx) => (
                                            <div key={v.name} className={`vendor-row-compact ${selectedVendors.find(sv => sv.name === v.name) ? 'selected' : ''}`} onClick={() => toggleVendor(v)}>
                                                <div className="vendor-row-num">{idx + 1}</div>
                                                <div className="vendor-card-check">
                                                    {selectedVendors.find(sv => sv.name === v.name) ? <IconCheck size={14} /> : <div className="check-empty" />}
                                                </div>
                                                <div className="vendor-card-detail">
                                                    <strong>{v.name}</strong>
                                                    <span>{v.city} • {v.specialty}</span>
                                                </div>
                                                <span className="vendor-row-badge">{v.category}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : agentState === 'drafting' ? (
                                <div className="agent-drafts">
                                    <h3>Personalized Vendor Outreach</h3>
                                    <div className="draft-container">
                                        {emailDrafts.map((draft, i) => (
                                            <div key={i} className="email-draft-box">
                                                <div className="draft-header">To: {draft.to}</div>
                                                <div className="draft-subject">Re: {draft.subject}</div>
                                                <pre className="draft-content">{draft.body}</pre>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => { setShowForm(false); setAgentState(null); }}>Cancel</button>
                            {!agentState && <button className="btn btn-primary" onClick={startDiscovery} disabled={criteriaTotal !== 100}>
                                {criteriaTotal !== 100 ? `Weights must equal 100% (${criteriaTotal}%)` : 'Find Vendors with AI'}
                            </button>}
                            {agentState === 'selecting' && <button className="btn btn-primary" onClick={generateDrafts}>Generate Drafts ({selectedVendors.length})</button>}
                            {agentState === 'drafting' && <button className="btn btn-success" onClick={finalizeRFP} disabled={saving}>{saving ? 'Dispatching...' : 'Approve & Send'}</button>}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== RANKING DETAIL PANEL ===== */}
            {selected && (
                <>
                    <div className="detail-panel-overlay" onClick={() => setSelected(null)}></div>
                    <div className="detail-panel" style={{ width: '720px' }}>
                        <div className="detail-panel-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', background: '#eff6ff', color: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                                    {selected.id?.split('-')[0]}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{selected.id}</h2>
                                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>{selected.status} • {selected.category}</p>
                                </div>
                            </div>
                            <button className="modal-close" onClick={() => setSelected(null)}><IconX size={20} /></button>
                        </div>

                        <div className="detail-panel-body" style={{ padding: '0' }}>
                            {/* RFP Info Summary */}
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', margin: '0 0 8px 0' }}>{selected.title}</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                    <div><span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Budget</span><p style={{ fontSize: '0.95rem', fontWeight: 600, margin: '2px 0 0' }}>₹{((selected.budget || 0) / 100000).toFixed(1)}L</p></div>
                                    <div><span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Due Date</span><p style={{ fontSize: '0.95rem', fontWeight: 600, margin: '2px 0 0' }}>{selected.dueDate}</p></div>
                                    <div><span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Submissions</span><p style={{ fontSize: '0.95rem', fontWeight: 600, margin: '2px 0 0' }}>{selected.submissions || 0}</p></div>
                                </div>
                            </div>

                            {/* Ranking Content */}
                            {rankingData && rankingData.rankings && rankingData.rankings.length > 0 ? (
                                <div>
                                    {/* Tab Buttons */}
                                    <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', padding: '0 20px' }}>
                                        {[
                                            { id: 'leaderboard', label: '🏆 Leaderboard' },
                                            { id: 'shortlist', label: '🤖 AI Shortlist' },
                                            { id: 'compare', label: '⚖️ Compare' },
                                        ].map(t => (
                                            <button key={t.id} onClick={() => setRankTab(t.id)} style={{
                                                padding: '12px 16px', background: 'none', border: 'none', fontFamily: 'inherit',
                                                fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
                                                color: rankTab === t.id ? '#2563eb' : '#64748b',
                                                borderBottom: `2px solid ${rankTab === t.id ? '#2563eb' : 'transparent'}`,
                                                marginBottom: '-2px'
                                            }}>{t.label}</button>
                                        ))}
                                    </div>

                                    {/* What-If Weight Sliders */}
                                    {whatIfCriteria && (
                                        <div style={{ padding: '12px 20px', background: '#fafafa', borderBottom: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    ⚡ Adjust Weights (Live Re-ranking)
                                                </span>
                                                <span style={{ fontSize: '0.7rem', color: whatIfCriteria.reduce((s, c) => s + c.weight, 0) === 100 ? '#059669' : '#dc2626', fontWeight: 600 }}>
                                                    {whatIfCriteria.reduce((s, c) => s + c.weight, 0)}%
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {whatIfCriteria.map((c, i) => (
                                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px 10px', fontSize: '0.75rem' }}>
                                                        <span style={{ color: '#334155', fontWeight: 500, whiteSpace: 'nowrap' }}>{c.name.split(' ')[0]}</span>
                                                        <input type="range" min="0" max="60" value={c.weight} style={{ width: '60px', accentColor: '#3b82f6' }}
                                                            onChange={e => handleWhatIfChange(i, parseInt(e.target.value))} />
                                                        <span style={{ fontWeight: 600, color: '#2563eb', minWidth: '24px' }}>{c.weight}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ padding: '16px 20px', overflowY: 'auto', maxHeight: 'calc(100vh - 400px)' }}>
                                        {/* LEADERBOARD TAB */}
                                        {rankTab === 'leaderboard' && (
                                            <div>
                                                {rankingData.rankings.map((v, i) => (
                                                    <div key={v.vendorId} style={{
                                                        display: 'flex', gap: '14px', padding: '14px', marginBottom: '10px',
                                                        background: i === 0 ? '#fffbeb' : '#fff', border: '1px solid',
                                                        borderColor: i === 0 ? '#fde68a' : '#e2e8f0', borderRadius: '12px',
                                                        alignItems: 'flex-start', transition: 'all 0.2s'
                                                    }}>
                                                        {/* Rank Badge */}
                                                        <div style={{
                                                            ...getRankBadgeStyle(v.rank), width: '32px', height: '32px',
                                                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontWeight: 700, fontSize: '0.85rem', flexShrink: 0
                                                        }}>#{v.rank}</div>

                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{v.vendorName}</h4>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: getScoreColor(v.composite) }}>{v.composite}</span>
                                                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>/100</span>
                                                                </div>
                                                            </div>
                                                            {/* Score Bars */}
                                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '8px' }}>
                                                                {Object.entries(v.scores).map(([key, score]) => (
                                                                    <div key={key} style={{ fontSize: '0.65rem' }}>
                                                                        <div style={{ color: '#94a3b8', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{key.split(' ')[0]}</div>
                                                                        <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                                                                            <div style={{ height: '100%', width: `${score}%`, background: getScoreColor(score), borderRadius: '2px', transition: 'width 0.5s ease' }}></div>
                                                                        </div>
                                                                        <div style={{ color: '#475569', fontWeight: 600, marginTop: '1px' }}>{score}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            {/* Key details */}
                                                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.75rem', color: '#64748b' }}>
                                                                <span>💰 ₹{(v.quotedPrice / 100000).toFixed(1)}L</span>
                                                                <span>📦 {v.deliveryDays} days</span>
                                                                <span>🛡 {v.warranty}</span>
                                                                <span>📋 {v.paymentTerms}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* AI SHORTLIST TAB */}
                                        {rankTab === 'shortlist' && (
                                            <div>
                                                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                                    <IconAI size={20} />
                                                    <div>
                                                        <strong style={{ fontSize: '0.9rem', color: '#0c4a6e' }}>AI Recommendation</strong>
                                                        <p style={{ fontSize: '0.825rem', color: '#0369a1', margin: '4px 0 0' }}>
                                                            Based on your evaluation criteria, here are the top {Math.min(5, rankingData.rankings.length)} vendors recommended for this RFP.
                                                        </p>
                                                    </div>
                                                </div>
                                                {rankingData.rankings.slice(0, 5).map(v => (
                                                    <div key={v.vendorId} style={{
                                                        background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px',
                                                        marginBottom: '12px', borderLeft: `4px solid ${getScoreColor(v.composite)}`
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <span style={{ ...getRankBadgeStyle(v.rank), width: '24px', height: '24px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>#{v.rank}</span>
                                                                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{v.vendorName}</h4>
                                                            </div>
                                                            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: getScoreColor(v.composite) }}>{v.composite}/100</span>
                                                        </div>
                                                        <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6, margin: '0 0 12px 0' }}>{v.aiSummary}</p>
                                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                            {v.certifications.map(c => (
                                                                <span key={c} className="tag tag-blue" style={{ fontSize: '0.7rem' }}>{c}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* COMPARE TAB */}
                                        {rankTab === 'compare' && (
                                            <div>
                                                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px' }}>Select 2-5 vendors to compare side-by-side:</p>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                                    {rankingData.rankings.map(v => (
                                                        <button key={v.vendorId} onClick={() => toggleCompare(v.vendorId)}
                                                            style={{
                                                                padding: '6px 14px', borderRadius: '99px', border: '1px solid',
                                                                borderColor: compareVendors.includes(v.vendorId) ? '#3b82f6' : '#e2e8f0',
                                                                background: compareVendors.includes(v.vendorId) ? '#eff6ff' : '#fff',
                                                                color: compareVendors.includes(v.vendorId) ? '#2563eb' : '#64748b',
                                                                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, fontFamily: 'inherit'
                                                            }}>
                                                            {compareVendors.includes(v.vendorId) ? '✓ ' : ''}{v.vendorName.split(' ').slice(0, 2).join(' ')}
                                                        </button>
                                                    ))}
                                                </div>
                                                {compareVendors.length >= 2 && (
                                                    <div style={{ overflowX: 'auto' }}>
                                                        <table className="data-table" style={{ fontSize: '0.8rem' }}>
                                                            <thead>
                                                                <tr>
                                                                    <th style={{ minWidth: '140px' }}>Criterion</th>
                                                                    {rankingData.rankings.filter(v => compareVendors.includes(v.vendorId)).map(v => (
                                                                        <th key={v.vendorId} style={{ textAlign: 'center', minWidth: '110px' }}>{v.vendorName.split(' ').slice(0, 2).join(' ')}</th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr style={{ fontWeight: 600 }}>
                                                                    <td>Overall Score</td>
                                                                    {rankingData.rankings.filter(v => compareVendors.includes(v.vendorId)).map(v => {
                                                                        const comparedScores = rankingData.rankings.filter(x => compareVendors.includes(x.vendorId)).map(x => x.composite);
                                                                        const isMax = v.composite === Math.max(...comparedScores);
                                                                        return <td key={v.vendorId} style={{ textAlign: 'center', color: getScoreColor(v.composite), background: isMax ? '#f0fdf4' : 'transparent' }}>{v.composite}/100</td>;
                                                                    })}
                                                                </tr>
                                                                {Object.keys(rankingData.rankings[0]?.scores || {}).map(criterion => {
                                                                    const comparedVendors = rankingData.rankings.filter(v => compareVendors.includes(v.vendorId));
                                                                    const maxScore = Math.max(...comparedVendors.map(v => v.scores[criterion] || 0));
                                                                    return (
                                                                        <tr key={criterion}>
                                                                            <td>{criterion}</td>
                                                                            {comparedVendors.map(v => {
                                                                                const score = v.scores[criterion] || 0;
                                                                                const isMax = score === maxScore;
                                                                                return (
                                                                                    <td key={v.vendorId} style={{ textAlign: 'center', background: isMax ? '#f0fdf4' : 'transparent', fontWeight: isMax ? 600 : 400 }}>
                                                                                        {score}
                                                                                    </td>
                                                                                );
                                                                            })}
                                                                        </tr>
                                                                    );
                                                                })}
                                                                <tr>
                                                                    <td>Quoted Price</td>
                                                                    {rankingData.rankings.filter(v => compareVendors.includes(v.vendorId)).map(v => {
                                                                        const prices = rankingData.rankings.filter(x => compareVendors.includes(x.vendorId)).map(x => x.quotedPrice);
                                                                        const isMin = v.quotedPrice === Math.min(...prices);
                                                                        return <td key={v.vendorId} style={{ textAlign: 'center', background: isMin ? '#f0fdf4' : 'transparent', fontWeight: isMin ? 600 : 400 }}>₹{(v.quotedPrice / 100000).toFixed(1)}L</td>;
                                                                    })}
                                                                </tr>
                                                                <tr>
                                                                    <td>Delivery</td>
                                                                    {rankingData.rankings.filter(v => compareVendors.includes(v.vendorId)).map(v => {
                                                                        const days = rankingData.rankings.filter(x => compareVendors.includes(x.vendorId)).map(x => x.deliveryDays);
                                                                        const isMin = v.deliveryDays === Math.min(...days);
                                                                        return <td key={v.vendorId} style={{ textAlign: 'center', background: isMin ? '#f0fdf4' : 'transparent', fontWeight: isMin ? 600 : 400 }}>{v.deliveryDays} days</td>;
                                                                    })}
                                                                </tr>
                                                                <tr>
                                                                    <td>Warranty</td>
                                                                    {rankingData.rankings.filter(v => compareVendors.includes(v.vendorId)).map(v => (
                                                                        <td key={v.vendorId} style={{ textAlign: 'center' }}>{v.warranty}</td>
                                                                    ))}
                                                                </tr>
                                                                <tr>
                                                                    <td>Payment Terms</td>
                                                                    {rankingData.rankings.filter(v => compareVendors.includes(v.vendorId)).map(v => (
                                                                        <td key={v.vendorId} style={{ textAlign: 'center' }}>{v.paymentTerms}</td>
                                                                    ))}
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                                {compareVendors.length < 2 && (
                                                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                                                        <p style={{ fontSize: '0.9rem' }}>Select at least 2 vendors above to see comparison</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                /* No rankings — show basic info */
                                <div style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                                        {(selected.vendors || []).map(v => <span key={v} className="tag">{v}</span>)}
                                    </div>
                                    {selected.status === 'Open' && (
                                        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '16px', display: 'flex', gap: '10px' }}>
                                            <IconAI size={18} />
                                            <div>
                                                <strong style={{ color: '#0c4a6e', fontSize: '0.9rem' }}>Awaiting Vendor Responses</strong>
                                                <p style={{ color: '#0369a1', fontSize: '0.8rem', margin: '4px 0 0' }}>AI ranking will activate once vendors submit their proposals.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            <style jsx>{`
                .rfp-form-grid { display: flex; flex-direction: column; gap: 16px; }
                .ai-agent-teaser { background: #f0f9ff; border: 1px dashed #bae6fd; padding: 16px; border-radius: 12px; display: flex; gap: 12px; align-items: flex-start; }
                .ai-agent-teaser-icon { color: #0369a1; padding-top: 2px; }
                .ai-agent-teaser-text strong { display: block; color: #0c4a6e; font-size: 0.9rem; }
                .ai-agent-teaser-text p { color: #0369a1; font-size: 0.8rem; margin: 0; }
                .ai-search-view { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; min-height: 400px; background: radial-gradient(circle at center, #f8fafc 0%, #f1f5f9 100%); position: relative; }
                .ai-wave-container { height: 100px; display: flex; align-items: center; justify-content: center; }
                .ai-wave { display: flex; align-items: center; gap: 6px; height: 60px; }
                .wave-bar { width: 4px; height: 15px; background: linear-gradient(to bottom, #3b82f6, #60a5fa); border-radius: 3px; animation: wave 1.2s ease-in-out infinite; }
                .wave-bar:nth-child(2) { animation-delay: 0.1s; background: #60a5fa; }
                .wave-bar:nth-child(3) { animation-delay: 0.2s; background: #93c5fd; }
                .wave-bar:nth-child(4) { animation-delay: 0.3s; background: #3b82f6; }
                .wave-bar:nth-child(5) { animation-delay: 0.4s; background: #60a5fa; }
                .wave-bar:nth-child(6) { animation-delay: 0.5s; background: #93c5fd; }
                .wave-bar:nth-child(7) { animation-delay: 0.6s; background: #3b82f6; }
                .wave-bar:nth-child(8) { animation-delay: 0.7s; background: #60a5fa; }
                .wave-bar:nth-child(9) { animation-delay: 0.8s; background: #93c5fd; }
                @keyframes wave { 0%, 100% { height: 15px; transform: scaleY(1); } 50% { height: 50px; transform: scaleY(1.2); } }
                .ai-status-text { margin-top: 30px; font-size: 1.1rem; color: #475569; font-weight: 500; text-align: center; }
                .ai-search-overlay-logo { position: absolute; bottom: 30px; opacity: 0.1; color: #3b82f6; }
                .vendor-list-scroll { max-height: 420px; overflow-y: auto; margin-top: 10px; display: flex; flex-direction: column; gap: 6px; padding-right: 4px; }
                .vendor-list-scroll::-webkit-scrollbar { width: 5px; }
                .vendor-list-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
                .vendor-list-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .vendor-row-compact { padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px; display: flex; gap: 10px; cursor: pointer; transition: all 0.2s; background: #fff; align-items: center; }
                .vendor-row-compact:hover { border-color: #3b82f6; background: #f8fafc; }
                .vendor-row-compact.selected { border-color: #3b82f6; background: #eff6ff; }
                .vendor-row-num { width: 22px; height: 22px; border-radius: 50%; background: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; flex-shrink: 0; }
                .vendor-row-compact.selected .vendor-row-num { background: #dbeafe; color: #2563eb; }
                .vendor-row-badge { font-size: 0.65rem; padding: 2px 8px; border-radius: 99px; background: #f0fdf4; color: #16a34a; font-weight: 500; white-space: nowrap; flex-shrink: 0; margin-left: auto; }
                .vendor-card-check { width: 20px; padding-top: 2px; flex-shrink: 0; }
                .check-empty { width: 18px; height: 18px; border: 2px solid #cbd5e1; border-radius: 5px; }
                .selected .check-empty { border-color: #3b82f6; }
                .vendor-card-detail { display: flex; flex-direction: column; min-width: 0; flex: 1; }
                .vendor-card-detail strong { font-size: 0.85rem; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .vendor-card-detail span { font-size: 0.72rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .email-draft-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
                .draft-header { font-size: 0.8rem; color: #64748b; margin-bottom: 4px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
                .draft-subject { font-size: 0.9rem; font-weight: 700; color: #1e293b; margin-bottom: 12px; }
                .draft-content { font-family: inherit; font-size: 0.85rem; color: #334155; white-space: pre-wrap; margin: 0; }
            `}</style>
        </div>
    );
}
