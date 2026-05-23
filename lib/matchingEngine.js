/**
 * Logic to calculate 3-way match score and status.
 * Compares Purchase Order (PO), Goods Receipt Notes (GRN), and Invoice.
 */
export function calculateThreeWayMatch(po, grns, invoice) {
    if (!po) return { score: 0, status: 'Missing PO', details: {} };

    // 1. Price Matching (PO vs Invoice)
    // We compare the total amount on the invoice with the total amount on the PO.
    const priceMatch = Math.abs(invoice.amount - po.totalAmount) < 0.01;
    const priceScore = priceMatch ? 100 : Math.max(0, 100 - (Math.abs(invoice.amount - po.totalAmount) / po.totalAmount * 100));

    // 2. Quantity Matching (PO vs GRN)
    // We sum up accepted quantities in all related GRNs and compare with the total ordered quantity in the PO.
    let qtyScore = 0;
    let totalOrdered = 0;
    let totalAccepted = 0;

    if (po.items && Array.isArray(po.items)) {
        po.items.forEach(poItem => {
            totalOrdered += poItem.qty;
            // Find this item across all related GRNs
            if (grns && Array.isArray(grns)) {
                grns.forEach(grn => {
                    if (grn.items && Array.isArray(grn.items)) {
                        const grnItem = grn.items.find(gi => gi.name === poItem.name);
                        if (grnItem) {
                            totalAccepted += grnItem.acceptedQty;
                        }
                    }
                });
            }
        });
    }

    if (totalOrdered > 0) {
        qtyScore = Math.min(100, (totalAccepted / totalOrdered) * 100);
    } else {
        qtyScore = 100; // If nothing was ordered, it's a "match" in a weird way, or should be handled differently.
    }

    // 3. Final Score Calculation
    // We weigh price and quantity equally for the final score.
    const finalScore = Math.round((priceScore + qtyScore) / 2);

    let status = 'Pending';
    if (finalScore >= 95) {
        status = 'Matched';
    } else if (finalScore >= 70) {
        status = 'Partial Match';
    } else {
        status = 'Discrepancy';
    }

    return {
        score: finalScore,
        status: status,
        details: {
            priceScore: Math.round(priceScore),
            qtyScore: Math.round(qtyScore),
            priceMatch,
            totalOrdered,
            totalAccepted,
            discrepancy: finalScore < 100
        }
    };
}
