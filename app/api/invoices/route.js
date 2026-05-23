import { createApiHandler } from '@/lib/apiHandler';
import { getCollection, query } from '@/lib/db';
import { calculateThreeWayMatch } from '@/lib/matchingEngine';

const baseHandler = createApiHandler('invoices');

export const { POST, PUT, DELETE } = baseHandler;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const filters = {
            search: searchParams.get('search') || '',
            status: searchParams.get('status') || '',
            sortBy: searchParams.get('sortBy') || '',
            sortDir: searchParams.get('sortDir') || 'asc',
            page: parseInt(searchParams.get('page') || '0'),
            limit: parseInt(searchParams.get('limit') || '0'),
        };

        const result = query('invoices', filters);

        // Enrich with 3-way match data
        const pos = getCollection('purchaseOrders');
        const grns = getCollection('grns');

        result.data = result.data.map(invoice => {
            const po = pos.find(p => p.id === invoice.poId);
            const relatedGrns = grns.filter(g => g.poId === invoice.poId);

            const matchResult = calculateThreeWayMatch(po, relatedGrns, invoice);

            return {
                ...invoice,
                threeWayScore: matchResult.score,
                matchStatus: matchResult.status,
                matchDetails: matchResult.details
            };
        });

        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
