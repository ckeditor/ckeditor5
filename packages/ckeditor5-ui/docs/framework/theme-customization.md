---
category: framework-deep-dive-ui
meta-title: Theme customization | CKEditor 5 Framework Documentation
meta-description: Learn how to customize CKEditor 5 themes, including styling components and applying custom CSS for a unique editor look.
order: 10
modified_at: 2026-10-27
---

# Theme customization

You can customize the CKEditor&nbsp;5 UI theme by overriding its CSS variables (custom properties) to change colors, spacing, fonts, and more. The demo below shows the default theme restyled as a dark theme using this approach.

<div class="u-flex-horizontal u-gap-5">
	<ck:checkbox id="theme-mode-light" type="radio" name="theme-mode" value="light" label="Light" />
	<ck:checkbox id="theme-mode-dark" type="radio" name="theme-mode" value="dark" label="Dark" checked />
</div>

{@snippet examples/default-theme}

## Working with the token layers

The UI theme is organized into three layers - foundation, semantic, and component - defined and named as described in the {@link framework/theme-token-naming Theme token naming} guide. Each layer references the one below, so a value set once in the foundation flows up through the semantic roles into the components that use it.

Pick a layer by your task:

* **Customizing the look (integrators)** &ndash; override an existing token, choosing the layer by how far the change should reach: *foundation* for a global shift (palette, density, shape scale), *semantic* for one design role across many components (every surface, every focus ring), or *component* for a single component.
* **Building a plugin or component (plugin authors)** &ndash; define your component's own tokens in the component layer and resolve them from **semantic** tokens rather than raw values, so the component tracks the theme and exposes clean override points.

When you add tokens for your own component, name them component-first, resolve them from semantic tokens, and declare them on `:root` and `:host`, like the theme does. Declared on the component's own selector, they would shadow every `:root` override:

```css
:root,
:host {
	--ck-my-widget-background: var(--ck-color-surface-container);
	--ck-my-widget-border-radius: var(--ck-border-radius-control);
}

.ck.ck-my-widget {
	background: var(--ck-my-widget-background);
	border-radius: var(--ck-my-widget-border-radius);
}
```

### Global vs scoped overrides

Overriding a token on `:root` (or `:host` in a shadow root) changes its value everywhere. Both new and legacy names work at this level, and you can mix layers in one place:

```css
:root {
	/* Foundation - changes radius everywhere. */
	--ck-radius-base: 5px;

	/* Legacy name - also works globally via backward-compatible fallbacks. */
	--ck-border-radius: 5px;

	/* Component - changes only button padding. */
	--ck-button-padding: 5px;
}
```

To restyle a single element or region, scope the override to a selector - but **always override the component token there**, never a foundation or semantic name:

```css
/* ✓ Component token on the scoped element - takes effect. */
.my-small-button { --ck-button-padding: 2px; }

/* ✗ No effect - the semantic and foundation chain already resolved on :root. */
.my-small-button { --ck-spacing-control-padding-block: 2px; }
```

