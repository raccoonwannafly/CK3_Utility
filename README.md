
# CK3 Royal Utility Suite

<img width="1920" height="919" alt="image" src="https://github.com/user-attachments/assets/345eee93-9287-4630-a0a1-620cc9ae0a4b" />
<img width="1920" height="919" alt="image" src="https://github.com/user-attachments/assets/2d489574-dd9b-4b9a-9272-aae8d25a8933" />


A React-based web toolkit for Crusader Kings III DNA manipulation and modding.

## Tech Stack
*   **Core**: React 19, TypeScript
*   **Build**: Vite
*   **Styling**: Tailwind CSS
*   **Backend**: Node.js/Express (Steam proxy)

## Modules

### 1. DNA Manager (`/dna`)
*   **Function**: Converts between Persistent DNA (Save File) and Ruler Designer DNA.
*   **Features**: 
    *   Base64 decoding/encoding.
    *   Supports Vanilla and EPE mod gene indices.
    *   Raw byte editing.

### 2. Gallery Hub (`/gallery`)
*   **Function**: Character storage and organization.
*   **Features**:
    *   LocalStorage persistence.
    *   Steam Workshop import (via Node.js proxy).
    *   JSON export/import.
    *   Collection grouping.

### 3. DNA Forge (`/forge`)
*   **Function**: Visual gene editor.
*   **Logic**: Normalizes raw gene values (0-255 or 0.0-1.0) to percentage sliders based on template ranges defined in `constants.ts`.

### 4. Morph Lab (`/morph_lab`)
*   **Function**: Mod file analysis and generation.
*   **Inputs**: `.txt` files (Paradox script format) or raw DNA strings.
*   **Logic**:
    *   Parses `morph = { ... }` blocks.
    *   Visual difference highlighting.
    *   "Sweet Spot" mixing algorithm: `avg +/- (diff / 4)`.

## Setup

1.  **Install**: `npm install`
2.  **Dev**: `npm run dev` (Frontend on port 5173)
3.  **Full Stack**: `npm run server` (Express on port 3001, proxies frontend)

## Environment
*   `PORT`: Backend port (default 3001)

## Disclaimer
Unofficial tool. Not affiliated with Paradox Interactive.
