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

// Zoom state
let baseHeight = null;
let baseWidth = null;

/**
 * Load layouts from JSON file
 * @returns {Promise<void>}
 */
async function loadLayouts() {
    try {
        const response = await fetch('layouts.json');
        if (!response.ok) {
            throw new Error(`Failed to load layouts: ${response.status}`);
        }
        const data = await response.json();
        // Remove schema metadata, keep only layer data
        const { _schema, ...layerData } = data;
        layouts = layerData;
        // Store deep copy of original layouts for reset functionality
        originalLayouts = JSON.parse(JSON.stringify(layouts));
    } catch (error) {
        console.error('Error loading layouts:', error);
        // Show error to user
        document.body.innerHTML = `
            <div style="color: #ff6b6b; text-align: center; padding: 50px;">
                <h2>Failed to load keyboard layouts</h2>
                <p>${error.message}</p>
                <p>Make sure layouts.json exists and is valid JSON.</p>
            </div>
        `;
        throw error;
    }
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
        accent: false,
        highlight: false
    };
    updateKey(layer, side, index);
    getKeyElement(layer, side, index).classList.add('selected');
    updateSidebar();
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
    });

    document.getElementById('field-secondary').addEventListener('input', (e) => {
        if (!selectedKey) return;
        saveUndoState();
        const { layer, side, index } = selectedKey;
        layouts[layer][side][index].secondary = e.target.value;
        updateKey(layer, side, index);
        getKeyElement(layer, side, index).classList.add('selected');
    });

    document.getElementById('field-hold').addEventListener('input', (e) => {
        if (!selectedKey) return;
        saveUndoState();
        const { layer, side, index } = selectedKey;
        layouts[layer][side][index].hold = e.target.value;
        updateKey(layer, side, index);
        getKeyElement(layer, side, index).classList.add('selected');
    });

    // Checkboxes - update on change
    document.getElementById('field-accent').addEventListener('change', (e) => {
        if (!selectedKey) return;
        saveUndoState();
        const { layer, side, index } = selectedKey;
        layouts[layer][side][index].accent = e.target.checked;
        updateKey(layer, side, index);
        getKeyElement(layer, side, index).classList.add('selected');
    });

    document.getElementById('field-highlight').addEventListener('change', (e) => {
        if (!selectedKey) return;
        saveUndoState();
        const { layer, side, index } = selectedKey;
        layouts[layer][side][index].highlight = e.target.checked;
        updateKey(layer, side, index);
        getKeyElement(layer, side, index).classList.add('selected');
    });

    // Clear Key button
    document.getElementById('btn-clear-key').addEventListener('click', clearSelectedKey);

    // Reset Key button
    document.getElementById('btn-reset-key').addEventListener('click', resetSelectedKey);

    // Undo button
    document.getElementById('btn-undo').addEventListener('click', undo);
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
async function init() {
    try {
        await loadLayouts();
        initEventListeners();
        initSidebarListeners();
        renderLayout('base');
        setZoom(100);
        updateUndoButton(); // Initialize undo button state
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
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
    undo
};
