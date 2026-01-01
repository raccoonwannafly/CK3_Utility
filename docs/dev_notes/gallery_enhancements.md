# Gallery UI Enhancements Plan

## 1. Item Size Options
**Goal**: Allow user to switch between different card sizes (Small, Medium, Large) in the grid view.
**Implementation**:
*   Add `cardSize` state to `Gallery` component (default: 'medium').
*   Add `Slider` control (using Radix UI or simple range input) or Toggle Group in the toolbar to adjust size.
*   Update Grid CSS `grid-cols-x` dynamically based on `cardSize`.
    *   Small: `grid-cols-2 md:grid-cols-4 lg:grid-cols-6`
    *   Medium: `grid-cols-1 md:grid-cols-3 lg:grid-cols-4` (Current)
    *   Large: `grid-cols-1 md:grid-cols-2 lg:grid-cols-2`

## 2. Character Details Overlay & Fullscreen
**Goal**: Make the details view an overlay instead of a separate page replacement, and allow "true" fullscreen.
**Implementation**:
*   Refactor `view === 'details'` logic. Instead of replacing the grid, render the Details Panel as a fixed/absolute `div` on top of the grid (`z-50`).
*   Keep the Grid visible underneath (dimmed/blurred backdrop).
*   **Fullscreen Mode**:
    *   Currently, there is a maximize button using `isMaximized`.
    *   We will ensure `isMaximized` makes the overlay cover 100% of viewport.
    *   Standard mode will be a centered modal-like popup (floating window style).

## 3. Trait Suggestions
**Goal**: Suggest traits when typing in the Tags input. This is slightly ambiguous ("trait suggestions when typing tags" -> does user mean game traits or existing tags?).
*   **Assumption**: User uses "Tags" to list Traits (common pattern).
*   **Implementation**:
    *   When user types in `tagInput`, filter the `TRAITS` constant (and existing unique tags in the gallery).
    *   Show a dropdown/list of matches.
    *   Clicking a suggestion auto-completes the input.

## Execution Order
1.  Implement **Item Size** Slider/Buttons.
2.  Refactor **Details View** to Overlay.
3.  Implement **Tag Autocomplete**.
