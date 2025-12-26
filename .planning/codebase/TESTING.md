# Testing Patterns

**Analysis Date:** 2025-12-26

## Test Framework

**Runner:**
- Not detected - No test framework installed

**Assertion Library:**
- Not detected

**Run Commands:**
```bash
# No test commands available
# Manual browser testing only
```

## Test File Organization

**Location:**
- No test files present

**Naming:**
- Not applicable

**Structure:**
```
No test infrastructure exists
```

## Test Structure

**Suite Organization:**
- Not applicable (no tests)

**Patterns:**
- Manual visual testing only
- No automated test suite

## Mocking

**Framework:**
- Not applicable

**Patterns:**
- Not applicable

**What to Mock (if tests added):**
- DOM APIs
- Event handlers
- Browser viewport size

**What NOT to Mock:**
- Layout data (test with real data)
- CSS rendering

## Fixtures and Factories

**Test Data:**
- Not applicable
- Layout data in `index.html` could serve as test fixtures if tests added

**Location:**
- Not applicable

## Coverage

**Requirements:**
- No coverage requirements
- 0% current coverage (no tests)

**Configuration:**
- Not configured

**View Coverage:**
```bash
# Not available
```

## Test Types

**Unit Tests:**
- Not present
- Could test: `createKey()`, `setZoom()`, zoom calculations

**Integration Tests:**
- Not present
- Could test: Layer switching, zoom controls, keyboard shortcuts

**E2E Tests:**
- Not present
- Could test: Full user flows (select layer, zoom, navigate)

**Manual Testing Checklist:**
- [ ] Layer tabs switch correctly (base, navnum, symbols, system)
- [ ] Keyboard shortcuts work (1-4 for layers)
- [ ] Zoom in/out buttons work
- [ ] Zoom slider works
- [ ] Keyboard zoom shortcuts work (+, -, 0)
- [ ] Ctrl+scroll wheel zooms
- [ ] Keys display correctly (primary, secondary, hold labels)
- [ ] Accent keys highlighted in red
- [ ] Transparent keys invisible
- [ ] Thumb cluster rotations correct
- [ ] Responsive layout at different zoom levels

## Common Patterns

**If Adding Tests:**

**Async Testing:**
```javascript
// Not needed - no async operations in current codebase
```

**DOM Testing:**
```javascript
// Example with Jest/Vitest (not currently implemented)
it('should create key element', () => {
  const keyData = { primary: 'A', secondary: 'a' };
  const key = createKey(keyData, 0);
  expect(key.classList.contains('key')).toBe(true);
});
```

**Event Testing:**
```javascript
// Example (not implemented)
it('should switch layer on tab click', () => {
  const tab = document.querySelector('[data-layer="navnum"]');
  tab.click();
  expect(currentLayer).toBe('navnum');
});
```

**Snapshot Testing:**
- Not applicable (no React/Vue components)

## Recommended Test Setup (Future)

If tests are added, recommend:

**Framework:** Vitest or Jest
**DOM:** jsdom or happy-dom
**Structure:** Co-located test files (`index.test.js`)

**Minimal Setup:**
```bash
npm init -y
npm install -D vitest jsdom
```

```javascript
// vitest.config.js
export default {
  test: {
    environment: 'jsdom'
  }
}
```

---

*Testing analysis: 2025-12-26*
*Update when test patterns change*
