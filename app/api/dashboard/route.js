import { getCollection } from '@/lib/db';

export async function GET() {
    try {
        const prs = getCollection('purchaseRequisitions');
        const pos = getCollection('purchaseOrders');
        const vendors = getCollection('vendors');
        const invoices = getCollection('invoices');
        const inventory = getCollection('inventory');
        const approvals = getCollection('approvals');
        const budgets = getCollection('budgets');

        const totalSpend = pos.reduce((s, p) => s + (p.totalAmount || 0), 0);
        const pendingApprovals = approvals.filter(a => a.status === 'Pending').length;
        const activeVendors = vendors.filter(v => v.status === 'Active').length;
        const pendingPRs = prs.filter(p => p.status === 'Pending Approval').length;
        const lowStockItems = inventory.filter(i => i.quantity <= i.reorderLevel).length;
        const overdueInvoices = invoices.filter(i => i.status === 'Overdue' || (i.dueDate && new Date(i.dueDate) < new Date() && i.status !== 'Approved' && i.status !== 'Paid')).length;

        const totalBudget = budgets.reduce((s, b) => s + b.allocated, 0);
        const totalBudgetSpent = budgets.reduce((s, b) => s + b.spent, 0);

        const spendByCategory = {};
        pos.forEach(po => {
            (po.items || []).forEach(item => {
                const cat = item.category || 'Other';
                spendByCategory[cat] = (spendByCategory[cat] || 0) + (item.total || 0);
            });
        });

        const monthlySpend = [
            { month: 'Sep', amount: 3200000 },
            { month: 'Oct', amount: 3800000 },
            { month: 'Nov', amount: 2900000 },
            { month: 'Dec', amount: 4100000 },
            { month: 'Jan', amount: 3600000 },
            { month: 'Feb', amount: totalSpend },
        ];

        return Response.json({
            stats: {
                totalSpend,
                pendingApprovals,
                activeVendors,
                pendingPRs,
                lowStockItems,
                overdueInvoices,
                totalPOs: pos.length,
                totalBudget,
                totalBudgetSpent,
                budgetUtilization: totalBudget ? Math.round(totalBudgetSpent / totalBudget * 100) : 0,
            },
            monthlySpend,
            recentPRs: prs.slice(0, 5),
            recentPOs: pos.slice(0, 5),
            topVendors: vendors
                .filter(v => v.status === 'Active')
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 5),
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
