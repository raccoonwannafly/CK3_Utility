# v1.3.3 Implementation Summary
2026-01-01

Summary of major improvements implemented in Version 1.3.3.

## 1. Gallery UX & Layout Control
*   **Grid Sizing**: Added a toolbar toggle allowing you to switch between **Small (S)**, **Medium (M)**, and **Large (L)** cards on the fly.
*   **Immersive Overlay**: Refactored the character details view into a smooth, animated overlay with blur effects.
*   **Enhanced Contrast**: Improved character name visibility with stronger background gradients and drop-shadows.

## 2. Advanced Sorting & Lifecycle Tracking
*   **Lifecycle Timestamps**: Characters now automatically track creation and modification times (`updatedAt`).
*   **New Sort Modes**: Added sorting by **Recently Edited**, **Recently Added**, **Dynasty**, and **House**.

## 3. Visual "Grandeur" System
*   **Tiered Styling**: Fame and Devotion levels now feature scaling visual fidelity. 
*   **Animated Glows**: Top tiers ("Living Legend" / "Paragon of Virtue") feature an **animated pulsing aura**.

## 4. Historical Data Expansion
*   **New Fields**: Added support for **Birth Names** and **Titles**.
*   **Database Update**: Updated all historical entries with accurate titles and birth years.

## 5. Definitive Light Mode Fixes
*   **Visibility Resolved**: Fixed all font readability issues by forcing dark overlays to persist even in Light Mode.
*   **UI Polish**: Standardized sidebar, menu, and toggle styling for high accessibility.

## 6. Documentation System Overhaul
*   **Dynamic Loading**: Migrated to a purely file-based documentation system.
*   **Robust Deletion**: Implemented query-based deletion to handle nested directory paths safely.