All tokens are defined and resolved on `:root` (or `:host` in a shadow root), so a scoped override of a lower-layer token does not re-flow up through the chain. The closer a token sits to the property it controls, the better it works when scoped - which makes component tokens the safe choice for per-element tweaks. Legacy token names are an exception: the theme reads them at each point of use, so a legacy override also works when scoped - the {@link updating/migration-to-refreshed-theme#overriding-on-a-narrower-selector migration guide} covers the few that stay `:root`-only, for example the legacy z-index names (`--ck-z-default`, `--ck-z-panel`, and `--ck-z-dialog`).

The same applies to tokens composed from parts on `:root`. For example, `--ck-button-border` is composed from `--ck-button-border-width`, `--ck-button-border-style`, and `--ck-button-border-color`. On `:root`, you can override a single part. On a narrower selector, override the whole `--ck-button-border`, because a scoped part is not recomposed. The border shorthands of inputs, dropdown panels, balloon panels, toolbars, and autocomplete results work differently: the theme composes them where they are used, so a border color such as `--ck-input-border-color` also works on a narrower selector. These shorthands are override-only, so you can set them, but reading them resolves to nothing.

### Toolbar buttons

To restyle the buttons of every toolbar without touching other buttons, use the toolbar button tokens. They apply to the buttons of the editor toolbar, balloon and widget toolbars, compact toolbars in forms (for example the alignment toolbar in table properties), and toolbars in dropdowns:

```css
:root {
	--ck-toolbar-button-border: 1px solid hsl(0, 0%, 0%);
	--ck-toolbar-button-border-radius: 0;
}
```

Scope them to one toolbar to restyle only its buttons:

```css
.ck-editor__top .ck-toolbar {
	--ck-toolbar-button-border: 1px solid hsl(0, 0%, 0%);
}
```

A scoped override also reaches the toolbars in dropdown panels opened from that toolbar, for example the alignment toolbar or the "Show more items" toolbar, because they are toolbars too. Lists in dropdown panels keep their regular button styles. To give the toolbars in dropdown panels the regular button styles, unset the tokens there. This also drops any value you set for the toolbar tokens on `:root`:

```css
.ck-editor__top .ck-dropdown__panel .ck-toolbar {
	--ck-toolbar-button-border: initial;
	--ck-toolbar-button-border-radius: initial;
}
```

Until you set them, toolbar buttons use `--ck-button-border` and `--ck-button-border-radius`. The outer corners of compact toolbars, for example in table properties, use `--ck-border-radius-control`.

An open dropdown or split button in a toolbar also uses `--ck-toolbar-button-border-radius`, ahead of `--ck-dropdown-panel-uniform-button-border-radius`. If you set both, for example `--ck-dropdown-panel-uniform-button-border-radius: initial` to keep the attached-corner look, the toolbar button radius wins for open dropdowns in toolbars. The vertical toolbar keeps its own `--ck-toolbar-vertical-button-border-radius`.

### Brand color: fill and accent text

Two semantic roles carry the brand color, and you can set them separately:

* `--ck-color-interactive-primary-surface` is a **fill**: the background of action buttons and of the selected item in lists, with `--ck-color-interactive-primary-text` on top.
* `--ck-color-text-accent` is **accent text** drawn on the canvas: the label and border of outline buttons, the active tab icon and indicator bar, and selected labels (`--ck-color-interactive-selected-text` follows it). Its border counterpart, `--ck-color-border-accent`, colors accent borders and thin lines, for example the border of a toggled-on surface button, of the selected style in the style grid, and the hovered table column resizer. It follows `--ck-color-text-accent` unless you set it.

Both roles resolve to the same color in the default theme. In a dark theme, keep the fill saturated so white text stays readable on it, and make the accent text lighter so it reads on the dark canvas:

```css
:root {
	--ck-color-interactive-primary-surface: hsl(168, 76%, 42%);
	--ck-color-text-accent: hsl(205, 100%, 74%);
}
```

### Stacking order

Layer tokens set the stacking order of floating UI. `--ck-layer-panel` places dropdowns, balloons, and the sticky toolbar. `--ck-layer-dialog` places dialogs, and the tooltips follow it. The mention list, the emoji picker, and CKBox shown above a dialog follow the dialog layer too, so raising it moves them together:

```css
:root {
	--ck-layer-dialog: 20000;
}
```

To place your own UI relative to dialogs, read the layer token, for example `z-index: calc(var(--ck-layer-dialog) + 1)`. The {@link updating/migration-to-refreshed-theme#z-index-layers migration guide} lists the legacy z-index names and how they map to the layers.

### Fonts

The editor UI, including every button and input, uses `--ck-font-family`. Override it on `:root` to change the UI font. The editing area uses the content font (`--ck-content-font-family`) instead.

### Best practices

* Override the **closest** token to what you want to change; drop to a lower layer only when the change should reach further.
* Point your own component tokens at **semantic** tokens, not raw values, so they track the theme.
* Avoid hardcoding raw colors or sizes in component CSS - you lose theme-ability.
* Avoid overriding a foundation or semantic token in a scoped selector expecting it to cascade; use the component token instead.
* For new customizations, prefer the current token names. Legacy names still work as override fallbacks, but they are not the target.

## Example: a dark theme

Assuming you finished our {@link getting-started/integrations-cdn/quick-start quick start} guide and have a running CKEditor&nbsp;5 instance, you can customize the UI theme through CSS variables. The file containing custom variables can be named `custom.css` and it will look as below:

```css
:root {
	/* Optional app palette helpers (outside CKEditor token layers). */
	--app-surface-1: hsl(255, 3%, 18%);
	--app-surface-2: hsl(255, 4%, 16%);
	--app-surface-3: hsl(240, 4%, 24%);
	--app-text-1: hsl(0, 0%, 98%);
	--app-text-2: hsl(0, 0%, 78%);
	--app-focus-hsl: 208, 90%, 62%;
	--app-brand: hsl(168, 76%, 42%);
	--app-brand-hover: hsl(168, 76%, 38%);
	--app-brand-contrast: hsl(0, 0%, 100%);
	--app-selected: hsl(208, 40%, 20%);
	--app-selected-hover: hsl(208, 42%, 24%);

	/* -----------------------------------------------------------------
	 * 1) FOUNDATION TOKENS
	 * The palette. Most semantic roles derive from it, so setting it
	 * restyles surfaces, borders, text, and interactive states at once.
	 * ----------------------------------------------------------------- */
	--ck-color-base-background: var(--app-surface-1);
	--ck-color-base-foreground: var(--app-surface-2);
	--ck-color-base-border: var(--app-surface-3);
	--ck-color-base-border-light: var(--app-surface-3);
	--ck-color-base-text: var(--app-text-1);
	--ck-color-base-hover: var(--app-surface-2);
	--ck-color-base-hover-strong: var(--app-surface-3);
	--ck-color-base-selected: var(--app-selected);
	--ck-color-base-selected-hover: var(--app-selected-hover);
	--ck-color-base-action: var(--app-brand);
	--ck-color-base-action-hover: var(--app-brand-hover);
	--ck-color-base-action-muted: var(--app-selected);
	--ck-color-base-action-disabled: hsl(168, 30%, 30%);
	--ck-color-base-error: hsl(10, 90%, 62%);
	--ck-color-base-error-shadow: hsla(10, 90%, 62%, .3);
	--ck-color-base-focus: hsl(var(--app-focus-hsl));
	--ck-color-base-focus-shadow: hsla(var(--app-focus-hsl), .4);

	/* -----------------------------------------------------------------
	 * 2) SEMANTIC TOKENS
	 * Override a role directly when it should differ from the palette,
	 * or when its default is not derived from the palette.
	 * ----------------------------------------------------------------- */

	/* Tooltips and text on filled buttons. The defaults derive from
	   the text and background colors, which are inverted here. */
	--ck-color-surface-inverse: hsl(252, 7%, 14%);
	--ck-color-text-inverse: var(--app-brand-contrast);

	/* Secondary text, set on the role: some labels with white text
	   use the foundation `--ck-color-base-text-light` as their background. */
	--ck-color-text-secondary: hsl(0, 0%, 86%);
	--ck-color-text-disabled: var(--app-text-2);

	/* Accent text on the dark canvas: lighter than the brand fill. */
	--ck-color-text-accent: hsl(205, 100%, 74%);

	/* Pressed state: darker than the palette hover. */
	--ck-color-interactive-active-surface: hsl(255, 4%, 14%);

	/* Roles with fixed defaults that do not derive from the palette. */
	--ck-color-text-placeholder: var(--app-text-2);
	--ck-color-surface-skeleton: var(--app-surface-2);
	--ck-color-surface-skeleton-highlight: var(--app-surface-3);
	--ck-color-interactive-disabled-surface: hsl(255, 4%, 21%);
	--ck-color-interactive-focus-border-coordinates: var(--app-focus-hsl);

	/* -----------------------------------------------------------------
	 * 3) COMPONENT TOKENS
	 * Restyle a single component.
	 * ----------------------------------------------------------------- */
	--ck-dialog-shadow: 0 10px 24px 2px hsla(0, 0%, 0%, .35);
	--ck-widget-hover-border-color: hsl(43, 100%, 68%);

	/* The link preview in the link balloon. A legacy name, and its only override point. */
	--ck-color-link-default: hsl(190, 100%, 75%);
}

/* Optional: feature-specific content tokens (outside @ckeditor/ckeditor5-ui theme layers). */
:root {
	/* Editable (and published) content text - light on the dark background. */
	--ck-content-font-color: var(--app-text-1);

	--ck-content-image-caption-background-color: var(--app-surface-2);
	--ck-content-image-caption-text-color: var(--app-text-2);

	--ck-content-block-quote-border-color: var(--app-surface-3);

	--ck-content-code-block-background: var(--app-surface-2);
	--ck-content-code-block-text-color: hsl(0, 0%, 91%);
	--ck-content-code-block-border-color: var(--app-surface-3);

	--ck-content-table-border-color: var(--app-surface-3);
	--ck-content-table-cell-border-color: var(--app-surface-3);
	--ck-content-table-header-background: var(--app-surface-2);
}

/* Improve displaying links. */
.ck.ck-editor__editable a {
	color: hsl(210, 100%, 63%);
}
```

The example sets the content tokens of the features loaded in the demo above. If your editor uses other content features, for example the horizontal line, page break, to-do list, or table caption, set their `--ck-content-*` tokens too. The {@link getting-started/setup/content-styles#feature-specific-styling Content styles} guide lists them.

Depending on your setup method, you can either import a style sheet into your JavaScript file:

```js
import { ClassicEditor } from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

// Override the default styles.
import 'custom.css';

ClassicEditor
	.create( /* ... */ )
	.then( editor => {
		console.log( editor );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
```

Or import it with the `<link>` element in the CDN setup:

```html
<link rel="stylesheet" href="path/to/custom.css" type="text/css">
```
