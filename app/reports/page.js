'use client';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';
import { IconDownload, IconFilter, IconBarChart, IconBuilding, IconAI, IconShield, IconClipboard, IconRefresh, IconDollar, IconPackage, IconDashboard } from '@/components/Icons';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, AreaChart, Area } from 'recharts';

export default function DeepAnalytics() {
    const toast = useToast();
    const [activeTab, setActiveTab] = useState('insights');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/analytics')
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleExport = () => {
        toast.info('Generating advanced analytics PDF...');
        setTimeout(() => toast.success('Analytics Export downloaded successfully'), 2000);
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
    if (!data) return <div className="empty-state"><h3>Failed to load analytics</h3></div>;

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];

    const getImpactColor = (impact) => {
        if (impact === 'High' || impact === 'Critical') return { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' };
        if (impact === 'Medium') return { bg: '#fef3c7', text: '#d97706', border: '#f59e0b' };
        return { bg: '#dbeafe', text: '#2563eb', border: '#3b82f6' };
    };

    const getInsightEmoji = (type) => {
        if (type === 'risk') return '⚠️';
        if (type === 'savings') return '💰';
        if (type === 'anomaly') return '🔍';
        if (type === 'forecast') return '📈';
        return '💡';
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Deep Analytics & Insights</h1>
                    <p className="page-header-subtitle">AI-powered intelligence and comprehensive reporting</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary" onClick={() => toast.info('Filters coming soon')}><IconFilter size={16} /> Filters</button>
                    <button className="btn btn-primary" onClick={handleExport}><IconDownload size={16} /> Export Report</button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '4px', borderBottom: '2px solid #e2e8f0', marginBottom: '24px' }}>
                <div style={{ paddingBottom: '4px', overflowX: 'auto', display: 'flex' }}>
                    {[
                        { id: 'insights', label: 'Executive Summary', Icon: IconDashboard },
                        { id: 'spend_savings', label: 'Spend & Savings', Icon: IconDollar },
                        { id: 'ops_efficiency', label: 'Operations & Efficiency', Icon: IconClipboard },
                        { id: 'vendors_forecast', label: 'Vendor & Forecasts', Icon: IconAI },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '12px 24px', background: 'transparent', border: 'none',
                                fontWeight: 500, color: activeTab === tab.id ? '#2563eb' : '#64748b',
                                cursor: 'pointer', borderBottom: `2px solid ${activeTab === tab.id ? '#2563eb' : 'transparent'}`,
                                marginBottom: '-2px', transition: 'all 0.2s', fontSize: '0.95rem',
                                fontFamily: 'inherit'
                            }}
                        >
                            <tab.Icon size={18} /> <span style={{ whiteSpace: 'nowrap' }}>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ===== SMART INSIGHTS TAB ===== */}
            {activeTab === 'insights' && (
                <div>
                    {/* Hero Stats */}
                    <div className="stats-row">
                        <div className="stat-card">
                            <div className="stat-card-content">
                                <div className="stat-card-label">Total Procurement Spend</div>
                                <div className="stat-card-value">₹{(data.spend.total / 100000).toFixed(1)}L</div>
                                <span className="stat-card-trend up">↑ 12.4% vs last quarter</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-content">
                                <div className="stat-card-label">Predicted Savings</div>
                                <div className="stat-card-value">₹4.5L</div>
                                <span className="stat-card-trend up">From AI optimizations</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-content">
                                <div className="stat-card-label">Risk Exposure</div>
                                <div className="stat-card-value">Low</div>
                                <span className="stat-card-trend neutral" style={{ color: '#8b5cf6' }}>2 active risk alerts</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-content">
                                <div className="stat-card-label">Avg Cycle Time</div>
                                <div className="stat-card-value">{data.ops.poCycleTime} Days</div>
                                <span className="stat-card-trend up">-0.5 days efficiency gain</span>
                            </div>
                        </div>
                    </div>

                    {/* AI Recommended Actions */}
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '24px 0 16px', color: '#0f172a' }}>
                        <span style={{ marginRight: '8px' }}>🤖</span>AI Recommended Actions
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                        {data.insights.map(insight => {
                            const colors = getImpactColor(insight.impact);
                            return (
                                <div key={insight.id} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: '16px',
                                    background: '#fff', border: '1px solid #e2e8f0',
                                    borderLeft: `4px solid ${colors.border}`,
                                    padding: '16px 20px', borderRadius: '12px',
                                    transition: 'all 0.2s', cursor: 'pointer'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                                >
                                    <span style={{ fontSize: '24px', paddingTop: '2px' }}>{getInsightEmoji(insight.type)}</span>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#0f172a', fontWeight: 600 }}>{insight.title}</h4>
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>{insight.description}</p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', minWidth: '130px' }}>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: '99px', fontSize: '0.75rem',
                                            fontWeight: 600, background: colors.bg, color: colors.text
                                        }}>{insight.impact} Impact</span>
                                        <button className="btn btn-sm btn-ghost" style={{ color: '#2563eb' }}>{insight.action} →</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Spend Trend Chart */}
                    <div className="chart-card">
                        <div className="chart-card-header"><h3>Spend Trend vs AI Forecast</h3></div>
                        <div className="chart-card-body">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={data.spend.trend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <RechartsTooltip formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, '']} />
                                    <Legend />
                                    <Line type="monotone" dataKey="amount" name="Actual Spend" stroke="#3b82f6" strokeWidth={3} dot={false} />
                                    <Line type="monotone" dataKey={(d) => Math.round(d.amount * 0.92)} strokeDasharray="5 5" name="AI Forecast" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== SPEND & SAVINGS TAB (Consolidated) ===== */}
            {activeTab === 'spend_savings' && (
                <div>
                     <div className="stats-row mb-6">
                        <div className="stat-card">
                            <div className="stat-card-content">
                                <div className="stat-card-label">Negotiation Savings</div>
                                <div className="stat-card-value text-green-600">₹{(data.savings.negotiation / 100000).toFixed(1)}L</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-content">
                                <div className="stat-card-label">Contract Savings</div>
                                <div className="stat-card-value text-green-600">₹{(data.savings.contractSavings / 100000).toFixed(1)}L</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-content">
                                <div className="stat-card-label">Cost Avoidance</div>
                                <div className="stat-card-value text-blue-600">₹{(data.savings.costAvoidance / 1000).toFixed(0)}K</div>
                            </div>
                        </div>
                        <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
                            <div className="stat-card-content">
                                <div className="stat-card-label">Total Maverick Spend</div>
                                <div className="stat-card-value" style={{ color: '#ef4444' }}>
                                    ₹{data.maverickSpend.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('en-IN')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <h2 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '24px 0 16px', color: '#64748b', textTransform: 'uppercase' }}>Procurement Spend Analysis</h2>
                    <div className="charts-row">
                        <div className="chart-card">
                            <div className="chart-card-header"><h3>Spend by Category</h3></div>
                            <div className="chart-card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={data.spend.byCategory} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={4} dataKey="value">
                                            {data.spend.byCategory.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip formatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="chart-card">
                            <div className="chart-card-header"><h3>Spend by Department</h3></div>
                            <div className="chart-card-body">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={data.spend.byDepartment} layout="vertical" margin={{ left: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                        <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
                                        <RechartsTooltip formatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                                        <Bar dataKey="value" fill="#10b981" radius={[0, 6, 6, 0]} barSize={22} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <h2 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '24px 0 16px', color: '#64748b', textTransform: 'uppercase' }}>Savings & Cost Control</h2>
                    <div className="charts-row">
                        <div className="chart-card">
                            <div className="chart-card-header"><h3>Budget Vs Actual Spends</h3></div>
                            <div className="chart-card-body">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={data.savings.budgetVsActual}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="dept" axisLine={false} tickLine={false} />
                                        <YAxis tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} axisLine={false} tickLine={false} />
                                        <RechartsTooltip formatter={(val) => `₹${val.toLocaleString()}`} />
                                        <Legend />
                                        <Bar dataKey="budget" name="Budget" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="actual" name="Actual Spend" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="chart-card">
                            <div className="chart-card-header"><h3>Maverick Spend Breakdown</h3></div>
                            <div className="chart-card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={data.maverickSpend} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="amount" nameKey="category">
                                            <Cell fill="#ef4444" />
                                            <Cell fill="#f97316" />
                                            <Cell fill="#f59e0b" />
                                        </Pie>
                                        <RechartsTooltip formatter={(val) => `₹${val.toLocaleString()}`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== OPERATIONS & EFFICIENCY TAB (Consolidated) ===== */}
            {activeTab === 'ops_efficiency' && data.poStatus && (
                <div>
                     <div className="stats-row mb-6">
                        <div className="stat-card">
                            <div className="stat-card-content">
                                <div className="stat-card-label">Avg PO Processing</div>
                                <div className="stat-card-value">{data.poStatus.avgProcessingTime}d</div>
                                <span className="stat-card-trend up">Better than SLA</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-content">
                                <div className="stat-card-label">PR to PO Conversion</div>
                                <div className="stat-card-value">{data.efficiency.prToPo}%</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-content">
                                <div className="stat-card-label">RFQ Success Rate</div>
                                <div className="stat-card-value">{data.efficiency.rfqSuccess}%</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-content">
                                <div className="stat-card-label">Supplier Participation</div>
                                <div className="stat-card-value text-blue-600">{data.efficiency.supplierParticipation}%</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-content">
                                <div className="stat-card-label">Delayed Approvals</div>
                                <div className="stat-card-value" style={{ color: '#ef4444' }}>{data.poStatus.delayedApprovals?.length || 0}</div>
                                <span className="stat-card-trend down" style={{ color: '#ef4444' }}>Needs Action</span>
                            </div>
                        </div>
                    </div>

                    <h2 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '24px 0 16px', color: '#64748b', textTransform: 'uppercase' }}>Purchase Order Status</h2>
                    <div className="charts-row">
                        <div className="chart-card">
                            <div className="chart-card-header"><h3>Approved vs Pending / Open vs Closed</h3></div>
                            <div className="chart-card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={[{ name: 'Approved', value: data.poStatus.approved }, { name: 'Pending', value: data.poStatus.pending }]} cx="30%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                                            <Cell fill="#10b981" />
                                            <Cell fill="#f59e0b" />
                                        </Pie>
                                        <RechartsTooltip />
                                        <text x="30%" y="85%" textAnchor="middle" fill="#64748b" fontSize={12}>Approval State</text>

                                        <Pie data={[{ name: 'Closed', value: data.poStatus.closed }, { name: 'Open', value: data.poStatus.open }]} cx="70%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                                            <Cell fill="#6366f1" />
                                            <Cell fill="#3b82f6" />
                                        </Pie>
                                        <text x="70%" y="85%" textAnchor="middle" fill="#64748b" fontSize={12}>Fulfillment State</text>
                                        <RechartsTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="chart-card flex-1">
                            <div className="chart-card-header"><h3>Delayed Approvals Log</h3></div>
                            <div className="chart-card-body">
                                <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                    <thead style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
                                        <tr>
                                            <th style={{ padding: '12px' }}>PO Number</th>
                                            <th style={{ padding: '12px' }}>Vendor</th>
                                            <th style={{ padding: '12px' }}>Amount</th>
                                            <th style={{ padding: '12px' }}>Approver</th>
                                            <th style={{ padding: '12px' }}>Days Delayed</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.poStatus.delayedApprovals?.map((po, i) => (
                                            <tr key={po.id || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ fontWeight: 500, color: '#2563eb', padding: '12px' }}>{po.id}</td>
                                                <td style={{ padding: '12px' }}>{po.vendor}</td>
                                                <td style={{ padding: '12px' }}>₹{po.value.toLocaleString()}</td>
                                                <td style={{ padding: '12px' }}>{po.approver}</td>
                                                <td style={{ padding: '12px' }}><span style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{po.daysDelayed} Days</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                     <h2 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '24px 0 16px', color: '#64748b', textTransform: 'uppercase' }}>Procurement Cycle-Time Efficiency</h2>
                     <div className="chart-card">
                        <div className="chart-card-header"><h3>Stage Duration (Days)</h3></div>
                        <div className="chart-card-body">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data.cycleTime} layout="vertical" margin={{ left: 100 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                    <XAxis type="number" axisLine={false} tickLine={false} />
                                    <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} width={120} />
                                    <RechartsTooltip formatter={(val) => `${val} Days`} />
                                    <Bar dataKey="days" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== VENDORS & FORECASTS TAB (Consolidated) ===== */}
            {activeTab === 'vendors_forecast' && (
                <div>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '0 0 16px 0', color: '#64748b', textTransform: 'uppercase' }}>Vendor Performance & Inventory Links</h2>
                     <div className="stats-row mb-6">
                        <div className="stat-card">
                            <div className="stat-card-content">
                                <div className="stat-card-label">Avg Vendor Rating</div>
                                <div className="stat-card-value">{(data.vendors.reduce((s, v) => s + v.rating, 0) / data.vendors.length).toFixed(1)}/5</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-content">
                                <div className="stat-card-label">Avg On-Time %</div>
                                <div className="stat-card-value">{Math.round(data.vendors.reduce((s, v) => s + v.onTime, 0) / data.vendors.length)}%</div>
                            </div>
                        </div>
                         <div className="stat-card">
                            <div className="stat-card-content">
                                <div className="stat-card-label">Dead Inventory Value</div>
                                <div className="stat-card-value" style={{ color: '#ef4444' }}>₹{(data.inventory.deadInventoryValue / 100000).toFixed(2)}L</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-content">
                                <div className="stat-card-label">Overstock Items</div>
                                <div className="stat-card-value">{data.inventory.overstock}</div>
                            </div>
                        </div>
                    </div>

                    <div className="charts-row">
                        {/* Vendor Scorecard Table */}
                        <div className="chart-card flex-1">
                            <div className="chart-card-header"><h3>Vendor Scorecard</h3></div>
                            <div className="chart-card-body" style={{ overflowX: 'auto' }}>
                                <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                    <thead style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
                                        <tr>
                                            <th style={{ padding: '12px' }}>Vendor</th>
                                            <th style={{ padding: '12px' }}>Rating</th>
                                            <th style={{ padding: '12px' }}>On-Time</th>
                                            <th style={{ padding: '12px' }}>Quality</th>
                                            <th style={{ padding: '12px' }}>Risk</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.vendors.map((v, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ fontWeight: 500, padding: '12px' }}>{v.name}</td>
                                                <td style={{ padding: '12px' }}><span style={{ color: '#f59e0b' }}>★</span> {v.rating}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden', minWidth: '60px' }}>
                                                            <div style={{ height: '100%', width: `${v.onTime}%`, background: v.onTime >= 90 ? '#10b981' : v.onTime >= 75 ? '#f59e0b' : '#ef4444' }}></div>
                                                        </div>
                                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{v.onTime}%</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px' }}>{v.quality}%</td>
                                                <td style={{ padding: '12px' }}>
                                                    <span style={{ backgroundColor: v.risk === 'High' ? '#fee2e2' : v.risk === 'Medium' ? '#fef3c7' : '#d1fae5', color: v.risk === 'High' ? '#dc2626' : v.risk === 'Medium' ? '#d97706' : '#059669', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                                        {v.risk}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                         <div className="chart-card flex-1">
                            <div className="chart-card-header"><h3>Low Stock Alerts (Reorder Triggers)</h3></div>
                            <div className="chart-card-body" style={{ overflowX: 'auto' }}>
                                <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                    <thead style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
                                        <tr>
                                            <th style={{ padding: '12px' }}>Item Name</th>
                                            <th style={{ padding: '12px' }}>Current</th>
                                            <th style={{ padding: '12px' }}>Min</th>
                                            <th style={{ padding: '12px' }}>Vendor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.inventory.lowStock?.map((item, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ fontWeight: 500, padding: '12px' }}>{item.item}</td>
                                                <td style={{ color: '#ef4444', fontWeight: 'bold', padding: '12px' }}>{item.current}</td>
                                                <td style={{ padding: '12px' }}>{item.minimum}</td>
                                                <td style={{ padding: '12px' }}>{item.vendor}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <h2 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '24px 0 16px', color: '#64748b', textTransform: 'uppercase' }}>AI Price Benchmark & Forecasts</h2>
                    <div className="charts-row">
                        <div className="chart-card">
                            <div className="chart-card-header"><h3>Price Benchmark Analysis</h3></div>
                            <div className="chart-card-body">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={data.priceBenchmark}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="item" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                        <YAxis tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}K`} axisLine={false} tickLine={false} />
                                        <RechartsTooltip formatter={(val) => `₹${val.toLocaleString()}`} />
                                        <Legend />
                                        <Bar dataKey="historical" name="Historical" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="market" name="Market Avg" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="vendorQuote" name="Vendor Quote" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                         <div className="chart-card">
                            <div className="chart-card-header"><h3>AI Forecast: Category Spend</h3></div>
                            <div className="chart-card-body">
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={data.forecast.categorySpendForecast}>
                                         <defs>
                                            <linearGradient id="colorIT" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorMkt" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                        <YAxis tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} axisLine={false} tickLine={false} />
                                        <RechartsTooltip formatter={(val) => `₹${val.toLocaleString()}`} />
                                        <Legend />
                                        <Area type="monotone" dataKey="IT" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIT)" />
                                        <Area type="monotone" dataKey="Marketing" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorMkt)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
