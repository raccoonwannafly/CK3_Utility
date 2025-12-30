
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
        const json = JSON.parse(text);

        // Basic Validation
        if (!json || typeof json !== 'object') {
            throw new Error("Invalid file format.");
        }

        // Handle Legacy Array (if user tries to import a raw array from older versions)
        let chars: StoredCharacter[] = [];
        if (Array.isArray(json)) {
            chars = json;
        } else if (json.meta?.app === "CK3_ROYAL_UTILITY" && Array.isArray(json.data)) {
            chars = json.data;
        } else {
            throw new Error("Unknown file format. Is this a CK3 Utility export?");
        }

        // Data Sanitization & Migration
        const validChars = chars.map(c => ({
            ...c,
            // Regenerate ID to ensure no database conflicts on merge
            id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            // Ensure array fields exist
            images: Array.isArray(c.images) ? c.images : [],
            tags: Array.isArray(c.tags) ? c.tags : [],
            traits: Array.isArray(c.traits) ? c.traits : [],
        }));

        resolve(validChars);

      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};
