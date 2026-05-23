// ============================================================
// AI Helper Utilities — Smart procurement intelligence layer
// ============================================================

// Vendor recommendation engine
export function getVendorRecommendations(category, vendors) {
    if (!vendors || !vendors.length) return [];
    return vendors
        .filter(v => v.status === 'Active' && (!category || v.category === category))
        .map(v => ({
            vendor: v.name,
            vendorId: v.id,
            score: ((v.rating || 3) * 20 + (v.onTimeDelivery || 80)) / 2,
            reasons: [
                v.rating >= 4.5 ? '⭐ Top-rated supplier' : v.rating >= 3.5 ? '✅ Well-rated supplier' : '📊 Average rating',
                `${v.onTimeDelivery || 85}% on-time delivery`,
                v.totalOrders > 50 ? '🏆 Highly experienced' : '📋 Established vendor',
            ],
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
}

// Spend anomaly detection
export function detectAnomalies(transactions) {
    if (!transactions || transactions.length < 3) return [];
    const amounts = transactions.map(t => t.amount || t.totalAmount || 0);
    const avg = amounts.reduce((s, a) => s + a, 0) / amounts.length;
    const stdDev = Math.sqrt(amounts.reduce((s, a) => s + Math.pow(a - avg, 2), 0) / amounts.length);

    return transactions
        .filter(t => {
            const amt = t.amount || t.totalAmount || 0;
            return Math.abs(amt - avg) > 1.5 * stdDev;
        })
        .map(t => {
            const amt = t.amount || t.totalAmount || 0;
            return {
                id: t.id,
                amount: amt,
                deviation: ((amt - avg) / avg * 100).toFixed(1),
                type: amt > avg ? 'unusually_high' : 'unusually_low',
                severity: Math.abs(amt - avg) > 2 * stdDev ? 'critical' : 'warning',
                message: amt > avg
                    ? `Amount ₹${amt.toLocaleString()} is ${((amt - avg) / avg * 100).toFixed(0)}% above average`
                    : `Amount ₹${amt.toLocaleString()} is ${((avg - amt) / avg * 100).toFixed(0)}% below average`,
            };
        });
}

// Spend prediction (simple trend extrapolation)
export function predictSpend(historicalData, months = 3) {
    if (!historicalData || historicalData.length < 2) {
        return { predicted: 0, trend: 'stable', confidence: 0 };
    }
    const values = historicalData.map(d => d.amount || d.totalAmount || 0);
    const n = values.length;
    const slope = (values[n - 1] - values[0]) / (n - 1);
    const lastValue = values[n - 1];
    const predicted = Math.max(0, lastValue + slope * months);
    const trend = slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable';
    const confidence = Math.min(95, 50 + n * 5);

    return {
        predicted: Math.round(predicted),
        trend,
        confidence,
        monthlyForecast: Array.from({ length: months }, (_, i) => ({
            month: i + 1,
            predicted: Math.round(Math.max(0, lastValue + slope * (i + 1))),
        })),
    };
}

// Auto-categorize items
export function autoCategorize(itemName) {
    const categories = {
        'IT & Electronics': ['laptop', 'computer', 'server', 'software', 'printer', 'monitor', 'keyboard', 'mouse', 'cable', 'network', 'router', 'switch', 'phone', 'tablet'],
        'Office Supplies': ['paper', 'pen', 'pencil', 'folder', 'binder', 'stapler', 'tape', 'envelope', 'notebook', 'desk', 'chair', 'whiteboard'],
        'Raw Materials': ['steel', 'iron', 'copper', 'aluminum', 'plastic', 'rubber', 'wood', 'cement', 'chemical', 'resin', 'polymer', 'fabric'],
        'Machinery': ['motor', 'pump', 'compressor', 'generator', 'turbine', 'conveyor', 'drill', 'lathe', 'crane', 'forklift'],
        'Safety Equipment': ['helmet', 'glove', 'goggle', 'vest', 'boot', 'mask', 'fire', 'extinguisher', 'harness', 'barrier'],
        'Packaging': ['box', 'carton', 'wrap', 'pallet', 'container', 'label', 'seal', 'shrink', 'bag', 'crate'],
        'Electrical': ['wire', 'transformer', 'circuit', 'breaker', 'panel', 'fuse', 'relay', 'battery', 'inverter', 'capacitor'],
        'MRO': ['bearing', 'filter', 'gasket', 'bolt', 'nut', 'washer', 'valve', 'pipe', 'fitting', 'lubricant', 'oil'],
    };

    const name = (itemName || '').toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(kw => name.includes(kw))) {
            return { category, confidence: 0.85, method: 'keyword_match' };
        }
    }
    return { category: 'General', confidence: 0.4, method: 'default' };
}

// Vendor risk scoring
export function calculateRiskScore(vendor) {
    let riskScore = 0;
    const factors = [];

    if ((vendor.rating || 5) < 3) { riskScore += 30; factors.push('Low rating'); }
    else if ((vendor.rating || 5) < 4) { riskScore += 10; factors.push('Below-average rating'); }

    if ((vendor.onTimeDelivery || 100) < 70) { riskScore += 30; factors.push('Poor delivery performance'); }
    else if ((vendor.onTimeDelivery || 100) < 85) { riskScore += 15; factors.push('Moderate delivery delays'); }

    if ((vendor.qualityScore || 100) < 70) { riskScore += 25; factors.push('Quality concerns'); }

    if ((vendor.yearsActive || 10) < 2) { riskScore += 10; factors.push('New vendor'); }

    if (vendor.complianceIssues > 0) { riskScore += 20; factors.push('Compliance issues noted'); }

    const level = riskScore >= 50 ? 'High' : riskScore >= 25 ? 'Medium' : 'Low';
    return { score: Math.min(100, riskScore), level, factors };
}

// Smart approval routing
export function suggestApprovalRoute(item) {
    const amount = item.totalAmount || item.amount || 0;
    if (amount > 1000000) {
        return { approver: 'CFO', level: 'executive', reason: 'Amount exceeds ₹10L threshold' };
    } else if (amount > 500000) {
        return { approver: 'VP Procurement', level: 'senior', reason: 'Amount exceeds ₹5L threshold' };
    } else if (amount > 100000) {
        return { approver: 'Procurement Manager', level: 'manager', reason: 'Amount exceeds ₹1L threshold' };
    }
    return { approver: 'Team Lead', level: 'team', reason: 'Standard approval' };
}

// Duplicate detection
export function findDuplicates(newItem, existingItems) {
    if (!existingItems || !existingItems.length) return [];
    const name = (newItem.title || newItem.name || '').toLowerCase();
    return existingItems
        .filter(item => {
            const existingName = (item.title || item.name || '').toLowerCase();
            return similarity(name, existingName) > 0.7;
        })
        .map(item => ({
            ...item,
            matchScore: similarity(name, (item.title || item.name || '').toLowerCase()),
        }));
}

// Contract risk analysis
export function analyzeContractRisk(contract) {
    const risks = [];
    const now = new Date();
    const endDate = new Date(contract.endDate);
    const daysToExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

    if (daysToExpiry < 30) risks.push({ type: 'expiry', severity: 'critical', message: `Contract expires in ${daysToExpiry} days` });
    else if (daysToExpiry < 90) risks.push({ type: 'expiry', severity: 'warning', message: `Contract expires in ${daysToExpiry} days` });

    if ((contract.value || 0) > 5000000) risks.push({ type: 'value', severity: 'info', message: 'High-value contract — enhanced monitoring recommended' });

    if (!contract.autoRenewal) risks.push({ type: 'renewal', severity: 'warning', message: 'Manual renewal required' });

    return { riskLevel: risks.some(r => r.severity === 'critical') ? 'High' : risks.some(r => r.severity === 'warning') ? 'Medium' : 'Low', risks };
}

// Reorder point prediction
export function predictReorderPoint(item) {
    const avgDailyUsage = (item.monthlyUsage || 100) / 30;
    const leadTimeDays = item.leadTimeDays || 7;
    const safetyStock = Math.ceil(avgDailyUsage * (item.safetyDays || 3));
    const reorderPoint = Math.ceil(avgDailyUsage * leadTimeDays + safetyStock);
    const daysUntilReorder = item.quantity > reorderPoint
        ? Math.floor((item.quantity - reorderPoint) / avgDailyUsage)
        : 0;

    return {
        reorderPoint,
        safetyStock,
        avgDailyUsage: Math.round(avgDailyUsage * 10) / 10,
        daysUntilReorder,
        status: item.quantity <= safetyStock ? 'critical' : item.quantity <= reorderPoint ? 'reorder_now' : 'adequate',
        recommendedOrderQty: Math.ceil(avgDailyUsage * 30),
    };
}

// Invoice 3-way match
export function threeWayMatch(invoice, po, grn) {
    const issues = [];
    let score = 100;

    if (!po) { issues.push('No matching Purchase Order found'); score -= 40; }
    if (!grn) { issues.push('No matching GRN found'); score -= 30; }

    if (po && Math.abs((invoice.amount || 0) - (po.totalAmount || 0)) > 0.01 * (po.totalAmount || 1)) {
        const diff = ((invoice.amount || 0) - (po.totalAmount || 0)).toFixed(2);
        issues.push(`Amount mismatch: Invoice differs from PO by ₹${diff}`);
        score -= 20;
    }

    if (grn && po) {
        const grnQty = (grn.items || []).reduce((s, i) => s + (i.receivedQty || 0), 0);
        const poQty = (po.items || []).reduce((s, i) => s + (i.quantity || 0), 0);
        if (grnQty !== poQty) {
            issues.push(`Quantity mismatch: GRN received ${grnQty} vs PO ordered ${poQty}`);
            score -= 15;
        }
    }

    return {
        score: Math.max(0, score),
        status: score >= 90 ? 'matched' : score >= 60 ? 'partial_match' : 'mismatch',
        issues,
        recommendation: score >= 90 ? 'Auto-approve recommended' : score >= 60 ? 'Manual review recommended' : 'Hold for investigation',
    };
}

// Generate natural language insight
export function generateInsight(type, data) {
    const insights = {
        spending: () => {
            const total = data.total || 0;
            const prev = data.previous || total;
            const change = prev ? ((total - prev) / prev * 100).toFixed(1) : 0;
            return {
                icon: '💡',
                title: 'Spending Insight',
                message: `Total procurement spend is ₹${total.toLocaleString()}, ${change > 0 ? 'up' : 'down'} ${Math.abs(change)}% from last period. ${Math.abs(change) > 20 ? 'This is a significant change worth investigating.' : 'This is within normal range.'}`,
                type: Math.abs(change) > 20 ? 'warning' : 'info',
            };
        },
        vendor: () => ({
            icon: '🏢',
            title: 'Vendor Performance',
            message: `${data.topVendor || 'Top vendor'} leads with ${data.rating || 4.5}/5 rating and ${data.onTime || 95}% on-time delivery. Consider increasing allocation.`,
            type: 'success',
        }),
        inventory: () => ({
            icon: '📦',
            title: 'Inventory Alert',
            message: `${data.lowStockCount || 0} items are below reorder level. ${data.criticalCount || 0} items are critically low and need immediate attention.`,
            type: data.criticalCount > 0 ? 'danger' : 'warning',
        }),
        savings: () => ({
            icon: '💰',
            title: 'Savings Opportunity',
            message: `AI analysis suggests potential savings of ₹${(data.potential || 0).toLocaleString()} through vendor consolidation and bulk purchasing.`,
            type: 'success',
        }),
    };

    return insights[type] ? insights[type]() : { icon: '📊', title: 'Insight', message: 'No insights available.', type: 'info' };
}

// --- Helper ---
function similarity(a, b) {
    if (!a || !b) return 0;
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    if (longer.length === 0) return 1.0;
    const costs = [];
    for (let i = 0; i <= longer.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= shorter.length; j++) {
            if (i === 0) { costs[j] = j; }
            else if (j > 0) {
                let newValue = costs[j - 1];
                if (longer[i - 1] !== shorter[j - 1]) newValue = Math.min(newValue, lastValue, costs[j]) + 1;
                costs[j - 1] = lastValue;
                lastValue = newValue;
            }
        }
        if (i > 0) costs[shorter.length] = lastValue;
    }
    return (longer.length - costs[shorter.length]) / longer.length;
}
