# Ergo Keyboard Layout Editor

## Vision

A web-based cheat sheet and editor for ergonomic keyboard users. The app helps users visualize where characters, modifiers, and key combinations are located across multiple keyboard layers - and now lets them customize everything to match their personal keymap.

Users of split ergonomic keyboards (like Corne, Sweep, Ferris) often struggle to remember their custom layouts, especially when learning a new keymap. This app serves as a quick reference they can pull up anytime, and now as a tool to document and share their own configurations.

The key insight: keyboard enthusiasts want zero friction. Click a key, change it, done. Export your config, import it on another machine. No accounts, no server, no complexity.

## Problem

Ergonomic keyboard users create highly personalized keymaps with multiple layers (base, navigation, symbols, system, etc.). These layouts live in firmware config files (ZMK, QMK) that are hard to visualize and even harder to remember.

**Current pain:**
- New users forget where keys are located across layers
- Existing tools are either too complex (firmware configurators) or too limited (static images)
- No easy way to create a personalized visual reference
- Sharing layouts means sharing firmware files, not visual representations

**The gap:** A simple, visual, editable cheat sheet that works offline and exports to portable JSON.

## Success Criteria

How we know this worked:

- [ ] User can click any key and edit its primary/secondary labels instantly via sidebar
- [ ] All combo types display correctly: modifier+key, layer-tap (hold behavior), chords
- [ ] JSON export produces a file user can download and re-import later
- [ ] JSON import restores a previously saved layout completely
- [ ] App works fully offline after initial page load
- [ ] Editing flow feels instant - no lag, no friction, no extra clicks

## Scope

### Building
- Sidebar panel editor (select key, edit in sidebar with all fields visible)
- Editable key labels: primary, secondary, hold modifier
- Visual combo indicators (modifier badges, hold behavior, chord display)
- JSON export (download button, custom app format)
- JSON import (file picker or drag-drop, restores full layout)
- 4 layer support (base, navnum, symbols, system)
- Zoom and navigation (keep existing functionality)
- LocalStorage auto-save (persist edits between sessions)

### Not Building
- ZMK/QMK keymap file import (future version)
- Multiple keyboard layouts (only current 36-key split design)
- Cloud sync or user accounts
- Mobile-optimized editing (view-only is fine on mobile)
- Keyboard layout designer (physical key positions are fixed)

## Context

**Current state:** Working static viewer with 4 layers, zoom controls, and keyboard shortcuts. All layout data hardcoded in JavaScript. Single HTML file (~960 lines) with inline CSS and JS.

**Codebase mapped:** `.planning/codebase/` contains full analysis (stack, architecture, conventions, concerns).

**Key technical notes:**
- Vanilla JS, no build tools, no dependencies
- Layout data stored as `layouts` object with left/right arrays
- Each key has: `primary`, `secondary`, `hold`, `transparent`, `accent`, `highlight`, `rotated`
- DOM rendering via `createKey()` and `renderLayout()` functions

## Constraints

- **Tech stack**: Vanilla JavaScript only - no React, Vue, or frameworks. Keep it simple and dependency-free.
- **Offline**: Must work completely offline after initial load. No external API calls for core functionality.
- **Portability**: JSON format must be self-contained and human-readable for manual editing if needed.

## Decisions Made

Key decisions from project exploration:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Edit UX | Sidebar panel | All fields visible at once, less disruptive than modals |
| Data format | Custom JSON | Simpler than parsing ZMK/QMK, future import can be added |
| Combo types | All three | Modifier+key, layer-tap, chords - users need complete representation |
| Persistence | LocalStorage + export | Offline-first, no server required |
| File structure | Can split files | Open to CSS/JS separation for maintainability |

## Open Questions

Things to figure out during execution:

- [ ] Sidebar position: left side or right side? (probably right, since keyboard is centered)
- [ ] Chord notation: how to visually represent "press A+B together = C"?
- [ ] Key selection: single-click to select, or hover-to-preview + click-to-lock?
- [ ] JSON schema: what structure makes import/export cleanest?

---
*Initialized: 2025-12-26*
