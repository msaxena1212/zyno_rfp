import { getCollection, saveCollection, getById, create, update, remove, query } from './db';

export function createApiHandler(collectionName) {
    return {
        async GET(request) {
            try {
                const { searchParams } = new URL(request.url);
                const id = searchParams.get('id');

                if (id) {
                    const item = getById(collectionName, id);
                    if (!item) {
                        return Response.json({ error: 'Not found' }, { status: 404 });
                    }
                    return Response.json(item);
                }

                const filters = {
                    search: searchParams.get('search') || '',
                    status: searchParams.get('status') || '',
                    sortBy: searchParams.get('sortBy') || '',
                    sortDir: searchParams.get('sortDir') || 'asc',
                    page: parseInt(searchParams.get('page') || '0'),
                    limit: parseInt(searchParams.get('limit') || '0'),
                };

                const result = query(collectionName, filters);
                return Response.json(result);
            } catch (error) {
                return Response.json({ error: error.message }, { status: 500 });
            }
        },

        async POST(request) {
            try {
                const body = await request.json();
                const newItem = create(collectionName, body);
                return Response.json(newItem, { status: 201 });
            } catch (error) {
                return Response.json({ error: error.message }, { status: 500 });
            }
        },

        async PUT(request) {
            try {
                const { searchParams } = new URL(request.url);
                const id = searchParams.get('id');
                if (!id) {
                    return Response.json({ error: 'ID required' }, { status: 400 });
                }
                const body = await request.json();
                const updated = update(collectionName, id, body);
                if (!updated) {
                    return Response.json({ error: 'Not found' }, { status: 404 });
                }
                return Response.json(updated);
            } catch (error) {
                return Response.json({ error: error.message }, { status: 500 });
            }
        },

        async DELETE(request) {
            try {
                const { searchParams } = new URL(request.url);
                const id = searchParams.get('id');
                if (!id) {
                    return Response.json({ error: 'ID required' }, { status: 400 });
                }
                const success = remove(collectionName, id);
                if (!success) {
                    return Response.json({ error: 'Not found' }, { status: 404 });
                }
                return Response.json({ success: true });
            } catch (error) {
                return Response.json({ error: error.message }, { status: 500 });
            }
        }
    };
}
