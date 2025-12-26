# Coding Conventions

**Analysis Date:** 2025-12-26

## Naming Patterns

**Files:**
- lowercase for all files: `index.html`, `layout.png`
- dot prefix for configuration: `.env`
- No TypeScript, no module files

**Functions:**
- camelCase for all functions: `createKey()`, `renderLayout()`, `setZoom()`
- Verb-based names: `createKey`, `render`, `set`, `zoom`
- No special prefix for async (none used)

**Variables:**
- camelCase for variables: `currentLayer`, `currentZoom`, `baseHeight`
- UPPER_SNAKE_CASE for constants: `MIN_ZOOM`, `MAX_ZOOM`, `ZOOM_STEP`
- No underscore prefix for private members

**Types:**
- Not applicable (vanilla JavaScript, no TypeScript)

**CSS Classes:**
- kebab-case: `layer-tabs`, `keyboard-container`, `thumb-cluster`
- Descriptive names: `left-half`, `right-half`, `zoom-controls`

**CSS IDs:**
- kebab-case: `zoom-out`, `keyboard-wrapper`, `layer-info`

## Code Style

**Formatting:**
- No automated formatter (Prettier not configured)
- 4-space indentation (consistent throughout)
- Single quotes for HTML attributes
- Double quotes in JavaScript strings
- Semicolons required (consistently used)

**Linting:**
- No linter configured (ESLint not present)
- No automated style enforcement

## Import Organization

**Not applicable** - Single file application with no imports/exports

## Error Handling

**Patterns:**
- No explicit error handling
- DOM operations assume elements exist
- No try/catch blocks anywhere
- Browser console for runtime errors

**Error Types:**
- Not defined (no custom error classes)
- No validation errors thrown
- Silent failures possible

## Logging

**Framework:**
- None (no logging library)
- Browser console available but not used in production code

**Patterns:**
- No structured logging
- No debug statements
- No console.log calls in committed code

## Comments

**When to Comment:**
- Section headers for code organization
- Brief, descriptive comments before major blocks
- Example: `// Keyboard layout data`, `// Zoom functions`

**JSDoc/TSDoc:**
- Not used (no TypeScript, no documented APIs)

**TODO Comments:**
- None detected in codebase

**Comment Locations in `index.html`:**
- Line 455: `// Keyboard layout data`
- Line 731: `// Zoom functions`
- Line 832: Section marker for layout rendering
- Line 897: Section marker for tab switching
- Line 907: Section marker for keyboard shortcuts

## Function Design

**Size:**
- Most functions 10-30 lines
- `renderLayout()` is largest at 64 lines (could be refactored)

**Parameters:**
- Simple parameters: `createKey(keyData, index)`, `renderLayout(layer)`, `setZoom(level)`
- No options objects used
- No destructuring in parameters

**Return Values:**
- DOM elements from factory functions (`createKey` returns HTMLElement)
- No return values from state management functions (side effects only)
- No explicit returns needed for void functions

## Module Design

**Not applicable** - Single file, global scope

**Namespace:**
- All code in global scope (window object)
- No module pattern or IIFE used
- Constants and functions accessible globally

## DOM Patterns

**Element Creation:**
- `document.createElement()` for dynamic elements
- `appendChild()` for DOM insertion
- `innerHTML` for simple content updates

**Element Selection:**
- `document.getElementById()` for specific elements
- `document.querySelector()` for CSS selectors
- `document.querySelectorAll()` for collections

**Event Handling:**
- Inline arrow functions: `btn.addEventListener('click', () => {})`
- Keyboard events on document level
- Mouse wheel with Ctrl modifier support

---

*Convention analysis: 2025-12-26*
*Update when patterns change*
