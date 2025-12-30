
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Get directory name in ES Module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 3001;

// --- IN-MEMORY DATABASE (For Demo Purposes) ---
// In a real app, this would be MongoDB or PostgreSQL
let galleryStore = []; 

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

app.post('/api/gallery', (req, res) => {
  const { character } = req.body;
  if (!character) {
    return res.status(400).json({ error: "Missing character data" });
  }
  
  // Add metadata
  const newEntry = {
    id: Date.now().toString(),
    ...character,
    createdAt: new Date().toISOString()
  };
  
  galleryStore.unshift(newEntry); // Add to top
  
  // Limit store size for demo
  if (galleryStore.length > 50) galleryStore.pop();
  
  res.json(newEntry);
});

app.put('/api/gallery/:id', (req, res) => {
    const { id } = req.params;
    const { character } = req.body;
    
    const index = galleryStore.findIndex(c => c.id === id);
    if (index === -1) {
        return res.status(404).json({ error: "Character not found" });
    }

    galleryStore[index] = { ...galleryStore[index], ...character, id }; // Prevent ID change
    res.json(galleryStore[index]);
});

app.delete('/api/gallery/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = galleryStore.length;
    galleryStore = galleryStore.filter(c => c.id !== id);
    
    if (galleryStore.length === initialLength) {
        return res.status(404).json({ error: "Character not found" });
    }
    
    res.json({ success: true, id });
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
