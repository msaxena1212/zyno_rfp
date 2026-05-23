'use client';
import { useState, useEffect } from 'react';

import { useToast } from '@/components/Toast';

export default function EAuctionPage() {
    const toast = useToast();
    const handleAction = (action) => toast.info(action + ' feature coming soon');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        fetch('/api/e-auction').then(r => r.json()).then(d => { setData(d.data || d); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left"><h1>E-Auction</h1><p className="page-header-subtitle">Run competitive reverse auctions with AI reserve price suggestions</p></div>
                <div className="page-header-actions"><button className="btn btn-primary" onClick={() => handleAction('+ Create Auction')}>+ Create Auction</button></div>
            </div>

            <div className="ai-insights-section">
                <div className="ai-insight-card">
                    <div className="ai-insight-icon">🔨</div>
                    <div className="ai-insight-content">
                        <div className="ai-insight-header"><span className="ai-insight-title">Reserve Price Suggestion</span><span className="ai-insight-badge">AI</span></div>
                        <p className="ai-insight-message">For AUC-00001 (Steel Procurement Q2), AI suggests a reserve price of ₹24L based on historical market trends. Current market rate for MS Steel is trending down 3.2%.</p>
                    </div>
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Total Auctions</div><div className="stat-card-value">{data.length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Live</div><div className="stat-card-value">{(Array.isArray(data) ? data : []).filter(a => a.status === 'Live').length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Upcoming</div><div className="stat-card-value">{(Array.isArray(data) ? data : []).filter(a => a.status === 'Upcoming').length}</div></div></div>
                <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Completed</div><div className="stat-card-value">{(Array.isArray(data) ? data : []).filter(a => a.status === 'Completed').length}</div></div></div>
            </div>

            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead><tr><th>Auction #</th><th>Title</th><th>Category</th><th>Start</th><th>End</th><th>Reserve Price</th><th>Current Bid</th><th>Bids</th><th>Status</th></tr></thead>
                    <tbody>
                        {(Array.isArray(data) ? data : []).map(auc => (
                            <tr key={auc.id} className="clickable" onClick={() => setSelected(auc)}>
                                <td><span className="data-table-id">{auc.id}</span></td>
                                <td className="truncate" style={{ maxWidth: 200 }}>{auc.title}</td>
                                <td><span className="tag tag-blue">{auc.category}</span></td>
                                <td>{new Date(auc.startDate).toLocaleDateString()}</td>
                                <td>{new Date(auc.endDate).toLocaleDateString()}</td>
                                <td>₹{((auc.reservePrice || 0) / 100000).toFixed(1)}L</td>
                                <td style={{ fontWeight: 600, color: auc.currentBid > 0 ? '#10B981' : '#94A3B8' }}>{auc.currentBid > 0 ? `₹${((auc.currentBid) / 100000).toFixed(1)}L` : '—'}</td>
                                <td>{(auc.bids || []).length}</td>
                                <td><span className={`badge badge-${auc.status === 'Live' ? 'in-progress' : auc.status === 'Completed' ? 'completed' : 'pending'}`}><span className="badge-dot"></span>{auc.status}</span></td>
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
                                <div className="detail-section-title">Auction Details</div>
                                <div className="detail-field"><span className="detail-field-label">Title</span><span className="detail-field-value">{selected.title}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Category</span><span className="detail-field-value">{selected.category}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Reserve Price</span><span className="detail-field-value" style={{ fontWeight: 700 }}>₹{((selected.reservePrice || 0) / 100000).toFixed(1)}L</span></div>
                                <div className="detail-field"><span className="detail-field-label">Current Bid</span><span className="detail-field-value" style={{ fontWeight: 700, color: '#10B981' }}>{selected.currentBid > 0 ? `₹${((selected.currentBid) / 100000).toFixed(1)}L` : 'No bids'}</span></div>
                                <div className="detail-field"><span className="detail-field-label">Participants</span><span className="detail-field-value">{(selected.participants || []).length} vendors</span></div>
                                <div className="detail-field"><span className="detail-field-label">Status</span><span className="detail-field-value"><span className={`badge badge-${selected.status === 'Live' ? 'in-progress' : selected.status === 'Completed' ? 'completed' : 'pending'}`}><span className="badge-dot"></span>{selected.status}</span></span></div>
                            </div>
                            {(selected.bids || []).length > 0 && (
                                <div className="detail-section">
                                    <div className="detail-section-title">Bid History</div>
                                    <div className="timeline">
                                        {(selected.bids || []).map((bid, i) => (
                                            <div className="timeline-item" key={i}>
                                                <div className={`timeline-dot${i === 0 ? ' success' : ''}`}></div>
                                                <div className="timeline-content">
                                                    <div className="timeline-title">₹{(bid.amount / 100000).toFixed(1)}L — {bid.vendor}</div>
                                                    <div className="timeline-meta">{bid.time}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="detail-panel-footer" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}><button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>{selected.status === 'Completed' && <button className="btn btn-success" onClick={() => handleAction('🏆 Award Winner')}>🏆 Award Winner</button>}</div>
                    </div>
                </>
            )}
        </div>
    );
}
