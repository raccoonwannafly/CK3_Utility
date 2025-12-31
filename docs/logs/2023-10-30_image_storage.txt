# The Image Storage Crux: LocalStorage vs. IndexedDB

## The Problem
We want users to be able to import JSON files containing their character library, including portrait images.
Originally, we used **LocalStorage**.

### Why LocalStorage Failed
1.  **Quota Limits**: Browsers strictly limit LocalStorage to roughly **5MB**.
2.  **Base64 Bloat**: Images encoded as Base64 strings are 33% larger than their binary counterparts.
3.  **The Crash**: Importing a JSON file with just 2-3 high-res screenshots (converted to text) immediately exceeds 5MB. This causes the auto-save to crash, meaning data is lost as soon as the user refreshes.

## The Solution: IndexedDB
We refactored the storage layer (`services/dbService.ts`) to use **IndexedDB**.

### Advantages
1.  **Capacity**: Limits are based on disk space (often 50% of free disk space), allowing gigabytes of storage.
2.  **Async**: Operations are asynchronous, preventing UI freezing during large saves.
3.  **Structured Clone**: Can store Blobs and binary arrays directly (though we currently use Base64 for easier JSON portability).

### The "Export" Strategy
By keeping images as Base64 strings within the JSON structure (despite the size), we ensure that a single `.json` file contains **everything**. The user doesn't need to unzip folders or relink images.
1.  **Import**: File -> Memory -> IndexedDB.
2.  **View**: IndexedDB -> React State (RAM).
3.  **Export**: IndexedDB -> JSON File.

This provides the seamless experience of a desktop application within the browser.
