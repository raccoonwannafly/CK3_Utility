
import { ReferenceDocument } from '../types';

// --- VERSIONS ---

const DOC_V130 = `# Ver 1.3.0

## Core
*   **Storage Engine Upgrade**: Migrated from \`localStorage\` to **IndexedDB**.
    *   *Why?* To support storing high-resolution images and unlimited character data without hitting the 5MB browser quota.
    *   *Migration:* The app automatically detects legacy local storage data and moves it to the new database on first load.

## Gallery Hub
*   **Collections**: Characters can now be organized into custom Folders/Collections.
*   **Bulk Actions**: Added ability to Move or Delete multiple characters at once.
*   **UX Improvements**: 
    *   Replaced native prompts with custom Modals for a unified UI.
    *   Added Sidebar navigation for filtering by collection.
    
## Developer Hub
*   **Restructure**: Split "Dev Log" into "Version History" (Changelog) and "Dev Notes" (Ideas/Technical Specs).
*   **Virtual File System**: All documentation is now loaded from external text definitions to simulate a CMS structure.`;

const DOC_V120 = `# Ver 1.2.0 Gallery & Navigation Overhaul
2025-12-31

Transformed the Gallery from a flat list into a full organizational system.

    Collections: Added support for creating custom Albums/Collections to group characters (e.g., "Campaign 1", "Mod Testing").
    Sidebar Layout: Implemented a sidebar for quick filtering between "All", "Historical", "Unsorted", and custom collections.
    Bulk Actions: Added a "Move to..." feature to bulk-assign characters to collections.
    UX Fix: Replaced the native prompt() for creating collections with a custom Modal to ensure consistent UI and styling.

Navigation Structure

    Prioritization: Moved core technical tools (DNA Converter, Gallery, DNA Forge) to the top of the main sidebar.
    Grouping: Moved roleplay-focused tools (Trait Planner, Character Sheet) to a "Work in Progress" section to better reflect the current development focus.`;

const DOC_V110 = `# Version 1.1.0 - Morph Lab Updates

## Morph Lab
*   **Updated Slider Range**: Changed the Smart Cell Editor slider range to 0.0-1.0 to better reflect how values are handled in modding files, while still supporting DNA byte value conversion internally.
*   **Remove Morph Template**: Added the ability to select "No Template" (or remove an existing template assignment) directly from the Smart Cell Editor dropdown.
*   **Smart Cell Editor Positioning**: Fixed an issue where the cell editor popup would overflow off the screen if the column was near the right edge or bottom.`;

const DOC_V100 = `# Version 1.0.0 - Initial Release
Initialized React/Vite project structure.

## Features
*   **Trait Planner**: Complete point calculator for all vanilla traits.
*   **DNA Converter**: Bi-directional conversion between Ruler Designer DNA and Persistent DNA.
*   **Morph Lab**: Advanced visual comparison tool for modders to analyze gene data.
*   **DNA Forge**: Visual slider interface for editing gene values.`;

// --- DEV NOTES ---

const DOC_CRUD_OPS = `# CRUD Operations & Soft Deletes

## Overview
The Developer Hub has been upgraded to support full Create, Read, Update, and Delete (CRUD) operations for documentation. This effectively turns the static documentation viewer into a lightweight CMS running entirely in the browser using IndexedDB.

## The "Delete Anything" Problem
The app loads documents from two sources:
1.  **Built-in (Static):** Hardcoded in \`services/docLoader.ts\`. These act as the immutable "base game" files.
2.  **Local (IndexedDB):** User-created notes or edits.

Because browsers cannot delete lines of code from the deployed source (the built-in docs), true deletion of built-in items is impossible. However, users expect a delete button to work on anything they see.

## The Solution: Soft Deletion
We implemented a "Soft Delete" mechanism to handle this.

### Data Flow
1.  **Selection**: User clicks delete on any document (Built-in or Custom).
2.  **Check**: The system checks if the ID exists in the Built-in list.
3.  **Action**:
    *   **If Local**: The record is physically removed from IndexedDB.
    *   **If Built-in**: A "Tombstone" record is saved to IndexedDB: \`{ id: "v1.0.0.txt", deleted: true }\`.

### Reconciliation
When the app loads or updates:
1.  It loads the static list.
2.  It loads the DB list.
3.  It merges them. Crucially, if a DB record has \`deleted: true\`, it removes the corresponding item from the final list displayed to the user.

This creates the illusion of full deletion capability across the entire system, while maintaining data integrity.

## Auto-Date
New entries now automatically prepend the current date to the content body for better organization.`;

