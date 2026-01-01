import { ReferenceDocument } from '../types';

/**
 * Global registry for documents fetched from the server.
 * This replaces the "baked-in" constants to rely purely on physical files.
 */
export let LOADED_DOCUMENTS: ReferenceDocument[] = [];

/**
 * Fetches all documents from the server API and updates the global registry.
 */
export const fetchAllDocuments = async (): Promise<ReferenceDocument[]> => {
    try {
        const res = await fetch('/api/docs');
        if (!res.ok) throw new Error('Failed to fetch docs');
        const data = await res.json();

        // Update global mutable export
        LOADED_DOCUMENTS.length = 0;
        LOADED_DOCUMENTS.push(...data);

        return data;
    } catch (e) {
        console.error("Failed to load global documents from server", e);
        return [];
    }
};

/**
 * Helper to get documents by category
 */
export const getDocsByCategory = (category: 'versions' | 'dev notes' | 'wiki' | 'PRD') => {
    return LOADED_DOCUMENTS.filter(d => d.category === category);
};
