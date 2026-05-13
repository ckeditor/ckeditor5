---
category: framework-deep-dive-ui
meta-title: Theme token naming guide | CKEditor 5 Framework Documentation
meta-description: Learn the naming conventions for foundation, semantic, and component CSS variables in the CKEditor 5 UI theme and apply them consistently.
order: 20
---

# Theme token naming guide

This guide defines naming conventions for CSS variables in `@ckeditor/ckeditor5-ui` theme files.

The goal is to keep tokens:
- easy to scan,
- consistent across files,
- easy to map to design tools (for example Figma),
- easy to override by integrators.

## Layer model

Use three layers:

| Layer | Purpose | Where |
| --- | --- | --- |
| Foundation | Low-level primitives (scale, base colors, base geometry). | `theme/globals/_*.css`, `theme/globals/colors/_foundation.css` |
| Semantic | Design-intent roles shared across components. | `theme/globals/_semantic-*.css`, `theme/globals/colors/_semantic-*.css` |
| Component | Component-specific API and variants. | `theme/components/**/**.css` |

Legacy compatibility tokens are allowed only in dedicated legacy files.

## Naming formats

### Foundation

Use primitive domain + value scale:

`--ck-{domain}-{property?}-{scale}`

Examples:
- `--ck-spacing-sm`
- `--ck-font-size-base`
- `--ck-font-weight-bold`
- `--ck-color-base-border`
- `--ck-color-base-hover`
- `--ck-color-base-success`
- `--ck-radius-base`, `--ck-radius-corners`
- `--ck-shadow-md`
- `--ck-z-overlay`
- `--ck-duration-fast`
- `--ck-ease-standard`

Notes:
- No component names in foundation tokens.
- Keep names short and generic.

### Semantic

Use design intent and role, not component names.

Preferred patterns:
- `--ck-{domain}-{role}-{property}`
- `--ck-{domain}-{role}-{state}-{property}`
- `--ck-{role}-{state}-{property}` (when domain is obvious from property, e.g. `focus`, `layer`)

Examples:
- `--ck-color-interactive-hover-surface`
- `--ck-color-text-primary`
- `--ck-interactive-focus-ring`
- `--ck-interactive-focus-error-shadow`
- `--ck-spacing-region-padding-inline`
- `--ck-border-radius-uniform`
- `--ck-border-radius-surface-cut-top-left`
- `--ck-layer-panel-above`

### Component

Use component-first naming.

Preferred pattern:
`--ck-{component}-{part?}-{state?}-{property}-{variant?}`

Examples:
- `--ck-button-focus-border-color`
- `--ck-button-default-hover-background-color`
- `--ck-dialog-border-color`
- `--ck-dropdown-panel-uniform-border-radius`
- `--ck-form-header-label-font-size`

Rule of thumb:
- If token is only used in one component, it must start with that component name.

## Vocabulary rules

### States

Allowed state keywords:
- `hover`
- `active`
- `focus`
- `disabled`
- `error`
- `selected`
- `readonly`
- `on`
- `off`

### Geometry variants

Prefer descriptive corner names:
- `top-left`, `top-right`, `bottom-left`, `bottom-right`

Short forms like `ne`, `sw`, etc. are allowed only when mirroring existing class/state naming in selectors.

### Typography

Use:
- `font-weight` (not shorthand like `weight`)
- semantic typography role tokens (`--ck-font-weight-ui-*`)
- component proxies for local override points

### Important Naming Constraint: `content`

In UI theme tokens, avoid `content` as a namespace because `.ck-content` already represents editable content styling in other packages.

Use:
- `text` for textual semantics (`--ck-color-text-*`)
- `region` for UI container spacing (`--ck-spacing-region-*`)

`region` is currently a provisional term and may be refined later.

### Do / Avoid

Do:
- `--ck-dialog-border-color`
- `--ck-labeled-field-label-background-color`
- `--ck-interactive-focus-disabled-shadow`

Avoid:
- `--ck-color-dialog-border`
- `--ck-color-labeled-field-label-background`
- mixed ordering like `--ck-focus-shadow-disabled-interactive`

## Migration Rules

When renaming tokens:
1. Rename declaration and all usages in the same change.
2. Keep behavior identical (only naming changes).
3. If public API risk is high, add temporary alias only when needed.
4. Never introduce new literals if a matching semantic/component token exists.

## Overriding Tokens

### Global overrides (`:root`)

Override tokens on `:root` to change values globally. Both legacy and new names work at this level:

```css
:root {
    /* Foundation — changes radius everywhere. */
    --ck-radius-base: 5px;

    /* Legacy name — also works globally via backward-compatible fallbacks. */
    --ck-border-radius: 5px;

    /* Component — changes only button padding. */
    --ck-button-padding: 5px;
}
```

### Scoped overrides (on a specific element or class)

For scoped overrides, always use the **component token** directly — not a foundation or legacy name.

All tokens are defined on `:root` and resolve there. A scoped override of a foundation or legacy token does **not** cascade through the semantic/component chain because the chain was already resolved at `:root`.

Do:
```css
/* ✓ Directly sets the component token on the scoped element. */
.my-small-button {
    --ck-button-padding: 2px;
    --ck-button-border-radius: 0;
}
```

Avoid:
```css
/* ✗ Won't affect --ck-button-padding — the chain resolved on :root. */
.my-small-button {
    --ck-spacing-control-padding-block: 2px;
}
```

The rule of thumb: the closer the token is to the property it controls, the better it works in scoped contexts. Component tokens are the safest choice for per-element customizations.

## Quick Examples

Foundation:
- `--ck-font-weight-bold: 700;`
- `--ck-color-base-success: hsl(120, 100%, 27%);`

Semantic:
- `--ck-font-weight-ui-heading: var(--ck-font-weight-bold);`
- `--ck-interactive-focus-ring: var(--ck-focus-ring);`
- `--ck-color-feedback-success: var(--ck-color-base-success);`

Component:
- `--ck-form-header-label-font-size: var(--ck-font-size-md);`
- `--ck-dropdown-panel-uniform-border-radius: var(--ck-border-radius-uniform);`