const DOC_IMAGE_STORAGE = `# The Image Storage Crux: LocalStorage vs. IndexedDB

## The Problem
We want users to be able to import JSON files containing their character library, including portrait images.
Originally, we used **LocalStorage**.

### Why LocalStorage Failed
1.  **Quota Limits**: Browsers strictly limit LocalStorage to roughly **5MB**.
2.  **Base64 Bloat**: Images encoded as Base64 strings are 33% larger than their binary counterparts.
3.  **The Crash**: Importing a JSON file with just 2-3 high-res screenshots (converted to text) immediately exceeds 5MB. This causes the auto-save to crash, meaning data is lost as soon as the user refreshes.

## The Solution: IndexedDB
We refactored the storage layer (\`services/dbService.ts\`) to use **IndexedDB**.

### Advantages
1.  **Capacity**: Limits are based on disk space (often 50% of free disk space), allowing gigabytes of storage.
2.  **Async**: Operations are asynchronous, preventing UI freezing during large saves.
3.  **Structured Clone**: Can store Blobs and binary arrays directly (though we currently use Base64 for easier JSON portability).

### The "Export" Strategy
By keeping images as Base64 strings within the JSON structure (despite the size), we ensure that a single \`.json\` file contains **everything**. The user doesn't need to unzip folders or relink images.
1.  **Import**: File -> Memory -> IndexedDB.
2.  **View**: IndexedDB -> React State (RAM).
3.  **Export**: IndexedDB -> JSON File.

This provides the seamless experience of a desktop application within the browser.`;

const DOC_EXAMPLE_DNA = `ruler_designer_12345={
	type=male
	id=0
	genes={ 
		hair_color={ 45 239 45 239 }
		skin_color={ 172 125 172 125 }
		eye_color={ 44 174 44 174 }
		gene_chin_forward={ "gene_chin_forward_pos" 121 "gene_chin_forward_pos" 121 }
    }
}`;

const DOC_COLOR_STRUCT = `Genes connect to the /ethnicities

=== Structure (very incomplete) ===

color_genes = {
	hair_color = {
		index = 0					# index within the DNA
		color = hair				# one of hair/eye/skin
		blend_range = { 0.4 0.6 }	# When inheriting the color, blend between "dominant" and "recessive" parent in this ratio. E.g. { 0.0 0.0 } will pick the "dominant" parent, and { 0.3 0.7 } with pick something 30% to 70% between parent's values.
	}
	...
}

decal = {
	type = skin						#decal type: skin or paint. Skin decals are added before skin color and use skin-diffuse+normal maps. Paint decals are added after skin color and use paint-diffuse+property maps.
	atlas_pos = { 0 0 }				#position of the decal in the atlas texture
	alpha_curve = {					#controls decal alpha relative to gene strength. Will give a linear interpolation if left unspecified
		#gene strength, decal alpha
		{ 0.0	0.6 }
		{ 1.0	0.6 }
	}
}


ugliness_feature_categories = { chin mouth } # A list of features the gene is associated with, used by ugliness_portrait_extremity_shift in traits`;

const DOC_COLOR_DEFS = `color_genes = {
	hair_color = {
		group = hair
		color = hair
		blend_range = { 0.0 0.0 }
	}
	skin_color = {
		sync_inheritance_with = hair_color
		group = body
		color = skin
		blend_range = { 0.55 0.65 }
	}
	eye_color = {
		sync_inheritance_with = hair_color
		group = eyes
		color = eye
		blend_range = { 0.0 0.0 }
	}

}`;

const DOC_MORPH_DEFS = `@maleMin = -0.5
@maleMax = 0.499
@femaleMin = -0.4
@femaleMax = 0.4
@boyMin = -0.5
@boyMax = 0.499
@girlMin = -0.4
@girlMax = 0.4

@maleBsMin = 0.0
@maleBsMax = 1.0
@femaleBsMin = 0.0
@femaleBsMax = 0.8

age_presets = {
	age_preset_aging_primary = {
		mode = multiply
		curve = {
			{ 0.0 0.0 }
			{ 0.25 0.0 }
			{ 0.35 0.2 }
			{ 0.75 1.0 }
		}
	}
	age_preset_aging_secondary = {
		mode = multiply
		curve = {
			{ 0.0 0.0 }
			{ 0.5 0.0 }
			{ 0.85 0.5 }
		}
	}
    # ... (Truncated due to extreme length, but represents 01_genes_morph.txt content) ...
    # This file contains the definitions for age presets, decal atlases, and morph genes.
}`;

