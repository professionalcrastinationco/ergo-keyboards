/**
 * ZMK Keyboard Layout Editor
 * Main application logic
 */

// Application state
let layouts = null;
let originalLayouts = null; // Deep copy of original layouts for reset functionality
let currentLayer = 'base';
let currentZoom = 100;
let selectedKey = null; // {layer, side, index}
let lastKeyState = null; // Single-level undo state
const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const ZOOM_STEP = 10;

// Combo color palette (23 Tailwind colors for non-adjacent combo badges)
const COMBO_COLORS = [
    // 700 shades
    '#c2410c', // orange-700
    '#a16207', // yellow-700
    '#15803d', // green-700
    '#0f766e', // teal-700
    '#0369a1', // sky-700
    '#4338ca', // indigo-700
    '#7e22ce', // purple-700
    '#be185d', // pink-700
    // 500 shades
    '#f59e0b', // amber-500
    '#84cc16', // lime-500
    '#10b981', // emerald-500
    '#06b6d4', // cyan-500
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#d946ef', // fuchsia-500
    // 300 shades
    '#fdba74', // orange-300
    '#fde047', // yellow-300
    '#86efac', // green-300
    '#5eead4', // teal-300
    '#7dd3fc', // sky-300
    '#a5b4fc', // indigo-300
    '#d8b4fe', // purple-300
    '#f9a8d4', // pink-300
];

/**
 * Get the grid position of a key from its index
 * @param {string} side - 'left' or 'right'
 * @param {number} index - Key index (0-23)
 * @returns {Object} {row, col, inThumb}
 */
function getKeyPosition(side, index) {
    if (index < 18) {
        return { row: Math.floor(index / 6), col: index % 6, inThumb: false };
    }
    return { row: 3, col: index - 18, inThumb: true };
}

/**
 * Check if two keys are adjacent (same side, orthogonal neighbors)
 * @param {Object} key1 - {side, index}
 * @param {Object} key2 - {side, index}
 * @returns {boolean}
 */
function areKeysAdjacent(key1, key2) {
    // Must be same side
    if (key1.side !== key2.side) return false;

    const pos1 = getKeyPosition(key1.side, key1.index);
    const pos2 = getKeyPosition(key2.side, key2.index);

    // Both in main grid
    if (!pos1.inThumb && !pos2.inThumb) {
        const colDiff = Math.abs(pos1.col - pos2.col);
        const rowDiff = Math.abs(pos1.row - pos2.row);
        // Adjacent if orthogonal (not diagonal)
        return (colDiff === 1 && rowDiff === 0) || (colDiff === 0 && rowDiff === 1);
    }

    // Both in thumb cluster - adjacent if sequential
    if (pos1.inThumb && pos2.inThumb) {
        return Math.abs(key1.index - key2.index) === 1;
    }

    // Main grid to thumb cluster boundary (index 17 → 18)
    if ((key1.index === 17 && key2.index === 18) ||
        (key1.index === 18 && key2.index === 17)) {
        return true;
    }

    return false;
}

// LocalStorage persistence
const STORAGE_KEY = 'keyboardEditor_layouts';

