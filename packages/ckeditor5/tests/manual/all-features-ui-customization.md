# All features — UI customization (Design Token Explorer)

Interactive test combining the full-featured editor with the Design Token Explorer panel.

## Layout

- **Left**: Classic editor with all features enabled (same config as `all-features` test)
- **Right**: Scrollable token customization panel with collapsible sections

## How to use

### Token panel

1. Use the search input at the top to filter tokens by name or description. Matching sections auto-expand; clearing restores the previous state.
2. Check "Show only overridden" to hide all tokens that haven't been changed (works with search).
3. Expand a tier (Foundation / Semantic / Component) to see categories. Use "Expand all" / "Collapse all" per tier.
4. Each token shows a short description of what it controls.
5. Click a token name to copy its full `--ck-*` name to clipboard (turns green with a ✓ on success).
6. Tokens with a 🖼 icon have a visual diagram — click to toggle. Click "Show Diagrams" in the header to toggle all at once.
7. Use the input controls to override token values live:
   - **Color tokens**: color picker + text input (supports hsl, hex, rgb)
   - **Spacing/size**: text input (px, em, calc values)
   - **Font weight**: dropdown (100-900)
   - **Duration**: range slider + text input
   - **Easing**: dropdown with presets
   - **Opacity**: range slider (0-1)
8. Overridden tokens are highlighted in blue. Tokens changed by an active stylesheet preset are highlighted in amber.
9. Section headers inherit the highlight color so you can see overrides even when collapsed.
10. Dependent tokens update automatically — e.g., changing `--ck-spacing-unit` refreshes all spacing tokens that reference it. Manually overridden dependents are not affected.
11. Click the "↺" button on any row to reset that token to its default.
12. Click "Reset All" to clear all overrides.
13. Click a greyed-out reference (← token-name) to scroll to and highlight the source token.

### Stylesheet presets (paste & compare)

The all-features test loads built-in presets from `presets/` directory on startup. To add a new preset: drop a `.css` file into `presets/` and add its filename to `presets/index.js`.

1. Open the "Stylesheet Presets" section at the top of the panel (blue accent).
2. Paste a CSS block (e.g. `:root { --ck-radius-base: 10px; }`) into the textarea.
3. Optionally enter a name, then click "Add Stylesheet".
4. The stylesheet is immediately activated — the editor updates and token inputs refresh.
5. Add more stylesheets to compare. Use the radio buttons to switch between them.
6. Select "None (default)" to go back to the framework defaults.
7. Clicking a stylesheet entry loads its CSS into the textarea for editing. Click "Update Stylesheet" to apply changes.
8. Click "Add New" to fork the current textarea content into a new preset without modifying the selected one.
9. Use the "Reset" button to deselect the active stylesheet and clear the textarea.
10. Check "Clear manual overrides on switch" to reset all per-token tweaks when switching between stylesheets. This gives a clean comparison between presets.

### Export overrides

1. Tweak tokens using the panel inputs.
2. Click "Generate Stylesheet from Overrides" at the bottom of the panel.
3. A `:root { ... }` block with all manually changed tokens appears in a read-only textarea, ready to copy.

### WCAG contrast checking

Foreground color tokens (e.g. `--ck-color-text-primary`, `--ck-button-action-text-color`) show a live contrast ratio badge next to their input. The badge compares against the paired background token and displays:
- **Green** `AAA` (≥ 7:1) or `AA` (≥ 4.5:1) — passes WCAG
- **Red** `Fail` (< 4.5:1) — fails WCAG AA for normal text

Badges show two color swatches (foreground + background) and update dynamically when either token changes. Click a badge to scroll to the paired background token. Hover for details.

### Share via link

1. Override some tokens, then click "Share Link" in the header.
2. The URL with encoded overrides is copied to clipboard.
3. Open the link in another browser/tab — overrides are restored automatically.

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
- Manual overrides (blue) visually override preset changes (amber) on the same token.
- Section headers turn blue for manual overrides and amber for preset changes.
- "Show Diagrams" toggles all diagrams at once; individual 🖼 icons toggle one at a time.
- Built-in presets from `presets/` directory load on startup and appear in the radio list.
- Contrast badges on foreground color tokens update when either the foreground or background token changes.
