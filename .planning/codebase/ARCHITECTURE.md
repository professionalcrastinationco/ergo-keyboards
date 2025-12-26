# Architecture

**Analysis Date:** 2025-12-26

## Pattern Overview

**Overall:** Single-Page Application (SPA) - Monolithic Frontend

**Key Characteristics:**
- Single HTML file containing all code
- Pure client-side rendering
- No backend services or APIs
- Standalone static file served directly in browser
- Zero external dependencies

## Layers

**Presentation Layer:**
- Purpose: UI rendering and user interaction
- Contains: HTML structure, CSS styling, event handlers
- Location: `index.html` (lines 1-452 for HTML/CSS)
- Depends on: Data layer for layout definitions
- Used by: Browser (direct rendering)

**Data Layer:**
- Purpose: Store keyboard layout definitions
- Contains: Hardcoded JavaScript objects with key configurations
- Location: `index.html` (lines 456-723 - `layouts` object)
- Depends on: Nothing (self-contained)
- Used by: Business logic layer

**Business Logic Layer:**
- Purpose: Handle user interactions and state management
- Contains: Zoom functions, rendering logic, event handlers
- Location: `index.html` (lines 731-958)
- Depends on: Data layer, DOM APIs
- Used by: Event handlers, initialization

## Data Flow

**Layer Switch Flow:**

1. User clicks layer tab or presses 1-4 key
2. Event handler captures interaction (`index.html` lines 897-905, 920-926)
3. `currentLayer` variable updated
4. `renderLayout(layer)` called (`index.html` line 832)
5. DOM cleared and rebuilt with new layout data
6. Zoom re-applied

**State Management:**
- Simple variable-based state:
  - `currentLayer` - Active keyboard layer ('base', 'navnum', 'symbols', 'system')
  - `currentZoom` - Current zoom level (50-200)
- No state management library
- State persists only during session (resets on reload)

## Key Abstractions

**layouts Object:**
- Purpose: Hierarchical storage of all keyboard layer definitions
- Location: `index.html` lines 456-723
- Pattern: Configuration object with nested arrays
- Structure: `{ layerName: { left: [], right: [], info: {} } }`

**Key Data Model:**
- Purpose: Define individual key appearance and behavior
- Pattern: Plain object with optional properties
- Properties: `primary`, `secondary`, `hold`, `transparent`, `accent`, `highlight`, `rotated`

**DOM Factory Functions:**
- `createKey(keyData, index)` - Creates individual key DOM elements (`index.html` line 779)
- `renderLayout(layer)` - Orchestrates full layout rendering (`index.html` line 832)

## Entry Points

**Browser Load:**
- Location: `index.html`
- Triggers: Opening file in browser or HTTP request
- Responsibilities: Parse HTML, execute inline CSS/JS, render initial state

**JavaScript Initialization:**
- Location: `index.html` lines 955-957
- Triggers: Script tag execution
- Responsibilities: Render base layer, set initial zoom

## Error Handling

**Strategy:** No explicit error handling

**Patterns:**
- DOM operations assume elements exist (no null checks)
- No try/catch blocks
- Browser console for any errors
- Graceful degradation not implemented

## Cross-Cutting Concerns

**Logging:**
- No structured logging
- Browser developer tools only

**Validation:**
- No input validation
- Keyboard shortcuts assume valid key ranges
- DOM queries assume elements exist

**Accessibility:**
- Keyboard shortcuts for layer switching (1-4)
- Keyboard shortcuts for zoom (+, -, 0)
- Missing ARIA labels
- Missing focus indicators

---

*Architecture analysis: 2025-12-26*
*Update when major patterns change*