// Default layouts (embedded for offline use)
const DEFAULT_LAYOUTS = {
    base: {
        left: [
            { primary: "TAB" },
            { primary: "Q" },
            { primary: "W", hold: "@" },
            { primary: "E", hold: "#" },
            { primary: "R", hold: "$" },
            { primary: "T", hold: "%" },
            { primary: "LSHFT" },
            { primary: "A" },
            { primary: "S", hold: "\\" },
            { primary: "D", secondary: "ESCAPE", hold: "=" },
            { primary: "F", secondary: "PASTE", hold: "=" },
            { primary: "G", secondary: "COPY" },
            { primary: "LCTRL" },
            { primary: "Z" },
            { primary: "X" },
            { primary: "V" },
            { primary: "B" },
            { primary: "", transparent: true },
            { primary: "", transparent: true },
            { primary: "", transparent: true },
            { primary: "", transparent: true },
            { primary: "LGUI" },
            { primary: "NavNum", secondary: "" },
            { primary: "SPACE" }
        ],
        right: [
            { primary: "Y" },
            { primary: "U", hold: "+" },
            { primary: "I", hold: "*" },
            { primary: "O", hold: "{" },
            { primary: "P" },
            { primary: "BACKSPACE" },
            { primary: "H" },
            { primary: "J", hold: "{", secondary: "KP" },
            { primary: "K", hold: "/" },
            { primary: "L", hold: "}" },
            { primary: ";" },
            { primary: "'" },
            { primary: "N" },
            { primary: "M", secondary: "MINUS", hold: "[" },
            { primary: ",", hold: "]" },
            { primary: "." },
            { primary: "/" },
            { primary: "RSHFT" },
            { primary: "", transparent: true },
            { primary: "RET" },
            { primary: "TAB", secondary: "Symbols" },
            { primary: "RIGHT", secondary: "ALT" },
            { primary: "", transparent: true },
            { primary: "", transparent: true }
        ],
        info: {
            title: "Base Layer",
            description: "Primary typing layer with QWERTY layout. Hold keys show modifier and layer access functions."
        },
        combos: []
    },
    navnum: {
        left: [
            { primary: "", hold: "\\" },
            { primary: "1" },
            { primary: "2", hold: "@" },
            { primary: "3", hold: "#" },
            { primary: "4", hold: "$" },
            { primary: "5", hold: "%" },
            { primary: "&caps_wo", secondary: "" },
            { primary: "", hold: "\\" },
            { primary: "UP", secondary: "ARROW", hold: "=" },
            { primary: "", secondary: "browser", hold: "=" },
            { primary: "PAGE", secondary: "UP" },
            { primary: "" },
            { primary: "" },
            { primary: "LEFT", secondary: "PASTE", hold: "=" },
            { primary: "", secondary: "ESCAPE", hold: "=" },
            { primary: "RIGHT", secondary: "COPY", hold: "=" },
            { primary: "PAGE", secondary: "DOWN" },
            { primary: "", transparent: true },
            { primary: "", transparent: true },
            { primary: "", transparent: true },
            { primary: "", transparent: true },
            { primary: "LGUI" },
            { primary: "", accent: true },
            { primary: "SPACE" }
        ],
        right: [
            { primary: "6" },
            { primary: "7", hold: "+" },
            { primary: "8", hold: "*" },
            { primary: "9", hold: "{" },
            { primary: "0" },
            { primary: "" },
            { primary: "0" },
            { primary: "4", hold: "{", secondary: "" },
            { primary: "5", hold: "/" },
            { primary: "6", hold: "}" },
            { primary: "" },
            { primary: "" },
            { primary: "", secondary: "KP MINUS", hold: "[" },
            { primary: "1", hold: "[" },
            { primary: "2", hold: "]" },
            { primary: "3", hold: "]" },
            { primary: "" },
            { primary: "" },
            { primary: "", transparent: true },
            { primary: "RET" },
            { primary: "" },
            { primary: "" },
            { primary: "", transparent: true },
            { primary: "", transparent: true }
        ],
        info: {
            title: "NavNum Layer",
            description: "Navigation and number pad layer. Arrow keys on the left, numpad on the right."
        },
        combos: []
    },
    symbols: {
        left: [
            { primary: "" },
            { primary: "!" },
            { primary: "@", hold: "@" },
            { primary: "#", hold: "#" },
            { primary: "$", hold: "$" },
            { primary: "%", hold: "%" },
            { primary: "" },
            { primary: "" },
            { primary: "UP", secondary: "ARROW", hold: "=" },
            { primary: "", secondary: "ESCAPE", hold: "=" },
            { primary: "", secondary: "PASTE", hold: "=" },
            { primary: "~" },
            { primary: "" },
            { primary: "LEFT", secondary: "ARROW", hold: "\\" },
            { primary: "", hold: "=" },
            { primary: "RIGHT", secondary: "ARROW", hold: "=" },
            { primary: "-" },
            { primary: "", transparent: true },
            { primary: "", transparent: true },
            { primary: "", transparent: true },
            { primary: "", transparent: true },
            { primary: "LGUI" },
            { primary: "" },
            { primary: "SPACE" }
        ],
        right: [
            { primary: "^" },
            { primary: "&", hold: "+" },
            { primary: "*", hold: "*" },
            { primary: "(", hold: "{" },
            { primary: ")" },
            { primary: "" },
            { primary: "-" },
            { primary: "{", hold: "[" },
            { primary: "}", hold: "/" },
            { primary: "]", hold: "}" },
            { primary: "" },
            { primary: "\\" },
            { primary: "+", secondary: "KP MINUS", hold: "[" },
            { primary: "{", hold: "]" },
            { primary: "}", hold: "]" },
            { primary: "}" },
            { primary: "|" },
            { primary: "" },
            { primary: "", transparent: true },
            { primary: "RET" },
            { primary: "", accent: true },
            { primary: "" },
            { primary: "", transparent: true },
            { primary: "", transparent: true }
        ],
        info: {
            title: "Symbols Layer",
            description: "Symbol layer for programming and special characters. Quick access to brackets, operators, and punctuation."
        },
        combos: []
    },
    system: {
        left: [
            { primary: "" },
            { primary: "F1" },
            { primary: "F2", hold: "@" },
            { primary: "F3", hold: "#" },
            { primary: "F4", hold: "$" },
            { primary: "F5", hold: "%" },
            { primary: "" },
            { primary: "F12" },
            { primary: "F11", hold: "\\" },
            { primary: "", secondary: "ESCAPE", hold: "=" },
            { primary: "", secondary: "PASTE", hold: "=" },
            { primary: "", highlight: true },
            { primary: "" },
            { primary: "BT", secondary: "0" },
            { primary: "BT", secondary: "1" },
            { primary: "BT", secondary: "2", hold: "=" },
            { primary: "BT CLR" },
            { primary: "BT CLR", secondary: "ALL", highlight: true },
            { primary: "", transparent: true },
            { primary: "", transparent: true },
            { primary: "", transparent: true },
            { primary: "" },
            { primary: "", accent: true },
            { primary: "", accent: true }
        ],
        right: [
            { primary: "F6" },
            { primary: "F7", hold: "+" },
            { primary: "F8", hold: "*" },
            { primary: "F9", hold: "{" },
            { primary: "F10" },
            { primary: "" },
            { primary: "" },
            { primary: "", hold: "{" },
            { primary: "", hold: "/" },
            { primary: "", hold: "}" },
            { primary: "" },
            { primary: "" },
            { primary: "", secondary: "KP MINUS", hold: "-" },
            { primary: "", hold: "[" },
            { primary: "", hold: "]" },
            { primary: "" },
            { primary: "&bootload", secondary: "" },
            { primary: "" },
            { primary: "", transparent: true },
            { primary: "" },
            { primary: "", accent: true },
            { primary: "", accent: true },
            { primary: "", transparent: true },
            { primary: "", transparent: true }
        ],
        info: {
            title: "System Layer",
            description: "System functions including F-keys, Bluetooth profiles (BT 0-2), and bootloader access. ZMK Studio Unlock available."
        },
        combos: []
    }
};

