
import { StoredCharacter } from "../types";
import { dbService } from "./dbService";

// --- API CLIENT ---
const apiCall = async (endpoint: string, method: string = 'POST', body?: any, timeoutMs: number = 25000) => {
  const controller = new AbortController();

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

    const response = await Promise.race([
      fetch(`/api/${endpoint}`, options),
      timeoutPromise
    ]) as Response;

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Server Error: ${response.status} - ${errText}`);
    }

    const text = await response.text();

    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error("Invalid JSON response");
    }

  } catch (e: any) {
    throw e;
  }
};

// --- STEAM IMPORT ---

export const importFromSteam = async (url: string): Promise<StoredCharacter> => {
  try {
    const response = await apiCall('import/steam', 'POST', { url }, 20000);
    return response.character;
  } catch (e: any) {
    throw new Error(e.message || "Failed to import from Steam. Ensure URL is valid and the Workshop item has a public DNA string.");
  }
};

// --- GALLERY SERVICES (With IndexedDB Fallback) ---

// Trigger migration on module load (non-blocking)
dbService.migrateFromLocalStorage().catch(console.error);

const GALLERY_TIMEOUT = 5000;

export const saveToGallery = async (character: Partial<StoredCharacter>) => {
  try {
    return await apiCall('gallery', 'POST', { character }, GALLERY_TIMEOUT);
  } catch (e) {
    // Offline / Local Mode using IndexedDB
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
      events: character.events || "",
      achievements: character.achievements || "",
      dateStart: character.dateStart || "",
      dateBirth: character.dateBirth || "",
      tags: character.tags || [],
      dynastyMotto: character.dynastyMotto || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: 'custom',
      collection: character.collection || 'Unsorted'
    };

    await dbService.add(newEntry);
    return newEntry;
  }
};

export const fetchGallery = async () => {
  try {
    const data = await apiCall('gallery', 'GET', undefined, GALLERY_TIMEOUT);
    return { data, source: 'server' };
  } catch (e) {
    const localData = await dbService.getAllGallery();
    return { data: localData, source: 'local' };
  }
};

export const updateCharacter = async (id: string, updates: Partial<StoredCharacter>, fullState?: StoredCharacter) => {
  try {
    return await apiCall(`gallery/${id}`, 'PUT', { character: updates }, GALLERY_TIMEOUT);
  } catch (e) {
    const all = await dbService.getAllGallery();
    const existing = all.find(c => c.id === id);

    if (existing) {
      const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
      await dbService.update(updated);
      return updated;
    } else if (fullState) {
      await dbService.update(fullState);
      return fullState;
    } else if (updates.id && updates.name) {
      // Allow upserting (e.g. creating a local override for a historical character)
      // We cast to StoredCharacter assuming the caller provided a complete object
      const newEntry = updates as StoredCharacter;
      await dbService.update(newEntry);
      return newEntry;
    }
    throw new Error("Cannot update record while offline (if created on server).");
  }
};

export const deleteCharacter = async (id: string) => {
  try {
    return await apiCall(`gallery/${id}`, 'DELETE', undefined, GALLERY_TIMEOUT);
  } catch (e) {
    // Use renamed method
    await dbService.deleteItem(id);
    return { success: true, id };
  }
};
