---
category: framework-deep-dive-ui
meta-title: Theme token naming | CKEditor 5 Framework Documentation
meta-description: Learn the naming conventions for foundation, semantic, and component CSS variables in the CKEditor 5 UI theme and apply them consistently.
order: 20
modified_at: 2026-09-14
---

# Theme token naming

This guide defines the naming conventions for the CSS variables (design tokens) in the `@ckeditor/ckeditor5-ui` theme files. Following them keeps tokens easy to scan and consistent across files, straightforward to map to design tools such as Figma, and easy for integrators to override.

## Layer model

The theme is organized into three layers, and every token belongs to exactly one of them. Each layer references the one below it, so a value defined once in the foundation flows up through the semantic roles into the components that use it.

| Layer | Purpose | Where |
| --- | --- | --- |
| Foundation | Low-level primitives (scale, base colors, base geometry). | `theme/globals/_*.css`, `theme/globals/colors/_foundation.css` |
| Semantic | Design-intent roles shared across components. | `theme/globals/_semantic-*.css`, `theme/globals/colors/_semantic-*.css` |
| Component | Component-specific API and variants. | `theme/components/**/**.css` |

Legacy compatibility tokens are the one exception, and they live only in dedicated legacy files.

## Naming formats

Each layer has its own naming format that reflects its role: primitives are named by their scale, semantic tokens by their design intent, and component tokens by the component they belong to.

### Foundation

Foundation tokens are named after a primitive domain and a value on its scale, following the `--ck-{domain}-{property?}-{scale}` pattern. For example:

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

Keep foundation names short and generic, and never include a component name in them.

### Semantic

Semantic tokens describe a design intent and role rather than any specific component. Use one of these patterns:

- `--ck-{domain}-{role}-{property}`
- `--ck-{domain}-{role}-{state}-{property}`
- `--ck-{role}-{state}-{property}` (when the domain is obvious from the property, such as `focus` or `layer`)

For example:

- `--ck-color-interactive-hover-surface`
- `--ck-color-text-primary`
- `--ck-interactive-focus-ring`
- `--ck-interactive-focus-error-shadow`
- `--ck-spacing-control-padding-inline`
- `--ck-border-radius-uniform`
- `--ck-border-radius-surface-cut-top-left`
- `--ck-layer-panel-above`

### Component

Component tokens are named component-first, following the `--ck-{component}-{part?}-{state?}-{property}-{variant?}` pattern. For example:

- `--ck-button-focus-border-color`
- `--ck-button-default-hover-background-color`
- `--ck-dialog-border-color`
- `--ck-dropdown-panel-uniform-border-radius`
- `--ck-form-header-label-font-size`

As a rule of thumb, if a token is used in only one component, its name must start with that component.

## Vocabulary rules

Beyond the per-layer formats, a few shared vocabulary rules keep names predictable across the whole theme.

### States

Use these state keywords: `hover`, `active`, `focus`, `disabled`, `error`, `selected`, `readonly`, `on`, and `off`.

### Geometry variants

Prefer descriptive corner names, such as `top-left`, `top-right`, `bottom-left`, and `bottom-right`. Short forms like `ne` or `sw` are allowed only when they mirror existing class or state naming in the selectors.

### Typography

For typography, use `font-weight` rather than a shorthand like `weight`, reach for the semantic typography role tokens (`--ck-font-weight-ui-*`), and add component proxies for local override points.

### The `content` namespace

Avoid `content` as a namespace in UI theme tokens, because `.ck-content` already represents editable content styling in other packages. Use `text` for textual semantics instead, as in `--ck-color-text-*`.

### Do and avoid

Component-first, property-last names read consistently and sort well; domain-first names and mixed ordering do not.

✅ Do:

- `--ck-dialog-border-color`
- `--ck-labeled-field-label-background-color`
- `--ck-interactive-focus-disabled-shadow`

❌ Avoid:

- `--ck-color-dialog-border`
- `--ck-color-labeled-field-label-background`
- mixed ordering like `--ck-focus-shadow-disabled-interactive`

## Overriding tokens

Where you override a token determines how far the change reaches. A global override changes a value everywhere, while a scoped override changes a single element — but only if you target the right token.

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

For scoped overrides, always use the **component token** directly — not a foundation or legacy name. All tokens are defined on `:root` and resolve there, so a scoped override of a foundation or legacy token does **not** cascade through the semantic and component chain, because that chain was already resolved at `:root`.

```css
/* ✓ Directly sets the component token on the scoped element. */
.my-small-button {
    --ck-button-padding: 2px;
    --ck-button-border-radius: 0;
}

/* ✗ Won't affect --ck-button-padding — the chain resolved on :root. */
.my-small-button {
    --ck-spacing-control-padding-block: 2px;
}
```

The closer a token sits to the property it controls, the better it works in scoped contexts, which makes component tokens the safest choice for per-element customizations.

## Quick example

A single value flows through all three layers: the raw number lives in the foundation, the shared design role in the semantic layer, and the per-component override point in the component layer.

```css
/* Foundation — the raw value. */
--ck-radius-md: 4px;

/* Semantic — the shared design role. */
--ck-border-radius-control: var(--ck-radius-md);

/* Component — the per-component override points. */
--ck-input-border-radius: var(--ck-border-radius-control);
--ck-button-border-radius: var(--ck-border-radius-control);
```

To round the corners of every control, override the semantic token once (`--ck-border-radius-control`); to change only inputs, override the component token (`--ck-input-border-radius`).
