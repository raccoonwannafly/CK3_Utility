
import { StoredCharacter, ReferenceDocument } from "../types";

const DB_NAME = 'CK3_Utility_DB';
const DB_VERSION = 2;
const STORE_GALLERY = 'gallery';
const STORE_DOCS = 'documents';

interface GalleryDB extends IDBDatabase {}

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            
            if (!db.objectStoreNames.contains(STORE_GALLERY)) {
                db.createObjectStore(STORE_GALLERY, { keyPath: 'id' });
            }

            if (!db.objectStoreNames.contains(STORE_DOCS)) {
                db.createObjectStore(STORE_DOCS, { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result);
        };

        request.onerror = (event) => {
            reject((event.target as IDBOpenDBRequest).error);
        };
    });
};

const getAllItems = async <T>(storeName: string): Promise<T[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result as T[]);
        request.onerror = () => reject(request.error);
    });
};

const putItem = async <T>(storeName: string, item: T): Promise<T> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(item);

        request.onsuccess = () => resolve(item);
        request.onerror = () => reject(request.error);
    });
};

const removeItem = async (storeName: string, id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        // Using bracket notation to avoid potential syntax errors with reserved 'delete' keyword
        const request = store['delete'](id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const dbService = {
    open: openDB,
    getAll: getAllItems,
    put: putItem,
    remove: removeItem,

    // --- GALLERY SPECIFIC ---

    async getAllGallery(): Promise<StoredCharacter[]> {
        const items = await getAllItems<StoredCharacter>(STORE_GALLERY);
        return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    async add(character: StoredCharacter): Promise<StoredCharacter> {
        return putItem(STORE_GALLERY, character);
    },

    async update(character: StoredCharacter): Promise<StoredCharacter> {
        return putItem(STORE_GALLERY, character);
    },

    // Renamed to avoid reserved word conflict
    async deleteItem(id: string): Promise<void> {
        return removeItem(STORE_GALLERY, id);
    },
    
    // --- DOCUMENTS SPECIFIC ---

    async getAllDocs(): Promise<ReferenceDocument[]> {
        return getAllItems<ReferenceDocument>(STORE_DOCS);
    },

    async saveDoc(doc: ReferenceDocument): Promise<ReferenceDocument> {
        return putItem(STORE_DOCS, doc);
    },

    async deleteDoc(id: string): Promise<void> {
        return removeItem(STORE_DOCS, id);
    },
    
    async migrateFromLocalStorage() {
        const LOCAL_STORAGE_KEY = 'ck3_royal_gallery_offline';
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (raw) {
            try {
                const data = JSON.parse(raw) as StoredCharacter[];
                if (Array.isArray(data) && data.length > 0) {
                    const db = await openDB();
                    const tx = db.transaction(STORE_GALLERY, 'readwrite');
                    const store = tx.objectStore(STORE_GALLERY);
                    
                    for (const char of data) {
                        store.put(char);
                    }
                    
                    tx.oncomplete = () => {
                        console.log("Migrated gallery to IndexedDB");
                        localStorage.removeItem(LOCAL_STORAGE_KEY);
                    };
                }
            } catch (e) {
                console.error("Migration failed", e);
            }
        }
    }
};
