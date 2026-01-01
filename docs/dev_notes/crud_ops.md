# CRUD Operations & Architecture

## Data Flow
The application uses a dual-layer storage strategy:
1.  **Server (Primary)**: \`gallery.json\` acts as the persistent store.
2.  **Local (Fallback)**: IndexedDB is used if the server is unreachable or for caching.

## API Endpoints
*   \`GET /api/gallery\`: Fetch all characters.
*   \`POST /api/gallery\`: Create new.
*   \`PUT /api/gallery/:id\`: Update existing.
*   \`DELETE /api/gallery/:id\`: Remove.

## Image Handling
Images are stored as Base64 strings or URLs.
*   **Steam Imports**: URLs are preserved from the Steam CDN.
*   **Uploads**: Converted to Base64 (max 5MB) for portability, though this has performance implications. Future update should implementing file upload to \`/uploads\` directory.
