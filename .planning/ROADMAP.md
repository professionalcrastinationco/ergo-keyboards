# Roadmap: Ergo Keyboard Layout Editor

## Overview

Transform the static keyboard layout viewer into an interactive editor. The journey: refactor the data layer for editability, build selection and editing UI, add combo visualization, enable persistence and export.

## Domain Expertise

None

## Milestones

- ✅ **v1.0 MVP** - Phases 1-5 (shipped 2025-12-26)
- 🚧 **v1.1 Enhanced Combo Visualization** - Phases 6-8.2 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-5) - SHIPPED 2025-12-26</summary>

See [v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md) for full details.

</details>

### 🚧 v1.1 Enhanced Combo Visualization (In Progress)

**Milestone Goal:** Improve combo key display with visual badges between adjacent keys and color-matched badges for non-adjacent combos, plus intuitive combo creation mode.

**UI/UX Decisions:**
- Exit combo mode: ESC key or click outside
- Adjacent badge position: Centered at midpoint between keys
- Non-adjacent badge position: Bottom center of key
- Multiple combos per key: Allowed, badges side by side

#### Phase 6: Combo Data Model

**Goal**: Refactor combo storage from per-key to layer-level with position-based references for adjacency detection
**Depends on**: v1.0 complete
**Research**: Unlikely (internal refactor)
**Plans**: 1 plan

Plans:
- [x] 06-01: Add color palette, adjacency detection, layer-level combos array

#### Phase 7: Combo Rendering

**Goal**: Render adjacent combos as floating badges between keys, non-adjacent as color-matched badges on each key
**Depends on**: Phase 6
**Research**: Unlikely (CSS/JS patterns established)
**Plans**: 1 plan

Plans:
- [x] 07-01: Add CSS and renderCombos() function for combo visualization

#### Phase 8: Combo Editing

**Goal**: Add Combo mode (click two keys, enter output), sidebar combo list, delete functionality
**Depends on**: Phase 7
**Research**: Unlikely (editing patterns from v1.0)
**Plans**: 1 plan

Plans:
- [x] 08-01: Add combo mode UI, creation flow, sidebar list, delete functionality

#### Phase 8.1: Combo Badge Polish (INSERTED)

**Goal**: Fix combo badge centering, text contrast, and zoom-related positioning issues discovered during testing
**Depends on**: Phase 8
**Research**: None (bug fixes)
**Plans**: 1 plan

Plans:
- [x] 08.1-01: Center badges, add luminance-based text contrast, fix zoom positioning

**Details:**
Bug fixes discovered after Phase 8 completion:
- Combo badges were right-aligned instead of centered
- Long labels overflowed key boundaries
- Light-colored badges had poor text contrast (white on light backgrounds)
- Adjacent combo badges positioned incorrectly at non-100% zoom levels

#### Phase 8.2: Fix Thumb Cluster Rotation (INSERTED)

**Goal**: Fix the thumb cluster keys rotation angles to match the reference keymap-drawer image
**Depends on**: Phase 8.1
**Research**: None (visual matching)
**Plans**: 1 plan

Plans:
- [x] 08.2-01: Add graduated rotation classes and apply to thumb cluster keys

**Details:**
Applied graduated rotation angles to thumb cluster keys:
- Inner keys (closest to center gap): ±15deg
- Middle keys: ±10deg
- Outer keys: ±5deg

Keys now fan outward from the center gap as shown in keymap-drawer reference.

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Data Layer Refactor | v1.0 | 1/1 | Complete | 2025-12-26 |
| 2. Selection & Sidebar UI | v1.0 | 1/1 | Complete | 2025-12-26 |
| 3. Real-time Editing | v1.0 | 1/1 | Complete | 2025-12-26 |
| 4. Combo Visualization | v1.0 | 1/1 | Complete | 2025-12-26 |
| 5. Persistence & Export | v1.0 | 1/1 | Complete | 2025-12-26 |
| 6. Combo Data Model | v1.1 | 1/1 | Complete | 2025-12-26 |
| 7. Combo Rendering | v1.1 | 1/1 | Complete | 2025-12-26 |
| 8. Combo Editing | v1.1 | 1/1 | Complete | 2025-12-26 |
| 8.1. Combo Badge Polish | v1.1 | 1/1 | Complete | 2025-12-27 |
| 8.2. Fix Thumb Cluster Rotation | v1.1 | 1/1 | Complete | 2025-12-27 |
