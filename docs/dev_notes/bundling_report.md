# Bundling Compatibility Report

If you intend to package this application as an executable (using tools like **Electron**, **Tauri**, or **pkg**), the following areas act as "breaking points" in the current architecture.

## 1. File System Write Access (Critical)
The current server writes directly to files relative to its executable path:
*   `server/data/gallery.json`
*   `docs/*` (The new DevHub storage)

**The Problem:**
Packaged executables (especially Electron ASARs or pkg snapshots) are **Read-Only**. Attempting to write to `__dirname` or relative paths inside the binary will crash the application.

**The Fix:**
You must detect the environment and switch storage paths to the User's Application Data folder (e.g., `%APPDATA%/CK3UtilityHub/`).
*   **Current**: `path.join(__dirname, 'data/gallery.json')`
*   **Required**: `path.join(process.env.APPDATA, 'CK3UtilityHub', 'gallery.json')`

## 2. External Documentation
**The Problem:**
You requested that "Developer Hub" edits be saved to the "docs" folder.
*   In an **exe**, the `docs` folder might be bundled *inside* the hidden binary. The user won't be able to see or edit these files externally.
*   If you want users to edit docs, the `docs` folder must be generated on the user's hard drive (outside the exe) on first launch.

## 3. Server-Client Communication
**The Problem:**
*   **Hardcoded Ports**: The server binds to port `3001`. If the user has something else on 3001, the exe will fail.
*   **Vite Proxy**: `vite.config.ts` handles the proxying in dev. In a production build, the frontend is static HTML/JS. The `server/index.js` correctly serves `../dist`, but this relative path `../dist` might break depending on how the bundler structures the output files.

## 4. Proposed "Bundlable" Architecture

To make this safe for an executable distribution, I recommend the following refactor:

### Phase 1: Path Management
Create a `storage.js` module in the server:
```javascript
const IS_PACKAGED = process.pkg || process.versions.electron;
const DATA_ROOT = IS_PACKAGED 
    ? path.join(process.env.APPDATA, 'CK3UtilityHub')
    : path.join(__dirname, '../'); // Dev Project Root

// Ensure folders exist on startup
// DATA_ROOT/data
// DATA_ROOT/docs
```

### Phase 2: Dynamic Port
Let the OS assign a free port, and pass that port to the React frontend (e.g., via a global `window.SERVER_PORT` injected variable in `index.html` or a startup config file).

### Phase 3: Externalizing Docs
On startup, check if `%APPDATA%/CK3UtilityHub/docs` exists. If not, copy the default template docs from the internal bundle to this external folder. This ensures the user has the starter docs but can edit them freely.
