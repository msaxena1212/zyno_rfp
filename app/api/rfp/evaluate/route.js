import { getCollection } from '@/lib/db';

// Scoring Engine: computes weighted composite scores for vendor responses
function computeRankings(rfp, criteriaOverrides) {
    const criteria = criteriaOverrides || rfp.evaluationCriteria || [
        { name: 'Price Competitiveness', weight: 30 },
        { name: 'Technical Fit', weight: 25 },
        { name: 'Past Performance', weight: 20 },
        { name: 'Delivery Timeline', weight: 15 },
        { name: 'Value Adds', weight: 10 },
    ];

    const responses = rfp.vendorResponses || [];
    if (!responses.length) return { rankings: [], criteria };

    // Find min/max values for normalization
    const prices = responses.map(r => r.quotedPrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const deliveries = responses.map(r => r.deliveryDays);
    const minDel = Math.min(...deliveries);
    const maxDel = Math.max(...deliveries);

    const ranked = responses.map(r => {
        // Score each criterion 0-100
        const scores = {};

        // Price: lower is better (normalized inversely)
        scores['Price Competitiveness'] = maxPrice === minPrice ? 100 :
            Math.round(((maxPrice - r.quotedPrice) / (maxPrice - minPrice)) * 100);

        // Technical Fit: direct from technicalCompliance %
        scores['Technical Fit'] = r.technicalCompliance || 0;

        // Past Performance: weighted avg of rating, on-time history, quality history
        const ratingScore = ((r.pastRating || 0) / 5) * 100;
        const onTimeScore = r.onTimeHistory || 0;
        const qualityScore = r.qualityHistory || 0;
        scores['Past Performance'] = Math.round((ratingScore * 0.3 + onTimeScore * 0.35 + qualityScore * 0.35));

        // Delivery Timeline: faster is better (normalized inversely)
        scores['Delivery Timeline'] = maxDel === minDel ? 100 :
            Math.round(((maxDel - r.deliveryDays) / (maxDel - minDel)) * 100);

        // Value Adds: composite of warranty, certifications, payment terms
        let valueScore = 0;
        // Warranty scoring
        const w = (r.warranty || '').toLowerCase();
        if (w.includes('5 year') || w.includes('comprehensive') || w.includes('premium')) valueScore += 40;
        else if (w.includes('3 year') || w.includes('on-site') || w.includes('quality guarantee')) valueScore += 30;
        else if (w.includes('2 year') || w.includes('extended')) valueScore += 20;
        else valueScore += 10;

        // Certifications scoring (more = better, max ~6)
        const certCount = (r.certifications || []).length;
        valueScore += Math.min(certCount * 10, 40);

        // Payment terms scoring
        const pt = (r.paymentTerms || '').toLowerCase();
        if (pt.includes('net 30')) valueScore += 20;
        else if (pt.includes('net 45') || pt.includes('net 60')) valueScore += 10;
        else valueScore += 0; // advance payment = 0

        scores['Value Adds'] = Math.min(valueScore, 100);

        // Compute weighted composite
        const totalWeight = criteria.reduce((s, c) => s + c.weight, 0);
        let composite = 0;
        criteria.forEach(c => {
            const score = scores[c.name] || 0;
            composite += (score * c.weight) / totalWeight;
        });

        // Generate AI summary
        const summary = generateSummary(r, scores, Math.round(composite));

        return {
            vendorId: r.vendorId,
            vendorName: r.vendorName,
            quotedPrice: r.quotedPrice,
            deliveryDays: r.deliveryDays,
            technicalCompliance: r.technicalCompliance,
            warranty: r.warranty,
            certifications: r.certifications,
            paymentTerms: r.paymentTerms,
            proposalSummary: r.proposalSummary,
            scores,
            composite: Math.round(composite),
            aiSummary: summary,
        };
    });

    // Sort by composite descending
    ranked.sort((a, b) => b.composite - a.composite);

    // Assign ranks
    ranked.forEach((r, i) => { r.rank = i + 1; });

    return { rankings: ranked, criteria };
}

function generateSummary(vendor, scores, composite) {
    const name = vendor.vendorName;
    const strengths = [];
    const weaknesses = [];

    if (scores['Price Competitiveness'] >= 80) strengths.push('highly competitive pricing');
    else if (scores['Price Competitiveness'] <= 30) weaknesses.push('premium pricing');

    if (scores['Technical Fit'] >= 95) strengths.push('exceptional technical compliance');
    else if (scores['Technical Fit'] >= 90) strengths.push('strong technical fit');
    else if (scores['Technical Fit'] < 80) weaknesses.push('gaps in technical requirements');

    if (scores['Past Performance'] >= 90) strengths.push('outstanding track record');
    else if (scores['Past Performance'] < 75) weaknesses.push('mixed historical performance');

    if (scores['Delivery Timeline'] >= 80) strengths.push('fast delivery capability');
    else if (scores['Delivery Timeline'] <= 20) weaknesses.push('longer delivery timelines');

    if (scores['Value Adds'] >= 70) strengths.push('excellent value-adds including warranty and certifications');

    let summary = `${name} scored ${composite}/100 overall.`;
    if (strengths.length) summary += ` Strengths: ${strengths.join(', ')}.`;
    if (weaknesses.length) summary += ` Areas of concern: ${weaknesses.join(', ')}.`;
    summary += ` Quoted ₹${(vendor.quotedPrice / 100000).toFixed(1)}L with ${vendor.deliveryDays}-day delivery.`;

    return summary;
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const rfpId = searchParams.get('rfpId');

        if (!rfpId) {
            return Response.json({ error: 'rfpId parameter required' }, { status: 400 });
        }

        const rfps = getCollection('rfps');
        const rfp = rfps.find(r => r.id === rfpId);

        if (!rfp) {
            return Response.json({ error: 'RFP not found' }, { status: 404 });
        }

        if (!rfp.vendorResponses || rfp.vendorResponses.length === 0) {
            return Response.json({ rankings: [], criteria: rfp.evaluationCriteria || [], message: 'No vendor submissions yet' });
        }

        const result = computeRankings(rfp);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { rfpId, criteria } = body;

        if (!rfpId) {
            return Response.json({ error: 'rfpId required' }, { status: 400 });
        }

        const rfps = getCollection('rfps');
        const rfp = rfps.find(r => r.id === rfpId);

        if (!rfp) {
            return Response.json({ error: 'RFP not found' }, { status: 404 });
        }

        // Allow dynamic weight overrides (for What-If)
        const result = computeRankings(rfp, criteria || null);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
