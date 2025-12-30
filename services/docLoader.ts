
import { ReferenceDocument } from '../types';
import { FORGE_DOCS_CONTENT } from '../data_forge';

export const LOADED_DOCUMENTS: ReferenceDocument[] = Object.entries(FORGE_DOCS_CONTENT).map(([path, content]) => {
  // Path parsing logic
  const parts = path.split('/');
  const filename = parts.pop() || "";
  
  // Extract category from the folder name immediately preceding the file
  let category = "General";
  
  // Find 'docs' in the path and take the next folder as category
  const docsIndex = parts.indexOf('docs');
  if (docsIndex !== -1 && docsIndex < parts.length - 1) {
      // There is a folder after 'docs' (e.g. dna-forge)
      const rawCat = parts[docsIndex + 1];
      // Format: "dna-forge" -> "Dna Forge"
      category = rawCat.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  // Create a pretty title from filename
  let title = filename.replace(/\.txt$/, '');
  title = title.replace(/^\d+[_-\s]*/, ''); // Remove leading numbers
  title = title.replace(/_/g, ' '); // Replace underscores
  title = title.replace(/\b\w/g, c => c.toUpperCase()); // Title Case

  return {
    id: filename,
    title: title || filename,
    description: `Source: ${path}`,
    path: path,
    content: content as string,
    category: category
  };
}).sort((a, b) => {
    // Sort by category first, then title
    if (a.category !== b.category) {
        return (a.category || "").localeCompare(b.category || "");
    }
    return a.title.localeCompare(b.title);
});

// Fallback if no docs found
if (LOADED_DOCUMENTS.length === 0) {
    LOADED_DOCUMENTS.push({
        id: 'welcome',
        title: 'Welcome',
        description: 'System Message',
        path: 'internal',
        category: 'Guide',
        content: `No documentation loaded. Please ensure data_forge.ts contains valid content.`
    });
}