const DOC_GENES_RULES = `Genes connect to the /ethnicities

=== Structure (very incomplete) ===

color_genes = {
	hair_color = {
		index = 0					# index within the DNA
		color = hair				# one of hair/eye/skin
		blend_range = { 0.4 0.6 }	# When inheriting the color, blend between "dominant" and "recessive" parent in this ratio. E.g. { 0.0 0.0 } will pick the "dominant" parent, and { 0.3 0.7 } with pick something 30% to 70% between parent's values.
	}
	...
}

decal = {
	type = skin						#decal type: skin or paint. Skin decals are added before skin color and use skin-diffuse+normal maps. Paint decals are added after skin color and use paint-diffuse+property maps.
	atlas_pos = { 0 0 }				#position of the decal in the atlas texture
	alpha_curve = {					#controls decal alpha relative to gene strength. Will give a linear interpolation if left unspecified
		#gene strength, decal alpha
		{ 0.0	0.6 }
		{ 1.0	0.6 }
	}
}


ugliness_feature_categories = { chin mouth } # A list of features the gene is associated with, used by ugliness_portrait_extremity_shift in traits`;

const DOC_GENES_COLOR = `color_genes = {
	hair_color = {
		group = hair
		color = hair
		blend_range = { 0.0 0.0 }
	}
	skin_color = {
		sync_inheritance_with = hair_color
		group = body
		color = skin
		blend_range = { 0.55 0.65 }
	}
	eye_color = {
		sync_inheritance_with = hair_color
		group = eyes
		color = eye
		blend_range = { 0.0 0.0 }
	}

}`;

const DOC_GENES_MORPH_FULL = `@maleMin = -0.5
@maleMax = 0.499
@femaleMin = -0.4
@femaleMax = 0.4
@boyMin = -0.5
@boyMax = 0.499
@girlMin = -0.4
@girlMax = 0.4

@maleBsMin = 0.0
@maleBsMax = 1.0
@femaleBsMin = 0.0
@femaleBsMax = 0.8

age_presets = {
	age_preset_aging_primary = {
		mode = multiply
		curve = {
			{ 0.0 0.0 }
			{ 0.25 0.0 }
			{ 0.35 0.2 }
			{ 0.75 1.0 }
		}
	}
	age_preset_aging_secondary = {
		mode = multiply
		curve = {
			{ 0.0 0.0 }
			{ 0.5 0.0 }
			{ 0.85 0.5 }
		}
	}
    # ... (Truncated due to extreme length, but represents 01_genes_morph.txt content) ...
    # This file contains the definitions for age presets, decal atlases, and morph genes.
}`;


// --- WIKI ---

const DOC_WELCOME = `# CK3 Royal Utility Suite

Welcome, this suite combines character planning, DNA manipulation, and roleplay generation into one interface.
This knowledge base details the inner workings of the Crusader Kings III DNA system and how this tool interacts with it.

## Quick Start
1. **Trait Planner**: Design your ruler's personality and stats.
2. **Character Sheet**: Generate a backstory and portrait for your build.
3. **DNA Converter**: Convert between save-game DNA strings and console commands.
4. **Morph Lab**: For modders - analyze and mix DNA files.

Use the sidebar to navigate between these tools.`;

const DOC_MORPH_GUIDE = `# Morph Lab Guide

The Morph Lab (Comparator) is a tool for "Gene Alchemy".

## How to use
1.  **Paste DNA**: Paste a character's DNA string into the workbench.
2.  **Load Mod Files**: Upload \`.txt\` files from a mod (e.g., EPE) that contain \`morph = { ... }\` definitions.
3.  **Comparison**: The grid shows the raw values.
    *   **Green**: Value is higher than the reference.
    *   **Red**: Value is lower than the reference.

## Sweet Spot Mixing
The "Mix Columns" feature uses a weighted random formula to create natural variations:
\`\`\`
Average (E) = (A + B) / 2
Difference (D) = abs(A - B)
Range = [E - D/4,  E + D/4]
Result = Random(Range)
\`\`\`
This ensures the child looks related to the parents but isn't just a strict linear average.`;

// --- PRD ---

