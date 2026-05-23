import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

export function getCollection(name) {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, `${name}.json`);
    if (!fs.existsSync(filePath)) {
        return [];
    }
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
        return [];
    }
}

export function saveCollection(name, data) {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, `${name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function getById(collectionName, id) {
    const data = getCollection(collectionName);
    return data.find(item => item.id === id) || null;
}

export function create(collectionName, item) {
    const data = getCollection(collectionName);
    const newItem = {
        ...item,
        id: item.id || generateId(collectionName, data.length),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    data.push(newItem);
    saveCollection(collectionName, data);
    return newItem;
}

export function update(collectionName, id, updates) {
    const data = getCollection(collectionName);
    const index = data.findIndex(item => item.id === id);
    if (index === -1) return null;
    data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
    saveCollection(collectionName, data);
    return data[index];
}

export function remove(collectionName, id) {
    const data = getCollection(collectionName);
    const filtered = data.filter(item => item.id !== id);
    if (filtered.length === data.length) return false;
    saveCollection(collectionName, filtered);
    return true;
}

export function query(collectionName, filters = {}) {
    let data = getCollection(collectionName);

    if (filters.search) {
        const s = filters.search.toLowerCase();
        data = data.filter(item =>
            Object.values(item).some(v =>
                String(v).toLowerCase().includes(s)
            )
        );
    }

    if (filters.status) {
        data = data.filter(item => item.status === filters.status);
    }

    if (filters.sortBy) {
        const dir = filters.sortDir === 'desc' ? -1 : 1;
        data.sort((a, b) => {
            if (a[filters.sortBy] < b[filters.sortBy]) return -1 * dir;
            if (a[filters.sortBy] > b[filters.sortBy]) return 1 * dir;
            return 0;
        });
    }

    const total = data.length;

    if (filters.page && filters.limit) {
        const start = (filters.page - 1) * filters.limit;
        data = data.slice(start, start + filters.limit);
    }

    return { data, total };
}

function generateId(prefix, count) {
    const pre = prefix.replace(/s$/, '').substring(0, 3).toUpperCase();
    return `${pre}-${String(count + 1).padStart(5, '0')}`;
}