// Zoom state
let baseHeight = null;
let baseWidth = null;

/**
 * Save current layouts to LocalStorage
 */
function saveToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
        updateSaveIndicator(true);
    } catch (error) {
        console.warn('Failed to save to LocalStorage:', error);
    }
}

/**
 * Load layouts from LocalStorage if available
 * @returns {Object|null} Saved layouts or null
 */
function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (error) {
        console.warn('Failed to load from LocalStorage:', error);
    }
    return null;
}

/**
 * Update save indicator in UI
 * @param {boolean} hasSaved - Whether there's saved data
 */
function updateSaveIndicator(hasSaved) {
    const indicator = document.getElementById('save-indicator');
    if (indicator) {
        indicator.textContent = hasSaved ? 'Saved' : 'Default';
        indicator.className = 'save-indicator ' + (hasSaved ? 'saved' : 'default');
    }
}

/**
 * Load layouts from LocalStorage or use embedded defaults
 */
function loadLayouts() {
    // Store original defaults for reset functionality
    originalLayouts = JSON.parse(JSON.stringify(DEFAULT_LAYOUTS));

    // Try LocalStorage first
    const savedLayouts = loadFromLocalStorage();
    if (savedLayouts) {
        layouts = savedLayouts;
        // Ensure combos array exists on each layer (backward compatibility)
        for (const layer of ['base', 'navnum', 'symbols', 'system']) {
            if (!layouts[layer].combos) {
                layouts[layer].combos = [];
            }
        }
        updateSaveIndicator(true);
        return;
    }

    // Use embedded defaults
    layouts = JSON.parse(JSON.stringify(DEFAULT_LAYOUTS));
    updateSaveIndicator(false);
}

/**
 * Set zoom level
 * @param {number} level - Zoom level (50-200)
 */
function setZoom(level) {
    currentZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, level));
    const container = document.getElementById('keyboard-container');
    const wrapper = document.getElementById('keyboard-wrapper');
    const zoomLevelEl = document.getElementById('zoom-level');
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');

    // Store base dimensions on first call
    if (baseHeight === null || baseWidth === null) {
        baseHeight = container.offsetHeight;
        baseWidth = container.offsetWidth;
    }

    // Apply zoom transform
    container.style.transform = `scale(${currentZoom / 100})`;

    // Adjust wrapper dimensions to accommodate scaled content
    const scaledHeight = baseHeight * (currentZoom / 100);
    const scaledWidth = baseWidth * (currentZoom / 100);
    wrapper.style.minHeight = `${Math.max(400, scaledHeight + 40)}px`;
    wrapper.style.minWidth = `${scaledWidth + 40}px`;

    zoomLevelEl.textContent = `${currentZoom}%`;
    zoomSlider.value = currentZoom;

    // Update button states
    zoomInBtn.disabled = currentZoom >= MAX_ZOOM;
    zoomOutBtn.disabled = currentZoom <= MIN_ZOOM;
}

