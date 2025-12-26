# Codebase Concerns

**Analysis Date:** 2025-12-26

## Tech Debt

**Single-file architecture:**
- Issue: All 960 lines of code in one HTML file
- Files: `index.html`
- Why: Quick prototype/MVP approach
- Impact: Harder to maintain, test, and extend
- Fix approach: Extract CSS to `styles.css`, JavaScript to `app.js`, layout data to `layouts.json`

**Repeated DOM queries:**
- Issue: `querySelectorAll('.layer-tab')` called multiple times
- Files: `index.html` lines 898, 913
- Why: Not optimized during development
- Impact: Minor performance overhead on each interaction
- Fix approach: Cache DOM queries at initialization

**Code duplication in rendering:**
- Issue: Left and right half rendering use nearly identical patterns
- Files: `index.html` lines 845-862 (left) and 865-882 (right)
- Why: Copy-paste during development
- Impact: Changes require updates in multiple places
- Fix approach: Extract to generic `renderHalf(layout, halfId, side)` function

## Known Bugs

**None detected** - Application appears functional

## Security Considerations

**CRITICAL: Exposed GitHub credentials:**
- Risk: Personal Access Token in `.env` with no `.gitignore`
- Files: `.env`
- Current mitigation: None
- Recommendations:
  - Immediately revoke token at https://github.com/settings/tokens
  - Add `.env` to `.gitignore`
  - Create `.env.example` with placeholder values
  - Never commit real credentials

**innerHTML usage:**
- Risk: Potential XSS if layout data ever comes from external source
- Files: `index.html` lines 841-842, 886-889
- Current mitigation: Data is hardcoded (low risk currently)
- Recommendations:
  - Use `textContent` for plain text
  - Use DOM methods like `createElement()` for HTML
  - Add sanitization if external data introduced

## Performance Bottlenecks

**None significant** - Application is lightweight

**Minor optimization opportunities:**
- Multiple `querySelectorAll()` calls could be cached
- Full DOM clear and rebuild on layer switch (acceptable for this scale)

## Fragile Areas

**DOM element assumptions:**
- Files: `index.html` lines 737-742, 834-835, 885, 914
- Why fragile: `getElementById()` and `querySelector()` calls assume elements exist
- Common failures: TypeError if element missing
- Safe modification: Add null checks before accessing properties
- Test coverage: None

**Magic numbers in layout slicing:**
- Files: `index.html` lines 845, 852, 865, 872
- Why fragile: `slice(0, 18)` and `slice(18)` assume exact key count
- Common failures: Wrong keys displayed if layout structure changes
- Safe modification: Define constants `GRID_KEYS = 18`, `THUMB_KEYS = 6`
- Test coverage: None

## Scaling Limits

**Not applicable** - Static client-side application with no server resources

**Browser performance:**
- Current capacity: Handles 4 layers × 48 keys efficiently
- Limit: Would slow with hundreds of keyboard variants
- Symptoms at limit: Sluggish DOM updates
- Scaling path: Virtual scrolling, lazy rendering (not needed at current scale)

## Dependencies at Risk

**None** - Zero external dependencies

**Browser API reliance:**
- ES6 features used (arrow functions, template literals, const/let)
- Modern browser required (IE11 not supported)
- No polyfills

## Missing Critical Features

**No persistent state:**
- Problem: Selected layer and zoom reset on page reload
- Current workaround: User re-selects preferences
- Blocks: User preference memory
- Implementation complexity: Low (localStorage)

**No export/print functionality:**
- Problem: Can't save layout as image or PDF
- Current workaround: Browser screenshot
- Blocks: Sharing layouts
- Implementation complexity: Medium (html2canvas or similar)

## Test Coverage Gaps

**Complete absence of automated tests:**
- What's not tested: Everything (100% gap)
- Risk: Regressions undetected during changes
- Priority: Medium (stable, simple application)
- Difficulty to test: Low (pure functions, DOM manipulation)

**Recommended priority test areas:**
1. `createKey()` - Key element generation
2. `renderLayout()` - Layout rendering
3. `setZoom()` - Zoom state management
4. Layer switching logic
5. Keyboard shortcut handlers

## Documentation Gaps

**No README.md:**
- Problem: No usage instructions, no setup guide
- Impact: New contributors lost
- Recommendation: Add basic README with purpose, usage, development notes

**No code comments explaining "why":**
- Problem: Comments mark sections but don't explain decisions
- Impact: Future maintainers may not understand design choices
- Recommendation: Add comments explaining layout data structure, zoom calculations

---

*Concerns audit: 2025-12-26*
*Update as issues are fixed or new ones discovered*