const DOC_PRD = `# CK3 Royal Utility Suite - Product Requirements Document (PRD)

## 1. Executive Summary
The **CK3 Royal Utility Suite** is a comprehensive companion application designed for players and modders of *Crusader Kings III*. It bridges the gap between technical game data (DNA strings, scripts) and immersive roleplay, providing tools to visualize, manipulate, and generate character data.

## 2. User Personas
*   **The Roleplayer**: Wants to create a deep backstory and visual identity for their starting ruler without writing fiction from scratch.
*   **The Min-Maxer**: Needs to calculate trait costs efficiently to build the perfect 400-point Ironman character.
*   **The Modder**: Needs to debug facial variations, merge DNA presets, and convert between different game data formats.

## 3. Core Features & Requirements

### 3.1 Trait Planner
*   **Goal**: Calculate character customization points.
*   **Requirements**:
    *   List all game traits categorized (Education, Personality, Congenital, etc.).
    *   Show point costs and effects.
    *   Handle trait conflicts (e.g., cannot be both *Humble* and *Arrogant*).
    *   Real-time point total calculation.

### 3.2 Character Sheet
*   **Goal**: Enhance roleplay.
*   **Requirements**:
    *   **Lore**: Write biography, strategy guide, and dynasty motto.
    *   **Portrait**: Store DNA strings and image URLs.

### 3.3 DNA Forge & Converter
*   **Goal**: Manipulate genetic strings.
*   **Requirements**:
    *   Convert between **Persistent DNA** (Save File/Ruler Designer) and **Console Commands**.
    *   **Granular Editor**: Edit individual gene bytes (0-255).
    *   **Visual Forge**: Slider-based interface for modifying genes (Chin, Eyes, Nose, etc.) with visual feedback on ranges (Male/Female/Boy/Girl).

### 3.4 Morph Lab (Comparator)
*   **Goal**: Advanced analysis for modders.
*   **Requirements**:
    *   **File Parsing**: Read \`.txt\` mod files containing \`morph = { ... }\` blocks.
    *   **Comparison**: Side-by-side view of multiple files/DNA strings.
    *   **Diffing**: Highlight value differences (Green = Higher, Red = Lower).
    *   **Sweet Spot Mixing**: Algorithm to blend two DNA sources to create a "child" or variation.
    *   **Export**: Generate valid \`.txt\` code blocks for mod usage.

### 3.5 Gallery (Archives)
*   **Goal**: Persistence.
*   **Requirements**:
    *   Save created characters locally (IndexedDB).
    *   Export/Import gallery as JSON for backup.
    *   Steam Workshop import (via URL scraping).
    *   **Collections**: Organize characters into albums/folders.

## 4. Technical Architecture
*   **Frontend**: React 19, TypeScript, Vite.
*   **Styling**: Tailwind CSS (Custom "CK3 Glass" theme).
*   **Storage**: IndexedDB for large assets (images), LocalStorage for settings.`;

