# Ergo Keyboard Layout Editor

## Current State (Updated: 2025-12-27)

**Shipped:** v1.1 Enhanced Combo Visualization (2025-12-27)
**Status:** Complete - functional offline web app with combo editing
**Codebase:** 2,876 LOC (JavaScript/CSS/JSON/HTML), vanilla JS, no dependencies

**What shipped (v1.1):**
- Layer-level combo system with visual badges
- Floating badges between adjacent combo keys
- Color-matched badges for non-adjacent combos
- Combo creation mode (click two keys, enter output)
- Sidebar combo list with delete functionality
- Luminance-based text contrast for badge readability
- Corrected thumb cluster rotation mirroring left/right sides

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

## Success Criteria (v1.0)

- [x] User can click any key and edit its primary/secondary labels instantly via sidebar
- [x] All combo types display correctly: modifier+key, layer-tap (hold behavior), chords
- [x] JSON export produces a file user can download and re-import later
- [x] JSON import restores a previously saved layout completely
- [x] App works fully offline after initial page load
- [x] Editing flow feels instant - no lag, no friction, no extra clicks

## Constraints

- **Tech stack**: Vanilla JavaScript only - no React, Vue, or frameworks. Keep it simple and dependency-free.
- **Offline**: Must work completely offline after initial load. No external API calls for core functionality.
- **Portability**: JSON format must be self-contained and human-readable for manual editing if needed.

## Decisions Made

Key decisions from v1.0 development:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Edit UX | Sidebar panel | All fields visible at once, less disruptive than modals |
| Data format | Custom JSON | Simpler than parsing ZMK/QMK, future import can be added |
| Combo types | All three | Modifier+key, layer-tap, chords - users need complete representation |
| Persistence | LocalStorage + export | Offline-first, no server required |
| File structure | Split files | CSS/JS/JSON separation for maintainability |

---

*v1.0 MVP shipped: 2025-12-26*
*See .planning/MILESTONES.md for full history*
