
import { StoredCharacter } from "../types";

const CURRENT_VERSION = "1.0";

interface GallerySnapshot {
  meta: {
    version: string;
    exportedAt: string;
    app: "CK3_ROYAL_UTILITY";
  };
  data: StoredCharacter[];
}

/**
 * Downloads the current gallery as a JSON file.
 */
export const exportGallery = (characters: StoredCharacter[]) => {
  const snapshot: GallerySnapshot = {
    meta: {
      version: CURRENT_VERSION,
      exportedAt: new Date().toISOString(),
      app: "CK3_ROYAL_UTILITY"
    },
    data: characters
  };

  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `ck3-gallery-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Parses a JSON file and returns a list of characters.
 * Regenerates IDs to prevent conflicts with existing items.
 */
export const importGallery = async (file: File): Promise<StoredCharacter[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        let json; // Must be let, not const, as it is assigned in the try block
        
        try {
            json = JSON.parse(text);
        } catch (e) {
            throw new Error("File contains invalid JSON data.");
        }

        // Handle Legacy Array (if user tries to import a raw array from older versions)
        let chars: any[] = [];
        if (Array.isArray(json)) {
            // Direct array import (Legacy support)
            chars = json;
        } else if (json && typeof json === 'object') {
            // Standard format
            if (Array.isArray(json.data)) {
                 chars = json.data;
            } else if (json.meta && !json.data) {
                 throw new Error("JSON has meta but no data array.");
            } else {
                 // Try to see if it's a single character object?
                 // Or maybe a different format. 
                 // For now, if it's an object but not our format, assume it might be a key-value store of chars
                 // This is a guess, but safe to fail if not found.
                 throw new Error("Unknown file format. Expected an array or CK3 Utility snapshot.");
            }
        } else {
            throw new Error("Invalid file content.");
        }

        // Data Sanitization & Migration
        const validChars: StoredCharacter[] = chars.filter(c => c && typeof c === 'object' && (c.name || c.dna)).map(c => ({
            ...c,
            // Regenerate ID to ensure no database conflicts on merge
            id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: c.name || "Unknown Imported",
            // Ensure array fields exist
            images: Array.isArray(c.images) ? c.images : [],
            tags: Array.isArray(c.tags) ? c.tags : [],
            traits: Array.isArray(c.traits) ? c.traits : [],
            // Ensure strings
            culture: c.culture || "",
            religion: c.religion || "",
            bio: c.bio || "",
            events: c.events || "",
            achievements: c.achievements || "",
            dateStart: c.dateStart || "",
            dateBirth: c.dateBirth || "",
            goal: c.goal || "",
            dna: c.dna || "",
            createdAt: c.createdAt || new Date().toISOString(),
            category: 'custom'
        }));

        if (validChars.length === 0) {
             throw new Error("No valid character data found in file.");
        }

        resolve(validChars);

      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};