function zoomIn() {
    setZoom(currentZoom + ZOOM_STEP);
}

function zoomOut() {
    setZoom(currentZoom - ZOOM_STEP);
}

function resetZoom() {
    setZoom(100);
}

/**
 * Create a key element from key data
 * @param {Object} keyData - Key configuration object
 * @param {number} index - Key index in the layout array
 * @param {string} layer - Layer name (base, navnum, symbols, system)
 * @param {string} side - Side of keyboard ('left' or 'right')
 * @returns {HTMLElement} The key DOM element
 */
function createKey(keyData, index, layer, side) {
    const key = document.createElement('div');
    key.className = 'key';

    // Add data attributes for single-key updates
    key.dataset.layer = layer;
    key.dataset.side = side;
    key.dataset.index = index;

    if (keyData.transparent) {
        key.classList.add('transparent');
        return key;
    }

    if (keyData.accent) {
        key.classList.add('accent');
    }

    if (keyData.highlight) {
        key.classList.add('highlight');
    }

    // Build key content
    rebuildKeyContent(key, keyData);

    // Add click feedback
    key.addEventListener('mousedown', () => {
        key.classList.add('pressed');
    });
    key.addEventListener('mouseup', () => {
        key.classList.remove('pressed');
    });
    key.addEventListener('mouseleave', () => {
        key.classList.remove('pressed');
    });

    // Add click handler for selection
    key.addEventListener('click', () => {
        if (keyData.transparent) return; // Can't select transparent keys
        selectKey(layer, side, index);
    });

    return key;
}

/**
 * Rebuild the inner content of a key element
 * Used for both initial creation and updates
 * @param {HTMLElement} keyEl - The key DOM element
 * @param {Object} keyData - Key configuration object
 */
function rebuildKeyContent(keyEl, keyData) {
    // Clear existing content (but preserve event listeners)
    keyEl.innerHTML = '';

    // Modifier combo badge (top-right)
    if (keyData.modifierKey) {
        const badge = document.createElement('div');
        badge.className = 'combo-badge';
        badge.textContent = keyData.modifierKey;
        keyEl.appendChild(badge);
    }

    // Layer-tap: explicit tap + hold rendering
    if (keyData.tap && keyData.hold) {
        const wrapper = document.createElement('div');
        wrapper.className = 'layer-tap-wrapper';

        const tapLabel = document.createElement('div');
        tapLabel.className = 'tap-label';
        tapLabel.textContent = keyData.tap;
        wrapper.appendChild(tapLabel);

        const holdLabel = document.createElement('div');
        holdLabel.className = 'hold-label';
        holdLabel.textContent = keyData.hold;
        wrapper.appendChild(holdLabel);

        keyEl.appendChild(wrapper);
    } else {
        // Standard rendering (existing logic)
        // Primary label
        const primary = document.createElement('div');
        primary.className = 'primary';
        primary.textContent = keyData.primary || '';
        keyEl.appendChild(primary);

        // Secondary label
        if (keyData.secondary) {
            const secondary = document.createElement('div');
            secondary.className = 'secondary';
            secondary.textContent = keyData.secondary;
            keyEl.appendChild(secondary);
        }

        // Hold indicator
        if (keyData.hold) {
            const hold = document.createElement('div');
            hold.className = 'hold-indicator';
            hold.textContent = keyData.hold;
            keyEl.appendChild(hold);
        }
    }

    // Chord notation (bottom)
    if (keyData.chord && keyData.chord.keys && keyData.chord.output) {
        const chord = document.createElement('div');
        chord.className = 'chord-notation';
        chord.innerHTML = keyData.chord.keys.join('+') +
            '<span class="chord-arrow">→</span>' +
            keyData.chord.output;
        keyEl.appendChild(chord);
    }
}

/**
 * Get a key element by its position
 * @param {string} layer - Layer name
 * @param {string} side - 'left' or 'right'
 * @param {number} index - Key index
 * @returns {HTMLElement|null} The key element or null
 */
function getKeyElement(layer, side, index) {
    return document.querySelector(
        `.key[data-layer="${layer}"][data-side="${side}"][data-index="${index}"]`
    );
}

/**
 * Update a single key without re-rendering the entire layout
 * @param {string} layer - Layer name
 * @param {string} side - 'left' or 'right'
 * @param {number} index - Key index
 */
