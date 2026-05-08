# All features — UI customization (Design Token Explorer)

Interactive test combining the full-featured editor with the Design Token Explorer panel.

## Layout

- **Left**: Classic editor with all features enabled (same config as `all-features` test)
- **Right**: Scrollable token customization panel with collapsible sections

## How to use

### Token panel

1. Expand a tier (Foundation / Semantic / Component) to see categories.
2. Expand a category to see individual tokens.
3. Each token shows a short description of what it controls.
4. Use the input controls to override token values live:
   - **Color tokens**: color picker + text input (supports hsl, hex, rgb)
   - **Spacing/size**: text input (px, em, calc values)
   - **Font weight**: dropdown (100-900)
   - **Duration**: range slider + text input
   - **Easing**: dropdown with presets
   - **Opacity**: range slider (0-1)
5. Overridden tokens are highlighted in blue.
6. Dependent tokens update automatically — e.g., changing `--ck-spacing-unit` refreshes all spacing tokens that reference it. Manually overridden dependents are not affected.
7. Click the "↺" button on any row to reset that token to its default.
8. Click "Reset All" to clear all overrides.
9. Click a greyed-out reference (← token-name) to scroll to and highlight the source token.

### Stylesheet presets (paste & compare)

1. Open the "Stylesheet Presets" section at the top of the panel (blue accent).
2. Paste a CSS block (e.g. `:root { --ck-radius-base: 10px; }`) into the textarea.
3. Optionally enter a name, then click "Add Stylesheet".
4. The stylesheet is immediately activated — the editor updates and token inputs refresh.
5. Add more stylesheets to compare. Use the radio buttons to switch between them.
6. Select "None (default)" to go back to the framework defaults.
7. Clicking a stylesheet entry loads its CSS into the textarea for editing. Click "Update Stylesheet" to apply changes.
8. Use the "Reset" button to deselect the active stylesheet and clear the textarea.
9. Check "Clear manual overrides on switch" to reset all per-token tweaks when switching between stylesheets. This gives a clean comparison between presets.

### Export overrides

1. Tweak tokens using the panel inputs.
2. Click "Generate Stylesheet from Overrides" at the bottom of the panel.
3. A `:root { ... }` block with all manually changed tokens appears in a read-only textarea, ready to copy.

## What to verify

- All features render correctly with default tokens (compare with `all-features` test).
- Changing a foundation token cascades to semantic and component tokens.
- Changing a semantic token overrides the foundation reference for that role only.
- Component tokens can be overridden independently.
- Token changes affect all editor UI: toolbar, dropdowns, dialogs, panels, menus, color pickers, etc.
- Content features (tables, images, code blocks, lists, etc.) display correctly alongside token changes.
- Reset restores original values and re-enables the var() cascade.
- Pasted stylesheets apply at normal CSS specificity — per-token inline overrides always win (unless "Clear manual overrides on switch" is checked).
- Switching between stylesheet presets refreshes all non-overridden token inputs.
- Updating an active stylesheet re-applies the CSS and refreshes token inputs.
- The export button captures only manually overridden tokens, not stylesheet preset values.
