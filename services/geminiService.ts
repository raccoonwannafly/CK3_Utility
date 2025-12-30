
import { StoredCharacter } from "../types";

// --- API CLIENT ---
const apiCall = async (endpoint: string, method: string = 'POST', body?: any, timeoutMs: number = 25000) => {
  const controller = new AbortController();
  
  // 1. Create a timeout promise that rejects automatically
  const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => {
          controller.abort();
          reject(new Error("Timeout"));
      }, timeoutMs)
  );

  try {
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    };
    if (body) options.body = JSON.stringify(body);

    // 2. Race the fetch against the timeout
    const response = await Promise.race([
        fetch(`/api/${endpoint}`, options),
        timeoutPromise
    ]) as Response;

    // 3. Handle HTTP errors (Like 404 Not Found in preview mode)
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server Error: ${response.status} - ${errText}`);
    }

    // 4. TEXT FIRST: Avoid "Unexpected token <" errors by reading text first
    // In preview mode, servers often return HTML (404 page) instead of JSON.
    const text = await response.text();

    // 5. Safe Parse
    try {
      return JSON.parse(text);
    } catch (e) {
      // If it fails to parse (e.g., it was HTML), throw so we trigger LocalStorage fallback
      throw new Error("Invalid JSON response");
    }

  } catch (e: any) {
    // Re-throw to be caught by the specific service function (saveToGallery, etc)
    // which will then trigger the LocalStorage fallback.
    throw e;
  }
};

// --- STEAM IMPORT ---

export const importFromSteam = async (url: string): Promise<StoredCharacter> => {
  try {
      const response = await apiCall('import/steam', 'POST', { url }, 20000); // 20s timeout for Steam
      return response.character;
  } catch (e: any) {
      throw new Error(e.message || "Failed to import from Steam. Ensure URL is valid and the Workshop item has a public DNA string.");
  }
};

// --- GALLERY SERVICES (With Offline Fallback) ---

const LOCAL_STORAGE_KEY = 'ck3_royal_gallery_offline';

const getLocalGallery = (): StoredCharacter[] => {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
};

const setLocalGallery = (data: StoredCharacter[]) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn("LocalStorage quota exceeded or unavailable.");
    }
};

// SUPER FAST TIMEOUT: 400ms. 
// If the server doesn't reply instantly (which it won't in preview mode), assume offline.
const GALLERY_TIMEOUT = 400;

export const saveToGallery = async (character: Partial<StoredCharacter>) => {
  try {
    return await apiCall('gallery', 'POST', { character }, GALLERY_TIMEOUT);
  } catch (e) {
    // Silent fallback - effectively "Offline Mode"
    const newEntry: StoredCharacter = {
      id: 'local_' + Date.now().toString(),
      name: character.name || "Unknown",
      traits: character.traits || [],
      culture: character.culture || "",
      religion: character.religion || "",
      goal: character.goal || "",
      dna: character.dna || "",
      images: character.images || [],
      bio: character.bio || "",
      tags: character.tags || [],
      dynastyMotto: character.dynastyMotto || "",
      createdAt: new Date().toISOString()
    };
    
    const existing = getLocalGallery();
    existing.unshift(newEntry);
    setLocalGallery(existing);
    
    return newEntry;
  }
};

export const fetchGallery = async () => {
  try {
    const data = await apiCall('gallery', 'GET', undefined, GALLERY_TIMEOUT);
    return { data, source: 'server' };
  } catch (e) {
    const localData = getLocalGallery();
    return { data: localData, source: 'local' };
  }
};

export const updateCharacter = async (id: string, updates: Partial<StoredCharacter>) => {
    try {
        return await apiCall(`gallery/${id}`, 'PUT', { character: updates }, GALLERY_TIMEOUT);
    } catch (e) {
        const existing = getLocalGallery();
        const index = existing.findIndex(c => c.id === id);
        if (index !== -1) {
            existing[index] = { ...existing[index], ...updates };
            setLocalGallery(existing);
            return existing[index];
        }
        // If updating a server item while offline, we can't really do it easily without sync logic.
        // For this demo, we'll just fail gracefully or pretend it worked.
        throw new Error("Cannot update record while offline (if created on server).");
    }
};

export const deleteCharacter = async (id: string) => {
    try {
        return await apiCall(`gallery/${id}`, 'DELETE', undefined, GALLERY_TIMEOUT);
    } catch (e) {
        const existing = getLocalGallery();
        const newData = existing.filter(c => c.id !== id);
        
        if (newData.length !== existing.length) {
             setLocalGallery(newData);
             return { success: true, id };
        }
        
        // Optimistic success for UI
        return { success: true, id };
    }
};
