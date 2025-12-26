# Roadmap: Ergo Keyboard Layout Editor

## Overview

Transform the static keyboard layout viewer into an interactive editor. The journey: refactor the data layer for editability → build selection and editing UI → add combo visualization → enable persistence and export. Each phase delivers incremental value while keeping the app functional throughout.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Data Layer Refactor** - Extract layouts to JSON, enable dynamic rendering
- [x] **Phase 2: Selection & Sidebar UI** - Build sidebar panel, implement key selection
- [x] **Phase 3: Real-time Editing** - Live key editing with instant visual updates
- [ ] **Phase 4: Combo Visualization** - Modifier badges, layer-tap, chord notation
- [ ] **Phase 5: Persistence & Export** - LocalStorage auto-save, JSON import/export

## Phase Details

### Phase 1: Data Layer Refactor
**Goal**: Extract hardcoded layout data into JSON format, split files for maintainability, refactor rendering to support dynamic updates
**Depends on**: Nothing (first phase)
**Research**: Unlikely (internal refactoring, established patterns)
**Plans**: 1 (01-01-PLAN.md)

Key deliverables:
- Separate `layouts.json` with keyboard data
- Separate `styles.css` and `app.js` files
- Rendering functions that can re-render individual keys
- JSON schema documented

### Phase 2: Selection & Sidebar UI
**Goal**: Build the sidebar editor panel and key selection system
**Depends on**: Phase 1
**Research**: Unlikely (vanilla JS DOM manipulation)
**Plans**: TBD

Key deliverables:
- Sidebar panel (right side) with editing fields
- Click-to-select key highlighting
- Display selected key's properties in sidebar
- Field layout: primary, secondary, hold, accent, highlight toggles

### Phase 3: Real-time Editing
**Goal**: Enable live editing with instant visual feedback
**Depends on**: Phase 2
**Research**: Unlikely (internal event handling patterns)
**Plans**: TBD

Key deliverables:
- Edit any field in sidebar, see key update immediately
- Support all key properties (primary, secondary, hold modifier)
- Clear/reset key functionality
- Undo last change (single-level)

### Phase 4: Combo Visualization
**Goal**: Display all combo types with clear visual indicators
**Depends on**: Phase 3
**Research**: Unlikely (internal UI patterns)
**Plans**: TBD

Key deliverables:
- Modifier+key display (e.g., "Shift+A" badge)
- Layer-tap indicators (tap behavior vs hold behavior)
- Chord combination notation (A+B → C)
- Editable combo fields in sidebar

### Phase 5: Persistence & Export
**Goal**: Save work and enable sharing via JSON files
**Depends on**: Phase 4
**Research**: Unlikely (standard browser APIs - File API, LocalStorage)
**Plans**: TBD

Key deliverables:
- LocalStorage auto-save (persist between sessions)
- Export button → download JSON file
- Import via file picker or drag-drop
- Reset to default layout option
- JSON schema validation on import

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Data Layer Refactor | 1/1 | Complete | 2025-12-26 |
| 2. Selection & Sidebar UI | 1/1 | Complete | 2025-12-26 |
| 3. Real-time Editing | 1/1 | Complete | 2025-12-26 |
| 4. Combo Visualization | 0/TBD | Not started | - |
| 5. Persistence & Export | 0/TBD | Not started | - |