const DOC_DEV_DOCS = `# CK3 DNA Forge - Developer Documentation

## 1. Project Overview
The **CK3 DNA Forge** is a specialized React application designed to simulate the character creation "Gene" system found in the strategy game *Crusader Kings 3*. It serves as a bridge between raw game data (Paradox script files) and a visual interface, allowing modders and players to manipulate genetic parameters and generate valid DNA strings.

## 2. Technical Architecture

### Core Stack
- **Framework:** React 18 (Functional Components, Hooks)
- **Language:** TypeScript (Strict typing for complex game data structures)
- **Styling:** Tailwind CSS (Custom configuration for "CK3 Glass" aesthetic)
- **Icons:** Lucide React
- **Build/Runtime:** Browser-native ES Modules (via ESM.sh) for maximum portability without complex build steps.

### File Structure & Responsibilities
*   \`index.html\`: Entry point. Contains the Import Map (dependencies) and Tailwind configuration.
*   \`App.tsx\`: The main controller. Handles global state (\`geneValues\`), routing between "Forge" and "Reference" views, and initial data fetching.
*   \`documents.ts\`: **Critical.** The Manifest file. It lists all available \`.txt\` files in the \`docs/\` folder so the browser knows what to fetch.
*   \`constants.ts\`: The static database defining all \`GeneDefinitions\` (Morphs, Accessories, Colors) and their ranges.
*   \`types.ts\`: TypeScript interfaces (\`GeneDefinition\`, \`GeneTemplate\`, \`GeneState\`).
*   \`components/\`:
    *   \`GeneSlider.tsx\`: Renders individual sliders. Handles the math to normalize game values (0.0-1.0) into UI percentages.
    *   \`GeneInfo.tsx\`: A draggable, resizable modal using \`React.createPortal\` to show raw game code context.
    *   \`DnaOutput.tsx\`: Serializes the current state into the proprietary Paradox DNA format.
*   \`docs/\`: Contains raw \`.txt\` files loaded at runtime.

## 3. The Document Loading System (Manifest Pattern)

Because this application is designed to run in environments without a backend filesystem scanner (like static hosts or code sandboxes), it uses a **Manifest Pattern** to load text resources.

### How it works:
1.  **Storage:** Text files (e.g., \`01_genes_morph.txt\`) are stored in the \`docs/\` directory.
2.  **Manifest:** The file \`documents.ts\` exports a constant \`DOCUMENT_MANIFEST\`. This is an array of objects containing the \`id\`, \`title\`, and \`path\` for each file.
3.  **Loading:** On application mount, \`App.tsx\` calls \`loadAllDocuments()\`.
4.  **Fetching:** This function iterates through the manifest and performs a standard \`fetch(path)\` for each file to retrieve its text content.
5.  **Caching:** The results are stored in memory to allow instant switching between documents in the "Game References" tab.

**Adding a new document:**
To add a new reference file, place it in \`docs/\` and add an entry to the \`DOCUMENT_MANIFEST\` array in \`documents.ts\`.

## 4. Data Model: Genes & Templates

The application's logic revolves around the \`GeneDefinition\` interface found in \`types.ts\`. CK3 genes are not simple linear sliders; they are context-dependent.

### Key Concepts:
1.  **Gene ID:** The internal game key (e.g., \`gene_chin_forward\`).
2.  **Templates:** Most genes have "modes" called templates (e.g., \`chin_forward_neg\` vs \`chin_forward_pos\`).
    *   *Negative Template:* Usually handles values < 0.5 (or -0.5 to 0.0 in raw terms).
    *   *Positive Template:* Usually handles values > 0.5.
3.  **Ranges:**
    *   **Morphs:** Typically range from -0.5 to 0.5 (Male) or 0.0 to 1.0 (Blend Shapes).
    *   **Accessories:** Integer-based indices (0, 1, 2, 3...).
4.  **Normalization:** The \`GeneSlider\` component normalizes these varying ranges into a 0-100% visual slider for consistency, while maintaining the raw value in the background for export.

### State Structure
The global state (\`geneValues\`) is a dictionary:
\`\`\`typescript
type GeneState = {
  [geneId: string]: {
    value: number;        // The raw game value (e.g., 0.125 or 127/255)
    templateIndex: number // The index of the selected template (e.g., 0 for _neg, 1 for _pos)
  }
}
\`\`\`

## 5. DNA Serialization (Export)

The \`DnaOutput\` component generates the specific string format required by the game.

**Format:**
\`\`\`
ruler_designer_12345={
    genes={
        gene_id={ "template_name" value "template_name" value }
        ...
    }
}
\`\`\`
*Note: The generator uses the selected template name for both the dominant and recessive gene slots (Simulating a homozygous gene for consistency).*

## 6. Styling System (CK3 Glass)

The UI replicates the "Glass" aesthetic of the CK3 interface using Tailwind utility classes.

*   **Colors:** Defined in \`tailwind.config\` within \`index.html\`.
    *   \`ck3-bg\`: Dark background (#050505).
    *   \`ck3-glass\`: Translucent dark gray with blur (\`backdrop-blur-md\`).
    *   \`ck3-accent\`: Gold (#d4af37).
    *   \`ck3-border\`: Subtle white border (#ffffff14).
*   **Typography:**
    *   Headers: 'Cinzel' (Serif, evocative of medieval text).
    *   Body: 'Lato' (Sans-serif, clean UI text).
    *   Code: 'Fira Code' (Monospace).

## 7. Extension Guide

**To add a new gene slider:**
1.  Open \`constants.ts\`.
2.  Add a new entry to the \`GENE_DEFINITIONS\` array.
3.  Specify the \`id\`, \`name\`, \`group\`, and \`type\`.
4.  Define \`templates\` if the gene has multiple modes (like negative/positive variations) or specific index ranges.

**To add a new category:**
1.  Open \`constants.ts\`.
2.  Add to \`GENE_GROUPS\`.
3.  Ensure the new genes reference this group ID.`;


