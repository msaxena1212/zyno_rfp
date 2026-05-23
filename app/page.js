'use client';
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useToast } from '@/components/Toast';
import { IconDollar, IconCheck, IconBuilding, IconClipboard, IconPackage, IconAI, IconDownload, IconPlus, IconBarChart } from '@/components/Icons';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();
    const router = useRouter();

    useEffect(() => {
        fetch('/api/dashboard')
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleExport = () => {
        toast.info('Exporting dashboard report...');
        setTimeout(() => toast.success('Report downloaded successfully'), 1500);
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
    if (!data) return <div className="empty-state"><h3>Unable to load dashboard</h3></div>;

    const { stats, monthlySpend, recentPRs, topVendors } = data;

    const statusData = [
        { name: 'Approved', value: 35, color: '#10B981' },
        { name: 'Pending', value: 22, color: '#F59E0B' },
        { name: 'In Transit', value: 18, color: '#3B82F6' },
        { name: 'Delivered', value: 15, color: '#6366F1' },
        { name: 'Draft', value: 10, color: '#94A3B8' },
    ];

    const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#6366F1', '#94A3B8'];

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <div className="flex items-center gap-2">
                        <h1>Executive Dashboard</h1>
                        <span className="tag" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }} className="pulse-glow"></span> AI Active
                        </span>
                    </div>
                    <p className="page-header-subtitle">Real-time procurement overview and smart insights engine</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary" onClick={() => router.push('/reports')}><IconBarChart size={16} /> Deep Analytics</button>
                    <button className="btn btn-secondary" onClick={handleExport}><IconDownload size={16} /> Export</button>
                    <button className="btn btn-primary" onClick={() => router.push('/pr')}><IconPlus size={16} /> New PR</button>
                </div>
            </div>

            {/* Smart Insights Briefing */}
            <div className="smart-briefing-section mb-6">
                <div className="ai-briefing-panel" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <div className="ai-briefing-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <IconAI size={22} color="#8b5cf6" />
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: '#0f172a' }}>Smart Briefing</h2>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Auto-generated</span>
                    </div>
                    <div className="ai-briefing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', padding: '10px', gap: '10px' }}>
                        <div style={{ borderLeft: '4px solid #ef4444', background: '#fef2f2', padding: '16px', borderRadius: '4px 8px 8px 4px' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#b91c1c', margin: '0 0 4px 0' }}>Critical Restock</h4>
                            <p style={{ fontSize: '0.85rem', color: '#991b1b', margin: 0, lineHeight: 1.5 }}>{stats.lowStockItems} inventory items below safety stock. AI suggests immediate PO generation.</p>
                        </div>
                        <div style={{ borderLeft: '4px solid #10b981', background: '#ecfdf5', padding: '16px', borderRadius: '4px 8px 8px 4px' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#047857', margin: '0 0 4px 0' }}>Savings Opportunity</h4>
                            <p style={{ fontSize: '0.85rem', color: '#065f46', margin: 0, lineHeight: 1.5 }}>Consolidating pending hardware PRs could yield an estimated 8% volume discount (₹1.2L savings).</p>
                        </div>
                        <div style={{ borderLeft: '4px solid #3b82f6', background: '#eff6ff', padding: '16px', borderRadius: '4px 8px 8px 4px' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1d4ed8', margin: '0 0 4px 0' }}>Budget Analysis</h4>
                            <p style={{ fontSize: '0.85rem', color: '#1e40af', margin: 0, lineHeight: 1.5 }}>IT department projecting 12% overspend by Q3. Review upcoming software renewals.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-card-icon blue"><IconDollar size={20} /></div>
                    <div className="stat-card-content">
                        <div className="stat-card-label">Total Spend</div>
                        <div className="stat-card-value">₹{((stats.totalSpend || 0) / 100000).toFixed(1)}L</div>
                        <span className="stat-card-trend up">↑ 12.5%</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon orange"><IconCheck size={20} /></div>
                    <div className="stat-card-content">
                        <div className="stat-card-label">Pending Approvals</div>
                        <div className="stat-card-value">{stats.pendingApprovals}</div>
                        <span className="stat-card-trend down">↓ 2 from yesterday</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon green"><IconBuilding size={20} /></div>
                    <div className="stat-card-content">
                        <div className="stat-card-label">Active Vendors</div>
                        <div className="stat-card-value">{stats.activeVendors}</div>
                        <span className="stat-card-trend neutral">— Stable</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon red"><IconClipboard size={20} /></div>
                    <div className="stat-card-content">
                        <div className="stat-card-label">Pending PRs</div>
                        <div className="stat-card-value">{stats.pendingPRs}</div>
                        <span className="stat-card-trend up">↑ 1 new</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon purple"><IconPackage size={20} /></div>
                    <div className="stat-card-content">
                        <div className="stat-card-label">Low Stock</div>
                        <div className="stat-card-value">{stats.lowStockItems}</div>
                        <span className="stat-card-trend down">Action needed</span>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-row">
                <div className="chart-card">
                    <div className="chart-card-header">
                        <h3>Monthly Spend</h3>
                    </div>
                    <div className="chart-card-body">
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={monthlySpend}>
                                <defs>
                                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} axisLine={false} tickLine={false} />
                                <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Spend']} />
                                <Area type="monotone" dataKey="amount" stroke="#2563EB" strokeWidth={2} fill="url(#colorSpend)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-card-header">
                        <h3>Order Status</h3>
                    </div>
                    <div className="chart-card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Tables Row */}
            <div className="charts-row">
                {/* Recent PRs */}
                <div className="data-table-wrapper">
                    <div className="data-table-toolbar">
                        <div className="data-table-toolbar-left"><h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Recent Requisitions</h3></div>
                        <button onClick={() => router.push('/pr')} className="btn btn-sm btn-ghost">View All →</button>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>PR #</th>
                                <th>Title</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(recentPRs || []).map(pr => (
                                <tr key={pr.id} className="clickable" onClick={() => router.push('/pr')}>
                                    <td><span className="data-table-id">{pr.id}</span></td>
                                    <td className="truncate" style={{ maxWidth: 200 }}>{pr.title}</td>
                                    <td>₹{(pr.totalAmount || 0).toLocaleString('en-IN')}</td>
                                    <td><span className={`badge badge-${(pr.status || '').toLowerCase().replace(/\s+/g, '-')}`}><span className="badge-dot"></span>{pr.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Top Vendors */}
                <div className="data-table-wrapper">
                    <div className="data-table-toolbar">
                        <div className="data-table-toolbar-left"><h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Top Vendors</h3></div>
                        <button onClick={() => router.push('/vendors')} className="btn btn-sm btn-ghost">View All →</button>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Vendor</th>
                                <th>Rating</th>
                                <th>On-Time</th>
                                <th>Spend</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(topVendors || []).map(v => (
                                <tr key={v.id} className="clickable" onClick={() => router.push('/vendors')}>
                                    <td style={{ fontWeight: 500 }}>{v.name}</td>
                                    <td>{v.rating}/5</td>
                                    <td><span className={`tag ${v.onTimeDelivery >= 90 ? 'tag-green' : 'tag-orange'}`}>{v.onTimeDelivery}%</span></td>
                                    <td>₹{((v.totalSpend || 0) / 100000).toFixed(1)}L</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