function updateKey(layer, side, index) {
    const keyEl = getKeyElement(layer, side, index);
    if (!keyEl) {
        console.warn(`Key not found: ${layer}/${side}/${index}`);
        return;
    }

    const keyData = layouts[layer][side][index];
    if (!keyData) {
        console.warn(`Key data not found: ${layer}/${side}/${index}`);
        return;
    }

    // Update classes
    keyEl.className = 'key';
    keyEl.dataset.layer = layer;
    keyEl.dataset.side = side;
    keyEl.dataset.index = index;

    if (keyData.transparent) {
        keyEl.classList.add('transparent');
        keyEl.innerHTML = '';
        return;
    }

    if (keyData.accent) {
        keyEl.classList.add('accent');
    }

    if (keyData.highlight) {
        keyEl.classList.add('highlight');
    }

    // Rebuild content
    rebuildKeyContent(keyEl, keyData);
}

/**
 * Select a key for editing
 * @param {string} layer - Layer name
 * @param {string} side - 'left' or 'right'
 * @param {number} index - Key index
 */
function selectKey(layer, side, index) {
    // Deselect previous
    if (selectedKey) {
        const prevEl = getKeyElement(selectedKey.layer, selectedKey.side, selectedKey.index);
        if (prevEl) prevEl.classList.remove('selected');
    }

    // Select new
    selectedKey = { layer, side, index };
    const newEl = getKeyElement(layer, side, index);
    if (newEl) newEl.classList.add('selected');

    // Update sidebar
    updateSidebar();
}

/**
 * Deselect the currently selected key
 */
function deselectKey() {
    if (selectedKey) {
        const el = getKeyElement(selectedKey.layer, selectedKey.side, selectedKey.index);
        if (el) el.classList.remove('selected');
        selectedKey = null;
        updateSidebar();
    }
}

/**
 * Update the sidebar to reflect current selection
 */
function updateSidebar() {
    const noSelection = document.getElementById('no-selection');
    const keyFields = document.getElementById('key-fields');
    const position = document.getElementById('selected-position');

    if (!selectedKey) {
        noSelection.style.display = 'block';
        keyFields.style.display = 'none';
        position.textContent = 'No key selected';
        return;
    }

    noSelection.style.display = 'none';
    keyFields.style.display = 'block';

    const { layer, side, index } = selectedKey;
    const keyData = layouts[layer][side][index];

    // Update position indicator
    position.textContent = `${layer} / ${side} / ${index}`;

    // Populate fields
    document.getElementById('field-primary').value = keyData.primary || '';
    document.getElementById('field-secondary').value = keyData.secondary || '';
    document.getElementById('field-hold').value = keyData.hold || '';
    document.getElementById('field-accent').checked = keyData.accent || false;
    document.getElementById('field-highlight').checked = keyData.highlight || false;

    // Populate combo fields
    document.getElementById('field-tap').value = keyData.tap || '';
    document.getElementById('field-modifier-key').value = keyData.modifierKey || '';
    document.getElementById('field-chord-keys').value =
        keyData.chord ? keyData.chord.keys.join('+') : '';
    document.getElementById('field-chord-output').value =
        keyData.chord ? keyData.chord.output : '';
}

/**
 * Save current key state for undo (single-level)
 */
function saveUndoState() {
    if (!selectedKey) return;
    const { layer, side, index } = selectedKey;
    lastKeyState = {
        layer, side, index,
        data: JSON.parse(JSON.stringify(layouts[layer][side][index]))
    };
    updateUndoButton();
}

/**
 * Undo the last change
 */
function undo() {
    if (!lastKeyState) return;
    const { layer, side, index, data } = lastKeyState;
    layouts[layer][side][index] = data;
    updateKey(layer, side, index);

    // If this key is still selected, update sidebar
    if (selectedKey && selectedKey.layer === layer &&
        selectedKey.side === side && selectedKey.index === index) {
        getKeyElement(layer, side, index).classList.add('selected');
        updateSidebar();
    }

    lastKeyState = null;
    updateUndoButton();
}

/**
 * Update undo button disabled state
 */
function updateUndoButton() {
    const btn = document.getElementById('btn-undo');
    if (btn) {
        btn.disabled = !lastKeyState;
    }
}

/**
 * Clear the selected key (set all properties to empty/false)
 */
function clearSelectedKey() {
    if (!selectedKey) return;
    saveUndoState();
    const { layer, side, index } = selectedKey;
    layouts[layer][side][index] = {
        primary: '',
        secondary: '',
        hold: '',
        tap: '',
        modifierKey: '',
        chord: null,
        accent: false,
        highlight: false
    };
    updateKey(layer, side, index);
    getKeyElement(layer, side, index).classList.add('selected');
    updateSidebar();
    saveToLocalStorage();
}

/**
 * Reset the selected key to its original loaded values
 */
