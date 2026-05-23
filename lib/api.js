const BASE = '/api';

export async function fetchCollection(module, params = {}) {
    const url = new URL(`${BASE}/${module}`, window.location.origin);
    Object.entries(params).forEach(([k, v]) => {
        if (v) url.searchParams.set(k, v);
    });
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${module}`);
    return res.json();
}

export async function fetchItem(module, id) {
    const res = await fetch(`${BASE}/${module}?id=${id}`);
    if (!res.ok) throw new Error(`Failed to fetch ${module}/${id}`);
    return res.json();
}

export async function createItem(module, data) {
    const res = await fetch(`${BASE}/${module}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create ${module}`);
    return res.json();
}

export async function updateItem(module, id, data) {
    const res = await fetch(`${BASE}/${module}?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update ${module}/${id}`);
    return res.json();
}

export async function deleteItem(module, id) {
    const res = await fetch(`${BASE}/${module}?id=${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed to delete ${module}/${id}`);
    return res.json();
}
