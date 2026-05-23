import { getCollection } from '@/lib/db';

export async function GET() {
    try {
        const prs = getCollection('purchaseRequisitions');
        const pos = getCollection('purchaseOrders');
        const vendors = getCollection('vendors');
        const invoices = getCollection('invoices');
        const inventory = getCollection('inventory');

        // 1. Spend Analysis Data
        let totalSpend = 0;
        const spendByCategory = {};
        const spendByDepartment = {};
        const trendData = [];

        // Mock 12-month trend if not enough POs
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        months.forEach(m => trendData.push({ month: m, amount: Math.floor(Math.random() * 500000) + 1000000 }));

        pos.forEach(po => {
            const amount = po.totalAmount || 0;
            totalSpend += amount;

            const dept = po.department || 'Operations';
            spendByDepartment[dept] = (spendByDepartment[dept] || 0) + amount;

            (po.items || []).forEach(item => {
                const cat = item.category || 'General';
                spendByCategory[cat] = (spendByCategory[cat] || 0) + (item.total || 0);
            });
        });

        const categoryData = Object.keys(spendByCategory).map(k => ({ name: k, value: spendByCategory[k] }));
        const departmentData = Object.keys(spendByDepartment).map(k => ({ name: k, value: spendByDepartment[k] }));

        // 2. Vendor Performance
        const topVendors = vendors.map(v => {
            return {
                name: v.name,
                rating: v.rating || 0,
                onTime: v.onTimeDelivery || Math.floor(Math.random() * 20 + 80),
                quality: v.qualityScore || Math.floor(Math.random() * 15 + 85),
                risk: v.riskScore || (v.rating < 3 ? 'High' : v.rating < 4 ? 'Medium' : 'Low')
            };
        }).sort((a, b) => b.rating - a.rating).slice(0, 10);

        // 3. AI Insights
        const insights = [
            {
                id: 1,
                type: 'risk',
                title: 'High Vendor Risk Detected',
                description: 'Vendor "TechCorp" has 3 consecutive delayed deliveries. Recommend diversifying server hardware sourcing.',
                impact: 'High',
                action: 'Find Alternates'
            },
            {
                id: 2,
                type: 'savings',
                title: 'Volume Discount Opportunity',
                description: 'You are ordering "Office Chairs" from 3 different vendors. Consolidating to "OfficeSupplies Inc." could save ₹45,000.',
                impact: 'Medium',
                action: 'Consolidate POs'
            },
            {
                id: 3,
                type: 'anomaly',
                title: 'Spend Anomaly in Marketing',
                description: 'Marketing department spend is 45% above the 6-month average. 3 unbudgeted POs detected in software category.',
                impact: 'High',
                action: 'Review Budgets'
            },
            {
                id: 4,
                type: 'forecast',
                title: 'Inventory Depletion Warning',
                description: 'Based on seasonal trends, "Raw Material Alpha" will drop below critical levels in 14 days.',
                impact: 'Critical',
                action: 'Auto-Reorder'
            }
        ];

        // 4. Operational Efficiency
        const poCycleTime = 4.2; // Days average
        const invoiceProcessingTime = 2.8;

        return Response.json({
            spend: {
                total: totalSpend || 12500000,
                byCategory: categoryData.length ? categoryData : [{ name: 'IT', value: 4000000 }, { name: 'Admin', value: 2000000 }, { name: 'Marketing', value: 6500000 }],
                byDepartment: departmentData.length ? departmentData : [{ name: 'Operations', value: 8000000 }, { name: 'Sales', value: 4500000 }],
                trend: trendData
            },
            vendors: topVendors.length ? topVendors : [
                { name: 'Supplier A', rating: 4.5, onTime: 95, quality: 98, risk: 'Low' },
                { name: 'Supplier B', rating: 3.2, onTime: 75, quality: 80, risk: 'High' }
            ],
            insights,
            ops: {
                poCycleTime,
                invoiceProcessingTime,
                prToPoConversion: 85 // %
            },
            poStatus: {
                totalCreated: 1420,
                approved: 1250,
                pending: 170,
                delayedApprovals: [
                    { id: 'PO-2026-089', vendor: 'TechCorp', value: 45000, daysDelayed: 4, approver: 'John D.' },
                    { id: 'PO-2026-092', vendor: 'OfficeSupplies Inc.', value: 12000, daysDelayed: 2, approver: 'Sarah M.' }
                ],
                open: 310,
                closed: 1110,
                avgProcessingTime: 4.2 // days
            },
            cycleTime: [
                { stage: 'PR to Approval', days: 2.1 },
                { stage: 'Approval to RFP', days: 5.4 },
                { stage: 'RFP to PO', days: 12.3 },
                { stage: 'PO to Delivery', days: 18.5 }
            ],
            savings: {
                negotiation: 320000, // ₹3.2L
                budgetVsActual: [
                    { dept: 'IT', budget: 5000000, actual: 4800000 },
                    { dept: 'Marketing', budget: 4000000, actual: 4500000 }, // Over budget
                    { dept: 'Operations', budget: 8000000, actual: 7200000 }
                ],
                costAvoidance: 150000,
                contractSavings: 420000
            },
            inventory: {
                lowStock: [
                    { item: 'Server Racks', current: 5, minimum: 10, vendor: 'TechCorp' },
                    { item: 'Printer Ink', current: 12, minimum: 20, vendor: 'OfficeSupplies Inc.' }
                ],
                overstock: 14,
                deadInventoryValue: 450000
            },
            maverickSpend: [
                { category: 'Outside Procurement', amount: 350000 },
                { category: 'Without Approvals', amount: 120000 },
                { category: 'Without Contracts', amount: 50000 }
            ],
            efficiency: {
                prToPo: 85,
                rfqSuccess: 72,
                supplierParticipation: 68,
                negotiationSuccess: 45
            },
            forecast: {
                categorySpendForecast: [
                    { month: 'Next Month', IT: 4200000, Admin: 2100000, Marketing: 6000000 },
                    { month: 'In 2 Months', IT: 4500000, Admin: 2200000, Marketing: 5800000 },
                    { month: 'In 3 Months', IT: 4800000, Admin: 2300000, Marketing: 6200000 }
                ],
                supplierDemand: [
                    { vendor: 'TechCorp', predictedDemand: 'High +20%' },
                    { vendor: 'OfficeSupplies Inc.', predictedDemand: 'Stable' }
                ]
            },
            priceBenchmark: [
                { item: 'Standard Laptop', historical: 65000, market: 62000, vendorQuote: 63000 },
                { item: 'Ergonomic Chair', historical: 12000, market: 11500, vendorQuote: 11000 },
                { item: 'Server Rack', historical: 150000, market: 155000, vendorQuote: 148000 }
            ]
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