function resetSelectedKey() {
    if (!selectedKey) return;
    if (!originalLayouts) return;
    saveUndoState();
    const { layer, side, index } = selectedKey;
    layouts[layer][side][index] = JSON.parse(
        JSON.stringify(originalLayouts[layer][side][index])
    );
    updateKey(layer, side, index);
    getKeyElement(layer, side, index).classList.add('selected');
    updateSidebar();
    saveToLocalStorage();
}

/**
 * Export current layouts as JSON file download
 */
function exportLayouts() {
    // Rebuild full JSON with schema
    const exportData = {
        _schema: {
            description: "ZMK Keyboard Layout Editor - Layout Data Schema",
            version: "1.0.0",
            keyProperties: {
                primary: "Main key label (string, required)",
                secondary: "Secondary label below primary (string, optional)",
                hold: "Hold modifier indicator (string, optional)",
                transparent: "Invisible/placeholder key (boolean, optional)",
                accent: "Special key styling (boolean, optional)",
                highlight: "Highlighted key with border (boolean, optional)",
                tap: "Tap behavior label for layer-tap keys (string, optional)",
                modifierKey: "Modifier+key combo display (string, optional)",
                chord: "Chord definition {keys: [...], output: '...'} (object, optional)"
            },
            layerStructure: {
                left: "Array of 24 keys for left half (18 main + 6 thumb area)",
                right: "Array of 24 keys for right half (18 main + 6 thumb area)",
                info: "Layer metadata with title and description",
                combos: "Array of combo definitions [{keys: [{side, index}, {side, index}], output: string}]"
            }
        },
        ...layouts
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `keyboard-layout-${timestamp}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Validate imported layout data structure
 * @param {Object} data - Parsed JSON data
 * @returns {Object} {valid: boolean, error: string|null}
 */
function validateLayoutData(data) {
    const requiredLayers = ['base', 'navnum', 'symbols', 'system'];

    for (const layer of requiredLayers) {
        if (!data[layer]) {
            return { valid: false, error: `Missing required layer: ${layer}` };
        }
        if (!data[layer].left || !Array.isArray(data[layer].left)) {
            return { valid: false, error: `Layer ${layer} missing 'left' array` };
        }
        if (!data[layer].right || !Array.isArray(data[layer].right)) {
            return { valid: false, error: `Layer ${layer} missing 'right' array` };
        }
        if (data[layer].left.length !== 24 || data[layer].right.length !== 24) {
            return { valid: false, error: `Layer ${layer} must have 24 keys per side` };
        }
        if (!data[layer].info || !data[layer].info.title) {
            return { valid: false, error: `Layer ${layer} missing info.title` };
        }
        // Combos is optional, but if present must be an array
        if (data[layer].combos !== undefined && !Array.isArray(data[layer].combos)) {
            return { valid: false, error: `Layer ${layer} combos must be an array` };
        }
    }

    return { valid: true, error: null };
}

/**
 * Import layouts from file
 * @param {File} file - JSON file to import
 */
async function importLayouts(file) {
    try {
        const text = await file.text();
        const data = JSON.parse(text);

        // Remove schema if present
        const { _schema, ...layerData } = data;

        // Validate structure
        const validation = validateLayoutData(layerData);
        if (!validation.valid) {
            showNotification(validation.error, 'error');
            return;
        }

        // Apply imported data
        layouts = layerData;

        // Ensure combos array exists on each layer (backward compatibility)
        for (const layer of ['base', 'navnum', 'symbols', 'system']) {
            if (!layouts[layer].combos) {
                layouts[layer].combos = [];
            }
        }

        saveToLocalStorage();
        renderLayout(currentLayer);
        deselectKey();

        showNotification('Layout imported successfully', 'success');
    } catch (error) {
        showNotification('Invalid JSON file: ' + error.message, 'error');
    }
}

/**
 * Show notification message
 * @param {string} message - Message to display
 * @param {string} type - 'success' or 'error'
 */
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Reset layouts to original default state
 */
function resetToDefault() {
    if (!confirm('Reset all layouts to default? This will discard all your changes.')) {
        return;
    }

    // Clear LocalStorage
    localStorage.removeItem(STORAGE_KEY);

    // Restore from original
    layouts = JSON.parse(JSON.stringify(originalLayouts));

    // Re-render
    renderLayout(currentLayer);
    deselectKey();
    updateSaveIndicator(false);

    showNotification('Reset to default layout', 'success');
}

/**
 * Render a complete keyboard layout
 * @param {string} layer - Layer name to render
 */
function renderLayout(layer) {
    // Clear selection when changing layers
    deselectKey();

    const layout = layouts[layer];
    const leftHalf = document.getElementById('left-half');
    const rightHalf = document.getElementById('right-half');

    // Reset base dimensions when layout changes
    baseHeight = null;
    baseWidth = null;

    leftHalf.innerHTML = '';
    rightHalf.innerHTML = '';

    // Render left half (first 18 keys in grid)
    layout.left.slice(0, 18).forEach((keyData, index) => {
        leftHalf.appendChild(createKey(keyData, index, layer, 'left'));
    });

    // Left thumb cluster
    const leftThumb = document.createElement('div');
    leftThumb.className = 'thumb-cluster';
    layout.left.slice(18).forEach((keyData, index) => {
        const actualIndex = index + 18;
        const key = createKey(keyData, actualIndex, layer, 'left');
        if (!keyData.transparent) {
            key.classList.add('thumb-key');
            if (index >= 3) {
                key.classList.add('rotated-left');
            }
        }
        leftThumb.appendChild(key);
    });
    leftHalf.appendChild(leftThumb);

    // Render right half
    layout.right.slice(0, 18).forEach((keyData, index) => {
        rightHalf.appendChild(createKey(keyData, index, layer, 'right'));
    });

    // Right thumb cluster
    const rightThumb = document.createElement('div');
    rightThumb.className = 'thumb-cluster right';
    layout.right.slice(18).forEach((keyData, index) => {
        const actualIndex = index + 18;
        const key = createKey(keyData, actualIndex, layer, 'right');
        if (!keyData.transparent) {
            key.classList.add('thumb-key');
            if (index < 3) {
                key.classList.add('rotated-right');
            }
        }
        rightThumb.appendChild(key);
    });
    rightHalf.appendChild(rightThumb);

    // Update layer info
    const layerInfo = document.getElementById('layer-info');
    layerInfo.innerHTML = `
        <h3>${layout.info.title}</h3>
        <p>${layout.info.description}</p>
    `;

    // Re-apply zoom after layout renders
    requestAnimationFrame(() => {
        setZoom(currentZoom);
    });
}

/**
 * Initialize sidebar field event listeners for live editing
 */
function initSidebarListeners() {
    // Text fields - update on input for instant feedback
    document.getElementById('field-primary').addEventListener('input', (e) => {
        if (!selectedKey) return;
        saveUndoState();
        const { layer, side, index } = selectedKey;
        layouts[layer][side][index].primary = e.target.value;
        updateKey(layer, side, index);
        // Re-add selected class (updateKey resets classes)
        getKeyElement(layer, side, index).classList.add('selected');
        saveToLocalStorage();
    });

    document.getElementById('field-secondary').addEventListener('input', (e) => {
        if (!selectedKey) return;
        saveUndoState();
        const { layer, side, index } = selectedKey;
        layouts[layer][side][index].secondary = e.target.value;
        updateKey(layer, side, index);
        getKeyElement(layer, side, index).classList.add('selected');
        saveToLocalStorage();
    });

    document.getElementById('field-hold').addEventListener('input', (e) => {
        if (!selectedKey) return;
        saveUndoState();
        const { layer, side, index } = selectedKey;
        layouts[layer][side][index].hold = e.target.value;
        updateKey(layer, side, index);
        getKeyElement(layer, side, index).classList.add('selected');
        saveToLocalStorage();
    });

    // Checkboxes - update on change
    document.getElementById('field-accent').addEventListener('change', (e) => {
        if (!selectedKey) return;
        saveUndoState();
        const { layer, side, index } = selectedKey;
        layouts[layer][side][index].accent = e.target.checked;
        updateKey(layer, side, index);
        getKeyElement(layer, side, index).classList.add('selected');
        saveToLocalStorage();
    });

    document.getElementById('field-highlight').addEventListener('change', (e) => {
        if (!selectedKey) return;
        saveUndoState();
        const { layer, side, index } = selectedKey;
        layouts[layer][side][index].highlight = e.target.checked;
        updateKey(layer, side, index);
        getKeyElement(layer, side, index).classList.add('selected');
        saveToLocalStorage();
    });

    // Combo fields
    document.getElementById('field-tap').addEventListener('input', (e) => {
        if (!selectedKey) return;
        saveUndoState();
        const { layer, side, index } = selectedKey;
        layouts[layer][side][index].tap = e.target.value || undefined;
        updateKey(layer, side, index);
        getKeyElement(layer, side, index).classList.add('selected');
        saveToLocalStorage();
    });

    document.getElementById('field-modifier-key').addEventListener('input', (e) => {
        if (!selectedKey) return;
        saveUndoState();
        const { layer, side, index } = selectedKey;
        layouts[layer][side][index].modifierKey = e.target.value || undefined;
        updateKey(layer, side, index);
        getKeyElement(layer, side, index).classList.add('selected');
        saveToLocalStorage();
    });

    // Chord fields need to create/update chord object
    document.getElementById('field-chord-keys').addEventListener('input', (e) => {
        if (!selectedKey) return;
        saveUndoState();
        const { layer, side, index } = selectedKey;
        const keyData = layouts[layer][side][index];
        const keys = e.target.value ? e.target.value.split('+').map(k => k.trim()) : null;
        if (keys && keys.length > 0 && keys[0] !== '') {
            keyData.chord = keyData.chord || {};
            keyData.chord.keys = keys;
        } else if (keyData.chord) {
            delete keyData.chord.keys;
            if (!keyData.chord.output) delete keyData.chord;
        }
        updateKey(layer, side, index);
        getKeyElement(layer, side, index).classList.add('selected');
        saveToLocalStorage();
    });

    document.getElementById('field-chord-output').addEventListener('input', (e) => {
        if (!selectedKey) return;
        saveUndoState();
        const { layer, side, index } = selectedKey;
        const keyData = layouts[layer][side][index];
        if (e.target.value) {
            keyData.chord = keyData.chord || {};
            keyData.chord.output = e.target.value;
        } else if (keyData.chord) {
            delete keyData.chord.output;
            if (!keyData.chord.keys) delete keyData.chord;
        }
        updateKey(layer, side, index);
        getKeyElement(layer, side, index).classList.add('selected');
        saveToLocalStorage();
    });

    // Clear Key button
    document.getElementById('btn-clear-key').addEventListener('click', clearSelectedKey);

    // Reset Key button
    document.getElementById('btn-reset-key').addEventListener('click', resetSelectedKey);

    // Undo button
    document.getElementById('btn-undo').addEventListener('click', undo);

    // File operations
    document.getElementById('btn-export').addEventListener('click', exportLayouts);

    document.getElementById('btn-import').addEventListener('click', () => {
        document.getElementById('file-import').click();
    });

    document.getElementById('file-import').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            importLayouts(e.target.files[0]);
            e.target.value = ''; // Reset for re-import of same file
        }
    });

    document.getElementById('btn-reset-all').addEventListener('click', resetToDefault);
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
    // Tab switching
    document.querySelectorAll('.layer-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.layer-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentLayer = tab.dataset.layer;
            renderLayout(currentLayer);
        });
    });

    // Keyboard shortcuts for layer switching and zoom
    document.addEventListener('keydown', (e) => {
        // Layer switching: 1-4
        if (e.key >= '1' && e.key <= '4' && !e.ctrlKey && !e.altKey) {
            const layers = ['base', 'navnum', 'symbols', 'system'];
            const index = parseInt(e.key) - 1;
            document.querySelectorAll('.layer-tab').forEach(t => t.classList.remove('active'));
            document.querySelector(`[data-layer="${layers[index]}"]`).classList.add('active');
            currentLayer = layers[index];
            renderLayout(currentLayer);
        }

        // Zoom shortcuts
        if (e.key === '+' || e.key === '=') {
            e.preventDefault();
            zoomIn();
        }
        if (e.key === '-' || e.key === '_') {
            e.preventDefault();
            zoomOut();
        }
        if (e.key === '0' && !e.ctrlKey) {
            e.preventDefault();
            resetZoom();
        }
    });

    // Zoom control event listeners
    document.getElementById('zoom-in').addEventListener('click', zoomIn);
    document.getElementById('zoom-out').addEventListener('click', zoomOut);
    document.getElementById('zoom-reset').addEventListener('click', resetZoom);

    document.getElementById('zoom-slider').addEventListener('input', (e) => {
        setZoom(parseInt(e.target.value));
    });

    // Mouse wheel zoom (Ctrl + scroll)
    document.getElementById('keyboard-wrapper').addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            if (e.deltaY < 0) {
                zoomIn();
            } else {
                zoomOut();
            }
        }
    }, { passive: false });
}

/**
 * Initialize the application
 */
function init() {
    loadLayouts();
    initEventListeners();
    initSidebarListeners();
    renderLayout('base');
    setZoom(100);
    updateUndoButton(); // Initialize undo button state
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Export functions for console debugging and future editing features
window.keyboardEditor = {
    layouts: () => layouts,
    originalLayouts: () => originalLayouts,
    currentLayer: () => currentLayer,
    selectedKey: () => selectedKey,
    lastKeyState: () => lastKeyState,
    updateKey,
    getKeyElement,
    renderLayout,
    setZoom,
    selectKey,
    deselectKey,
    clearSelectedKey,
    resetSelectedKey,
    undo,
    exportLayouts,
    importLayouts,
    resetToDefault,
    saveToLocalStorage,
    loadFromLocalStorage,
    // Combo utilities (Phase 6)
    COMBO_COLORS,
    getKeyPosition,
    areKeysAdjacent
};
