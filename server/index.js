
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

dotenv.config();

// Get directory name in ES Module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 3001;

// --- PERSISTENT GALLERY STORE ---
const GALLERY_FILE = path.join(__dirname, 'data/gallery.json');
let galleryStore = [];

// Load initial data
async function loadGallery() {
    try {
        const data = await fs.readFile(GALLERY_FILE, 'utf-8');
        galleryStore = JSON.parse(data);
        console.log(`Loaded ${galleryStore.length} items from gallery archive.`);
    } catch (e) {
        if (e.code === 'ENOENT') {
            console.log("No gallery archive found. Starting fresh.");
            await saveGallery(); // Create empty file
        } else {
            console.error("Failed to load gallery:", e);
        }
    }
}

async function saveGallery() {
    try {
        await fs.writeFile(GALLERY_FILE, JSON.stringify(galleryStore, null, 2), 'utf-8');
    } catch (e) {
        console.error("Failed to save gallery:", e);
    }
}

// Initialize
loadGallery();

// --- HELPER: Basic HTML decoding for Steam descriptions ---
function decodeSteamHtml(html) {
    if (!html) return "";
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/<\/?[^>]+(>|$)/g, ""); // Strip remaining tags
}

// --- STEAM IMPORT ENDPOINT ---
app.post('/api/import/steam', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url || !url.includes('steamcommunity.com/sharedfiles/filedetails')) {
            return res.status(400).json({ error: "Invalid Steam Workshop URL" });
        }

        // Fetch with headers to avoid being blocked by Steam
        const steamResponse = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            }
        });

        if (!steamResponse.ok) throw new Error("Failed to fetch Steam page");
        const html = await steamResponse.text();

        // 1. Extract Title
        const titleMatch = html.match(/<div class="workshopItemTitle">(.+?)<\/div>/);
        const name = titleMatch ? titleMatch[1].trim() : "Unknown Ruler";

        // 2. Extract Main Image
        const imgMatch = html.match(/<img id="previewImage" class="workshopItemPreviewImageEnlargeable" src="(.+?)"/);
        const imageUrl = imgMatch ? imgMatch[1] : null;

        // 3. Extract Description & DNA
        const descMatch = html.match(/<div class="workshopItemDescription" id="highlightContent">([\s\S]+?)<\/div>/);
        let dnaString = "";
        let rawDesc = "";

        if (descMatch) {
            rawDesc = decodeSteamHtml(descMatch[1]);

            // Look for Ruler Designer block: ruler_designer_...={ ... }
            // Capture greedily to find the closing brace usually associated with these blocks
            const dnaRegex = /(ruler_designer_\d+\s*=\s*\{[\s\S]+?\s+\}\s+\}\s+\})/g;
            let dnaMatches = rawDesc.match(dnaRegex);

            // Fallback: Try a simpler regex if the precise one fails
            if (!dnaMatches || dnaMatches.length === 0) {
                const fallbackRegex = /ruler_designer_\d+\s*=\s*\{[\s\S]+?\}/g;
                dnaMatches = rawDesc.match(fallbackRegex);
            }

            if (dnaMatches && dnaMatches.length > 0) {
                // Find the longest match as it's likely the complete one
                dnaString = dnaMatches.reduce((a, b) => a.length > b.length ? a : b);
            } else {
                // Fallback 2: Look for Base64 blob if no wrapper
                const base64Regex = /[A-Za-z0-9+/=]{100,}/g;
                const base64Matches = rawDesc.match(base64Regex);
                if (base64Matches) {
                    dnaString = base64Matches[0];
                }
            }
        }

        if (!dnaString) {
            return res.status(404).json({ error: "Could not find valid CK3 DNA string in description." });
        }

        const character = {
            name: name,
            dna: dnaString,
            images: imageUrl ? [imageUrl] : [],
            bio: rawDesc.substring(0, 500) + "...", // Truncate bio
            traits: [], // Parsing traits from text is unreliable without AI, leaving empty
            culture: "Unknown",
            religion: "Unknown",
            category: 'custom',
            tags: ['Steam Import']
        };

        res.json({ character });

    } catch (error) {
        console.error("Steam Import Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- GALLERY ENDPOINTS ---

app.get('/api/gallery', (req, res) => {
    res.json(galleryStore);
});

app.post('/api/gallery', async (req, res) => {
    const { character } = req.body;
    if (!character) {
        return res.status(400).json({ error: "Missing character data" });
    }

    // Add metadata
    const newEntry = {
        id: Date.now().toString(),
        ...character,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    galleryStore.unshift(newEntry); // Add to top

    // Limit store size commented out for persistence
    // if (galleryStore.length > 50) galleryStore.pop();

    await saveGallery();
    res.json(newEntry);
});

app.put('/api/gallery/:id', async (req, res) => {
    const { id } = req.params;
    const { character } = req.body;

    const index = galleryStore.findIndex(c => c.id === id);
    if (index === -1) {
        // Upsert behavior: Create if not found (useful for syncing local/historical overrides)
        const newEntry = {
            ...character,
            id,
            createdAt: character.createdAt || new Date().toISOString()
        };
        galleryStore.unshift(newEntry);
        await saveGallery();
        return res.json(newEntry);
    }

    galleryStore[index] = { ...galleryStore[index], ...character, id, updatedAt: new Date().toISOString() }; // Prevent ID change
    await saveGallery();
    res.json(galleryStore[index]);
});

app.delete('/api/gallery/:id', async (req, res) => {
    const { id } = req.params;
    const initialLength = galleryStore.length;
    galleryStore = galleryStore.filter(c => c.id !== id);

    if (galleryStore.length === initialLength) {
        return res.status(404).json({ error: "Character not found" });
    }

    await saveGallery();
    res.json({ success: true, id });
});

// --- HISTORICAL CHARACTERS ENDPOINTS ---
const HISTORICAL_FILE = path.join(__dirname, 'data/historical_characters.json');

app.get('/api/historical', async (req, res) => {
    try {
        const data = await fs.readFile(HISTORICAL_FILE, 'utf-8');
        res.json(JSON.parse(data));
    } catch (e) {
        console.error("Failed to read historical data:", e);
        res.status(500).json({ error: "Failed to load historical data" });
    }
});

app.post('/api/historical', async (req, res) => {
    try {
        const { characters } = req.body;
        if (!Array.isArray(characters)) {
            return res.status(400).json({ error: "Invalid data format" });
        }
        await fs.writeFile(HISTORICAL_FILE, JSON.stringify(characters, null, 2), 'utf-8');
        res.json({ success: true, count: characters.length });
    } catch (e) {
        console.error("Failed to save historical data:", e);
        res.status(500).json({ error: "Failed to save historical data" });
    }
});

// --- DOCS ENDPOINTS ---
const DOCS_DIR = path.join(__dirname, '../docs');

// Helper to get category from path
const getCategoryFromDir = (dirName) => {
    switch (dirName) {
        case 'versions': return 'versions';
        case 'dev_notes': return 'dev notes';
        case 'wiki': return 'wiki';
        case 'prd': return 'PRD';
        case 'dna-forge': return 'dev notes'; // Group DNA Forge specs under dev notes or a new category
        default: return 'dev notes';
    }
};

app.get('/api/docs', async (req, res) => {
    try {
        const categories = ['versions', 'dev_notes', 'wiki', 'prd', 'dna-forge'];
        let allDocs = [];

        for (const catDir of categories) {
            const dirPath = path.join(DOCS_DIR, catDir);
            try {
                const files = await fs.readdir(dirPath);
                for (const file of files) {
                    if (file.endsWith('.md') || file.endsWith('.txt')) {
                        const filePath = path.join(dirPath, file);
                        const content = await fs.readFile(filePath, 'utf-8');

                        // Extract Title (first line # Title)
                        const firstLine = content.split('\n')[0];
                        const title = firstLine.replace(/^#\s*/, '').trim() || file;

                        allDocs.push({
                            id: `${catDir}/${file}`,
                            title: title,
                            category: getCategoryFromDir(catDir),
                            content: content,
                            path: 'local', // Signals it's editable
                            description: 'External File'
                        });
                    }
                }
            } catch (e) {
                // Ignore missing directories
                if (e.code !== 'ENOENT') console.error(`Error reading docs dir ${catDir}:`, e);
            }
        }
        res.json(allDocs);
    } catch (e) {
        console.error("Failed to list docs:", e);
        res.status(500).json({ error: "Failed to list documentation" });
    }
});

app.post('/api/docs', async (req, res) => {
    try {
        const { id, content, category } = req.body;
        // ID is expected to be "folder/filename.md"

        let targetPath;
        let safeId = id;

        // If ID doesn't have a folder, assign based on category
        if (!id.includes('/') && !id.includes('\\')) {
            let folder = 'dev_notes';
            if (category === 'versions') folder = 'versions';
            if (category === 'wiki') folder = 'wiki';
            if (category === 'PRD') folder = 'prd';
            safeId = `${folder}/${id.endsWith('.md') ? id : id + '.md'}`;
        }

        targetPath = path.join(DOCS_DIR, safeId);

        // Ensure directory exists
        await fs.mkdir(path.dirname(targetPath), { recursive: true });

        await fs.writeFile(targetPath, content, 'utf-8');
        res.json({ success: true, id: safeId });
    } catch (e) {
        console.error("Failed to save doc:", e);
        res.status(500).json({ error: "Failed to save document" });
    }
});

app.post('/api/docs/rename', async (req, res) => {
    try {
        const { oldId, newId } = req.body;
        if (!oldId || !newId) return res.status(400).json({ error: "Missing parameters" });

        const oldPath = path.join(DOCS_DIR, oldId);
        const newPath = path.join(DOCS_DIR, newId);

        // Security check
        if (!oldPath.startsWith(DOCS_DIR) || !newPath.startsWith(DOCS_DIR)) {
            return res.status(403).json({ error: "Invalid path" });
        }

        await fs.rename(oldPath, newPath);
        res.json({ success: true, oldId, newId });
    } catch (e) {
        console.error("Failed to rename doc:", e);
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/docs', async (req, res) => {
    try {
        const id = req.query.id;
        console.log(`Attempting to delete doc via query: ${id}`);

        if (!id) return res.status(400).json({ error: "No ID provided" });

        const targetPath = path.resolve(DOCS_DIR, id);

        // Security: Ensure target is within DOCS_DIR
        if (!targetPath.startsWith(path.resolve(DOCS_DIR))) {
            return res.status(403).json({ error: "Access denied" });
        }

        await fs.unlink(targetPath);
        console.log(`Successfully deleted: ${targetPath}`);
        res.json({ success: true });
    } catch (e) {
        console.error("Failed to delete doc:", e);
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/docs/*', async (req, res) => {
    try {
        const id = decodeURIComponent(req.params[0]);
        console.log(`Attempting to delete doc via path: ${id}`);

        if (!id) return res.status(400).json({ error: "No ID provided" });

        const targetPath = path.resolve(DOCS_DIR, id);

        if (!targetPath.startsWith(path.resolve(DOCS_DIR))) {
            return res.status(403).json({ error: "Access denied" });
        }

        await fs.unlink(targetPath);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- SERVE REACT FRONTEND ---
// This middleware serves the static files from the 'dist' folder generated by Vite
app.use(express.static(path.join(__dirname, '../dist')));

// This handles React Router paths - if the request doesn't match an API route or static file,
// serve the main HTML file so React can handle the routing on the client side.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