export const LOADED_DOCUMENTS: ReferenceDocument[] = [
    // --- Versions ---
    {
        id: 'v1.3.0.txt',
        title: 'Version 1.3.0',
        category: 'versions',
        content: DOC_V130,
        path: 'virtual:v1.3.0',
        description: 'Changelog'
    },
    {
        id: 'v1.2.0.txt',
        title: 'Version 1.2.0',
        category: 'versions',
        content: DOC_V120,
        path: 'virtual:v1.2.0',
        description: 'Changelog'
    },
    {
        id: 'v1.1.0.txt',
        title: 'Version 1.1.0',
        category: 'versions',
        content: DOC_V110,
        path: 'virtual:v1.1.0',
        description: 'Changelog'
    },
    {
        id: 'v1.0.0.txt',
        title: 'Version 1.0.0',
        category: 'versions',
        content: DOC_V100,
        path: 'virtual:v1.0.0',
        description: 'Changelog'
    },

    // --- Dev Notes ---
    {
        id: 'crud_ops.txt',
        title: 'CRUD Operations',
        category: 'dev notes',
        content: DOC_CRUD_OPS,
        path: 'virtual:crud_ops',
        description: 'Dev Hub Update'
    },
    {
        id: 'image_storage.txt',
        title: 'The Image Storage Crux',
        category: 'dev notes',
        content: DOC_IMAGE_STORAGE,
        path: 'virtual:image_storage',
        description: 'Analysis of Storage methods'
    },
    {
        id: 'example_dna.txt',
        title: 'Example DNA',
        category: 'dev notes',
        content: DOC_EXAMPLE_DNA,
        path: 'virtual:example_dna',
        description: 'Sample DNA string'
    },
    {
        id: 'color_structure.txt',
        title: 'Color Structure',
        category: 'dev notes',
        content: DOC_COLOR_STRUCT,
        path: 'virtual:color_structure',
        description: 'Paradox Color Structure'
    },
    {
        id: 'color_definitions.txt',
        title: 'Color Definitions',
        category: 'dev notes',
        content: DOC_COLOR_DEFS,
        path: 'virtual:color_definitions',
        description: 'Defined Color Genes'
    },
    {
        id: 'morph_definitions.txt',
        title: 'Morph Definitions',
        category: 'dev notes',
        content: DOC_MORPH_DEFS,
        path: 'virtual:morph_definitions',
        description: 'Defined Morph Genes'
    },
    {
        id: 'genes_rules.txt',
        title: 'Genes Rules',
        category: 'dev notes',
        content: DOC_GENES_RULES,
        path: 'virtual:genes_rules',
        description: 'Gene Rules'
    },
    {
        id: '00_genes_color.txt',
        title: 'Genes Color',
        category: 'dev notes',
        content: DOC_GENES_COLOR,
        path: 'virtual:genes_color',
        description: 'Gene Colors'
    },
    {
        id: '01_genes_morph.txt',
        title: 'Genes Morph (Full)',
        category: 'dev notes',
        content: DOC_GENES_MORPH_FULL,
        path: 'virtual:genes_morph',
        description: 'Raw game file (Full)'
    },

    // --- Wiki ---
    {
        id: '00_welcome.txt',
        title: 'Welcome',
        category: 'wiki',
        content: DOC_WELCOME,
        path: 'virtual:welcome',
        description: 'Wiki Home'
    },
    {
        id: '01_morph_lab_guide.txt',
        title: 'Morph Lab Guide',
        category: 'wiki',
        content: DOC_MORPH_GUIDE,
        path: 'virtual:morph_guide',
        description: 'Guide for Morph Lab'
    },

    // --- PRD ---
    {
        id: 'prd.txt',
        title: 'Product Requirements',
        category: 'PRD',
        content: DOC_PRD,
        path: 'virtual:prd',
        description: 'Original PRD'
    },
    {
        id: 'dev_docs.txt',
        title: 'DNA Forge Dev Docs',
        category: 'PRD',
        content: DOC_DEV_DOCS,
        path: 'virtual:dev_docs',
        description: 'Technical docs for DNA Forge'
    }
].sort((a, b) => {
    // Sort by category first
    if (a.category !== b.category) {
        const order = ["versions", "dev notes", "wiki", "PRD"];
        const idxA = order.indexOf(a.category || '');
        const idxB = order.indexOf(b.category || '');
        
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return (a.category || '').localeCompare(b.category || '');
    }
    
    // Sort Versions descending (newest first)
    if (a.category === 'versions') {
        return b.title.localeCompare(a.title); 
    }
    
    // Default alphabetical
    return a.title.localeCompare(b.title);
});
